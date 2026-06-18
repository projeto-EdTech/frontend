export interface FlashCard {
  id: number;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject?: string;
  topic?: string;
  available?: boolean;
}

export interface FlashCardTopic {
  name: string;
  cards: FlashCard[];
}

export interface FlashCardSubject {
  subject: string;
  topics: FlashCardTopic[];
}

export interface FlashCardGameProps {
  onComplete?: (result: { correct: number; total: number }) => void;
}

export interface GameScore {
  correct: number;
  incorrect: number;
}

export interface GameState {
  cards: FlashCard[];
  availableSubjects: string[];
  error: string | null;
  gameStarted: boolean;
  selectedSubject: string;
  currentIndex: number;
  isFlipped: boolean;
  score: GameScore;
  reviewedCards: number[];
  correctIds: number[];
  gameCards: FlashCard[];
  isComplete: boolean;
  showingAnswer: boolean;
  points: number;
  comboCount: number;
  isComboActive: boolean;
  multiplier: number;
  isLoading: boolean;
}

// Constantes
export const SUBJECT_COLORS: Record<string, string> = {
  'Matemática': '#ef4444',
  'Física': '#3b82f6',
  'Química': '#10b981',
  'História': '#f59e0b',
  'Geografia': '#8b5cf6',
  'Português': '#f97316',
  'Literatura': '#06b6d4',
  'Biologia': '#84cc16',
  'Inglês': '#ec4899',
  'Filosofia': '#64748b',
};

export const DEFAULT_SUBJECT_COLOR = '#6366f1';

export const DIFFICULTY_POINTS = {
  easy: 5,
  medium: 10,
  hard: 20,
} as const;

export const COMBO_THRESHOLDS = {
  BASIC: 3,
  ADVANCED: 5,
} as const;

export const COMBO_MULTIPLIERS = {
  NONE: 1,
  BASIC: 1.5,
  ADVANCED: 2,
} as const;

export const COMBO_COLORS = {
  BASIC: ['#FFA500', '#FF4500', '#FFD700', '#FF6347'],
  ADVANCED: ['#FFD700', '#FFA500', '#FF4500', '#FF1493'],
} as const;

// Tipos de dados
// Dados dos flash cards organizados por Matéria > Tópico > Cards
export const flashCardsData: FlashCardSubject[] = [
  {
    subject: "Matemática",
    topics: [
      {
        name: "Geometria Plana",
        cards: [
          { id: 1, question: "Qual é a fórmula da **Área de um Triângulo Equilátero** em função do lado $l$?", answer: "$A = \\frac{l^2 \\sqrt{3}}{4}$", difficulty: "medium" },
          { id: 13, question: "Qual é a fórmula da **Área de um Trapézio**?", answer: "$A = \\frac{(B + b) \\cdot h}{2}$", difficulty: "easy" },
          { id: 19, question: "Qual o valor da **Soma dos Ângulos Internos** de um polígono convexo de $n$ lados?", answer: "$S_i = (n - 2) \\cdot 180^\\circ$", difficulty: "medium" },
          { id: 21, question: "Qual é a fórmula da **Área de um Círculo** de raio $r$?", answer: "$A = \\pi r^2$", difficulty: "easy" },
          { id: 28, question: "Qual a relação entre o **Lado ($l$) e a Apótema ($a$)** de um quadrado inscrito num círculo de raio $R$?", answer: "$l = R\\sqrt{2}$ e $a = \\frac{l}{2}$", difficulty: "hard" },
          { id: 30, question: "Qual a fórmula da **Área de um Losango**?", answer: "$A = \\frac{D \\cdot d}{2}$", difficulty: "easy" },
          { id: 41, question: "Qual a fórmula da **Área de um Setor Circular** de raio $r$ e ângulo $\\alpha$ (em radianos)?", answer: "$A = \\frac{1}{2} r^2 \\alpha$", difficulty: "medium" },
          { id: 43, question: "O que afirma o **Teorema de Pitágoras**?", answer: "$a^2 = b^2 + c^2$, onde $a$ é a hipotenusa.", difficulty: "easy" }
        ]
      },
      {
        name: "Álgebra",
        cards: [
          { id: 2, question: "Em uma PA, qual a fórmula do **Termo Geral** ($a_n$)?", answer: "$a_n = a_1 + (n - 1) \\cdot r$", difficulty: "easy" },
          { id: 4, question: "Como se calcula a soma dos termos de uma PG infinita (convergente)?", answer: "$S_{\\infty} = \\frac{a_1}{1 - q}, \\text{ para } |q| < 1$", difficulty: "medium" },
          { id: 8, question: "Qual a condição para que uma equação do 2º grau tenha **duas raízes reais e iguais**?", answer: "$\\Delta = 0$", difficulty: "easy" },
          { id: 9, question: "Qual a fórmula da **Soma ($S$) e do Produto ($P$)** das raízes de uma equação do 2º grau?", answer: "$S = -\\frac{b}{a}$ e $P = \\frac{c}{a}$", difficulty: "medium" },
          { id: 15, question: "Qual a fórmula para calcular o **Logaritmo de um produto**, ou seja, $\\log_b(m \\cdot n)$?", answer: "$\\log_b(m) + \\log_b(n)$", difficulty: "medium" },
          { id: 17, question: "Como se calcula a **Razão ($q$)** de uma Progressão Geométrica (PG)?", answer: "$q = \\frac{a_n}{a_{n-1}}$", difficulty: "easy" },
          { id: 20, question: "Qual a fórmula do **Termo Geral de uma Expansão Binomial** (Binômio de Newton)?", answer: "$T_{p+1} = \\binom{n}{p} a^{n-p} b^p$", difficulty: "hard" },
          { id: 27, question: "Qual a fórmula para a **Soma dos Termos de uma PA** finita?", answer: "$S_n = \\frac{(a_1 + a_n) \\cdot n}{2}$", difficulty: "medium" },
          { id: 29, question: "Qual o valor do **Logaritmo de 1** em qualquer base $b$ ($b > 0$ e $b \\neq 1$)?", answer: "$\\log_b(1) = 0$", difficulty: "easy" },
          { id: 40, question: "Qual é o valor do **Logaritmo da base**: $\\log_b(b)$?", answer: "1", difficulty: "easy" },
          { id: 45, question: "Qual a fórmula para a **Mudança de Base** de um logaritmo: $\\log_a(b)$ para base $c$?", answer: "$\\frac{\\log_c(b)}{\\log_c(a)}$", difficulty: "medium" }
        ]
      },
      {
        name: "Trigonometria",
        cards: [
          { id: 3, question: "Qual a **Relação Fundamental** da Trigonometria?", answer: "$\\operatorname{sen}^2(x) + \\cos^2(x) = 1$", difficulty: "easy" },
          { id: 6, question: "No Ciclo Trigonométrico, quais são os valores de **seno e cosseno de $90^\\circ$** ($\\pi/2$)?", answer: "$\\operatorname{sen}(90^\\circ) = 1$ e $\\cos(90^\\circ) = 0$", difficulty: "medium" },
          { id: 10, question: "Como converter um ângulo de **Graus para Radianos**?", answer: "$x_{rad} = x^\\circ \\cdot \\frac{\\pi}{180^\\circ}$", difficulty: "easy" },
          { id: 14, question: "Na Trigonometria, qual o valor da **tangente** em função de seno e cosseno?", answer: "$\\tan(x) = \\frac{\\operatorname{sen}(x)}{\\cos(x)}$", difficulty: "easy" },
          { id: 37, question: "Qual a fórmula do **Cosseno da Soma**: $\\cos(a + b)$?", answer: "$\\cos(a)\\cos(b) - \\operatorname{sen}(a)\\operatorname{sen}(b)$", difficulty: "medium" },
          { id: 38, question: "Qual a fórmula do **Seno da Soma**: $\\operatorname{sen}(a + b)$?", answer: "$\\operatorname{sen}(a)\\cos(b) + \\operatorname{sen}(b)\\cos(a)$", difficulty: "medium" },
          { id: 50, question: "Qual a lei dos senos em um triângulo qualquer?", answer: "$\\frac{a}{\\operatorname{sen} A} = \\frac{b}{\\operatorname{sen} B} = \\frac{c}{\\operatorname{sen} C} = 2R$", difficulty: "hard" }
        ]
      },
      {
        name: "Geometria Analítica",
        cards: [
          { id: 5, question: "Qual a fórmula da **Distância entre dois pontos** $A(x_1, y_1)$ e $B(x_2, y_2)$?", answer: "$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$", difficulty: "easy" },
          { id: 18, question: "Qual a fórmula da **Equação Reduzida da Reta**?", answer: "$y = mx + n$", difficulty: "easy" },
          { id: 25, question: "Na Geometria Analítica, qual a **Equação Geral da Reta**?", answer: "$ax + by + c = 0$", difficulty: "easy" },
          { id: 39, question: "Qual a equação reduzida de uma **Circunferência** com centro $(x_c, y_c)$ e raio $r$?", answer: "$(x - x_c)^2 + (y - y_c)^2 = r^2$", difficulty: "medium" }
        ]
      },
      {
        name: "Geometria Plana",
        cards: [
          { id: 1, question: "Qual é a fórmula da **Área de um Triângulo Equilátero** em função do lado $l$?", answer: "$A = \\frac{l^2 \\sqrt{3}}{4}$", difficulty: "medium" },
          { id: 13, question: "Qual é a fórmula da **Área de um Trapézio**?", answer: "$A = \\frac{(B + b) \\cdot h}{2}$", difficulty: "easy" },
          { id: 19, question: "Qual o valor da **Soma dos Ângulos Internos** de um polígono convexo de $n$ lados?", answer: "$S_i = (n - 2) \\cdot 180^\\circ$", difficulty: "medium" },
          { id: 21, question: "Qual é a fórmula da **Área de um Círculo** de raio $r$?", answer: "$A = \\pi r^2$", difficulty: "easy" },
          { id: 28, question: "Qual a relação entre o **Lado ($l$) e a Apótema ($a$)** de um quadrado inscrito num círculo de raio $R$?", answer: "$l = R\\sqrt{2}$ e $a = \\frac{l}{2}$", difficulty: "hard" },
          { id: 30, question: "Qual a fórmula da **Área de um Losango**?", answer: "$A = \\frac{D \\cdot d}{2}$", difficulty: "easy" },
          { id: 41, question: "Qual a fórmula da **Área de um Setor Circular** de raio $r$ e ângulo $\\alpha$ (em radianos)?", answer: "$A = \\frac{1}{2} r^2 \\alpha$", difficulty: "medium" },
          { id: 43, question: "O que afirma o **Teorema de Pitágoras**?", answer: "$a^2 = b^2 + c^2$, onde $a$ é a hipotenusa.", difficulty: "easy" },
        ]
      },
      {
        name: "Geometria Espacial",
        cards: [
          { id: 7, question: "Como se calcula o **Volume de uma Esfera** de raio $R$?", answer: "$V = \\frac{4}{3} \\pi R^3$", difficulty: "medium" },
          { id: 11, question: "Qual é a fórmula do **Volume de um Cilindro** de raio $r$ e altura $h$?", answer: "$V = \\pi r^2 h$", difficulty: "easy" },
          { id: 16, question: "Qual é a fórmula da **Área Total de um Cubo** de aresta $a$?", answer: "$A_t = 6a^2$", difficulty: "easy" },
          { id: 22, question: "Como se calcula o **Volume de uma Pirâmide** qualquer?", answer: "$V = \\frac{1}{3} \\cdot A_b \\cdot h$", difficulty: "medium" },
          { id: 24, question: "Qual a fórmula da **Área Lateral de um Cilindro** reto?", answer: "$A_l = 2\\pi rh$", difficulty: "medium" },
          { id: 42, question: "Como se calcula a **Diagonal de um Cubo** de aresta $a$?", answer: "$d = a\\sqrt{3}$", difficulty: "medium" },
          { id: 48, question: "Qual a fórmula da **Área Lateral de um Cone** reto?", answer: "$A_l = \\pi r g$, onde $g$ é a geratriz.", difficulty: "medium" }
        ]
      },
      {
        name: "Probabilidade e Estatística",
        cards: [
          { id: 12, question: "Como se define a **Probabilidade** de um evento $A$ ocorrer em um espaço amostral $S$?", answer: "$P(A) = \\frac{n(A)}{n(S)}$", difficulty: "easy" },
          { id: 23, question: "Qual é a definição de **Moda** em um conjunto de dados estatísticos?", answer: "É o valor que aparece com maior frequência no conjunto.", difficulty: "easy" },
          { id: 26, question: "Como se calcula a **Média Aritmética Simples** de $n$ elementos?", answer: "$\\bar{x} = \\frac{\\sum_{i=1}^{n} x_i}{n}$", difficulty: "easy" },
          { id: 44, question: "Qual a fórmula da **Variância** (amostral) $\\sigma^2$?", answer: "$\\sigma^2 = \\frac{\\sum (x_i - \\bar{x})^2}{n-1}$", difficulty: "hard" },
          { id: 49, question: "Qual a definição de **Mediana** em estatística?", answer: "O valor central de um conjunto de dados ordenados (Rol).", difficulty: "easy" }
        ]
      },
      {
        name: "Análise Combinatória",
        cards: [
          { id: 31, question: "Qual a fórmula de **Arranjo Simples** de $n$ elementos tomados $p$ a $p$?", answer: "$A_{n,p} = \\frac{n!}{(n-p)!}$", difficulty: "medium" },
          { id: 32, question: "Qual a fórmula de **Combinação Simples** de $n$ elementos tomados $p$ a $p$?", answer: "$C_{n,p} = \\frac{n!}{p!(n-p)!}$", difficulty: "medium" },
          { id: 46, question: "Qual o valor de **$n!$** (n fatorial) por definição?", answer: "$n \\cdot (n-1) \\cdot (n-2) \\dots 1$", difficulty: "easy" }
        ]
      },
      {
        name: "Números Complexos e Matrizes",
        cards: [
          { id: 33, question: "Como se define a unidade imaginária $i$ nos **Números Complexos**?", answer: "$i = \\sqrt{-1} \\text{ ou } i^2 = -1$", difficulty: "easy" },
          { id: 34, question: "Qual a **Forma Trigonométrica** (ou polar) de um número complexo $z$?", answer: "$z = |z|(\\cos \\theta + i \\operatorname{sen} \\theta)$", difficulty: "hard" },
          { id: 35, question: "Como se calcula o **Determinante** de uma matriz $2 \\times 2$ $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$?", answer: "$ad - bc$", difficulty: "easy" }
        ]
      },
      {
        name: "Funções",
        cards: [
          { id: 36, question: "Qual a condição para que uma função seja considerada **Injetora**?", answer: "Elementos distintos no domínio possuem imagens distintas no contradomínio.", difficulty: "medium" },
          { id: 47, question: "Como encontrar as coordenadas do **Vértice de uma Parábola** ($x_v$)?", answer: "$x_v = -\\frac{b}{2a}$", difficulty: "medium" }
        ]
      }
    ]
  },
  {
    subject: "Física",
    topics: [
      {
        name: "Cinemática",
        cards: [
          { id: 51, question: "Qual a fórmula da **Velocidade Escalar Média**?", answer: "$v_m = \\frac{\\Delta s}{\\Delta t}$", difficulty: "easy" },
          { id: 76, question: "Qual a fórmula do **Alcance Máximo** em um lançamento oblíquo (no mesmo nível)?", answer: "$A = \\frac{v_0^2 \\cdot \\operatorname{sen}(2\\theta)}{g}$", difficulty: "hard" },
          { id: 78, question: "Qual a fórmula para a **Aceleração Centrípeta**?", answer: "$a_c = \\frac{v^2}{R}$", difficulty: "easy" },
          { id: 90, question: "Qual a relação entre **Velocidade Angular ($\\omega$) e Frequência ($f$)**?", answer: "$\\omega = 2\\pi f$", difficulty: "medium" }
        ]
      },
      {
        name: "Dinâmica",
        cards: [
          { id: 52, question: "Enuncie a **Segunda Lei de Newton** (Princípio Fundamental da Dinâmica).", answer: "$\\vec{F}_{res} = m \\cdot \\vec{a}$", difficulty: "easy" },
          { id: 56, question: "Como se calcula o **Trabalho ($W$)** realizado por uma força constante?", answer: "$W = F \\cdot d \\cdot \\cos(\\theta)$", difficulty: "medium" },
          { id: 70, question: "Qual a fórmula do **Momento Linear** (ou Quantidade de Movimento)?", answer: "$\\vec{Q} = m \\cdot \\vec{v}$", difficulty: "easy" },
          { id: 99, question: "Como se calcula o **Impulso** de uma força constante?", answer: "$\\vec{I} = \\vec{F} \\cdot \\Delta t$", difficulty: "easy" }
        ]
      },
      {
        name: "Energia",
        cards: [
          { id: 53, question: "Como se calcula a **Energia Cinética** de um corpo?", answer: "$E_c = \\frac{m \\cdot v^2}{2}$", difficulty: "medium" },
          { id: 58, question: "Qual a fórmula da **Energia Potencial Gravitacional**?", answer: "$E_p = m \\cdot g \\cdot h$", difficulty: "easy" },
          { id: 74, question: "Qual a fórmula para a **Energia Potencial Elástica**?", answer: "$E_{pe} = \\frac{k \\cdot x^2}{2}$", difficulty: "easy" }
        ]
      },
      {
        name: "Termologia",
        cards: [
          { id: 54, question: "Qual a equação fundamental da **Calorimetria** (Calor Sensível)?", answer: "$Q = m \\cdot c \\cdot \\Delta T$", difficulty: "easy" },
          { id: 72, question: "Como se calcula a **Dilatação Linear** de um corpo sólido?", answer: "$\\Delta L = L_0 \\cdot \\alpha \\cdot \\Delta T$", difficulty: "easy" },
          { id: 88, question: "Como se calcula o **Calor Latente** de mudança de fase?", answer: "$Q = m \\cdot L$", difficulty: "easy" }
        ]
      },
      {
        name: "Eletrodinâmica",
        cards: [
          { id: 55, question: "Qual a fórmula da **Primeira Lei de Ohm**?", answer: "$U = R \\cdot i$", difficulty: "easy" },
          { id: 60, question: "Qual a fórmula para a **Potência Elétrica** consumida por um resistor?", answer: "$P = U \\cdot i$ ou $P = R \\cdot i^2$", difficulty: "medium" },
          { id: 92, question: "Como se calcula a **Resistência Equivalente** em um circuito em série?", answer: "$R_{eq} = R_1 + R_2 + \\dots + R_n$", difficulty: "easy" }
        ]
      },
      {
        name: "Ondulatória",
        cards: [
          { id: 57, question: "Qual a relação entre **Velocidade, Comprimento de Onda ($\\lambda$) e Frequência ($f$)**?", answer: "$v = \\lambda \\cdot f$", difficulty: "medium" },
          { id: 84, question: "Qual a fórmula da **Velocidade de uma onda em uma corda** (Fórmula de Taylor)?", answer: "$v = \\sqrt{\\frac{T}{\\mu}}$", difficulty: "hard" },
          { id: 87, question: "Qual a fórmula da **Frequência Aparente** no Efeito Doppler?", answer: "$f_{ap} = f_{real} \\left( \\frac{v \\pm v_{obs}}{v \\mp v_{fonte}} \\right)$", difficulty: "hard" },
          { id: 93, question: "Qual a fórmula da **Intensidade Sonora** ($I$)?", answer: "$I = \\frac{P}{A}$", difficulty: "medium" }
        ]
      },
      {
        name: "Hidrostática",
        cards: [
          { id: 59, question: "Como é definida a **Pressão ($P$)** sobre uma superfície?", answer: "$P = \\frac{F}{A}$", difficulty: "easy" },
          { id: 69, question: "Como se calcula o **Empuxo ($E$)** exercido por um fluido (Princípio de Arquimedes)?", answer: "$E = d_{fluido} \\cdot V_{sub} \\cdot g$", difficulty: "medium" },
          { id: 95, question: "Como se calcula a **Pressão Hidrostática** (Lei de Stevin)?", answer: "$P = d \\cdot g \\cdot h$", difficulty: "easy" }
        ]
      },
      {
        name: "Óptica",
        cards: [
          { id: 61, question: "Qual é a **Equação de Gauss** para lentes e espelhos esféricos?", answer: "$\\frac{1}{f} = \\frac{1}{p} + \\frac{1}{p'}$", difficulty: "medium" },
          { id: 65, question: "Como se calcula o **Índice de Refração ($n$)** de um meio?", answer: "$n = \\frac{c}{v}$", difficulty: "easy" },
          { id: 68, question: "O que diz a **Lei de Snell-Descartes**?", answer: "$n_1 \\cdot \\operatorname{sen}(\\theta_1) = n_2 \\cdot \\operatorname{sen}(\\theta_2)$", difficulty: "medium" },
          { id: 96, question: "Qual a fórmula do **Aumento Linear Transversal** ($A$) em espelhos?", answer: "$A = \\frac{i}{o} = -\\frac{p'}{p}$", difficulty: "medium" },
          { id: 97, question: "Qual a relação entre o **Raio de Curvatura ($R$) e a Distância Focal ($f$)**?", answer: "$f = \\frac{R}{2}$", difficulty: "easy" }
        ]
      },
      {
        name: "Termodinâmica",
        cards: [
          { id: 62, question: "Enuncie a **Primeira Lei da Termodinâmica**.", answer: "$\\Delta U = Q - W$", difficulty: "medium" },
          { id: 66, question: "Qual a equação de estado dos **Gases Ideais** (Equação de Clapeyron)?", answer: "$P \\cdot V = n \\cdot R \\cdot T$", difficulty: "easy" },
          { id: 79, question: "Como se calcula o **Trabalho em uma transformação isobárica**?", answer: "$W = P \\cdot \\Delta V$", difficulty: "medium" },
          { id: 89, question: "Qual a fórmula do **Rendimento ($n$) de uma Máquina Térmica**?", answer: "$n = 1 - \\frac{Q_2}{Q_1}$", difficulty: "medium" },
          { id: 100, question: "Qual o valor da **Constante Universal dos Gases** ($R$) em $atm \\cdot L / mol \\cdot K$?", answer: "$0,082$", difficulty: "medium" }
        ]
      },
      {
        name: "Eletrostática",
        cards: [
          { id: 63, question: "Qual a fórmula da **Lei de Coulomb** para a força entre duas cargas?", answer: "$F = k \\frac{|q_1 \\cdot q_2|}{d^2}$", difficulty: "medium" },
          { id: 81, question: "Qual é a fórmula da **Capacitância** ($C$) de um capacitor?", answer: "$C = \\frac{Q}{U}$", difficulty: "easy" },
          { id: 98, question: "Qual a fórmula da **Energia Potencial Elétrica** entre duas cargas?", answer: "$E_p = k \\frac{q_1 \\cdot q_2}{d}$", difficulty: "medium" }
        ]
      },
      {
        name: "Gravitação",
        cards: [
          { id: 64, question: "Qual a fórmula da **Velocidade de Escape** de um planeta?", answer: "$v_e = \\sqrt{\\frac{2GM}{R}}$", difficulty: "hard" },
          { id: 80, question: "Qual a relação da **Terceira Lei de Kepler** (Lei dos Períodos)?", answer: "$\\frac{T^2}{R^3} = K$", difficulty: "medium" }
        ]
      },
      {
        name: "Oscilações (MHS)",
        cards: [
          { id: 67, question: "Qual a fórmula do **Período ($T$)** de um pêndulo simples?", answer: "$T = 2\\pi \\sqrt{\\frac{L}{g}}$", difficulty: "hard" }
        ]
      },
      {
        name: "Eletromagnetismo",
        cards: [
          { id: 71, question: "Qual a fórmula da **Força Magnética** sobre uma carga móvel em um campo magnético?", answer: "$F_m = |q| \\cdot v \\cdot B \\cdot \\operatorname{sen}(\\theta)$", difficulty: "medium" },
          { id: 75, question: "O que diz a **Lei de Lenz** no eletromagnetismo?", answer: "O sentido da corrente induzida é tal que seu campo magnético se opõe à variação do fluxo que a produziu.", difficulty: "hard" },
          { id: 77, question: "Como se calcula o **Fluxo Magnético** ($\\Phi$) através de uma superfície?", answer: "$\\Phi = B \\cdot A \\cdot \\cos(\\theta)$", difficulty: "medium" },
          { id: 82, question: "Como se calcula o **Módulo do Campo Magnético** gerado por um fio retilíneo longo?", answer: "$B = \\frac{\\mu_0 \\cdot i}{2\\pi r}$", difficulty: "hard" },
          { id: 91, question: "Qual a **Segunda Lei de Faraday** (Indução Eletromagnética)?", answer: "$\\epsilon = -\\frac{\\Delta \\Phi}{\\Delta t}$", difficulty: "hard" }
        ]
      },
      {
        name: "Hidrodinâmica",
        cards: [
          { id: 73, question: "Qual a **Equação da Continuidade** para fluidos ideais?", answer: "$A_1 \\cdot v_1 = A_2 \\cdot v_2$", difficulty: "medium" }
        ]
      },
      {
        name: "Física Moderna",
        cards: [
          { id: 83, question: "Qual a relação entre a **Energia de um Fóton** e sua frequência ($f$)?", answer: "$E = h \\cdot f$", difficulty: "medium" },
          { id: 94, question: "Qual a **Equação de Einstein** para a equivalência massa-energia?", answer: "$E = m \\cdot c^2$", difficulty: "easy" }
        ]
      },
      {
        name: "Estática",
        cards: [
          { id: 85, question: "Como se define o **Momento de uma Força** (Torque)?", answer: "$\\tau = F \\cdot d \\cdot \\operatorname{sen}(\\theta)$", difficulty: "medium" },
          { id: 86, question: "Qual a condição de **Equilíbrio de um Ponto Material**?", answer: "$\\sum \\vec{F} = 0$", difficulty: "easy" }
        ]
      }
    ]
  },
  {
    subject: "Química",
    topics: [
      {
        name: "Química Geral",
        cards: [
          { id: 101, question: "Como se calcula o **Número de Mols** ($n$) de uma substância?", answer: "$n = \\frac{m}{M}$, onde $m$ é a massa e $M$ a massa molar.", difficulty: "easy" },
          { id: 106, question: "Qual a fórmula da **Densidade** ($d$) de um corpo?", answer: "$d = \\frac{m}{V}$", difficulty: "easy" },
          { id: 129, question: "Qual o nome do processo de separação baseado na **diferença de pontos de ebulição**?", answer: "Destilação", difficulty: "easy" },
          { id: 130, question: "O que é uma **Mistura Azeotrópica**?", answer: "Mistura que se comporta como substância pura durante a ebulição (ponto de ebulição constante).", difficulty: "hard" }
        ]
      },
      {
        name: "Soluções",
        cards: [
          { id: 102, question: "Qual a relação para calcular a **Concentração Comum** ($C$) de uma solução?", answer: "$C = \\frac{m_{soluto}}{V_{solução}}$", difficulty: "easy" },
          { id: 104, question: "Qual a fórmula para calcular a **Molaridade** ($M$ ou $[ ]$) de uma solução?", answer: "$M = \\frac{n_{soluto}}{V_{solução}}$", difficulty: "medium" },
          { id: 110, question: "Qual a fórmula para o cálculo da **Título ($T$)** em massa de uma solução?", answer: "$T = \\frac{m_{soluto}}{m_{solução}}$", difficulty: "easy" }
        ]
      },
      {
        name: "Atomística",
        cards: [
          { id: 103, question: "O que define um **Isótopo**?", answer: "Átomos do mesmo elemento (mesmo número atômico $Z$) que possuem diferentes números de massa ($A$).", difficulty: "easy" },
          { id: 105, question: "Segundo o Princípio de exclusão de Pauli, quantos **elétrons**, no máximo, podem ocupar um mesmo orbital?", answer: "2 elétrons, com spins opostos.", difficulty: "medium" },
          { id: 148, question: "O que é um **Isóbaro**?", answer: "Átomos de elementos diferentes que possuem o mesmo número de massa ($A$).", difficulty: "easy" }
        ]
      },
      {
        name: "Propriedades Periódicas",
        cards: [
          { id: 107, question: "Na Tabela Periódica, o que define a **Eleternegetividade**?", answer: "A tendência de um átomo de atrair elétrons para si em uma ligação química.", difficulty: "medium" }
        ]
      },
      {
        name: "Gases",
        cards: [
          { id: 108, question: "Qual o valor do **Volume Molar** de um gás ideal nas CNTP?", answer: "$22,4 \\text{ L/mol}$", difficulty: "easy" }
        ]
      },
      {
        name: "Ligações Químicas",
        cards: [
          { id: 109, question: "O que caracteriza uma **Ligação Iônica**?", answer: "A transferência definitiva de elétrons de um metal (cátion) para um ametal (ânion).", difficulty: "medium" },
          { id: 120, question: "O que caracteriza uma **Ligação Covalente Sigma ($\\sigma$)**?", answer: "Ligação simples resultante da interpenetração frontal de orbitais atômicos.", difficulty: "hard" },
          { id: 123, question: "Qual é a geometria molecular da molécula de **Água ($H_2O$)**?", answer: "Angular", difficulty: "medium" },
          { id: 149, question: "Qual a geometria da molécula de **Metano** ($CH_4$)?", answer: "Tetraédrica", difficulty: "easy" }
        ]
      },
      {
        name: "Termoquímica",
        cards: [
          { id: 111, question: "Como se calcula a **Variação de Entalpia** ($\\Delta H$) de uma reação?", answer: "$\\Delta H = H_{produtos} - H_{reagentes}$", difficulty: "easy" },
          { id: 112, question: "O que caracteriza uma reação **Exotérmica**?", answer: "Liberação de calor para o meio e $\\Delta H < 0$.", difficulty: "easy" },
          { id: 114, question: "O que afirma a **Lei de Hess**?", answer: "A variação de entalpia de uma reação depende apenas dos estados inicial e final, independentemente das etapas intermediárias.", difficulty: "medium" }
        ]
      },
      {
        name: "Equilíbrio Químico",
        cards: [
          { id: 113, question: "Qual a expressão da **Constante de Equilíbrio** ($K_c$) para a reação: $aA + bB \\rightleftharpoons cC + dD$?", answer: "$K_c = \\frac{[C]^c \\cdot [D]^d}{[A]^a \\cdot [B]^b}$", difficulty: "medium" },
          { id: 128, question: "O que afirma o **Princípio de Le Chatelier**?", answer: "Quando um sistema em equilíbrio sofre uma perturbação, ele se desloca no sentido de minimizar essa perturbação.", difficulty: "hard" },
          { id: 142, question: "Como se calcula a **Constante de Ionização de um Ácido** ($K_a$)?", answer: "$K_a = \\frac{[H^+][A^-]}{[HA]}$", difficulty: "medium" }
        ]
      },
      {
        name: "Equilíbrio Iônico",
        cards: [
          { id: 115, question: "Qual é a definição de **pH**?", answer: "$pH = -\\log[H^+]$", difficulty: "medium" },
          { id: 119, question: "Qual a relação entre **pH e pOH** a 25°C?", answer: "$pH + pOH = 14$", difficulty: "easy" },
          { id: 143, question: "O que é uma **Solução Tampão**?", answer: "Uma solução que resiste a variações de pH quando pequenas quantidades de ácidos ou bases são adicionadas.", difficulty: "hard" }
        ]
      },
      {
        name: "Cinética Química",
        cards: [
          { id: 116, question: "Qual a fórmula para calcular a **Velocidade Média** de uma reação química?", answer: "$v = \\frac{|\\Delta [Substância]|}{\\Delta t}$", difficulty: "easy" },
          { id: 117, question: "O que é a **Energia de Ativação**?", answer: "A energia mínima necessária para que os reagentes iniciem a reação química.", difficulty: "medium" },
          { id: 118, question: "Como um **Catalisador** atua em uma reação?", answer: "Aumenta a velocidade da reação ao diminuir a energia de ativação, sem ser consumido.", difficulty: "medium" }
        ]
      },
      {
        name: "Eletroquímica",
        cards: [
          { id: 124, question: "O que é um **Agente Redutor** em uma reação de oxirredução?", answer: "A espécie química que sofre oxidação (perde elétrons) e provoca a redução de outra.", difficulty: "medium" },
          { id: 125, question: "Qual a fórmula para calcular a **Variação do Número de Oxidação** ($\\Delta E$) em uma pilha?", answer: "$\\Delta E = E^0_{catodo} - E^0_{anodo}$", difficulty: "medium" },
          { id: 136, question: "No processo de **Eletrólise**, qual o sinal do polo onde ocorre a oxidação (Ânodo)?", answer: "Polo Positivo (+)", difficulty: "hard" },
          { id: 144, question: "Qual a principal diferença entre uma **Pilha** e uma **Eletrólise** quanto à espontaneidade?", answer: "A Pilha é um processo espontâneo ($\\Delta G < 0$), enquanto a Eletrólise é não espontânea ($\\Delta G > 0$).", difficulty: "medium" },
          { id: 147, question: "Qual é a unidade de carga elétrica na **Constante de Faraday** ($F$)?", answer: "$96.500 \\text{ C/mol de } e^-$", difficulty: "medium" }
        ]
      },
      {
        name: "Funções Inorgânicas",
        cards: [
          { id: 126, question: "O que define um **Ácido de Arrhenius**?", answer: "Substância que, em solução aquosa, se ioniza liberando como único cátion o $H^+$.", difficulty: "easy" }
        ]
      },
      {
        name: "Química Orgânica",
        cards: [
          { id: 121, question: "Qual o prefixo para uma cadeia carbônica com **4 átomos de carbono**?", answer: "But-", difficulty: "easy" },
          { id: 122, question: "Qual a fórmula geral dos **Alcanos**?", answer: "$C_nH_{2n+2}$", difficulty: "medium" },
          { id: 127, question: "Qual a função orgânica caracterizada pelo grupo funcional **-OH ligado a carbono saturado**?", answer: "Álcool", difficulty: "easy" },
          { id: 131, question: "Qual a função orgânica que possui o grupo funcional **Carbonila** na extremidade da cadeia?", answer: "Aldeído", difficulty: "easy" },
          { id: 132, question: "O que caracteriza um **Carbono Assimétrico** (ou Quiral)?", answer: "Um átomo de carbono que realiza quatro ligações simples com quatro grupos diferentes entre si.", difficulty: "medium" },
          { id: 133, question: "Qual é o produto principal de uma reação de **Esterificação**?", answer: "Éster e Água ($Ácido \\text{ } Carboxílico + Álcool \\rightarrow Éster + H_2O$)", difficulty: "medium" },
          { id: 134, question: "O que define a **Isomeria Plana de Função**?", answer: "Isômeros que possuem a mesma fórmula molecular, mas pertencem a funções químicas diferentes.", difficulty: "medium" },
          { id: 135, question: "Qual a condição necessária para a ocorrência de **Isomeria Geométrica (Cis-Trans)** em alcenos?", answer: "Presença de ligação dupla e ligantes diferentes em cada carbono da dupla.", difficulty: "hard" },
          { id: 137, question: "Qual a fórmula molecular do **Benzeno**?", answer: "$C_6H_6$", difficulty: "easy" },
          { id: 138, question: "O que são **Isômeros Ópticos Enantiômeros**?", answer: "Moléculas que são imagens especulares uma da outra, mas não são sobreponíveis.", difficulty: "hard" },
          { id: 139, question: "Qual o nome da reação entre uma gordura (triacilglicerol) e uma base forte para formar **sabão**?", answer: "Saponificação", difficulty: "medium" },
          { id: 140, question: "O que é um **Polímero de Adição**?", answer: "Macromolécula formada pela junção de monômeros iguais através da quebra de ligações duplas.", difficulty: "medium" },
          { id: 141, question: "Qual a hibridização do carbono que realiza uma **ligação tripla**?", answer: "$sp$", difficulty: "medium" },
          { id: 145, question: "O que caracteriza a função **Amina**?", answer: "Derivada da amônia ($NH_3$) pela substituição de hidrogênios por radicais orgânicos.", difficulty: "easy" },
          { id: 146, question: "Qual a regra de **Markovnikov** para adição em alcenos?", answer: "O hidrogênio do reagente liga-se preferencialmente ao carbono da dupla mais hidrogenado.", difficulty: "hard" }
        ]
      },
      {
        name: "Radioatividade",
        cards: [
          { id: 150, question: "Como se define a **Radioatividade** Alfa ($\\alpha$)?", answer: "Emissão de uma partícula com 2 prótons e 2 nêutrons (núcleo de Hélio).", difficulty: "medium" }
        ]
      }
    ]
  },
  {
    subject: "Biologia",
    topics: [
      {
        name: "Citologia",
        cards: [
          { id: 151, question: "Qual é a principal função das **Mitocôndrias** na célula eucarionte?", answer: "Realização da respiração celular para a produção de energia (ATP).", difficulty: "easy" },
          { id: 153, question: "O que diferencia uma célula **Procarionte** de uma **Eucarionte**?", answer: "A ausência de uma membrana nuclear (carioteca) delimitando o material genético.", difficulty: "medium" },
          { id: 154, question: "Qual organela é responsável pela **Síntese de Proteínas**?", answer: "Ribossomos.", difficulty: "easy" },
          { id: 155, question: "O que é a **Osmose**?", answer: "Transporte passivo de água através de uma membrana semipermeável, do meio menos concentrado para o mais concentrado.", difficulty: "medium" },
          { id: 157, question: "Qual a função do **Complexo de Golgi**?", answer: "Modificar, armazenar e exportar substâncias sintetizadas na célula (secreção celular).", difficulty: "medium" },
          { id: 160, question: "Qual a função dos **Lisossomos**?", answer: "Digestão intracelular.", difficulty: "easy" },
          { id: 168, question: "Qual organela realiza a **Fotossíntese** nas plantas?", answer: "Cloroplasto.", difficulty: "easy" },
          { id: 175, question: "Qual a principal diferença entre **Mitose** e **Meiose** quanto ao número de células-filhas?", answer: "A mitose gera 2 células idênticas à mãe ($2n$); a meiose gera 4 células com metade do material genético ($n$).", difficulty: "medium" }
        ]
      },
      {
        name: "Bioquímica",
        cards: [
          { id: 152, question: "Quais são as bases nitrogenadas que compõem o **DNA**?", answer: "Adenina, Timina, Citosina e Guanina.", difficulty: "easy" },
          { id: 156, question: "Qual a principal diferença entre as bases nitrogenadas do DNA e do **RNA**?", answer: "No RNA, a Timina é substituída pela Uracila.", difficulty: "easy" },
          { id: 167, question: "O que é o **Dogma Central da Biologia Molecular**?", answer: "O fluxo de informação genética: $DNA \\rightarrow RNA \\rightarrow \\text{Proteína}$.", difficulty: "medium" }
        ]
      },
      {
        name: "Ecologia",
        cards: [
          { id: 158, question: "Como se define um organismo **Autótrofo**?", answer: "Organismo capaz de produzir seu próprio alimento a partir de substâncias inorgânicas (ex: fotossíntese).", difficulty: "easy" },
          { id: 165, question: "Em Ecologia, o que define o **Nicho Ecológico**?", answer: "O conjunto de interações, hábitos e o modo de vida de uma espécie em seu habitat.", difficulty: "easy" },
          { id: 166, question: "Qual a diferença entre **Cadeia Alimentar** e **Teia Alimentar**?", answer: "A cadeia é uma sequência linear de transferência de energia; a teia é o conjunto de várias cadeias interligadas.", difficulty: "easy" },
          { id: 169, question: "O que caracteriza uma **Relação Interespecífica Desarmônica** do tipo Parasitismo?", answer: "Um indivíduo (parasita) vive às custas de outro (hospedeiro), causando-lhe prejuízos.", difficulty: "medium" },
          { id: 177, question: "O que são **Bactérias Decompositoras** e qual sua importância?", answer: "Seres que degradam matéria orgânica morta, devolvendo nutrientes ao ciclo da matéria.", difficulty: "easy" },
          { id: 179, question: "O que é a **Sucessão Ecológica Primária**?", answer: "Colonização de um ambiente que nunca foi habitado anteriormente (ex: rocha nua).", difficulty: "hard" },
          { id: 180, question: "Qual o principal gás responsável pelo **Efeito Estufa** agravado pela ação humana?", answer: "Dióxido de Carbono ($CO_2$).", difficulty: "easy" },
          { id: 195, question: "O que caracteriza o processo de **Biorremediação**?", answer: "Uso de organismos (geralmente microrganismos) para remover ou neutralizar poluentes no meio ambiente.", difficulty: "medium" }
        ]
      },
      {
        name: "Genética",
        cards: [
          { id: 159, question: "O que é o **Crossing-over** e em qual processo ocorre?", answer: "Troca de pedaços entre cromossomos homólogos para aumentar a variabilidade genética; ocorre na Meiose I.", difficulty: "hard" },
          { id: 161, question: "O que diz a **Primeira Lei de Mendel** (Lei da Segregação dos Fatores)?", answer: "Cada característica é determinada por um par de fatores que se separam na formação dos gametas.", difficulty: "medium" },
          { id: 171, question: "O que é um organismo **Heterozigoto**?", answer: "Aquele que possui dois alelos diferentes para um mesmo gene (ex: $Aa$).", difficulty: "easy" },
          { id: 189, question: "O que é a **Partenogênese**?", answer: "Desenvolvimento de um embrião a partir de um óvulo não fecundado.", difficulty: "medium" },
          { id: 199, question: "O que caracteriza a **Anemia Falciforme**?", answer: "Alteração genética que deforma as hemácias em formato de foice, dificultando o transporte de oxigênio.", difficulty: "medium" }
        ]
      },
      {
        name: "Fisiologia Humana",
        cards: [
          { id: 162, question: "Qual é o caminho do sangue na **Pequena Circulação** (Pulmonar)?", answer: "Coração (Ventrículo Direito) $\\rightarrow$ Pulmões $\\rightarrow$ Coração (Átrio Esquerdo).", difficulty: "medium" },
          { id: 164, question: "Qual a principal função do hormônio **Insulina**?", answer: "Facilitar a entrada de glicose nas células, reduzindo a glicemia no sangue.", difficulty: "easy" },
          { id: 170, question: "Qual a função dos **Néfrons** no sistema excretor?", answer: "Filtrar o sangue e formar a urina.", difficulty: "medium" },
          { id: 173, question: "Qual a função das **Plaquetas** no sangue?", answer: "Atuar no processo de coagulação sanguínea.", difficulty: "easy" },
          { id: 176, question: "Qual hormônio é conhecido como o 'hormônio do estresse'?", answer: "Cortisol.", difficulty: "medium" },
          { id: 178, question: "Qual a função da **Bile** e onde ela é produzida?", answer: "Emulsionar gorduras; é produzida no Fígado e armazenada na Vesícula Biliar.", difficulty: "medium" },
          { id: 188, question: "Qual a principal diferença entre **Soros e Vacinas**?", answer: "Vacina é preventiva (imunização ativa); Soro é curativo (imunização passiva com anticorpos prontos).", difficulty: "medium" }
        ]
      },
      {
        name: "Evolução",
        cards: [
          { id: 163, question: "O que são **Órgãos Homólogos**?", answer: "Órgãos com a mesma origem embrionária, mas que podem exercer funções diferentes (indício de ancestralidade comum).", difficulty: "medium" },
          { id: 174, question: "O que propõe a **Teoria da Seleção Natural** de Darwin?", answer: "Indivíduos com características mais vantajosas ao meio têm mais chances de sobreviver e se reproduzir.", difficulty: "medium" }
        ]
      },
      {
        name: "Fisiologia Comparada",
        cards: [
          { id: 172, question: "Qual é a principal excreta nitrogenada dos **Peixes Ósseos**?", answer: "Amônia.", difficulty: "hard" },
          { id: 198, question: "Qual é a principal excreta nitrogenada das **Aves**?", answer: "Ácido úrico.", difficulty: "medium" }
        ]
      },
      {
        name: "Botânica",
        cards: [
          { id: 181, question: "Quais são os quatro grandes grupos das **Plantas**?", answer: "Briófitas, Pteridófitas, Gimnospermas e Angiospermas.", difficulty: "easy" },
          { id: 182, question: "Qual é a principal característica das **Briófitas** quanto ao transporte de seiva?", answer: "São plantas avasculares (não possuem vasos condutores de seiva).", difficulty: "medium" },
          { id: 183, question: "O que caracteriza as **Angiospermas** em relação às sementes?", answer: "São as únicas que produzem flores e frutos, que protegem as sementes.", difficulty: "easy" },
          { id: 184, question: "Qual é a função do **Xilema**?", answer: "Transportar a seiva bruta (água e sais minerais) das raízes para as folhas.", difficulty: "medium" },
          { id: 191, question: "Qual a função do hormônio vegetal **Etileno**?", answer: "Promover o amadurecimento dos frutos e a queda das folhas (abscisão).", difficulty: "medium" },
          { id: 196, question: "Qual a função dos **Estômatos** nas plantas?", answer: "Realizar trocas gasosas e controlar a transpiração vegetal.", difficulty: "easy" },
          { id: 200, question: "Qual a função do **Floema**?", answer: "Transportar a seiva elaborada (açúcares) das folhas para o restante da planta.", difficulty: "medium" }
        ]
      },
      {
        name: "Embriologia",
        cards: [
          { id: 185, question: "O que são animais **Diploblásticos**?", answer: "Animais que possuem apenas dois folhetos germinativos: ectoderme e endoderme.", difficulty: "hard" },
          { id: 187, question: "Como se define um animal **Celomado**?", answer: "Aquele que possui uma cavidade corporal (celoma) totalmente revestida pela mesoderme.", difficulty: "hard" },
          { id: 193, question: "Na Embriologia, o que a **Ectoderme** origina?", answer: "Sistema nervoso e epiderme (e seus anexos).", difficulty: "hard" }
        ]
      },
      {
        name: "Programas de Saúde",
        cards: [
          { id: 186, question: "Qual é o agente etiológico da **Malária**?", answer: "Protozoários do gênero *Plasmodium*.", difficulty: "medium" },
          { id: 194, question: "Qual é o vetor da **Doença de Chagas**?", answer: "O inseto conhecido como barbeiro (*Triatoma infestans*).", difficulty: "easy" }
        ]
      },
      {
        name: "Zoologia",
        cards: [
          { id: 190, question: "Qual a principal característica dos **Artrópodes**?", answer: "Presença de apêndices articulados e exoesqueleto de quitina.", difficulty: "easy" },
          { id: 197, question: "O que são animais **Deuterostômios**?", answer: "Animais em que o blastóporo dá origem ao ânus (ex: Equinodermos e Cordados).", difficulty: "hard" }
        ]
      },
      {
        name: "Taxonomia",
        cards: [
          { id: 192, question: "O que são organismos **Eucariontes Heterótrofos por absorção**?", answer: "Fungos (Reino Fungi).", difficulty: "medium" }
        ]
      }
    ]
  },
  {
    subject: "História",
    topics: [
      {
        name: "História Antiga",
        cards: [
          { id: 201, question: "Qual a principal característica das civilizações da **Mesopotâmia** quanto à localização?", answer: "Eram civilizações hidráulicas, desenvolvendo-se entre os rios Tigre e Eufrates.", difficulty: "easy" },
          { id: 202, question: "O que caracterizava a **Teocracia** no Egito Antigo?", answer: "O Faraó era visto como um deus vivo, concentrando poderes políticos e religiosos.", difficulty: "easy" },
          { id: 203, question: "Quem foi o legislador grego considerado o 'pai da **Democracia**' em Atenas?", answer: "Clístenes.", difficulty: "medium" },
          { id: 204, question: "O que foi a política de **Pão e Circo** na Roma Antiga?", answer: "Distribuição de trigo e espetáculos gratuitos para acalmar a plebe e evitar revoltas.", difficulty: "easy" },
          { id: 205, question: "O que estabelecia o **Edito de Milão** (313 d.C.)?", answer: "Concedia liberdade de culto aos cristãos no Império Romano.", difficulty: "medium" }
        ]
      },
      {
        name: "Idade Média Europeia",
        cards: [
          { id: 206, question: "Como se definia a base da economia no **Feudalismo**?", answer: "Subsistência, centrada no feudo e baseada no trabalho servil.", difficulty: "easy" },
          { id: 207, question: "Qual o principal objetivo das **Cruzadas**?", answer: "Retomar a Terra Santa (Jerusalém) do domínio muçulmano.", difficulty: "easy" },
          { id: 208, question: "O que foi a **Peste Negra** do século XIV?", answer: "Uma epidemia de peste bubônica que dizimou cerca de um terço da população europeia.", difficulty: "easy" }
        ]
      },
      {
        name: "Idade Moderna",
        cards: [
          { id: 209, question: "O que foi o **Renascimento**?", answer: "Movimento cultural e artístico inspirado nos valores da Antiguidade Clássica e no Humanismo.", difficulty: "medium" },
          { id: 210, question: "Quem iniciou a **Reforma Protestante** em 1517?", answer: "Martinho Lutero.", difficulty: "easy" },
          { id: 211, question: "O que defendia a teoria do **Absolutismo** monárquico?", answer: "O poder total do rei, muitas vezes justificado pelo Direito Divino.", difficulty: "medium" },
          { id: 212, question: "Qual o foco principal do movimento **Iluminista**?", answer: "A razão como guia para o progresso e a crítica ao Antigo Regime.", difficulty: "easy" },
          { id: 213, question: "Onde e por que iniciou a **Revolução Industrial**?", answer: "Na Inglaterra, devido ao acúmulo de capital, minas de carvão e avanço tecnológico.", difficulty: "medium" },
          { id: 214, question: "Qual evento marcou o início da **Revolução Francesa**?", answer: "A Queda da Bastilha em 14 de julho de 1789.", difficulty: "easy" }
        ]
      },
      {
        name: "Idade Contemporânea",
        cards: [
          { id: 215, question: "O que foi o **Bloqueio Continental** decretado por Napoleão?", answer: "Proibição dos países europeus de comercializarem com a Inglaterra.", difficulty: "medium" },
          { id: 216, question: "O que caracterizou o **Imperialismo** no século XIX?", answer: "A partilha da África e da Ásia pelas potências europeias em busca de matérias-primas e mercados.", difficulty: "medium" },
          { id: 217, question: "Qual foi o estopim da **Primeira Guerra Mundial**?", answer: "O assassinato do arquiduque Francisco Ferdinando em Sarajevo.", difficulty: "easy" },
          { id: 218, question: "Quem liderou a **Revolução Russa** de Outubro em 1917?", answer: "Lênin e os Bolcheviques.", difficulty: "medium" },
          { id: 219, question: "O que causou a **Crise de 29** (Quebra da Bolsa de NY)?", answer: "Superprodução, especulação financeira e descompasso entre oferta e demanda.", difficulty: "medium" },
          { id: 220, question: "O que foi o **Holocausto** durante a Segunda Guerra Mundial?", answer: "O extermínio sistemático de 6 milhões de judeus e outras minorias pelos nazistas.", difficulty: "medium" },
          { id: 221, question: "O que definiu a **Guerra Fria**?", answer: "A disputa ideológica, econômica e militar entre os blocos capitalista (EUA) e socialista (URSS).", difficulty: "easy" },
          { id: 250, question: "O que foi o **Apartheid** na África do Sul?", answer: "Um regime de segregação racial oficial que durou de 1948 a 1994.", difficulty: "medium" }
        ]
      },
      {
        name: "Brasil Colônia",
        cards: [
          { id: 222, question: "O que dividia o mundo entre Portugal e Espanha no **Tratado de Tordesilhas** (1494)?", answer: "Um meridiano a 370 léguas a oeste das ilhas de Cabo Verde.", difficulty: "easy" },
          { id: 223, question: "O que foram as **Capitanias Hereditárias**?", answer: "Divisão do território brasileiro em 15 faixas de terra entregues a donatários para colonização.", difficulty: "easy" },
          { id: 224, question: "Por que foi criado o **Governo Geral** em 1548?", answer: "Para centralizar a administração e auxiliar as capitanias que fracassaram.", difficulty: "medium" },
          { id: 225, question: "Qual a missão dos **Jesuítas** no Brasil Colônia?", answer: "A catequização dos indígenas e a educação.", difficulty: "easy" },
          { id: 226, question: "Qual foi o principal produto econômico do Brasil no século XVI?", answer: "Açúcar (Ciclo do Açúcar).", difficulty: "easy" },
          { id: 227, question: "O que motivou as **Invasões Holandesas** no Nordeste brasileiro?", answer: "O interesse no controle do comércio de açúcar após a União Ibérica.", difficulty: "hard" },
          { id: 228, question: "Quem eram os **Bandeirantes** e quais seus objetivos?", answer: "Expedicionários que buscavam metais preciosos e a captura de indígenas no interior.", difficulty: "medium" },
          { id: 229, question: "Qual região foi o centro do **Ciclo do Ouro** no século XVIII?", answer: "Minas Gerais.", difficulty: "easy" },
          { id: 230, question: "O que foi a **Inconfidência Mineira** (1789)?", answer: "Revolta separatista inspirada no Iluminismo contra a opressão fiscal portuguesa (Derrama).", difficulty: "medium" }
        ]
      },
      {
        name: "Brasil Império",
        cards: [
          { id: 231, question: "O que mudou no Brasil com a **Vinda da Família Real** em 1808?", answer: "Abertura dos Portos, criação de bancos, bibliotecas e a elevação do Brasil a Reino Unido.", difficulty: "medium" },
          { id: 232, question: "Quem proclamou a **Independência do Brasil** em 1822?", answer: "Dom Pedro I.", difficulty: "easy" },
          { id: 233, question: "O que caracterizou o **Primeiro Reinado**?", answer: "O autoritarismo de D. Pedro I e a outorga da Constituição de 1824.", difficulty: "medium" },
          { id: 234, question: "Por que o **Período Regencial** é considerado instável?", answer: "Pelas diversas revoltas provinciais (Cabanagem, Farroupilha, etc.) e ausência de um imperador.", difficulty: "hard" },
          { id: 235, question: "Quanto tempo durou o **Segundo Reinado** (D. Pedro II)?", answer: "49 anos (1840-1889).", difficulty: "easy" },
          { id: 236, question: "Qual foi o maior conflito armado da América do Sul no século XIX?", answer: "A Guerra do Paraguai.", difficulty: "medium" },
          { id: 237, question: "O que determinou a **Lei Áurea** em 1888?", answer: "A abolição total da escravidão no Brasil.", difficulty: "easy" }
        ]
      },
      {
        name: "Brasil República",
        cards: [
          { id: 238, question: "Quando foi proclamada a **República** no Brasil?", answer: "15 de novembro de 1889.", difficulty: "easy" },
          { id: 239, question: "O que foi a **República da Espada**?", answer: "Período inicial da República governado por militares (Deodoro e Floriano).", difficulty: "medium" },
          { id: 240, question: "O que caracterizou a **Política do Café com Leite**?", answer: "Alternância de poder entre as oligarquias de São Paulo e Minas Gerais.", difficulty: "easy" },
          { id: 241, question: "O que foi a **Revolta da Vacina** (1904)?", answer: "Revolta popular no Rio contra a obrigatoriedade da vacina da varíola e reformas urbanas.", difficulty: "medium" },
          { id: 242, question: "Como Getúlio Vargas chegou ao poder na **Revolução de 30**?", answer: "Através de um golpe que pôs fim à República Velha após desentendimentos eleitorais.", difficulty: "medium" },
          { id: 243, question: "O que caracterizou o **Estado Novo** (1937-1945)?", answer: "Ditadura varguista com censura (DIP), repressão e nacionalismo econômico.", difficulty: "hard" },
          { id: 244, question: "Qual era o lema do governo de **Juscelino Kubitschek** (JK)?", answer: "50 anos em 5.", difficulty: "easy" },
          { id: 245, question: "Qual foi o estopim do **Ditadura Militar** em 1964?", answer: "O golpe militar que depôs o presidente João Goulart.", difficulty: "medium" },
          { id: 246, question: "O que foi o **AI-5** (1968)?", answer: "O ato mais repressivo da ditadura, que fechou o Congresso e suspendeu o habeas corpus.", difficulty: "hard" },
          { id: 247, question: "O que defendia o movimento das **Diretas Já** (1984)?", answer: "A volta de eleições diretas para a presidência da República.", difficulty: "easy" },
          { id: 248, question: "Por que a **Constituição de 1988** é chamada de 'Constituição Cidadã'?", answer: "Pelo seu amplo foco em direitos civis, humanos e sociais.", difficulty: "medium" },
          { id: 249, question: "Qual era o principal objetivo do **Plano Real** (1994)?", answer: "Combater a hiperinflação e estabilizar a economia.", difficulty: "easy" }
        ]
      }
    ]
  },
  {
    subject: "Geografia",
    topics: [
      {
        name: "Geografia Física",
        cards: [
          { id: 251, question: "Qual a camada mais externa da Terra?", answer: "Crosta terrestre.", difficulty: "easy" },
          { id: 252, question: "O que é o **Albedo**?", answer: "Refletividade de uma superfície (relação entre energia refletida e incidente).", difficulty: "hard" },
          { id: 253, question: "Qual a principal característica de um **Clima Equatorial**?", answer: "Temperaturas elevadas e chuvas abundantes durante todo o ano.", difficulty: "easy" },
          { id: 254, question: "O que são **Curvas de Nível** na cartografia?", answer: "Linhas que unem pontos de mesma altitude em um mapa.", difficulty: "medium" },
          { id: 255, question: "Qual o maior oceano do planeta?", answer: "Oceano Pacífico.", difficulty: "easy" },
          { id: 256, question: "Qual a diferença entre **Intemperismo Físico e Químico**?", answer: "O físico desagrega a rocha mecanicamente; o químico altera sua composição mineral.", difficulty: "medium" },
          { id: 257, question: "O que propõe a teoria da **Deriva Continental**?", answer: "Que os continentes já formaram uma única massa (Pangeia) e estão em constante movimento.", difficulty: "easy" },
          { id: 258, question: "O que define uma **Rocha Metamórfica**?", answer: "Rocha formada pela transformação de outras rochas sob altas pressões e temperaturas.", difficulty: "medium" },
          { id: 259, question: "O que é o **Epicentro** de um terremoto?", answer: "Ponto da superfície terrestre localizado exatamente acima do hipocentro (foco).", difficulty: "easy" },
          { id: 260, question: "Qual o gás mais abundante na atmosfera terrestre?", answer: "Nitrogênio ($N_2$).", difficulty: "medium" }
        ]
      },
      {
        name: "Geografia Humana e População",
        cards: [
          { id: 261, question: "O que é **Densidade Demográfica**?", answer: "A relação entre o número de habitantes e a área do território (hab/$km^2$).", difficulty: "easy" },
          { id: 262, question: "O que caracteriza a **Transição Demográfica**?", answer: "Mudança de altas para baixas taxas de natalidade e mortalidade em uma população.", difficulty: "medium" },
          { id: 263, question: "O que é o **Êxodo Rural**?", answer: "Migração em massa da população do campo para as cidades.", difficulty: "easy" },
          { id: 267, question: "O que o **IDH** (Índice de Desenvolvimento Humano) mede?", answer: "Saúde (longevidade), Educação (escolaridade) e Renda (PIB per capita).", difficulty: "medium" }
        ]
      },
      {
        name: "Geografia Econômica e Urbana",
        cards: [
          { id: 264, question: "O que define uma **Megalópole**?", answer: "Região urbanizada formada pela junção de duas ou mais metrópoles.", difficulty: "hard" },
          { id: 265, question: "O que é o processo de **Gentrificação**?", answer: "Valorização urbana que encarece o custo de vida e afasta a população pobre de certos bairros.", difficulty: "medium" },
          { id: 268, question: "Qual a principal característica do sistema **Toyotista** de produção?", answer: "Produção sob demanda (*just-in-time*) e flexibilização do trabalho.", difficulty: "medium" },
          { id: 269, question: "O que são **Commodities**?", answer: "Produtos básicos de baixo valor agregado cotados no mercado internacional (ex: soja, petróleo).", difficulty: "easy" },
          { id: 270, question: "O que define a **Terceirização da Economia** (Terciarização)?", answer: "Crescimento do setor de serviços e comércio em relação à indústria e agropecuária.", difficulty: "medium" }
        ]
      },
      {
        name: "Geopolítica e Globalização",
        cards: [
          { id: 271, question: "O que caracteriza a **Globalização**?", answer: "Integração econômica, cultural e social entre os países, facilitada pelo avanço dos transportes e comunicações.", difficulty: "easy" },
          { id: 272, question: "O que era a **Bipolaridade** na Guerra Fria?", answer: "Divisão do mundo entre as zonas de influência dos EUA (capitalista) e da URSS (socialista).", difficulty: "easy" },
          { id: 273, question: "Qual o principal objetivo do **Mercosul**?", answer: "Criação de um mercado comum e integração econômica entre países da América do Sul.", difficulty: "medium" },
          { id: 274, question: "O que significa a sigla **BRICS**?", answer: "Grupo de países emergentes formado por Brasil, Rússia, Índia, China e África do Sul.", difficulty: "easy" },
          { id: 275, question: "O que é o **G7**?", answer: "Grupo dos sete países mais industrializados e desenvolvidos do mundo.", difficulty: "easy" },
          { id: 276, question: "Qual a principal função da **ONU**?", answer: "Manter a paz e a segurança internacional e promover a cooperação entre as nações.", difficulty: "easy" },
          { id: 277, question: "O que define a **Multipolaridade** na geopolítica atual?", answer: "A existência de vários centros de poder econômico e político no mundo.", difficulty: "medium" },
          { id: 278, question: "Qual a principal causa dos conflitos entre **Israel e Palestina**?", answer: "Disputas territoriais, históricas e religiosas por soberania na região.", difficulty: "medium" },
          { id: 279, question: "O que foi o **Brexit**?", answer: "O processo de saída do Reino Unido da União Europeia.", difficulty: "easy" },
          { id: 280, question: "O que é a **OTAN**?", answer: "Aliança militar entre países ocidentais para defesa mútua.", difficulty: "medium" }
        ]
      },
      {
        name: "Geografia do Brasil",
        cards: [
          { id: 281, question: "Qual o maior bioma brasileiro em extensão territorial?", answer: "Amazônia.", difficulty: "easy" },
          { id: 282, question: "O que caracteriza o bioma **Cerrado**?", answer: "Vegetação arbustiva com raízes profundas, troncos retorcidos e solos ácidos.", difficulty: "medium" },
          { id: 283, question: "Qual o clima predominante no **Sertão Nordestino**?", answer: "Semiárido.", difficulty: "easy" },
          { id: 288, question: "O que caracteriza o **Pantanal**?", answer: "A maior planície inundável contínua do mundo.", difficulty: "easy" },
          { id: 289, question: "O que são os **Mares de Morros**?", answer: "Relevo mamelonar (arredondado) típico da região da Mata Atlântica brasileira.", difficulty: "medium" },
          { id: 290, question: "O que é o **Aquífero Guarani**?", answer: "Um dos maiores reservatórios subterrâneos de água doce do mundo, em grande parte no Brasil.", difficulty: "medium" },
          { id: 284, question: "O que define a **Região Geoeconômica do Centro-Sul**?", answer: "A região mais populosa, urbanizada e economicamente desenvolvida do Brasil.", difficulty: "medium" },
          { id: 285, question: "Qual o tipo de relevo predominante no Brasil?", answer: "Planaltos, depressões e planícies (sem dobramentos modernos).", difficulty: "hard" },
          { id: 286, question: "Qual a principal matriz de geração de energia elétrica no Brasil?", answer: "Hidrelétrica.", difficulty: "easy" }
        ]
      },
      {
        name: "Questões Ambientais e Energia",
        cards: [
          { id: 291, question: "O que é o **Efeito Estufa**?", answer: "Fenômeno natural de retenção de calor na atmosfera; agravado por atividades humanas.", difficulty: "easy" },
          { id: 292, question: "Qual a consequência da destruição da **Camada de Ozônio**?", answer: "Maior incidência de raios ultravioletas (UV) na superfície terrestre.", difficulty: "medium" },
          { id: 293, question: "O que é **Desenvolvimento Sustentável**?", answer: "Atender as necessidades da geração atual sem comprometer a capacidade das gerações futuras.", difficulty: "easy" },
          { id: 294, question: "Dê exemplos de **Fontes de Energia Renováveis**.", answer: "Solar, Eólica, Biomassa e Maremotriz.", difficulty: "easy" },
          { id: 295, question: "O que é o processo de **Lixiviação**?", answer: "Lavagem da camada superficial do solo pela água das chuvas.", difficulty: "hard" },
          { id: 296, question: "O que mede a **Pegada Ecológica**?", answer: "A quantidade de recursos naturais necessários para sustentar o estilo de vida de uma pessoa ou país.", difficulty: "hard" },
          { id: 297, question: "O que foi o **Protocolo de Kyoto**?", answer: "Tratado internacional para a redução da emissão de gases estufa.", difficulty: "medium" },
          { id: 298, question: "Quais os efeitos do fenômeno **El Niño**?", answer: "Aquecimento anormal das águas do Pacífico, alterando padrões de chuva e temperatura global.", difficulty: "hard" },
          { id: 299, question: "O que caracteriza a **Desertificação**?", answer: "Degradação das terras em regiões áridas e semiáridas por ação climática ou humana.", difficulty: "medium" },
          { id: 300, question: "Qual a importância da reciclagem na gestão de resíduos sociais?", answer: "Redução do volume de lixo em aterros e preservação de matérias-primas.", difficulty: "easy" }
        ]
      }
    ]
  },
  {
    subject: "Português",
    topics: [
      {
        name: "Gramática - Morfologia",
        cards: [
          { id: 301, question: "O que é um **Substantivo**?", answer: "Classe de palavras que nomeia seres, objetos, lugares, sentimentos, etc.", difficulty: "easy" },
          { id: 302, question: "Qual a função do **Adjetivo**?", answer: "Caracterizar o substantivo, atribuindo-lhe qualidade, estado ou modo de ser.", difficulty: "easy" },
          { id: 303, question: "O que caracteriza os **Verbos de Ligação**?", answer: "Verbos que não indicam ação, mas sim estado ou qualidade (ex: ser, estar, parecer).", difficulty: "medium" },
          { id: 304, question: "Como se define um **Pronome Relativo**?", answer: "Palavra que retoma um substantivo ou pronome anterior, introduzindo uma oração dependente.", difficulty: "medium" },
          { id: 305, question: "O que é uma **Conjunção**?", answer: "Palavra invariável que liga duas orações ou dois termos semelhantes de uma mesma oração.", difficulty: "easy" }
        ]
      },
      {
        name: "Gramática - Sintaxe",
        cards: [
          { id: 306, question: "O que é o **Sujeito Composto**?", answer: "Aquele que possui dois ou mais núcleos (ex: Maria e João saíram).", difficulty: "easy" },
          { id: 307, question: "Qual a diferença entre **Objeto Direto e Indireto**?", answer: "O direto se liga ao verbo sem preposição obrigatória; o indireto exige preposição.", difficulty: "medium" },
          { id: 308, question: "O que é o **Aposto**?", answer: "Termo que explica, detalha ou resume um termo anterior da oração.", difficulty: "medium" },
          { id: 309, question: "Qual a definição de **Voz Passiva**?", answer: "Voz verbal em que o sujeito sofre a ação expressa pelo verbo.", difficulty: "medium" },
          { id: 310, question: "O que é uma **Oração Sem Sujeito**?", answer: "Oração com verbos impessoais (ex: haver no sentido de existir, fenômenos da natureza).", difficulty: "hard" },
          { id: 311, question: "Qual a diferença entre **Complemento Nominal e Adjunto Adnominal**?", answer: "O complemento é alvo da ação (exige preposição com substantivos abstratos); o adjunto é agente ou possessivo.", difficulty: "hard" },
          { id: 312, question: "O que são **Orações Coordenadas Sindéticas**?", answer: "Orações independentes ligadas por uma conjunção.", difficulty: "medium" }
        ]
      },
      {
        name: "Ortografia e Acentuação",
        cards: [
          { id: 313, question: "Pelas regras atuais, palavras **Paroxítonas** terminadas em 'o' levam acento?", answer: "Não (ex: coco, solo).", difficulty: "easy" },
          { id: 314, question: "O que afirma a regra das **Proparoxítonas**?", answer: "Todas as palavras proparoxítonas devem ser acentuadas.", difficulty: "easy" },
          { id: 315, question: "Quando se usa o **Hífen** com o prefixo 'sub'?", answer: "Quando a palavra seguinte começa com 'b', 'r' ou 'h'.", difficulty: "hard" },
          { id: 316, question: "Qual a diferença de uso entre **'Mal' e 'Mau'**?", answer: "'Mal' é o oposto de 'bem'; 'Mau' é o oposto de 'bom'.", difficulty: "easy" },
          { id: 317, question: "Como se usa o **'Por que'** separado e sem acento?", answer: "Em perguntas diretas ou indiretas, ou quando pode ser substituído por 'pelo qual'.", difficulty: "medium" }
        ]
      },
      {
        name: "Semântica e Estilística",
        cards: [
          { id: 318, question: "O que são palavras **Homônimas**?", answer: "Palavras com a mesma pronúncia ou escrita, mas significados diferentes.", difficulty: "medium" },
          { id: 319, question: "Qual a definição de **Metáfora**?", answer: "Comparação implícita sem o uso de conectivos (ex: 'Ele é um leão').", difficulty: "easy" },
          { id: 320, question: "O que é uma **Metonímia**?", answer: "Substituição de um termo por outro com o qual mantém relação (ex: 'Ler Machado de Assis').", difficulty: "medium" },
          { id: 321, question: "Defina **Eufemismo**.", answer: "Figura de linguagem usada para suavizar uma expressão desagradável ou chocante.", difficulty: "easy" },
          { id: 322, question: "O que é a **Ironia**?", answer: "Expressar o oposto do que se quer dizer, geralmente para criticar ou satirizar.", difficulty: "easy" },
          { id: 323, question: "O que caracteriza a **Antítese**?", answer: "Aproximação de termos com sentidos opostos (ex: o bem e o mal).", difficulty: "medium" },
          { id: 324, question: "O que é a **Hipérbole**?", answer: "Uso de uma expressão exagerada para dar ênfase (ex: 'Morrer de rir').", difficulty: "easy" },
          { id: 325, question: "O que é a **Personificação** (ou Prosopopeia)?", answer: "Atribuir características humanas a seres inanimados ou irracionais.", difficulty: "easy" }
        ]
      },
      {
        name: "Concordância e Regência",
        cards: [
          { id: 326, question: "Qual a regra geral da **Concordância Verbal**?", answer: "O verbo deve concordar em número e pessoa com o sujeito.", difficulty: "easy" },
          { id: 327, question: "Em concordância nominal, como fica o adjetivo para dois substantivos de gêneros diferentes?", answer: "Vai para o masculino plural.", difficulty: "medium" },
          { id: 328, question: "Qual a regência correta do verbo **Assistir** no sentido de ver?", answer: "Exige a preposição 'a' (ex: Assistir ao filme).", difficulty: "medium" },
          { id: 329, question: "Qual a regência do verbo **Ir** para indicar destino?", answer: "Exige a preposição 'a' (ex: Vou à escola), embora no coloquial se use 'em'.", difficulty: "easy" }
        ]
      },
      {
        name: "Crase e Pontuação",
        cards: [
          { id: 330, question: "O que é a **Crase**?", answer: "A fusão da preposição 'a' com o artigo feminino 'a' (a + a = à).", difficulty: "easy" },
          { id: 331, question: "Ocorre crase antes de verbos?", answer: "Não.", difficulty: "easy" },
          { id: 332, question: "Quando o uso da crase é **facultativo**?", answer: "Antes de nomes próprios femininos, pronomes possessivos femininos e após a palavra 'até'.", difficulty: "hard" },
          { id: 333, question: "Para que serve a **Vírgula** no vocativo?", answer: "Separar o chamamento do restante da frase (ex: 'Olá, Pedro').", difficulty: "easy" },
          { id: 334, question: "Pode-se separar o sujeito do predicado com vírgula?", answer: "Nunca.", difficulty: "medium" }
        ]
      },
      {
        name: "Coesão e Coerência",
        cards: [
          { id: 335, question: "O que é a **Coesão Textual**?", answer: "Ligação harmônica entre as partes de um texto através de conectivos e pronomes.", difficulty: "medium" },
          { id: 336, question: "O que caracteriza a **Coerência Textual**?", answer: "Lógica e sentido global do texto, sem contradições internas.", difficulty: "medium" },
          { id: 337, question: "O que são **Conectivos de Oposição**?", answer: "Palavras que indicam contraste (ex: mas, porém, contudo, todavia).", difficulty: "easy" }
        ]
      },
      {
        name: "Gêneros Textuais e Funções da Linguagem",
        cards: [
          { id: 338, question: "Qual a principal característica do **Texto Dissertativo-Argumentativo**?", answer: "Defesa de um ponto de vista com base em argumentos lógicos.", difficulty: "medium" },
          { id: 339, question: "O que define a **Função Apelativa** (ou Conativa)?", answer: "Foco no destinatário, comum em propagandas e ordens.", difficulty: "medium" },
          { id: 340, question: "O que é a **Função Metalinguística**?", answer: "Quando o código explica o próprio código (ex: um poema sobre fazer poesia).", difficulty: "medium" },
          { id: 341, question: "Qual o objetivo da **Função Fática**?", answer: "Testar o canal de comunicação (ex: 'Alô?', 'Né?', 'Bom dia').", difficulty: "easy" },
          { id: 342, question: "O que caracteriza a **Crônica**?", answer: "Gênero narrativo curto que aborda fatos do cotidiano com leveza ou ironia.", difficulty: "medium" }
        ]
      },
      {
        name: "Variação Linguística",
        cards: [
          { id: 343, question: "O que é **Variação Diatópica**?", answer: "Variação da língua de acordo com a região geográfica (regionalismo).", difficulty: "easy" },
          { id: 344, question: "O que é o **Preconceito Linguístico**?", answer: "Discriminação baseada na forma como alguém fala ou escreve fora da norma padrão.", difficulty: "easy" }
        ]
      },
      {
        name: "Estrutura e Formação de Palavras",
        cards: [
          { id: 345, question: "O que é o **Radical** de uma palavra?", answer: "Parte da palavra que contém o seu significado básico.", difficulty: "easy" },
          { id: 346, question: "Defina **Derivação Prefixal**.", answer: "Acréscimo de um prefixo antes do radical (ex: infeliz).", difficulty: "easy" },
          { id: 347, question: "O que é o **Neologismo**?", answer: "Criação de novas palavras na língua.", difficulty: "medium" },
          { id: 348, question: "O que é a **Onomatopeia**?", answer: "Palavra que imita um som (ex: tique-taque, miau).", difficulty: "easy" },
          { id: 349, question: "O que caracteriza a **Composição por Justaposição**?", answer: "Junção de duas palavras sem perda de sons (ex: girassol, guarda-chuva).", difficulty: "medium" },
          { id: 350, question: "O que é o **Pleonasmo Vicioso**?", answer: "Repetição desnecessária de uma ideia em uma frase (ex: 'subir para cima').", difficulty: "easy" }
        ]
      }
    ]
  },
  {
    subject: "Literatura",
    topics: [
      {
        name: "Conceitos e Gêneros Literários",
        cards: [
          { id: 351, question: "Quais são os três **Gêneros Literários** clássicos definidos por Aristóteles?", answer: "Épico (ou narrativo), Lírico e Dramático.", difficulty: "easy" },
          { id: 352, question: "O que caracteriza o **Gênero Lírico**?", answer: "Manifestação do eu-lírico, expressando sentimentos, emoções e subjetividade, geralmente em versos.", difficulty: "easy" },
          { id: 353, question: "O que é uma **Epopeia**?", answer: "Poema narrativo extenso que celebra feitos heroicos de um povo ou nação (ex: *Os Lusíadas*).", difficulty: "medium" },
          { id: 354, question: "Qual a diferença entre **Texto Literário e Não Literário**?", answer: "O literário prioriza a estética, subjetividade e plurissignificação; o não literário é informativo e denotativo.", difficulty: "medium" }
        ]
      },
      {
        name: "Era Colonial: Barroco e Arcadismo",
        cards: [
          { id: 355, question: "Qual a principal característica da linguagem **Barroca**?", answer: "O uso de figuras de linguagem (antíteses, paradoxos), dualidade entre espírito e matéria e rebuscamento.", difficulty: "medium" },
          { id: 356, question: "O que é o **Cultismo** (ou Gongorismo) no Barroco?", answer: "Jogo de palavras, uso de vocabulário rebuscado e exploração da forma e do som.", difficulty: "hard" },
          { id: 357, question: "O que é o **Conceptismo** (ou Quevedismo) no Barroco?", answer: "Jogo de ideias, foco na retórica persuasiva e no raciocínio lógico.", difficulty: "hard" },
          { id: 358, question: "Quem foi o principal poeta satírico do Barroco brasileiro?", answer: "Gregório de Matos (o 'Boca do Inferno').", difficulty: "easy" },
          { id: 359, question: "O que defendia o **Arcadismo** (ou Neoclassicismo)?", answer: "A volta à simplicidade, a vida bucólica e a imitação da natureza e dos clássicos.", difficulty: "medium" },
          { id: 360, question: "Qual o lema arcádico que significa 'aproveite o dia'?", answer: "*Carpe diem*.", difficulty: "easy" },
          { id: 361, question: "Quem escreveu a obra épica *O Uraguai*?", answer: "Basílio da Gama.", difficulty: "hard" }
        ]
      },
      {
        name: "Romantismo",
        cards: [
          { id: 362, question: "Qual a característica central da **1ª Geração Romântica** no Brasil?", answer: "Indianismo e Nacionalismo (exaltação da pátria e do indígena como herói).", difficulty: "easy" },
          { id: 363, question: "Como ficou conhecida a **2ª Geração Romântica**?", answer: "Ultrarromantismo ou 'Mal do Século' (pessimismo, morbidez e egocentrismo).", difficulty: "medium" },
          { id: 364, question: "Qual o foco da **3ª Geração Romântica** (Condoreira)?", answer: "Temas sociais, liberdade e a luta abolicionista.", difficulty: "medium" },
          { id: 365, question: "Quem foi o principal autor da poesia condoreira no Brasil?", answer: "Castro Alves (o 'Poeta dos Escravos').", difficulty: "easy" },
          { id: 366, question: "A obra *Iraceuma* pertence a qual autor?", answer: "José de Alencar.", difficulty: "easy" }
        ]
      },
      {
        name: "Realismo e Naturalismo",
        cards: [
          { id: 367, question: "Qual obra marcou o início do **Realismo** no Brasil em 1881?", answer: "*Memórias Póstumas de Brás Cubas*, de Machado de Assis.", difficulty: "easy" },
          { id: 368, question: "O que diferencia o **Naturalismo** do Realismo?", answer: "O Naturalismo foca no determinismo biológico/social, tratando o homem como um animal condicionado pelo meio.", difficulty: "medium" },
          { id: 369, question: "Qual obra é considerada o marco do **Naturalismo** no Brasil?", answer: "*O Cortiço*, de Aluísio Azevedo.", difficulty: "medium" },
          { id: 370, question: "Machado de Assis é conhecido por qual característica narrativa marcante?", answer: "Análise psicológica profunda e uso constante da ironia.", difficulty: "medium" }
        ]
      },
      {
        name: "Parnasianismo e Simbolismo",
        cards: [
          { id: 371, question: "O que defendia o **Parnasianismo**?", answer: "A 'arte pela arte', o rigor formal, a perfeição da rima e do verso, e a objetividade.", difficulty: "medium" },
          { id: 372, question: "Quem compunha a 'Tríade Parnassiana' brasileira?", answer: "Olavo Bilac, Alberto de Oliveira e Raimundo Correia.", difficulty: "hard" },
          { id: 373, question: "Qual o foco do **Simbolismo**?", answer: "O misticismo, a musicalidade, a subjetividade e o uso de sinestesias.", difficulty: "medium" },
          { id: 374, question: "Quem foi o maior expoente do Simbolismo brasileiro?", answer: "Cruz e Sousa.", difficulty: "medium" }
        ]
      },
      {
        name: "Pré-Modernismo",
        cards: [
          { id: 375, question: "O que caracteriza o **Pré-Modernismo**?", answer: "A transição entre o passado e o novo, com denúncias sociais e foco no interior do Brasil.", difficulty: "medium" },
          { id: 376, question: "Quem escreveu *Os Sertões*?", answer: "Euclides da Cunha.", difficulty: "easy" },
          { id: 377, question: "Qual autor pré-modernista focou na decadência do caipira através do personagem Jeca Tatu?", answer: "Monteiro Lobato.", difficulty: "medium" },
          { id: 378, question: "Quem escreveu *Augusto dos Anjos*?", answer: "O próprio autor (obra única: *Eu*), conhecido pela poesia científica e 'feia'.", difficulty: "hard" }
        ]
      },
      {
        name: "Modernismo - 1ª Fase (Heroica)",
        cards: [
          { id: 379, question: "Qual evento marcou o início oficial do Modernismo no Brasil?", answer: "A Semana de Arte Moderna de 1922.", difficulty: "easy" },
          { id: 380, question: "Quais eram os objetivos da **1ª Fase Modernista**?", answer: "Ruptura com o passado, busca por uma identidade nacional e liberdade estética.", difficulty: "medium" },
          { id: 381, question: "Quem escreveu o 'Manifesto Antropofágico'?", answer: "Oswald de Andrade.", difficulty: "medium" },
          { id: 382, question: "O que propunha a **Antropofagia**?", answer: "Assimilar as influências estrangeiras mas 'devorá-las' para criar algo autenticamente brasileiro.", difficulty: "hard" },
          { id: 383, question: "Qual obra de Mário de Andrade é considerada a síntese do nosso povo?", answer: "*Macunaíma*.", difficulty: "easy" }
        ]
      },
      {
        name: "Modernismo - 2ª Fase (Geração de 30)",
        cards: [
          { id: 384, question: "Qual o foco do romance da **2ª Fase Modernista**?", answer: "Denúncia social e regionalismo (especialmente o Nordeste).", difficulty: "medium" },
          { id: 385, question: "Quem escreveu *Vidas Secas*?", answer: "Graciliano Ramos.", difficulty: "easy" },
          { id: 386, question: "Carlos Drummond de Andrade faz parte de qual fase do Modernismo?", answer: "2ª Fase (Poesia).", difficulty: "easy" },
          { id: 387, question: "Qual autora escreveu *A Bagaceira*, marco inicial do romance de 30?", answer: "Rachel de Queiroz.", difficulty: "hard" },
          { id: 388, question: "Quem escreveu *Capitães da Areia*?", answer: "Jorge Amado.", difficulty: "medium" }
        ]
      },
      {
        name: "Modernismo - 3ª Fase (Geração de 45)",
        cards: [
          { id: 389, question: "O que caracteriza a prosa de **Clarice Lispector**?", answer: "O fluxo de consciência, a introspecção e o momento da epifania.", difficulty: "medium" },
          { id: 390, question: "Quem escreveu *Grande Sertão: Veredas*?", answer: "Guimarães Rosa.", difficulty: "easy" },
          { id: 391, question: "João Cabral de Melo Neto é autor de qual obra famosa sobre a miséria nordestina?", answer: "*Morte e Vida Severina*.", difficulty: "easy" }
        ]
      },
      {
        name: "Literatura Contemporânea",
        cards: [
          { id: 392, question: "O que caracteriza a **Literatura Contemporânea**?", answer: "Hibridismo de gêneros, multiplicidade temática e diálogo com outras artes.", difficulty: "medium" },
          { id: 393, question: "Quem é o autor do 'Livro do Desassossego'?", answer: "Fernando Pessoa (heterônimo Bernardo Soares).", difficulty: "hard" },
          { id: 394, question: "O que são os **Heterônimos** de Fernando Pessoa?", answer: "Personalidades poéticas criadas com biografia e estilo próprios (ex: Ricardo Reis, Álvaro de Campos).", difficulty: "medium" }
        ]
      },
      {
        name: "Principais Obras de Portugal",
        cards: [
          { id: 395, question: "Qual poeta português escreveu *Mensagem*?", answer: "Fernando Pessoa.", difficulty: "medium" },
          { id: 396, question: "Quem escreveu o Auto da Barca do Inferno?", answer: "Gil Vicente (Teatro Humanista).", difficulty: "medium" },
          { id: 397, question: "Qual o estilo de Eça de Queirós em *Os Maias*?", answer: "Realismo Português.", difficulty: "hard" }
        ]
      },
      {
        name: "Figuras de Linguagem em Literatura",
        cards: [
          { id: 398, question: "O que é a **Sinestesia**?", answer: "Cruzamento de sensações de diferentes sentidos (ex: 'Cheiro doce').", difficulty: "easy" },
          { id: 399, question: "Defina **Catacrese**.", answer: "Uso de um termo figurado por falta de um termo próprio (ex: 'Asa da xícara', 'pé da mesa').", difficulty: "easy" },
          { id: 400, question: "O que é a **Aliteração**?", answer: "Repetição de sons consonantais para criar efeito sonoro.", difficulty: "medium" }
        ]
      }
    ]
  },
  {
    subject: "Filosofia",
    topics: [
      {
        name: "Filosofia Antiga",
        cards: [
          { id: 401, question: "Quem é considerado o primeiro filósofo e qual era sua **arché** (princípio)?", answer: "Tales de Mileto; a água.", difficulty: "easy" },
          { id: 402, question: "O que é a **Maiêutica** socrática?", answer: "Método de 'dar à luz' ideias através de sucessivas perguntas.", difficulty: "medium" },
          { id: 403, question: "O que Platão busca explicar com o **Mito da Caverna**?", answer: "A passagem da ignorância (sensível) para o conhecimento verdadeiro (inteligível).", difficulty: "easy" },
          { id: 404, question: "Qual a definição de **Eudaimonia** para Aristóteles?", answer: "A felicidade como fim supremo da vida humana, alcançada pela prática da virtude.", difficulty: "medium" },
          { id: 405, question: "O que caracteriza os filósofos **Sofistas**?", answer: "Mestres da retórica que cobravam para ensinar e defendiam o relativismo da verdade.", difficulty: "medium" },
          { id: 406, question: "O que é o **Mundo das Ideias** de Platão?", answer: "A realidade suprema, perfeita e imutável, da qual o mundo sensível é apenas uma cópia.", difficulty: "easy" }
        ]
      },
      {
        name: "Filosofia Medieval",
        cards: [
          { id: 407, question: "O que é a **Patrística**?", answer: "Primeiro período da filosofia medieval (ex: Santo Agostinho), focado na conciliação entre fé e razão grega.", difficulty: "medium" },
          { id: 408, question: "Qual a principal teoria de **Santo Agostinho** sobre o conhecimento?", answer: "Teoria da Iluminação Divina.", difficulty: "medium" },
          { id: 409, question: "O que caracteriza a **Escolástica**?", answer: "Período auge da filosofia medieval (ex: São Tomás de Aquino) dentro das universidades.", difficulty: "medium" },
          { id: 410, question: "Como São Tomás de Aquino sistematizou as provas da existência de Deus?", answer: "Através das **Cinco Vias** (Motor Imóvel, Causa Eficiente, etc).", difficulty: "hard" }
        ]
      },
      {
        name: "Filosofia Moderna - Epistemologia",
        cards: [
          { id: 411, question: "Qual o ponto central do **Racionalismo** de René Descartes?", answer: "A razão como única fonte segura de conhecimento (Dúvida Metódica).", difficulty: "easy" },
          { id: 412, question: "O que significa 'Cogito, ergo sum'?", answer: "Penso, logo existo.", difficulty: "easy" },
          { id: 413, question: "O que defende o **Empirismo** (ex: John Locke, David Hume)?", answer: "O conhecimento provém unicamente da experiência sensível.", difficulty: "medium" },
          { id: 414, question: "O que é a **Tábula Rasa** para John Locke?", answer: "A ideia de que a mente humana nasce vazia e é preenchida pela experiência.", difficulty: "easy" },
          { id: 415, question: "O que é o **Criticismo** de Immanuel Kant?", answer: "A síntese entre racionalismo e empirismo (Como conhecemos?).", difficulty: "hard" }
        ]
      },
      {
        name: "Filosofia Política",
        cards: [
          { id: 416, question: "Qual a principal ideia de Nicolau Maquiavel em *O Príncipe*?", answer: "A separação entre moral religiosa e política (Fins justificam os meios - atribuição comum).", difficulty: "medium" },
          { id: 417, question: "O que é o **Contrato Social**?", answer: "Teoria que explica a origem do Estado a partir de um acordo entre indivíduos.", difficulty: "easy" },
          { id: 418, question: "Qual a visão de **Thomas Hobbes** sobre o homem no estado de natureza?", answer: "Guerra de todos contra todos ('O homem é o lobo do homem').", difficulty: "medium" },
          { id: 419, question: "O que caracteriza o estado de natureza para **Jean-Jacques Rousseau**?", answer: "O 'bom selvagem': o homem nasce livre e bom, a sociedade o corrompe.", difficulty: "medium" },
          { id: 420, question: "O que defende John Locke no **Liberalismo Político**?", answer: "Direitos naturais inalienáveis: vida, liberdade e propriedade.", difficulty: "medium" },
          { id: 421, question: "Qual a teoria de **Montesquieu** sobre o Estado?", answer: "A tripartição dos poderes (Executivo, Legislativo e Judiciário).", difficulty: "easy" }
        ]
      },
      {
        name: "Ética e Moral",
        cards: [
          { id: 422, question: "O que é o **Imperativo Categórico** de Kant?", answer: "Agir de tal forma que sua ação possa ser elevada a uma lei universal.", difficulty: "hard" },
          { id: 423, question: "Qual o princípio fundamental do **Utilitarismo** (Bentham e Mill)?", answer: "A melhor ação é aquela que traz o maior bem/felicidade para o maior número de pessoas.", difficulty: "medium" },
          { id: 424, question: "Qual a diferença entre **Ética e Moral**?", answer: "Moral é o conjunto de regras/costumes; Ética é a reflexão filosófica sobre a moral.", difficulty: "easy" },
          { id: 425, question: "O que é o **Nietzscheanismo** (Nietzsche) quanto à moral?", answer: "Crítica à 'moral de rebanho' e defesa da 'vontade de poder' e do 'super-homem'.", difficulty: "hard" }
        ]
      },
      {
        name: "Filosofia Contemporânea",
        cards: [
          { id: 426, question: "O que defende o **Existencialismo** (ex: Jean-Paul Sartre)?", answer: "A existência precede a essência: o homem se define por suas escolhas (liberdade absoluta).", difficulty: "medium" },
          { id: 427, question: "O que é a **Fenomenologia**?", answer: "Estudo das coisas como elas se apresentam à consciência.", difficulty: "hard" },
          { id: 428, question: "O que caracteriza a **Escola de Frankfurt**?", answer: "Teoria Crítica da sociedade e análise da 'Indústria Cultural'.", difficulty: "hard" },
          { id: 429, question: "Qual o conceito de **Poder** para Michel Foucault?", answer: "O micro-poder e a biopolítica (instituições de controle).", difficulty: "medium" },
          { id: 430, question: "O que é o 'Eterno Retorno' em Nietzsche?", answer: "A ideia de viver cada momento como se ele devesse se repetir infinitamente.", difficulty: "hard" }
        ]
      },
      {
        name: "Filosofia da Ciência e Lógica",
        cards: [
          { id: 431, question: "O que é um **Silogismo** aristotélico?", answer: "Raciocínio dedutivo formado por duas premissas e uma conclusão.", difficulty: "medium" },
          { id: 432, question: "O que defende Karl Popper sobre a ciência?", answer: "O princípio da **Falsificabilidade**: uma teoria só é científica se puder ser contestada.", difficulty: "medium" },
          { id: 433, question: "O que são **Paradigmas** para Thomas Kuhn?", answer: "Modelos científicos dominantes que orientam a pesquisa em uma época.", difficulty: "medium" }
        ]
      },
      {
        name: "Helenismo",
        cards: [
          { id: 434, question: "O que defende o **Estoicismo**?", answer: "A busca da ataraxia através da aceitação do destino e controle das emoções.", difficulty: "medium" },
          { id: 435, question: "Qual o foco do **Epicurismo**?", answer: "A busca do prazer moderado e a ausência de dor para alcançar a paz.", difficulty: "medium" },
          { id: 436, question: "O que prega o **Ceticismo**?", answer: "A suspensão do juízo (*epoché*), pois a verdade absoluta é inalcançável.", difficulty: "medium" },
          { id: 437, question: "O que caracteriza o **Cinismo** (Cínicos)?", answer: "O desprezo pelas convenções sociais e a busca da virtude na vida simples/natural.", difficulty: "medium" }
        ]
      },
      {
        name: "Temas Clássicos",
        cards: [
          { id: 438, question: "O que é a **Alienação** para Karl Marx?", answer: "O estranhamento do trabalhador em relação ao produto do seu trabalho no sistema capitalista.", difficulty: "medium" },
          { id: 439, question: "O que é o **Otimismo Ontológico** de Leibniz?", answer: "A ideia de que vivemos no 'melhor de todos os mundos possíveis'.", difficulty: "hard" },
          { id: 440, question: "O que é a **Indústria Cultural** para Adorno e Horkheimer?", answer: "A mercantilização da cultura e das artes para manipulação das massas.", difficulty: "medium" },
          { id: 441, question: "Qual o conceito de **Banalidade do Mal** de Hannah Arendt?", answer: "Quando indivíduos comuns cometem atrocidades por apenas cumprirem ordens em sistemas burocráticos.", difficulty: "hard" },
          { id: 442, question: "O que é o **Niilismo**?", answer: "A negação ou descrença em todos os sentidos, valores ou realidades absolutas.", difficulty: "medium" },
          { id: 443, question: "O que é a **Metafísica**?", answer: "Ramo da filosofia que estuda a natureza última da realidade e do ser enquanto ser.", difficulty: "easy" },
          { id: 444, question: "Quem disse: 'Não se nasce mulher, torna-se mulher'?", answer: "Simone de Beauvoir.", difficulty: "easy" },
          { id: 445, question: "O que é a **Vontade** para Schopenhauer?", answer: "Uma força cega, irracional e insaciável que move o mundo e causa sofrimento.", difficulty: "hard" },
          { id: 446, question: "O que é a **Dialética** de Hegel?", answer: "Processo de tese, antítese e síntese que move a história e o pensamento.", difficulty: "hard" },
          { id: 447, question: "Qual a função da **Ataraxia**?", answer: "Alcançar a tranquilidade da alma e a imperturbabilidade.", difficulty: "medium" },
          { id: 448, question: "O que é o **Positivismo** de Auguste Comte?", answer: "Doutrina que defende que o conhecimento científico é a única forma verdadeira de saber (Lei dos Três Estados).", difficulty: "medium" },
          { id: 449, question: "O que é o **Existencialismo Cristão** (ex: Kierkegaard)?", answer: "Foco na angústia e no salto de fé do indivíduo diante de Deus.", difficulty: "hard" },
          { id: 450, question: "Qual o lema do **Iluminismo** (Kant)?", answer: "*Sapere Aude*: Ouse saber (pensar por si mesmo).", difficulty: "easy" }
        ]
      }
    ]
  },
  {
    subject: "Sociologia",
    topics: [
      {
        name: "Surgimento e Clássicos",
        cards: [
          { id: 501, question: "Quem é considerado o 'Pai da Sociologia' e criador do termo?", answer: "Auguste Comte.", difficulty: "easy" },
          { id: 502, question: "O que é um **Fato Social** para Émile Durkheim?", answer: "Maneiras de agir, pensar e sentir que são exteriores ao indivíduo, coercitivas e generalizadas.", difficulty: "medium" },
          { id: 503, question: "Para Max Weber, o que é uma **Ação Social**?", answer: "Uma conduta humana que possui um sentido subjetivo voltado para a ação de outros.", difficulty: "medium" },
          { id: 504, question: "O que é a **Mais-Valia** em Karl Marx?", answer: "A diferença entre o valor produzido pelo trabalhador e o salário pago pelo capitalista.", difficulty: "medium" },
          { id: 505, question: "Qual a diferença entre **Solidariedade Mecânica e Orgânica** em Durkheim?", answer: "A mecânica ocorre em sociedades pré-industriais (semelhança); a orgânica em sociedades industriais (interdependência pela divisão do trabalho).", difficulty: "hard" },
          { id: 506, question: "O que Weber entende por **Desencantamento do Mundo**?", answer: "O processo de racionalização onde explicações mágicas/religiosas são substituídas pelo conhecimento técnico-científico.", difficulty: "hard" }
        ]
      },
      {
        name: "Cultura e Identidade",
        cards: [
          { id: 507, question: "O que é o **Etnocentrismo**?", answer: "Visão de mundo onde o próprio grupo é tomado como centro e modelo para julgar as outras culturas.", difficulty: "easy" },
          { id: 508, question: "O que defende o **Relativismo Cultural**?", answer: "A ideia de que cada cultura deve ser compreendida nos seus próprios termos, sem julgamentos de superioridade.", difficulty: "medium" },
          { id: 509, question: "O que é a **Aculturação**?", answer: "Processo de modificação cultural de um grupo ou indivíduo ao entrar em contato direto e contínuo com outra cultura.", difficulty: "medium" },
          { id: 510, question: "Qual a definição de **Patrimônio Imaterial**?", answer: "Práticas, representações, expressões, conhecimentos e técnicas de uma comunidade (ex: capoeira, frevo).", difficulty: "easy" }
        ]
      },
      {
        name: "Poder, Estado e Política",
        cards: [
          { id: 511, question: "Como Max Weber define o **Estado**?", answer: "A instituição que possui o monopólio do uso legítimo da força física dentro de um território.", difficulty: "medium" },
          { id: 512, question: "Quais são os três tipos de **Dominação Legítima** para Weber?", answer: "Racional-legal, Tradicional e Carismática.", difficulty: "hard" },
          { id: 513, question: "O que é a **Docracia Partidária**?", answer: "Sistema onde partidos políticos são os principais mediadores entre a sociedade e o Estado.", difficulty: "medium" },
          { id: 514, question: "O que caracteriza a **Cidadania Ativa**?", answer: "A participação direta do cidadão na vida política e social para transformar a realidade.", difficulty: "easy" }
        ]
      },
      {
        name: "Trabalho e Sociedade",
        cards: [
          { id: 515, question: "O que caracteriza o **Fordismo**?", answer: "Produção em massa, linha de montagem e especialização extrema de tarefas.", difficulty: "easy" },
          { id: 516, question: "O que é a **Precarização do Trabalho**?", answer: "A perda de direitos trabalhistas e a instabilidade nos vínculos de emprego (ex: 'uberização').", difficulty: "medium" },
          { id: 517, question: "O que Weber analisa em sua obra *A Ética Protestante e o Espírito do Capitalismo*?", answer: "Como os valores do protestantismo (ascese, trabalho) favoreceram o desenvolvimento do capitalismo.", difficulty: "hard" }
        ]
      },
      {
        name: "Sociologia no Brasil",
        cards: [
          { id: 518, question: "Quem escreveu *Casa-Grande & Senzala*?", answer: "Gilberto Freyre.", difficulty: "easy" },
          { id: 519, question: "O que é o mito da **Democracia Racial**?", answer: "A ideia (criticada) de que no Brasil as relações entre raças seriam harmoniosas e sem preconceito.", difficulty: "medium" },
          { id: 520, question: "Quem criou o conceito de **Homem Cordial**?", answer: "Sérgio Buarque de Holanda em *Raízes do Brasil*.", difficulty: "medium" },
          { id: 521, question: "O que representa o 'Homem Cordial' para a sociologia brasileira?", answer: "A predominância da afetividade e do privado sobre o público, dificultando a impessoalidade do Estado.", difficulty: "hard" },
          { id: 522, question: "Qual sociólogo brasileiro focou na denúncia do mito da democracia racial?", answer: "Florestan Fernandes.", difficulty: "medium" }
        ]
      },
      {
        name: "Desigualdades e Movimentos Sociais",
        cards: [
          { id: 523, question: "O que caracteriza os **Novos Movimentos Sociais**?", answer: "Foco em pautas de identidade e qualidade de vida (feminismo, LGBTQIA+, ambientalismo) além das pautas econômicas.", difficulty: "medium" },
          { id: 524, question: "O que é a **Estrutura Social**?", answer: "O conjunto estável de relações e posições que organizam a vida em sociedade.", difficulty: "medium" },
          { id: 525, question: "O que define a **Mobilidade Social Vertical**?", answer: "A mudança de posição de um indivíduo na hierarquia social (subida ou descida de classe).", difficulty: "easy" },
          { id: 526, question: "O que é **Instituição Social**?", answer: "Formas estáveis e estabelecidas de relações sociais que organizam a convivência (ex: Família, Escola, Igreja).", difficulty: "medium" },
          { id: 527, question: "O que é a **Socialização Primária**?", answer: "Ocorre na infância, principalmente na família, onde a criança internaliza o mundo social.", difficulty: "easy" }
        ]
      },
      {
        name: "Cultura de Massa e Indústria Cultural",
        cards: [
          { id: 528, question: "Qual a diferença entre **Cultura Erudita e Cultura Popular**?", answer: "A erudita é associada à elite e academia; a popular às tradições das classes populares.", difficulty: "easy" },
          { id: 529, question: "O que caracteriza a **Cultura de Massa**?", answer: "Cultura produzida industrialmente para o consumo rápido e padronizado do maior número de pessoas.", difficulty: "medium" },
          { id: 530, question: "O que é a **Alienação Cultural**?", answer: "Quando os indivíduos aceitam passivamente padrões culturais impostos, perdendo o senso crítico sobre sua realidade.", difficulty: "medium" }
        ]
      },
      {
        name: "Questões Contemporâneas",
        cards: [
          { id: 531, question: "O que Zygmunt Bauman define como **Modernidade Líquida**?", answer: "Uma época de relações fluidas, incertas, imediatistas e frágeis em contraste com a solidez do passado.", difficulty: "medium" },
          { id: 532, question: "O que é o **Panóptico** para a sociologia (retomado por Foucault)?", answer: "Um modelo de vigilância onde um único observador pode ver todos sem ser visto, gerando autodisciplina.", difficulty: "hard" },
          { id: 533, question: "O que define a **Globalização Cultural**?", answer: "A intensificação das trocas culturais globais, muitas vezes gerando hibridismo ou homogeneização estética.", difficulty: "medium" },
          { id: 534, question: "O que é a **Anomia** social?", answer: "Um estado de desorientação e ausência de normas sociais claras que guiem o comportamento dos indivíduos.", difficulty: "hard" },
          { id: 535, question: "Como se define o **Preconceito Estrutural**?", answer: "O preconceito enraizado nas instituições e práticas cotidianas que mantém desigualdades históricas.", difficulty: "medium" }
        ]
      },
      {
        name: "Estado e Sociedade Civil",
        cards: [
          { id: 536, question: "O que é a **Sociedade Civil**?", answer: "O conjunto de organizações e cidadãos que atuam de forma independente do Estado para defender seus interesses.", difficulty: "medium" },
          { id: 537, question: "O que caracteriza o **Estado de Bem-Estar Social** (Welfare State)?", answer: "O Estado como garantidor de direitos sociais básicos (saúde, educação, previdência) aos cidadãos.", difficulty: "medium" },
          { id: 538, question: "O que defende o **Neoliberalismo** quanto ao papel do Estado?", answer: "A redução da intervenção estatal na economia e a privatização de serviços públicos.", difficulty: "medium" }
        ]
      },
      {
        name: "Educação e Sociedade",
        cards: [
          { id: 539, question: "Para Pierre Bourdieu, o que é o **Capital Cultural**?", answer: "O conjunto de conhecimentos, habilidades e diplomas que conferem status e vantagens sociais.", difficulty: "hard" },
          { id: 540, question: "Qual a função da escola segundo a **Teoria Institucionalista**?", answer: "Reproduzir os valores e a ordem social vigente através do currículo e comportamento.", difficulty: "medium" },
          { id: 541, question: "O que é o **Habitus** para Bourdieu?", answer: "Disposições incorporadas pelos indivíduos que orientam seu modo de agir e pensar conforme sua classe social.", difficulty: "hard" }
        ]
      },
      {
        name: "Temas Gerais de Sociologia",
        cards: [
          { id: 542, question: "O que é o **Ideolismo**?", answer: "Conjunto de ideias que justificam e mantêm uma determinada ordem social ou dominação de classe.", difficulty: "medium" },
          { id: 543, question: "O que define a **Geração** em termos sociológicos?", answer: "Grupo de pessoas que compartilham experiências históricas e culturais em um mesmo período temporal.", difficulty: "easy" },
          { id: 544, question: "O que é a **Internet das Coisas** (IoT) sob a ótica sociológica?", answer: "A crescente hiperconexão entre objetos e pessoas, alterando privacidades e interações sociais.", difficulty: "medium" },
          { id: 545, question: "O que caracteriza a **Sociedade da Informação**?", answer: "Sociedade onde a produção e controle de dados são a principal fonte de poder e riqueza.", difficulty: "easy" },
          { id: 546, question: "O que é o **Desenvolvimento Local**?", answer: "Processo de melhoria das condições de vida baseado no potencial e recursos de uma comunidade específica.", difficulty: "medium" },
          { id: 547, question: "O que é o **Cosmopolitismo**?", answer: "A ideia de ser 'cidadão do mundo', privilegiando a identidade humana global sobre a nacional.", difficulty: "medium" },
          { id: 548, question: "O que define o **Setor Secundário** da economia?", answer: "Atividades industriais de transformação de matéria-prima em produtos.", difficulty: "easy" },
          { id: 549, question: "O que é a **Pós-Modernidade**?", answer: "Período marcado pela fragmentação das grandes narrativas e pela valorização do pluralismo e efemeridade.", difficulty: "hard" },
          { id: 550, question: "Qual a importância da **Opinião Pública** na democracia?", answer: "Funciona como mecanismo de controle social e pressão sobre as decisões dos governantes.", difficulty: "easy" }
        ]
      }
    ]
  },
  {
    subject: "Inglês",
    topics: [
      {
        name: "Tempos Verbais (Verb Tenses)",
        cards: [
          { id: 451, question: "Qual o auxiliar usado para fazer perguntas no **Simple Present** (exceto para verbos especiais)?", answer: "*Do* ou *Does* (para he/she/it).", difficulty: "easy" },
          { id: 452, question: "Como se forma o **Present Continuous**?", answer: "Verbo *to be* (am/is/are) + verbo principal com *-ing*.", difficulty: "easy" },
          { id: 453, question: "Qual a principal função do **Present Perfect**?", answer: "Falar de ações que ocorreram num tempo indefinido no passado ou que continuam até o presente.", difficulty: "medium" },
          { id: 454, question: "No **Past Simple**, qual o sufixo adicionado aos verbos regulares?", answer: "*-ed*.", difficulty: "easy" },
          { id: 455, question: "Qual a diferença entre *Will* e *Going to* para o futuro?", answer: "*Will* é para decisões rápidas ou previsões; *Going to* é para planos e intenções já decididos.", difficulty: "medium" },
          { id: 456, question: "Qual o auxiliar usado no **Past Perfect**?", answer: "*Had*.", difficulty: "medium" }
        ]
      },
      {
        name: "Verbos Modais (Modal Verbs)",
        cards: [
          { id: 457, question: "Qual modal verb indica **habilidade** ou capacidade no presente?", answer: "*Can*.", difficulty: "easy" },
          { id: 458, question: "Qual a diferença entre *May* e *Might*?", answer: "Ambos indicam possibilidade, mas *May* sugere uma probabilidade maior que *Might*.", difficulty: "medium" },
          { id: 459, question: "Qual modal verb é usado para dar **conselhos**?", answer: "*Should*.", difficulty: "easy" },
          { id: 460, question: "Qual modal indica uma **obrigação** forte ou necessidade?", answer: "*Must*.", difficulty: "medium" }
        ]
      },
      {
        name: "Pronomes e Preposições",
        cards: [
          { id: 461, question: "Quando usamos a preposição **'In'** para tempo?", answer: "Para períodos longos: meses, anos, estações e séculos.", difficulty: "medium" },
          { id: 462, question: "Quando usamos a preposição **'On'** para tempo?", answer: "Para dias específicos e datas (ex: *On Monday*, *On Christmas Day*).", difficulty: "medium" },
          { id: 463, question: "Quando usamos a preposição **'At'** para tempo?", answer: "Para horas específicas e momentos precisos (ex: *At 7 PM*, *At night*).", difficulty: "medium" },
          { id: 464, question: "Qual a função dos **Relative Pronouns** *Who* e *Which*?", answer: "*Who* refere-se a pessoas; *Which* refere-se a objetos e animais.", difficulty: "easy" },
          { id: 465, question: "O que são **Possessive Adjectives** (ex: *my, your*)?", answer: "Palavras que indicam posse e sempre acompanham um substantivo.", difficulty: "easy" }
        ]
      },
      {
        name: "Falsos Cognatos (False Cognates)",
        cards: [
          { id: 466, question: "O que significa a palavra **'Actually'**?", answer: "Na verdade / Realmente (não é 'atualmente').", difficulty: "medium" },
          { id: 467, question: "O que significa **'Library'**?", answer: "Biblioteca (não é 'livraria').", difficulty: "easy" },
          { id: 468, question: "O que significa **'Parents'**?", answer: "Pais (não é 'parentes').", difficulty: "easy" },
          { id: 469, question: "O que significa **'Push'**?", answer: "Empurrar (não é 'puxar').", difficulty: "easy" },
          { id: 470, question: "O que significa **'Notice'**?", answer: "Notar / Perceber (não é 'notícia').", difficulty: "medium" },
          { id: 471, question: "O que significa **'Pretend'**?", answer: "Fingir (não é 'pretender').", difficulty: "medium" },
          { id: 472, question: "O que significa **'Intend'**?", answer: "Pretender.", difficulty: "medium" }
        ]
      },
      {
        name: "Phrasal Verbs e Expressões",
        cards: [
          { id: 473, question: "O que significa o phrasal verb **'Give up'**?", answer: "Desistir.", difficulty: "easy" },
          { id: 474, question: "O que significa **'Look for'**?", answer: "Procurar.", difficulty: "easy" },
          { id: 475, question: "O que significa **'Carry on'**?", answer: "Continuar.", difficulty: "medium" },
          { id: 476, question: "O que significa **'Find out'**?", answer: "Descobrir.", difficulty: "medium" },
          { id: 477, question: "O que significa **'Call off'**?", answer: "Cancelar.", difficulty: "hard" },
          { id: 478, question: "O que significa **'Set up'**?", answer: "Configurar / Estabelecer / Montar.", difficulty: "medium" }
        ]
      },
      {
        name: "Condicionais (Conditionals)",
        cards: [
          { id: 479, question: "O que caracteriza a **First Conditional** (If + present, ...)?", answer: "Indica uma possibilidade real no futuro (ex: *If it rains, I will stay home*).", difficulty: "medium" },
          { id: 480, question: "O que caracteriza a **Second Conditional** (If + past, would...)?", answer: "Indica situações hipotéticas ou improváveis no presente/futuro (ex: *If I won the lottery, I would travel*).", difficulty: "hard" },
          { id: 481, question: "Em condicionais, qual forma de 'to be' usamos para todas as pessoas após o 'If' no passado?", answer: "*Were* (ex: *If I were you*).", difficulty: "medium" }
        ]
      },
      {
        name: "Voz Passiva e Discurso Indireto",
        cards: [
          { id: 482, question: "Como se forma a **Passive Voice** em inglês?", answer: "Objeto + Verbo *to be* (no tempo da frase original) + Particípio Passado.", difficulty: "hard" },
          { id: 483, question: "No **Reported Speech**, o que acontece com o verbo no *Present Simple* ao ser relatado?", answer: "Ele geralmente muda para o *Past Simple*.", difficulty: "hard" }
        ]
      },
      {
        name: "Vocabulário Temático",
        cards: [
          { id: 484, question: "Como se diz **'Meio Ambiente'** em inglês?", answer: "*Environment*.", difficulty: "easy" },
          { id: 485, question: "O que significa **'Sustainable'**?", answer: "Sustentável.", difficulty: "easy" },
          { id: 486, question: "Como se diz **'Pesquisa'** (acadêmica/científica) em inglês?", answer: "*Research*.", difficulty: "medium" },
          { id: 487, question: "O que significa **'Goal'**?", answer: "Objetivo / Meta (além de 'gol').", difficulty: "easy" },
          { id: 488, question: "O que significa **'Health'**?", answer: "Saúde.", difficulty: "easy" },
          { id: 489, question: "O que significa **'Knowledge'**?", answer: "Conhecimento.", difficulty: "medium" }
        ]
      },
      {
        name: "Estratégias de Leitura (Reading)",
        cards: [
          { id: 490, question: "O que é a técnica de leitura **Skimming**?", answer: "Ler rapidamente o texto para captar a ideia geral (tópico principal).", difficulty: "medium" },
          { id: 491, question: "O que é a técnica de leitura **Scanning**?", answer: "Procurar informações específicas no texto (datas, nomes, números).", difficulty: "medium" },
          { id: 492, question: "O que são **Cognatos**?", answer: "Palavras que possuem a mesma origem e grafia similar ao português, com o mesmo sentido.", difficulty: "easy" }
        ]
      },
      {
        name: "Gramática Geral",
        cards: [
          { id: 493, question: "Qual a diferença entre **Many** e **Much**?", answer: "*Many* é usado para substantivos contáveis; *Much* para incontáveis.", difficulty: "easy" },
          { id: 494, question: "Quando usamos **'Few'** e **'Little'**?", answer: "*Few* para contáveis (poucos); *Little* para incontáveis (pouco).", difficulty: "medium" },
          { id: 495, question: "Qual a regra para o plural de palavras terminadas em **-y** precedido de consoante?", answer: "Troca-se o *-y* por *-ies* (ex: *city -> cities*).", difficulty: "easy" },
          { id: 496, question: "Como se forma o **Comparativo de Superioridade** para adjetivos curtos?", answer: "Adiciona-se o sufixo *-er* + *than* (ex: *taller than*).", difficulty: "easy" },
          { id: 497, question: "Como se forma o **Superlativo** para adjetivos longos?", answer: "*The most* + adjetivo (ex: *The most beautiful*).", difficulty: "medium" },
          { id: 498, question: "Qual a diferença entre **'Since'** e **'For'** no Present Perfect?", answer: "*Since* indica o ponto de início; *For* indica a duração do tempo.", difficulty: "medium" },
          { id: 499, question: "Qual o plural irregular de **'Child'**?", answer: "*Children*.", difficulty: "easy" },
          { id: 500, question: "O que significa o sufixo **-less** em palavras como *hopeless* ou *careless*?", answer: "Indica 'falta de' ou 'sem' (ex: sem esperança, sem cuidado).", difficulty: "medium" }
        ]
      }
    ]
  },
];