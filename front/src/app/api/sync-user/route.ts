import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { decodeJWT } from "@/app/service/jwtDecoder";

/**
 * Troca a sessão do NextAuth pela sessão do BFF Java.
 *
 * Pega o `id_token` do provedor OAuth, manda ao Java em `POST /auth/google` e grava o JWT
 * devolvido no cookie `user_data` HttpOnly. É o **único** lugar do fluxo de login que escreve
 * esse cookie — se esta rota falhar, o aplicativo inteiro se comporta como deslogado, porque
 * todas as telas e rotas de sessão leem dali.
 *
 * O JWT **não volta no corpo**. A resposta traz só o que o cliente usa nos analytics; devolver
 * o token daria ao navegador como guardá-lo, que é exatamente o que esta arquitetura evita.
 * Quem precisa dos claims na tela pergunta a `GET /api/user/me`.
 *
 * Os três modos de falha são separados **no log**, porque na tela eles são indistinguíveis e já
 * custaram horas de depuração apontando para o lugar errado:
 *
 * | Log                   | Significado                          | Status |
 * |-----------------------|--------------------------------------|--------|
 * | `[sync-user][NET]`    | não alcançou o BFF (rede/firewall)   | 504    |
 * | `[sync-user][BFF]`    | o Java respondeu, mas com erro       | relay  |
 * | `[sync-user][SHAPE]`  | respondeu OK, em formato inesperado  | 502    |
 * | `[sync-user][BUG]`    | exceção nossa                        | 500    |
 *
 * O corpo devolvido ao navegador é sanitizado em todos eles: nada de host, stack ou nome de
 * classe interna do Java atravessa esta rota.
 *
 * CACHE STRATEGY: no-store — grava sessão, nunca pode ser servida de cache
 */

/**
 * Corta antes dos 10s de connect timeout padrão do undici.
 *
 * Sem isto, um BFF inalcançável pendura o login por 10s e o erro chega como um
 * `TypeError: fetch failed` genérico, sem dizer se foi rede, DNS ou o Java engasgado.
 */
const TIMEOUT_MS = 8000;

/** Grafias em que o JWT já chegou do BFF. Ler só `{ token }` fazia o login falhar calado. */
function extrairJwt(backendData: unknown): string | null {
  const bruto =
    typeof backendData === "string"
      ? backendData
      : ((backendData as Record<string, unknown> | null)?.token ??
        (backendData as Record<string, unknown> | null)?.accessToken ??
        (backendData as Record<string, unknown> | null)?.jwt ??
        (
          (backendData as Record<string, Record<string, unknown>> | null)?.data as
            | Record<string, unknown>
            | undefined
        )?.token);

  // Qualquer coisa que não seja string vira `[object Object]` no cookie — sessão morta que só
  // aparece como 401 três telas depois.
  if (typeof bruto !== "string") return null;

  const limpo = bruto.trim().replace(/^Bearer\s+/i, "");
  return limpo || null;
}

/** Só o formato, nunca o valor: a regra do CLAUDE.md proíbe logar JWT, mesmo truncado. */
function descreverFormato(backendData: unknown): string {
  if (typeof backendData !== "object" || backendData === null) return typeof backendData;
  return `object{${Object.keys(backendData).join(",")}}`;
}

/** Falha antes de chegar ao Java: timeout nosso, connect timeout do undici, DNS, recusa. */
function ehErroDeRede(erro: unknown): boolean {
  if (erro instanceof DOMException && erro.name === "TimeoutError") return true;
  if (erro instanceof Error && erro.name === "AbortError") return true;
  return erro instanceof TypeError && "cause" in erro;
}

export async function POST(req: Request) {
  // Obtém o token da sessão (JWT decodificado pelo next-auth)
  // getToken typing expects NextRequest/NextApiRequest; cast via unknown -> NextRequest to avoid 'any'
  const token = await getToken({ req: req as unknown as NextRequest, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.googleAccount) {
    console.log("[sync-user][ABORT] googleAccount ausente no token");
    return NextResponse.json(
      { message: "Não autorizado: token de acesso não encontrado" },
      { status: 401 }
    );
  }

  if (!process.env.BACKEND_API_URL) {
    console.log("[sync-user][ERROR] BACKEND_API_URL ausente");
    return NextResponse.json(
      { message: "BACKEND_API_URL não configurada" },
      { status: 500 }
    );
  }

  const idToken = (token.googleAccount as { id_token?: string })?.id_token;

  if (!idToken) {
    console.log("[sync-user][ABORT] id_token ausente no googleAccount");
    return NextResponse.json(
      { message: "Não autorizado: id_token não encontrado" },
      { status: 401 }
    );
  }

  let response: Response;

  try {
    response = await fetch(`${process.env.BACKEND_API_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token: idToken }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    if (ehErroDeRede(e)) {
      const causa = (e as { cause?: { code?: string; message?: string } }).cause;
      console.error(
        `[sync-user][NET] BFF inalcançável em ${process.env.BACKEND_API_URL} — ` +
          `${(e as Error).name}: ${causa?.code ?? "sem código"} ${causa?.message ?? (e as Error).message}. ` +
          `Confira se o host aceita conexão (Test-NetConnection <host> -Port <porta>) ` +
          `antes de procurar bug de autenticação.`
      );
      return NextResponse.json(
        { message: "Não foi possível conectar ao servidor. Tente novamente." },
        { status: 504 }
      );
    }

    console.error("[sync-user][BUG] Exceção inesperada ao chamar o BFF", e);
    return NextResponse.json(
      { message: "Erro interno ao conectar com backend" },
      { status: 500 }
    );
  }

  try {
    // Tenta ler o corpo da resposta
    const contentType = response.headers.get("content-type") || "";
    const backendData = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      // Sem repassar `backendData`: o corpo do Java pode carregar host, stack ou nome de
      // classe interna, e esta é a única barreira entre ele e a tela do aluno.
      console.error("[sync-user][BFF] Backend respondeu", response.status, backendData);
      return NextResponse.json(
        { message: "Não foi possível sincronizar sua conta. Tente novamente." },
        { status: response.status }
      );
    }

    const jwtDoBff = extrairJwt(backendData);
    // Só o `jwtDecoder` lê JWT neste projeto. Validar antes de gravar impede que uma resposta
    // OK porém inesperada vire um cookie inútil — o modo de falha que respondia 200 e deixava
    // o aluno preso em 401.
    const decoded = jwtDoBff ? decodeJWT(jwtDoBff) : null;

    if (!jwtDoBff || !decoded) {
      console.error(
        `[sync-user][SHAPE] Resposta 200 do BFF sem JWT utilizável. ` +
          `Formato recebido: ${descreverFormato(backendData)}. ` +
          `Grafias aceitas: string crua, { token }, { accessToken }, { jwt }, { data: { token } }.`
      );
      return NextResponse.json(
        { message: "Não foi possível sincronizar sua conta. Tente novamente." },
        { status: 502 }
      );
    }

    const responseNext = NextResponse.json(
      { ok: true, id: decoded.id ?? null, tipo: decoded.tipo ?? null },
      { status: 200 }
    );

    responseNext.cookies.set("user_data", jwtDoBff, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 // 30 dias
    });

    return responseNext;

  } catch (e) {
    console.error("[sync-user][BUG] Falha ao processar a resposta do BFF", e);
    return NextResponse.json(
      { message: "Erro interno ao conectar com backend" },
      { status: 500 }
    );
  }
}
