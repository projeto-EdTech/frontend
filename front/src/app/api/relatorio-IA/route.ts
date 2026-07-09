import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Habilita o Edge Runtime
// Isso torna a resposta da API muito mais rápida para streaming.
//export const runtime = 'edge';

// --- Interfaces de Tipagem ---
interface Topic {
  name: string;
  percentage: number;
}

interface SubjectPerformance {
  subject: string;
  overallPercentage: number;
  topics: Topic[];
}

interface MonthlyProgress {
  label: string;
  value: number;
}

interface UserStats {
  simulados: number;
  questoes: number;
  acertos: number;
  eficiencia: number;
  pacing: string;
  resistencia: number;
}

interface UserData {
  stats: UserStats;
  subjectPerformance: SubjectPerformance[];
  monthlyProgress: MonthlyProgress[];
}

// --- ALTERAÇÃO: fetchUserDataFromDB agora simula dados aninhados ---
async function fetchUserDataFromDB(userId: string): Promise<UserData> {
  // LÓGICA REAL DO BANCO DE DADOS AQUI
  // Substitua esta simulação por suas chamadas ao DB (Prisma, Drizzle, etc.)
  console.log(`Simulando busca no DB para o usuário: ${userId}`);
  
  // Os dados de simulação agora incluem tópicos específicos
  return {
    stats: { 
      simulados: 50, 
      questoes: 450, 
      acertos: 352, 
      eficiencia: 78, 
      pacing: "3 minutos", 
      resistencia: 80
    },
    // --- Esta é a nova estrutura de dados detalhada ---
    subjectPerformance: [
      { 
        subject: "Matemática", 
        overallPercentage: 85,
        topics: [
          { name: "Álgebra", percentage: 90 },
          { name: "Geometria", percentage: 82 },
          { name: "Análise Combinatória", percentage: 80 }
        ]
      },
      { 
        subject: "Física", 
        overallPercentage: 72,
        topics: [
          { name: "Mecânica", percentage: 75 },
          { name: "Eletromagnetismo", percentage: 68 }, // Seu exemplo
          { name: "Óptica", percentage: 71 }
        ]
      },
      { 
        subject: "Química", 
        overallPercentage: 65, // Ponto de atenção geral
        topics: [
          { name: "Química Orgânica", percentage: 60 }, // Ponto de atenção específico
          { name: "Físico-Química", percentage: 62 },
          { name: "Química Inorgânica", percentage: 70 }
        ]
      },
      { 
        subject: "Biologia", 
        overallPercentage: 81,
        topics: [
          { name: "Ecologia", percentage: 88 },
          { name: "Citologia", percentage: 75 },
          { name: "Genética", percentage: 79 }
        ]
      }
    ],
    monthlyProgress: [
      { label: "Jun", value: 68 },
      { label: "Jul", value: 75 },
      { label: "Ago", value: 72 },
      { label: "Set", value: 78 },
    ]
  };
}
// --- Fim das Funções de Mock ---


// Configuração da API do Gemini
// Lembre-se de adicionar GEMINI_API_KEY ao seu .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


// Esta é a função que o front-end irá chamar (ex: GET /api/relatorio-IA)
export async function GET() {
  console.log("API /api/relatorio-IA (Edge) foi chamada.");

  try {
    // --- AUTENTICAÇÃO E BUSCA DE DADOS ---
  // Obtém a sessão real do NextAuth (API Route Handler)
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/core/auth");
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email || "Usuário não autenticado";
  const sessionName = session?.user?.name || "Sessão desconhecida";
    const { stats, subjectPerformance, monthlyProgress } = await fetchUserDataFromDB(userId);

    // Desestruturação dos dados gerais
    const {
      simulados,
      questoes,
      acertos,
      eficiencia,
      pacing,
      resistencia
    } = stats;

    // --- Lógica para formatar os dados aninhados para o prompt ---
    const performanceFormatada = subjectPerformance.map(subject => {
      const subjectStr = `- **${subject.subject} (Geral): ${subject.overallPercentage}%**`;
      const topicsStr = subject.topics.map(topic =>
        `  - ${topic.name}: ${topic.percentage}%`
      ).join('\n');

      // Retorna o bloco completo da matéria
      return subjectStr + '\n' + topicsStr;
    }).join('\n\n'); // Adiciona uma linha em branco entre as matérias

    // --- O PROMPT DETALHADO ---
    const prompt = `
      Você é um **mentor de estudos sênior** e **analista de dados educacionais** da plataforma **Vestibuline**.
      Sua função é **analisar o desempenho acadêmico de um estudante** com base nos dados fornecidos e **gerar um relatório personalizado, detalhado e motivacional**.
      O relatório deve traduzir os dados brutos em **insights significativos e humanos**, ajudando o aluno a compreender seu progresso, pontos fortes e áreas de melhoria.

      ⚠️ **Instrução importante:**  
      Comece sua resposta **diretamente com o conteúdo da seção solicitada**, sem introduções, cumprimentos, frases de concordância ("claro", "com certeza", "aqui está") ou repetições do contexto.  

      ---

      ### 🎯 Diretrizes de Produção:

      * **Não repita** os dados brutos literalmente. **Interprete-os** para gerar conclusões e recomendações.
      * Mantenha um **tom encorajador, honesto e profissional**, como um mentor que quer ver o aluno evoluir.
      * Use **markdown estruturado** com hierarquia clara de títulos (##, ###) e **emojis estratégicos** para facilitar a navegação visual.
      * Evite textos genéricos. Cada relatório deve soar **único e personalizado**, como se fosse escrito especialmente para o estudante.
      * A linguagem deve ser **clara, empática e motivadora**, equilibrando feedbacks positivos e construtivos.
      * **IMPORTANTE**: Use divisores visuais (---) entre seções principais para melhor separação.
      * Utilize **blocos de destaque** com > para informações-chave.
      * Organize dados numéricos em **tabelas markdown** quando apropriado para melhor legibilidade.

      ---

      ### 📊 DADOS DO ESTUDANTE:

      **Identificação:**
      * Nome: ${userId}
      * Sessão: ${sessionName}

      **Estatísticas Gerais:**
      * Simulados Realizados: ${simulados}
      * Questões Respondidas: ${questoes}
      * Acertos Totais: ${acertos}
      * Eficiência Geral: ${eficiencia}%
      * Pacing (tempo médio por questão): ${pacing}
      * Resistência (desempenho em sessões longas): ${resistencia}%

      **Performance por Matéria e Tópico (Percentual de Acertos):**
      ${performanceFormatada}

      **Progresso Mês a Mês (Evolução da Eficiência):**
      ${monthlyProgress.map(m => `- ${m.label}: ${m.value}%`).join('\n')}

      ---

      ### 🧩 ESTRUTURA DO RELATÓRIO:

      ## 1. Capa e Identificação do Relatório 📘

      **Formato:**
      Use um bloco de identificação limpo e institucional:

      **Estudante:** [Nome]  
      **Período Analisado:** [Período]  
      **Tipo:** Relatório de Desempenho Mensal  
      **Mentor Responsável:** Analista de Dados Educacionais Sênior | Vestibuline  
      **Data de Geração:** [Data]

      ---

      ## 2. Sumário Executivo ⚡

      **Formato:**
      Crie um resumo em formato de card de destaque usando blocos citação (>):

      > **Eficiência Geral:** XX%  
      > **Evolução Recente:** [Tendência positiva/estável/atenção]  
      > **Pontos Fortes:** [Matéria 1 (XX%), Matéria 2 (XX%)]  
      > **Áreas de Desenvolvimento:** [Matéria com performance mais baixa]

      **Recomendação Principal:**  
      > 🎯 **Foco do Próximo Ciclo:** [Matéria] — Tópico: [Tópico específico]

      Limite a 3-4 parágrafos curtos e objetivos após o card.

      ---

      ## 3. Visão Geral Global 🌍

      **Estrutura:**
      - Parágrafo inicial sobre o panorama geral (2-3 linhas)
      - **Análise de Consistência:** Subseção sobre volume e regularidade
      - **Análise de Eficiência:** Subseção sobre taxa de acertos
      - **Análise Comportamental:** Pacing e resistência

      Use ### para subseções e mantenha parágrafos concisos (3-4 linhas máximo).

      **Exemplo de estrutura:**

      ### Panorama Geral
      [Texto interpretativo sobre o desempenho global]

      ### Consistência e Volume de Estudos
      [Análise do volume e regularidade]

      ### Eficiência e Aproveitamento
      [Análise da taxa de acertos e padrões]

      ### Comportamento de Resolução
      [Análise de pacing e resistência]

      ---

      ## 4. Performance por Matéria 📚

      **Formato:**
      Organize em subseções claras por matéria, usando tabela para dados numéricos:

      ### Matemática 🔢
      **Desempenho:** XX%

      | Tópico | Acertos | Análise |
      |--------|---------|---------|
      | Álgebra | XX% | [Status] |
      | Geometria | XX% | [Status] |

      [Parágrafo interpretativo sobre a matéria]

      ---

      Repita para cada matéria com performance acima de 5% do total de questões.

      ---

      ## 5. Análise de Tópicos Específicos 🔎

      **Estrutura:**

      ### Tópicos de Destaque 🌟
      Liste os 3-5 tópicos com melhor desempenho em formato de bullet points com contexto.

      ### Tópicos Críticos ⚠️
      Liste os 3-5 tópicos com menor desempenho, incluindo análise de possível causa.

      **Formato para cada tópico:**
      - **[Nome do Tópico]** ([Matéria]) — XX% de acertos  
        [Breve análise interpretativa em 1-2 linhas]

      ---

      ## 6. Análise de Progresso 📈

      **Formato:**
      Apresente a evolução mensal em tabela seguida de análise narrativa:

      | Mês | Eficiência | Tendência |
      |-----|------------|-----------|
      | [Mês 1] | XX% | [↑/→/↓] |
      | [Mês 2] | XX% | [↑/→/↓] |
      | [Mês 3] | XX% | [↑/→/↓] |

      ### Interpretação da Evolução
      [3-4 parágrafos analisando tendências, causas prováveis e contexto]

      ---

      ## 7. Pontos Fortes 🚀

      **Formato:**
      Use cards de destaque para cada ponto forte principal:

      > **[Matéria/Tópico]** — XX% de acertos  
      > [Análise do que está funcionando bem]

      Limite a 3-4 pontos fortes principais, cada um em seu próprio bloco.

      ---

      ## 8. Pontos a Melhorar 🔬

      **Formato:**
      Organize como lista estruturada com análise de causa:

      ### [Matéria 1] — XX% de acertos

      **Tópicos de atenção:**
      - [Tópico A]: XX%
      - [Tópico B]: XX%

      **Análise de causas prováveis:**
      [Parágrafo interpretativo sobre as dificuldades]

      ---

      Repita para cada área de atenção.

      ---

      ## 9. Plano de Ação Personalizado 🧠

      **Formato:**
      Organize ações em cards numerados por prioridade:

      ### Ação 1 (Curto Prazo - 1-2 semanas) 🎯
      **Foco:** [Matéria/Tópico]  
      **Objetivo:** [Meta específica]  
      **Como fazer:**
      - [Passo 1]
      - [Passo 2]
      - [Passo 3]

      ---

      ### Ação 2 (Médio Prazo - 3-4 semanas) 📊
      [Mesma estrutura]

      ---

      Limite a 3-4 ações máximo, cada uma detalhada e prática.

      ---

      ## 10. Insights e Recomendações Extras 💡

      **Formato:**
      Use bullet points com emojis para diferentes categorias:

      **📚 Estratégias de Estudo:**
      - [Recomendação 1]
      - [Recomendação 2]

      **🔄 Otimização de Rotina:**
      - [Recomendação 1]
      - [Recomendação 2]

      **🛠️ Ferramentas Sugeridas:**
      - [Ferramenta/Método 1]
      - [Ferramenta/Método 2]

      ---

      ## 11. Conclusão Motivacional ✨

      **Formato:**
      Encerre com um bloco de destaque seguido de mensagem pessoal:

      > **Você está no caminho certo!** Sua dedicação e consistência são evidentes nos dados.

      [2-3 parágrafos de mensagem motivacional personalizada, reconhecendo esforços específicos e reforçando potencial de crescimento]

      **— Sua equipe Vestibuline está com você nessa jornada! 🚀**

      ---

      ### 📐 REGRAS DE FORMATAÇÃO OBRIGATÓRIAS:

      1. **Use ## para títulos principais e ### para subtítulos**
      2. **Insira --- entre seções principais**
      3. **Use > para destaques importantes**
      4. **Use tabelas markdown para dados comparativos**
      5. **Limite parágrafos a 4-5 linhas para melhor leitura**
      6. **Use emojis apenas em títulos, não no meio do texto**
      7. **Organize informações em cards visuais quando possível**
      8. **Mantenha hierarquia clara: dados → análise → recomendação**

      O resultado final deve ser um relatório visualmente organizado, fácil de navegar, com hierarquia clara e separação visual adequada entre seções.
      `;

    // --- Implementação do Streaming ---
    console.log("Enviando prompt para a API do Gemini (modo streaming)...");
    const result = await model.generateContentStream(prompt);

    // Criação do ReadableStream para enviar a resposta em "pedaços"
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      }
    });

    // --- RESPOSTA PARA O FRONT-END (Streaming) ---
    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error("Erro na API /api/relatorio-IA:", error);

    // Tratamento de erros (retorna JSON)
    if (error instanceof Error && error.message === "Usuário não autenticado") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Não foi possível gerar seu relatório neste momento." },
      { status: 500 }
    );
  }
}