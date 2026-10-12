import { GoogleGenerativeAI, type GenerateContentStreamResult } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { readSessionClaims } from "@/app/service/sessionClaims";
import { readRequestCookie } from "@/app/service/sessionToken";
import { isPaidTier } from "@/app/service/jwtDecoder";
import {
  AI_QUOTA_COOKIE,
  AI_QUOTA_COOKIE_MAX_AGE,
  FREE_DAILY_EXPLANATIONS,
  diaDeHoje,
  lerCota,
  restantes,
  serializarCota,
} from "@/app/service/aiExplanationQuota";
import { AI_QUOTA_HEADER } from "@/lib/core/aiQuota";

/**
 * Explicação de gabarito por IA (Gemini 2.5 Flash, streaming).
 *
 * Recebe `{ enunciado, gabarito }` e devolve `text/plain` em streaming, chunk a chunk.
 *
 * | Situação | Status |
 * |---|---|
 * | sem sessão | 401 |
 * | corpo inválido ou sem `enunciado`/`gabarito` | 400 |
 * | aluno FREE sem cota no dia | 429 — `{ error, limite }` |
 * | `GEMINI_API_KEY` ausente | 503 |
 * | Gemini não respondeu no teto | 504 |
 * | Gemini falhou antes de começar | 502 |
 *
 * O tier sai da sessão, no servidor (`readSessionClaims` → `isPaidTier`) — o mesmo caminho do
 * `/api/user/me`. PRO não tem cota; FREE tem `FREE_DAILY_EXPLANATIONS` por dia, contadas em
 * cookie HttpOnly (ver `aiExplanationQuota.ts`). O header `X-AI-Quota-Remaining` devolve o
 * saldo (`unlimited` para PRO) para a tela exibir sem recalcular.
 *
 * A cota só é debitada depois que o Gemini aceitou a requisição: falha do provedor não custa
 * uso ao aluno.
 *
 * CACHE STRATEGY: no-store — resposta gerada por requisição e que consome cota
 */

// Node, não Edge: a cota usa `node:crypto`, e a leitura de sessão do NextAuth usa `next-auth/jwt`.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Teto até o primeiro chunk. Explicação longa de exatas passa de 10s com folga. */
const AI_TIMEOUT_MS = 30_000;

/** Limite de entrada: questão de vestibular cabe com sobra; acima disso é abuso de cota. */
const MAX_CHARS = 20_000;

const MODEL = "gemini-2.5-flash";

function montarPrompt(enunciado: string, gabarito: string): string {
  return `
      Você receberá uma questão de vestibular com o enunciado e a alternativa correta já conhecida.
      Sua tarefa é explicar, de forma **clara, objetiva e didática**, o raciocínio necessário para chegar até a alternativa correta. Não analise ou mencione as outras alternativas.
      Adapte o estilo da explicação conforme a natureza da questão:
      - Se for uma questão de **exatas** (Matemática, Física, Química), use fórmulas e mostre o passo a passo dos cálculos.
      - Se for uma questão de **biológicas ou humanas** (História, Biologia, Geografia, Filosofia), explique com base nos conceitos teóricos e contexto histórico ou científico.
      - Seja direto, mas sempre **ensine o raciocínio** como se estivesse explicando para um aluno que quer aprender o conteúdo, e não apenas a resposta final.
      - Use uma linguagem acessível, evitando jargões complexos, a menos que sejam necessários para a compreensão.
      - Se a questão envolver **interpretação de texto**, analise o contexto e explique como chegar à resposta correta com base no que foi lido.
      - Se a questão envolver **interpretação de gráficos ou tabelas**, descreva como analisar esses dados para chegar à resposta correta.
      - Se a questão envolver **lógica ou raciocínio lógico**, explique os passos lógicos necessários para chegar à conclusão correta.
      - Seja muito organizado e claro na hora de demonstrar a sua resposta, de modo no qual fique fácil de entender o raciocínio.
      Formato de entrada:
      - **Enunciado:** ${enunciado}
      - **Alternativa correta:** ${gabarito}

      Comece sua resposta com:
      **"Para chegar à alternativa correta, devemos..."**
    `;
}

/**
 * Timeout ou cancelamento. O SDK embrulha o `AbortError` do fetch em
 * `GoogleGenerativeAIAbortError`, que não sobrescreve `name` — daí a checagem pela mensagem.
 */
function ehTimeout(erro: unknown): boolean {
  if (!(erro instanceof Error)) return false;
  return (
    erro.name === "AbortError" ||
    erro.name === "TimeoutError" ||
    /request aborted/i.test(erro.message)
  );
}

function textoValido(valor: unknown): valor is string {
  return typeof valor === "string" && valor.trim().length > 0 && valor.length <= MAX_CHARS;
}

export async function POST(request: Request) {
  const sessao = await readSessionClaims(request);

  if (!sessao) {
    return NextResponse.json({ error: "Faça login para gerar explicações." }, { status: 401 });
  }

  let corpo: { enunciado?: unknown; gabarito?: unknown };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { enunciado, gabarito } = corpo ?? {};
  if (!textoValido(enunciado) || !textoValido(gabarito)) {
    return NextResponse.json({ error: "Enunciado e gabarito são obrigatórios." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[generate-explanation][CONFIG] GEMINI_API_KEY ausente");
    return NextResponse.json(
      { error: "Explicação por IA indisponível no momento." },
      { status: 503 }
    );
  }

  const { claims } = sessao;
  const ilimitado = isPaidTier(claims.tier);

  // Sem `id` (sessão só do NextAuth), o e-mail identifica o aluno; o cookie guarda só um hash.
  const chaveDoAluno = claims.id ?? claims.email ?? "sem-identificador";
  const hoje = diaDeHoje();
  const cotaAtual = ilimitado
    ? null
    : lerCota(readRequestCookie(request, AI_QUOTA_COOKIE), chaveDoAluno, hoje);

  if (cotaAtual && restantes(cotaAtual) === 0) {
    return NextResponse.json(
      {
        error: `Você usou as ${FREE_DAILY_EXPLANATIONS} explicações gratuitas de hoje. Amanhã tem mais — ou assine o Simula PRO para usar sem limite.`,
        limite: FREE_DAILY_EXPLANATIONS,
      },
      { status: 429, headers: { [AI_QUOTA_HEADER]: "0", "Cache-Control": "no-store" } }
    );
  }

  let resultado: GenerateContentStreamResult;

  try {
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel(
      { model: MODEL },
      { timeout: AI_TIMEOUT_MS }
    );
    resultado = await model.generateContentStream(montarPrompt(enunciado, gabarito));
  } catch (erro) {
    // A mensagem do SDK traz URL do provedor e nome de classe: fica no log, nunca na resposta.
    console.error("[generate-explanation][GEMINI] Falha antes do streaming", erro);
    const timeout = ehTimeout(erro);
    return NextResponse.json(
      {
        error: timeout
          ? "A IA demorou para responder. Tente novamente."
          : "Não foi possível gerar a explicação agora. Tente novamente.",
      },
      { status: timeout ? 504 : 502 }
    );
  }

  const encoder = new TextEncoder();
  let cancelado = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of resultado.stream) {
          if (cancelado) break;
          controller.enqueue(encoder.encode(chunk.text()));
        }
      } catch (erro) {
        // Headers já saíram com 200; o jeito de avisar é no próprio texto.
        console.error("[generate-explanation][GEMINI] Streaming interrompido", erro);
        if (!cancelado) {
          controller.enqueue(encoder.encode("\n\n_A explicação foi interrompida. Tente gerar de novo._"));
        }
      } finally {
        if (!cancelado) controller.close();
      }
    },
    cancel() {
      // O aluno trocou de questão ou saiu da tela: para de ler o Gemini.
      cancelado = true;
    },
  });

  const saldo = cotaAtual ? restantes(cotaAtual) - 1 : null;

  const resposta = new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      [AI_QUOTA_HEADER]: saldo === null ? "unlimited" : String(saldo),
    },
  });

  if (cotaAtual) {
    resposta.cookies.set(
      AI_QUOTA_COOKIE,
      serializarCota({ dia: hoje, usados: cotaAtual.usados + 1 }, chaveDoAluno),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/generate-explanation",
        maxAge: AI_QUOTA_COOKIE_MAX_AGE,
      }
    );
  }

  return resposta;
}
