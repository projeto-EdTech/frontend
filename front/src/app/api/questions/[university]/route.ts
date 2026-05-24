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
  dia: number | null;
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
    dia: number;
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
 */
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
 */
function formatApiData(jsonData: any): QuestaoFormatada[] {
    // Ajuste para suportar array de provas ou prova única
    // Se jsonData for array, pegamos o primeiro ou iteramos?
    // O código original assumia `jsonData.prova || jsonData`.
    // Vamos assumir que API retorna uma prova ou lista de questões.
    
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
            dia: questao.dia || 1,
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

export async function POST(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ university: string }> }
) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const LOG = `[API_QUESTIONS][${requestId}]`;

  console.log(`${LOG} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`${LOG} 🚀 Nova requisição recebida`);
  console.log(`${LOG}    Timestamp: ${new Date().toISOString()}`);
  console.log(`${LOG}    Método: POST`);
  console.log(`${LOG}    URL completa: ${request.url}`);

  const params = await paramsPromise;
  console.log(`${LOG}    Param [university]: ${params.university}`);

  const backendApiUrl = process.env.BACKEND_API_URL;
  console.log(`${LOG}    BACKEND_API_URL configurado: ${backendApiUrl ? 'SIM (' + backendApiUrl + ')' : 'NÃO'}`);

  if (!backendApiUrl) {
    console.error(`${LOG} ❌ BACKEND_API_URL não está configurado nas variáveis de ambiente.`);
    return NextResponse.json({ message: 'Erro de configuração no servidor.' }, { status: 500 });
  }

  // Headers da requisição
  const headersLog: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headersLog[key] = key.toLowerCase() === 'authorization' ? 'Bearer [REDACTED]' : value;
  });
  console.log(`${LOG}    Headers recebidos:`, JSON.stringify(headersLog, null, 2));

  const authHeader = request.headers.get('Authorization');
  const userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  console.log(`${LOG}    Token JWT presente: ${userToken ? 'SIM (primeiros 10 chars: ' + userToken.substring(0, 10) + '...)' : 'NÃO'}`);

  if (!userToken) {
    console.warn(`${LOG} ❌ Requisição sem token JWT. Retornando 401.`);
    return NextResponse.json({ error: 'Não autorizado: Token não fornecido.' }, { status: 401 });
  }

  try {
    // 1. EXTRAINDO DADOS DO CORPO DA REQUISIÇÃO
    let body: any = {};
    try {
      body = await request.json();
      console.log(`${LOG}    Body parseado com sucesso:`, JSON.stringify(body));
    } catch (e) {
      console.warn(`${LOG} ⚠️ Body não é JSON válido ou está vazio. Usando query params como fallback. Erro:`, e instanceof Error ? e.message : e);
    }

    const url = new URL(request.url);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => { queryParams[key] = value; });
    console.log(`${LOG}    Query params:`, JSON.stringify(queryParams));

    const rawYear = body.year || url.searchParams.get('year');
    const year = rawYear ? Number(rawYear) : undefined;
    const universitySlug = params.university.toUpperCase();

    console.log(`${LOG}    Parâmetros extraídos → universitySlug: "${universitySlug}", year: ${year ?? 'não informado'}`);

    // 2. CONFIGURANDO E ENVIANDO CHAMADA AO BACKEND
    const backendUrl = `${backendApiUrl}/api/prova/instituicao`;
    const backendPayload = { instituicao: universitySlug, ano: year, dia: 1 };

    console.log(`${LOG} 📤 Enviando requisição ao backend:`);
    console.log(`${LOG}    URL: ${backendUrl}`);
    console.log(`${LOG}    Payload:`, JSON.stringify(backendPayload));

    const fetchStart = Date.now();
    const apiRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify(backendPayload),
      cache: 'no-store',
    });
    const fetchDuration = Date.now() - fetchStart;

    console.log(`${LOG} 📥 Resposta recebida do backend (${fetchDuration}ms):`);
    console.log(`${LOG}    Status: ${apiRes.status} ${apiRes.statusText}`);
    const responseHeaders: Record<string, string> = {};
    apiRes.headers.forEach((value, key) => { responseHeaders[key] = value; });
    console.log(`${LOG}    Headers de resposta:`, JSON.stringify(responseHeaders));

    if (!apiRes.ok) {
      const errorData = await apiRes.json().catch(() => ({ message: 'Erro ao decodificar a resposta do back-end.' }));

      if (apiRes.status === 404) {
        console.warn(`${LOG} ⚠️ Questões não encontradas para: "${universitySlug}" (404)`);
        return NextResponse.json({ error: 'Universidade ou questões não encontradas' }, { status: 404 });
      }

      console.error(`${LOG} ❌ Erro retornado pelo backend. Status: ${apiRes.status} | Body:`, JSON.stringify(errorData));
      return NextResponse.json(
        { message: errorData.message || 'Ocorreu um erro ao buscar os dados.' },
        { status: apiRes.status }
      );
    }

    const universityQuestionsRaw = await apiRes.json();
    const rawJson = JSON.stringify(universityQuestionsRaw);
    console.log(`${LOG}    Tamanho do payload raw: ${rawJson.length} bytes`);
    console.log(`${LOG}    Preview do raw (primeiros 300 chars): ${rawJson.substring(0, 300)}...`);

    const provaData = universityQuestionsRaw.prova || universityQuestionsRaw;
    const totalBruto = Array.isArray(provaData?.questoes) ? provaData.questoes.length : 0;
    const semResposta = Array.isArray(provaData?.questoes)
      ? provaData.questoes.filter((q: QuestaoBruta) => q.opcaoCorreta === null).length
      : 0;
    console.log(`${LOG}    Questões brutas no payload: ${totalBruto}`);
    console.log(`${LOG}    Questões filtradas (sem opcaoCorreta): ${semResposta}`);
    console.log(`${LOG}    Questões válidas para formatação: ${totalBruto - semResposta}`);

    // 3. FORMATANDO DADOS
    console.log(`${LOG} 🔄 Iniciando formatação dos dados...`);
    const formatStart = Date.now();
    const formattedQuestions = formatApiData(universityQuestionsRaw);
    console.log(`${LOG}    Formatação concluída em ${Date.now() - formatStart}ms → ${formattedQuestions.length} questões`);

    // 4. APLICANDO FILTROS
    const countParam = url.searchParams.get('count');
    const yearParam = url.searchParams.get('year');
    let result = formattedQuestions;

    if (yearParam) {
      const y = Number(yearParam);
      if (!isNaN(y)) {
        const antes = result.length;
        result = result.filter(q => q.year === y);
        console.log(`${LOG}    Filtro year=${y} → ${antes} → ${result.length} questões`);
      } else {
        console.warn(`${LOG} ⚠️ yearParam inválido: "${yearParam}" (NaN). Filtro ignorado.`);
      }
    }

    console.log(`${LOG}    Ordenando ${result.length} questões por ID...`);
    result.sort((a, b) => a.id - b.id);
    console.log(`${LOG}    Ordenação concluída. Primeiro ID: ${result[0]?.id ?? 'N/A'}, Último ID: ${result[result.length - 1]?.id ?? 'N/A'}`);

    if (countParam) {
      const c = Number(countParam);
      if (!isNaN(c) && c > 0) {
        const antes = result.length;
        result = result.slice(0, c);
        console.log(`${LOG}    Filtro count=${c} → ${antes} → ${result.length} questões`);
      } else {
        console.warn(`${LOG} ⚠️ countParam inválido: "${countParam}". Filtro ignorado.`);
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log(`${LOG} ✅ Sucesso! Retornando ${result.length} questões ao frontend.`);
    console.log(`${LOG}    Tempo total de execução: ${totalDuration}ms`);
    console.log(`${LOG} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    return NextResponse.json(result);

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`${LOG} ❌ Erro inesperado após ${totalDuration}ms:`);
    console.error(`${LOG}    Tipo:`, error instanceof Error ? error.constructor.name : typeof error);
    console.error(`${LOG}    Mensagem:`, error instanceof Error ? error.message : String(error));
    console.error(`${LOG}    Stack:`, error instanceof Error ? error.stack : 'N/A');
    console.log(`${LOG} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    return NextResponse.json(
      { message: 'Não foi possível buscar as questões. Verifique se o corpo da requisição está correto.' },
      { status: 503 }
    );
  }
}
