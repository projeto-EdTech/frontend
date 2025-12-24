import { NextResponse } from "next/server";
import { allQuestions, type Question } from "@/lib/dataUniversity";

/**
 * Evita cache para este endpoint (combina com fetch { cache: "no-store" } no front)
 */
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  // 1. Altere o tipo de 'params' para ser uma Promise
  { params: paramsPromise }: { params: Promise<{ university: string }> }
) {
  try {
    // 2. Aguarde (await) a resolução da Promise para obter os parâmetros
    const params = await paramsPromise;
    const { university } = params;
    const url = new URL(req.url);

    const countParam = url.searchParams.get("count") ?? "10";
    const yearParam = url.searchParams.get("year") ?? "";
    const dayParam = url.searchParams.get("day") ?? "";

    const count = Math.max(1, Math.min(parseInt(countParam, 10) || 10, 200));
    const year = yearParam ? Number(yearParam) : undefined;
    const day = dayParam ? Number(dayParam) : undefined;

    // 1) pool base por universidade
    let pool: Question[] = allQuestions.filter(
      (q) => q.university === university
    );

    if (pool.length === 0) {
      return NextResponse.json(
        { error: "Universidade não encontrada ou sem questões." },
        { status: 404 }
      );
    }

    // 2) aplica filtro por ano **apenas se encontrar resultados**
    if (year && !Number.isNaN(year)) {
      const byYear = pool.filter((q) => q.year === year);
      if (byYear.length > 0) pool = byYear;
    }

    // 3) aplica filtro por dia **apenas se encontrar resultados**
    if (day && !Number.isNaN(day)) {
      const byDay = pool.filter((q) => q.dia === day);
      if (byDay.length > 0) pool = byDay;
    }

    const result = pool
    .sort((a, b) => a.id - b.id) // ordena por id em ordem crescente
    .slice(0, count);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[GET /api/questions/[university]]", err);
    return NextResponse.json(
      { error: "Erro interno ao obter questões." },
      { status: 500 }
    );
  }
}


/* MODO REAL DA API IMPORTAÇÃO DE DADOS EXTERNOS A PARTIR DO BACK-END
import { NextResponse } from 'next/server';

// --- Tipagem para os dados recebidos da API e para o formato final ---

interface AlternativaBruta {
  letra: string;
  texto: string;
}

interface QuestaoBruta {
  numeroEnunciado: number | null;
  enunciado: string | null;
  alternativas: AlternativaBruta[] | null;
  opcaoCorreta: string | null;
  conteudo: string[] | null;
  imageNames?: string[];
}

interface ProvaBruta {
  nomeUniversidade: string;
  siglaUniversidade: string;
  nomeProva: string;
  ano: number;
  qtdeQuestoes: number;
  questoes: QuestaoBruta[];
}

interface QuestaoFormatada {
    id: number;
    university: string;
    year: number;
    text: {
      principal: string;
      subItens: any[];
    };
    options: string[];
    correctAnswer: number;
    materia: string[];
    conteudo: string[];
    imageNames?: string[];
    images?: string[];
}

// ==================================================================================
//                            LÓGICA DE FORMATAÇÃO LATEX
// ==================================================================================

/**
 * Formata de forma inteligente o texto para garantir a renderização LaTeX/KaTeX,
 * convertendo palavras-chave e envolvendo expressões matemáticas com delimitadores.
 * @param {string | null} text - O texto que pode conter fórmulas.
 * @returns {string} - O texto com as fórmulas devidamente delimitadas.

function formatLatexExpressions(text: string | null): string {
    if (typeof text !== 'string') {
        return "";
    }

    // Mapeamento de palavras-chave para seus equivalentes LaTeX
    const keywords: { [key: string]: string } = {
        'alpha': '\\alpha', 'beta': '\\beta', 'gamma': '\\gamma', 'delta': '\\delta',
        'epsilon': '\\epsilon', 'zeta': '\\zeta', 'eta': '\\eta', 'theta': '\\theta',
        'iota': '\\iota', 'kappa': '\\kappa', 'lambda': '\\lambda', 'mu': '\\mu',
        'nu': '\\nu', 'xi': '\\xi', 'pi': '\\pi', 'rho': '\\rho', 'sigma': '\\sigma',
        'tau': '\\tau', 'upsilon': '\\upsilon', 'phi': '\\phi', 'chi': '\\chi',
        'psi': '\\psi', 'omega': '\\omega',
        'sen': '\\sin', 'cos': '\\cos', 'tg': '\\tan', 'cotg': '\\cot', 'log': '\\log',
    };

    // Regex unificada e aprimorada para capturar termos matemáticos, incluindo aqueles com subscritos.
    const combinedRegex = new RegExp(
        `\\b(${Object.keys(keywords).join('|')}(_[a-zA-Z0-9]+)?)|` + // Palavras-chave com ou sem subscrito
        `([a-zA-Z0-9]+_[a-zA-Z0-9_]+)|` +       // Termos gerais com subscrito
        `([a-zA-Z0-9]+\\^[a-zA-Z0-9_]+)|` +      // Termos com sobrescrito
        `(\\w+/\\w+)|` +                        // Divisão
        `(\\\\[a-zA-Z]+)`,                      // Comandos LaTeX existentes
        'gi'
    );
    
    return text.replace(combinedRegex, (match) => {
        // Verifica se a correspondência já está dentro de delimitadores
        const index = text.indexOf(match);
        if (index > 0 && text[index - 1] === '$') {
            return match; // Já formatado, não faz nada
        }

        let latexToken = match;
        const lowerCaseMatch = match.toLowerCase();

        // Itera sobre as keywords para encontrar a correspondência correta (ex: "theta" em "theta_L")
        for (const key in keywords) {
            if (lowerCaseMatch.startsWith(key)) {
                const restOfToken = match.substring(key.length); // Pega o resto, ex: "_L"
                latexToken = keywords[key] + restOfToken; // Junta: \theta + _L = \theta_L
                break;
            }
        }
        
        return `$${latexToken}$`;
    }).replace(/\$\s*\$/g, ' '); // Limpeza final para juntar delimitadores adjacentes
}


// ==================================================================================
//                             FUNÇÃO PRINCIPAL DE FORMATAÇÃO
// ==================================================================================

/**
 * Transforma os dados brutos da API de questões para o formato esperado pelo front-end.
 * @param jsonData O JSON bruto recebido da API.
 * @returns Um array de questões formatadas.

function formatApiData(jsonData: any): QuestaoFormatada[] {
    const provaData: ProvaBruta = jsonData.prova || jsonData;

    if (!provaData || !Array.isArray(provaData.questoes)) {
        console.warn("Estrutura do JSON inesperada. O array 'questoes' não foi encontrado.");
        return [];
    }
    
    const questoesValidas = provaData.questoes.filter(q => q.opcaoCorreta !== null);

    return questoesValidas.map(questao => {
        const correctAnswerIndex = (questao.opcaoCorreta?.toString().toUpperCase().charCodeAt(0) ?? 65) - 65;

        let options: string[];
        if (Array.isArray(questao.alternativas) && questao.alternativas.length > 0) {
            options = questao.alternativas.map(alt => formatLatexExpressions(alt.texto));
        } else {
            options = ["A", "B", "C", "D", "E"];
        }

        const materias = new Set<string>();
        const conteudos: string[] = [];

        if (Array.isArray(questao.conteudo)) {
            questao.conteudo.forEach(item => {
                if (typeof item === 'string') {
                    const parts = item.split(' – ').map(s => s.trim());
                    const materia = parts[0];
                    const conteudoEspecifico = parts[1];
                    if (materia) materias.add(materia);
                    if (conteudoEspecifico) conteudos.push(conteudoEspecifico);
                }
            });
        }
        
        const questaoFormatada: QuestaoFormatada = {
            id: questao.numeroEnunciado || 0,
            university: provaData.siglaUniversidade?.toLowerCase() || 'desconhecida',
            year: provaData.ano || new Date().getFullYear(),
            text: {
                principal: formatLatexExpressions(questao.enunciado),
                subItens: []
            },
            options: options,
            correctAnswer: correctAnswerIndex,
            materia: Array.from(materias),
            conteudo: conteudos,
            imageNames: questao.imageNames || []
        };
        
        if (questaoFormatada.imageNames && questaoFormatada.imageNames.length > 0) {
            const universityFolderName = questaoFormatada.university.toUpperCase().replace(/-/g, '');
            questaoFormatada.images = questaoFormatada.imageNames.map(imageName => {
                return `https://raw.githubusercontent.com/projeto-EdTech/Docs/refs/heads/main/Banco%20de%20Imagens/banco%20de%20Imagens/${universityFolderName}/${questaoFormatada.year}/questao-${String(questaoFormatada.id).padStart(2, '0')}/${imageName}`;
            });
        }

        return questaoFormatada;
    });
}


// --- Rota da API ---

export async function GET(
  request: Request,
  { params }: { params: { university: string } }
) {
  const authHeader = request.headers.get('Authorization');
  const backendApiUrl = process.env.BACKEND_API_URL;
  const serverApiKey = process.env.BACKEND_API_KEY;

  if (!backendApiUrl || !serverApiKey) {
    console.error("Variáveis de ambiente BACKEND_API_URL ou BACKEND_API_KEY não estão configuradas.");
    return NextResponse.json({ message: "Erro de configuração no servidor." }, { status: 500 });
  }

  if (authHeader !== `Bearer ${serverApiKey}`) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const universitySlug = params.university.toLowerCase();

  try {
    const apiRes = await fetch(`${backendApiUrl}/api/exams/${universitySlug}`, { // Corrija o caminho se necessário
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 60,
      },
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.json().catch(() => ({ message: "Erro ao decodificar a resposta do back-end." }));
      return NextResponse.json(
        { message: errorData.message || "Ocorreu um erro ao buscar os dados." },
        { status: apiRes.status }
      );
    }

    const universityQuestionsRaw = await apiRes.json();
    
    const formattedQuestions = formatApiData(universityQuestionsRaw);

    return NextResponse.json(formattedQuestions);

  } catch (error) {
    console.error("Falha na chamada fetch para o back-end:", error);
    return NextResponse.json(
      { message: "Não foi possível conectar ao serviço de questões." },
      { status: 503 }
    );
  }
}
*/