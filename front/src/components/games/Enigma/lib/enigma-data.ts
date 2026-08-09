// =============================================================================
// UI TYPES (Menu e Cores)
// =============================================================================
export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface SubjectCardProps {
  subject: Subject;
  isPlayed: boolean;
  onSelect: (subject: Subject) => void;
}

export interface SubjectGridProps {
  subjects: Subject[];
  playedSubjects: string[];
  onSelectSubject: (subject: Subject) => void;
}

export interface ColorMap {
  shadow: string;
  background: string;
  borderHex: string;
  colorHex: string;
}

export type ColorMappings = {
  [key: string]: ColorMap;
};

// =============================================================================
// GAME LOGIC TYPES (Entidades e Feedback)
// =============================================================================
export interface Entity {
  id: string;
  name: string;
  attributes: EntityAttributes;
}

export interface EntityAttributes {
  [key: string]: string | number | string[];
}

export type FeedbackStatus = "correct" | "incorrect" | "partial" | "higher" | "lower";

export interface AttributeFeedback {
  key: string;
  value: string | number | string[];
  status: FeedbackStatus;
}

export interface GuessFeedback {
  entity: Entity;
  feedback: AttributeFeedback[];
  isCorrect: boolean;
}

// =============================================================================
// UI DATA (Cores e Lista de Matérias)
// =============================================================================
export const colorMappings: ColorMappings = {
  "bg-blue-50": { shadow: "rgba(59, 130, 246, 0.25)", background: "#eff6ff", borderHex: "#dbeafe", colorHex: "#1e40af" },
  "bg-indigo-50": { shadow: "rgba(99, 102, 241, 0.25)", background: "#eef2ff", borderHex: "#e0e7ff", colorHex: "#312e81" },
  "bg-emerald-50": { shadow: "rgba(16, 185, 129, 0.25)", background: "#f0fdf4", borderHex: "#d1fae5", colorHex: "#065f46" },
  "bg-green-50": { shadow: "rgba(34, 197, 94, 0.25)", background: "#f0fdf4", borderHex: "#dcfce7", colorHex: "#15803d" },
  "bg-amber-50": { shadow: "rgba(217, 119, 6, 0.25)", background: "#fffbeb", borderHex: "#fef3c7", colorHex: "#92400e" },
  "bg-teal-50": { shadow: "rgba(20, 184, 166, 0.25)", background: "#f0fdfa", borderHex: "#ccfbf1", colorHex: "#134e4a" },
  "bg-rose-50": { shadow: "rgba(244, 63, 94, 0.25)", background: "#fff7ed", borderHex: "#fecdd3", colorHex: "#be185d" },
  "bg-purple-50": { shadow: "rgba(147, 51, 234, 0.25)", background: "#faf5ff", borderHex: "#f3e8ff", colorHex: "#6b21a8" },
  "bg-cyan-50":   { shadow: "rgba(6, 182, 212, 0.25)", background: "#ecfeff", borderHex: "#cffafe", colorHex: "#0891b2" },
  "bg-orange-50": { shadow: "rgba(249, 115, 22, 0.25)", background: "#fff7ed", borderHex: "#ffedd5", colorHex: "#c2410c" },
};

export const subjects: Subject[] = [
  { id: "matematica", name: "Matemática", icon: "∑", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-100" },
  { id: "fisica", name: "Física", icon: "⚛", color: "text-indigo-700", bgColor: "bg-indigo-50", borderColor: "border-indigo-100" },
  { id: "quimica", name: "Química", icon: "🧪", color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-100" },
  { id: "biologia", name: "Biologia", icon: "🧬", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-100" },
  { id: "historia", name: "História", icon: "📜", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-100" },
  { id: "geografia", name: "Geografia", icon: "🌍", color: "text-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-100" },
  { id: "portugues", name: "Português", icon: "✍", color: "text-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-100" },
  { id: "literatura", name: "Literatura", icon: "📖", color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-100" },
  { id: "filosofia", name: "Filosofia", icon: "🤔", color: "text-cyan-700", bgColor: "bg-cyan-50", borderColor: "border-cyan-100" },
  { id: "sociologia", name: "Sociologia", icon: "👥", color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-100" },
];

// =============================================================================
// GAME DATA (Entidades e Labels)
// =============================================================================
export const attributeLabels: { [key: string]: string } = {
  nacionalidade: "Nacionalidade",
  seculo: "Século",
  area: "Área",
  contribuicao: "Contribuição",
};

export const entitiesBySubject: { [subjectId: string]: Entity[] } = {
  matematica: [
    { id: "pitagoras", name: "Pitágoras", attributes: { nacionalidade: "Grécia", seculo: -6, area: "Geometria", contribuicao: ["Teorema de Pitágoras", "Escola Pitagórica"] } },
    { id: "euclides", name: "Euclides", attributes: { nacionalidade: "Grécia", seculo: -3, area: "Geometria", contribuicao: ["Os Elementos", "Geometria Euclidiana"] } },
    { id: "arquimedes", name: "Arquimedes", attributes: { nacionalidade: "Grécia", seculo: -3, area: "Cálculo", contribuicao: ["Princípio de Arquimedes", "Cálculo de π"] } },
    { id: "newton", name: "Isaac Newton", attributes: { nacionalidade: "Inglaterra", seculo: 17, area: "Cálculo", contribuicao: ["Cálculo Diferencial", "Binômio de Newton"] } },
    { id: "gauss", name: "Carl Friedrich Gauss", attributes: { nacionalidade: "Alemanha", seculo: 19, area: "Álgebra", contribuicao: ["Teoria dos Números", "Distribuição Gaussiana"] } },
    { id: "euler", name: "Leonhard Euler", attributes: { nacionalidade: "Suíça", seculo: 18, area: "Cálculo", contribuicao: ["Identidade de Euler", "Teoria dos Grafos"] } },
    { id: "fibonacci", name: "Leonardo Fibonacci", attributes: { nacionalidade: "Itália", seculo: 13, area: "Números", contribuicao: ["Sequência de Fibonacci", "Algarismos Árabes"] } },
    { id: "descartes", name: "René Descartes", attributes: { nacionalidade: "França", seculo: 17, area: "Geometria Analítica", contribuicao: ["Coordenadas Cartesianas", "Discurso do Método"] } },
    { id: "riemann", name: "Bernhard Riemann", attributes: { nacionalidade: "Alemanha", seculo: 19, area: "Geometria", contribuicao: ["Geometria Riemanniana", "Hipótese de Riemann"] } },
    { id: "avila", name: "Artur Avila", attributes: { nacionalidade: "Brasil", seculo: 21, area: "Sistemas Dinâmicos", contribuicao: ["Medalha Fields", "Teoria Ergodica"] } },
  ],

  fisica: [
    { id: "galileu", name: "Galileu Galilei", attributes: { nacionalidade: "Itália", seculo: 17, area: "Mecânica", contribuicao: ["Queda Livre", "Heliocentrismo"] } },
    { id: "newton_fisica", name: "Isaac Newton", attributes: { nacionalidade: "Inglaterra", seculo: 17, area: "Mecânica", contribuicao: ["Leis de Newton", "Gravitação Universal"] } },
    { id: "einstein", name: "Albert Einstein", attributes: { nacionalidade: "Alemanha", seculo: 20, area: "Relatividade", contribuicao: ["Relatividade Geral", "E=mc²"] } },
    { id: "bohr", name: "Niels Bohr", attributes: { nacionalidade: "Dinamarca", seculo: 20, area: "Quântica", contribuicao: ["Modelo Atômico", "Princípio da Correspondência"] } },
    { id: "faraday", name: "Michael Faraday", attributes: { nacionalidade: "Inglaterra", seculo: 19, area: "Eletromagnetismo", contribuicao: ["Indução Eletromagnética", "Gaiola de Faraday"] } },
    { id: "tesla", name: "Nikola Tesla", attributes: { nacionalidade: "Sérvia", seculo: 20, area: "Eletromagnetismo", contribuicao: ["Corrente Alternada", "Bobina de Tesla"] } },
    { id: "maxwell", name: "James Clerk Maxwell", attributes: { nacionalidade: "Escócia", seculo: 19, area: "Eletromagnetismo", contribuicao: ["Equações de Maxwell", "Teoria Eletromagnética"] } },
    { id: "planck", name: "Max Planck", attributes: { nacionalidade: "Alemanha", seculo: 20, area: "Quântica", contribuicao: ["Constante de Planck", "Quantum de Energia"] } },
    { id: "heisenberg", name: "Werner Heisenberg", attributes: { nacionalidade: "Alemanha", seculo: 20, area: "Quântica", contribuicao: ["Princípio da Incerteza", "Matriz Mecânica"] } },
    { id: "feynman", name: "Richard Feynman", attributes: { nacionalidade: "Estados Unidos", seculo: 20, area: "Quântica", contribuicao: ["Eletrodinâmica Quântica", "Diagramas de Feynman"] } },
  ],

  quimica: [
    { id: "lavoisier", name: "Antoine Lavoisier", attributes: { nacionalidade: "França", seculo: 18, area: "Química Geral", contribuicao: ["Lei da Conservação da Massa", "Nomenclatura Química"] } },
    { id: "mendeleev", name: "Dmitri Mendeleev", attributes: { nacionalidade: "Rússia", seculo: 19, area: "Química Inorgânica", contribuicao: ["Tabela Periódica", "Lei Periódica"] } },
    { id: "dalton", name: "John Dalton", attributes: { nacionalidade: "Inglaterra", seculo: 19, area: "Química Geral", contribuicao: ["Teoria Atômica", "Lei das Proporções Múltiplas"] } },
    { id: "curie", name: "Marie Curie", attributes: { nacionalidade: "Polônia", seculo: 20, area: "Radioquímica", contribuicao: ["Radioatividade", "Descoberta do Rádio"] } },
    { id: "pauling", name: "Linus Pauling", attributes: { nacionalidade: "Estados Unidos", seculo: 20, area: "Química Quântica", contribuicao: ["Ligação Química", "Eletronegatividade"] } },
    { id: "nobel", name: "Alfred Nobel", attributes: { nacionalidade: "Suécia", seculo: 19, area: "Explosivos", contribuicao: ["Dinamite", "Prêmio Nobel"] } },
    { id: "avogadro", name: "Amedeo Avogadro", attributes: { nacionalidade: "Itália", seculo: 19, area: "Gases", contribuicao: ["Número de Avogadro", "Hipótese de Avogadro"] } },
    { id: "boyle", name: "Robert Boyle", attributes: { nacionalidade: "Irlanda", seculo: 17, area: "Gases", contribuicao: ["Lei de Boyle", "Química Moderna"] } },
    { id: "priestley", name: "Joseph Priestley", attributes: { nacionalidade: "Inglaterra", seculo: 18, area: "Gases", contribuicao: ["Descoberta do Oxigênio", "Água Gasosa"] } },
    { id: "rutherford", name: "Ernest Rutherford", attributes: { nacionalidade: "Nova Zelândia", seculo: 20, area: "Radioatividade", contribuicao: ["Modelo Nuclear", "Alfa, Beta, Gama"] } },
  ],

  biologia: [
    { id: "darwin", name: "Charles Darwin", attributes: { nacionalidade: "Inglaterra", seculo: 19, area: "Evolução", contribuicao: ["Seleção Natural", "A Origem das Espécies"] } },
    { id: "mendel", name: "Gregor Mendel", attributes: { nacionalidade: "Áustria", seculo: 19, area: "Genética", contribuicao: ["Leis da Hereditariedade", "Ervilhas de Mendel"] } },
    { id: "pasteur", name: "Louis Pasteur", attributes: { nacionalidade: "França", seculo: 19, area: "Microbiologia", contribuicao: ["Pasteurização", "Teoria dos Germes"] } },
    { id: "watson", name: "James Watson", attributes: { nacionalidade: "Estados Unidos", seculo: 20, area: "Genética", contribuicao: ["Estrutura do DNA", "Dupla Hélice"] } },
    { id: "lineu", name: "Carl Linnaeus", attributes: { nacionalidade: "Suécia", seculo: 18, area: "Taxonomia", contribuicao: ["Nomenclatura Binomial", "Systema Naturae"] } },
    { id: "hooke", name: "Robert Hooke", attributes: { nacionalidade: "Inglaterra", seculo: 17, area: "Microscopia", contribuicao: ["Célula", "Micrographia"] } },
    { id: "redi", name: "Francesco Redi", attributes: { nacionalidade: "Itália", seculo: 17, area: "Geracionismo", contribuicao: ["Experimento das Moscas", "Biogênese"] } },
    { id: "kohler", name: "Theodor Köhler", attributes: { nacionalidade: "Alemanha", seculo: 20, area: "Genética", contribuicao: ["Mutação", "Cromossomos"] } },
    { id: "wallace", name: "Alfred Russel Wallace", attributes: { nacionalidade: "Inglaterra", seculo: 19, area: "Evolução", contribuicao: ["Seleção Natural", "Biogeografia"] } },
    { id: "crick", name: "Francis Crick", attributes: { nacionalidade: "Inglaterra", seculo: 20, area: "Genética", contribuicao: ["Estrutura do DNA", "Código Genético"] } },
  ],

  historia: [
    { id: "napoleao", name: "Napoleão Bonaparte", attributes: { nacionalidade: "França", seculo: 19, area: "Política", contribuicao: ["Código Napoleônico", "Guerras Napoleônicas"] } },
    { id: "getulio", name: "Getúlio Vargas", attributes: { nacionalidade: "Brasil", seculo: 20, area: "Política", contribuicao: ["Era Vargas", "CLT"] } },
    { id: "pedro_ii", name: "Dom Pedro II", attributes: { nacionalidade: "Brasil", seculo: 19, area: "Monarquia", contribuicao: ["Segundo Reinado", "Lei Áurea"] } },
    { id: "lincoln", name: "Abraham Lincoln", attributes: { nacionalidade: "Estados Unidos", seculo: 19, area: "Política", contribuicao: ["Abolição da Escravidão", "Guerra Civil Americana"] } },
    { id: "cleópatra", name: "Cleópatra", attributes: { nacionalidade: "Egito", seculo: -1, area: "Monarquia", contribuicao: ["Dinastia Ptolemaica", "Aliança com Roma"] } },
    { id: "tiradentes", name: "Tiradentes", attributes: { nacionalidade: "Brasil", seculo: 18, area: "Inconfidência", contribuicao: ["Inconfidência Mineira", "Independência"] } },
    { id: "zumbi", name: "Zumbi dos Palmares", attributes: { nacionalidade: "Brasil", seculo: 17, area: "Quilombismo", contribuicao: ["Quilombo dos Palmares", "Resistência Escrava"] } },
    { id: "martin_luther", name: "Martin Luther", attributes: { nacionalidade: "Alemanha", seculo: 16, area: "Reforma", contribuicao: ["95 Teses", "Protestantismo"] } },
    { id: "gandhi", name: "Mahatma Gandhi", attributes: { nacionalidade: "Índia", seculo: 20, area: "Independência", contribuicao: ["Satyagraha", "Independência Indiana"] } },
    { id: "simon_bolivar", name: "Simón Bolívar", attributes: { nacionalidade: "Venezuela", seculo: 19, area: "Independência", contribuicao: ["Libertador América", "Gran Colômbia"] } },
  ],

  geografia: [
    { id: "humboldt", name: "Alexander von Humboldt", attributes: { nacionalidade: "Alemanha", seculo: 19, area: "Biogeografia", contribuicao: ["Corrente de Humboldt", "Cosmos"] } },
    { id: "ratzel", name: "Friedrich Ratzel", attributes: { nacionalidade: "Alemanha", seculo: 19, area: "Geografia Política", contribuicao: ["Espaço Vital", "Antropogeografia"] } },
    { id: "vidal", name: "Paul Vidal de La Blache", attributes: { nacionalidade: "França", seculo: 19, area: "Geografia Humana", contribuicao: ["Possibilismo", "Região"] } },
    { id: "santos", name: "Milton Santos", attributes: { nacionalidade: "Brasil", seculo: 20, area: "Geografia Crítica", contribuicao: ["Espaço Geográfico", "Globalização"] } },
    { id: "wegener", name: "Alfred Wegener", attributes: { nacionalidade: "Alemanha", seculo: 20, area: "Geologia", contribuicao: ["Deriva Continental", "Pangeia"] } },
    { id: "freyre", name: "Gilberto Freyre", attributes: { nacionalidade: "Brasil", seculo: 20, area: "Geografia Cultural", contribuicao: ["Casa-Grande & Senzala", "Raízes do Brasil"] } },
    { id: "christaller", name: "Walter Christaller", attributes: { nacionalidade: "Alemanha", seculo: 20, area: "Geografia Econômica", contribuicao: ["Teoria dos Lugares Centrais", "Hierarquia Urbana"] } },
    { id: "hartshorne", name: "Richard Hartshorne", attributes: { nacionalidade: "Estados Unidos", seculo: 20, area: "Metodologia", contribuicao: ["Natureza da Geografia", "Regionalismo"] } },
    { id: "monteiro", name: "Chorley Monteiro", attributes: { nacionalidade: "Brasil", seculo: 20, area: "Geomorfologia", contribuicao: ["Dinâmica Fluvial", "Geomorfologia Brasileira"] } },
    { id: "beckmann", name: "Martin Beckmann", attributes: { nacionalidade: "Alemanha", seculo: 20, area: "Econômica", contribuicao: ["Teoria da Localização", "Análise Espacial"] } },
  ],

  portugues: [
    { id: "machado", name: "Machado de Assis", attributes: { nacionalidade: "Brasil", seculo: 19, area: "Realismo", contribuicao: ["Dom Casmurro", "Memórias Póstumas"] } },
    { id: "pessoa", name: "Fernando Pessoa", attributes: { nacionalidade: "Portugal", seculo: 20, area: "Modernismo", contribuicao: ["Heterônimos", "Mensagem"] } },
    { id: "clarice", name: "Clarice Lispector", attributes: { nacionalidade: "Brasil", seculo: 20, area: "Modernismo", contribuicao: ["A Hora da Estrela", "Perto do Coração Selvagem"] } },
    { id: "drummond", name: "Carlos Drummond de Andrade", attributes: { nacionalidade: "Brasil", seculo: 20, area: "Modernismo", contribuicao: ["Alguma Poesia", "Sentimento do Mundo"] } },
    { id: "camoes", name: "Luís de Camões", attributes: { nacionalidade: "Portugal", seculo: 16, area: "Classicismo", contribuicao: ["Os Lusíadas", "Sonetos"] } },
    { id: "bandeira", name: "Manuel Bandeira", attributes: { nacionalidade: "Brasil", seculo: 20, area: "Modernismo", contribuicao: ["Libertinagem", "Poesia"] } },
    { id: "guimaraes", name: "João Guimarães Rosa", attributes: { nacionalidade: "Brasil", seculo: 20, area: "Modernismo", contribuicao: ["Grande Sertão: Veredas", "Linguagem Regional"] } },
    { id: "gregorio", name: "Gregório de Matos", attributes: { nacionalidade: "Brasil", seculo: 17, area: "Barroco", contribuicao: ["Boca do Inferno", "Lírico Barroco"] } },
    { id: "bilac", name: "Olavo Bilac", attributes: { nacionalidade: "Brasil", seculo: 19, area: "Parnasianismo", contribuicao: ["Via Láctea", "Hino à Bandeira"] } },
    { id: "cruz_e_sousa", name: "Cruz e Sousa", attributes: { nacionalidade: "Brasil", seculo: 19, area: "Simbolismo", contribuicao: ["Broquéis", "Poética Simbólica"] } },
  ],

  literatura: [
    { id: "shakespeare", name: "William Shakespeare", attributes: { nacionalidade: "Inglaterra", seculo: 16, area: "Teatro", contribuicao: ["Hamlet", "Romeu e Julieta"] } },
    { id: "dostoievski", name: "Fiódor Dostoiévski", attributes: { nacionalidade: "Rússia", seculo: 19, area: "Romance", contribuicao: ["Crime e Castigo", "Os Irmãos Karamazov"] } },
    { id: "kafka", name: "Franz Kafka", attributes: { nacionalidade: "Áustria", seculo: 20, area: "Modernismo", contribuicao: ["A Metamorfose", "O Processo"] } },
    { id: "borges", name: "Jorge Luis Borges", attributes: { nacionalidade: "Argentina", seculo: 20, area: "Fantástico", contribuicao: ["Ficções", "O Aleph"] } },
    { id: "marquez", name: "Gabriel García Márquez", attributes: { nacionalidade: "Colômbia", seculo: 20, area: "Realismo Mágico", contribuicao: ["Cem Anos de Solidão", "O Amor nos Tempos do Cólera"] } },
    { id: "joyce", name: "James Joyce", attributes: { nacionalidade: "Irlanda", seculo: 20, area: "Modernismo", contribuicao: ["Ulisses", "Fluxo de Consciência"] } },
    { id: "proust", name: "Marcel Proust", attributes: { nacionalidade: "França", seculo: 20, area: "Romance Psicológico", contribuicao: ["Em Busca do Tempo Perdido", "Memória Involuntária"] } },
    { id: "virginia", name: "Virginia Woolf", attributes: { nacionalidade: "Inglaterra", seculo: 20, area: "Modernismo", contribuicao: ["Mrs. Dalloway", "Fluxo de Consciência"] } },
    { id: "hemingway", name: "Ernest Hemingway", attributes: { nacionalidade: "Estados Unidos", seculo: 20, area: "Realismo", contribuicao: ["O Velho e o Mar", "Gelo Submerso"] } },
    { id: "graciliano", name: "Graciliano Ramos", attributes: { nacionalidade: "Brasil", seculo: 20, area: "Modernismo", contribuicao: ["Vidas Secas", "São Bernardo"] } },
  ],

  filosofia: [
    { id: "socrates", name: "Sócrates", attributes: { nacionalidade: "Grécia", seculo: -5, area: "Ética", contribuicao: ["Maiêutica", "Ironia Socrática"] } },
    { id: "platao", name: "Platão", attributes: { nacionalidade: "Grécia", seculo: -4, area: "Metafísica", contribuicao: ["Mito da Caverna", "Teoria das Ideias"] } },
    { id: "aristoteles", name: "Aristóteles", attributes: { nacionalidade: "Grécia", seculo: -4, area: "Lógica", contribuicao: ["Lógica Formal", "O Organon"] } },
    { id: "kant", name: "Immanuel Kant", attributes: { nacionalidade: "Alemanha", seculo: 18, area: "Epistemologia", contribuicao: ["Imperativo Categórico", "Crítica da Razão Pura"] } },
    { id: "nietzsche", name: "Friedrich Nietzsche", attributes: { nacionalidade: "Alemanha", seculo: 19, area: "Existencialismo", contribuicao: ["Niilismo", "Assim Falou Zaratustra"] } },
    { id: "descartes", name: "René Descartes", attributes: { nacionalidade: "França", seculo: 17, area: "Racionalismo", contribuicao: ["Cogito Ergo Sum", "Dúvida Metódica"] } },
    { id: "locke", name: "John Locke", attributes: { nacionalidade: "Inglaterra", seculo: 17, area: "Empirismo", contribuicao: ["Tabula Rasa", "Direitos Naturais"] } },
    { id: "rousseau", name: "Jean-Jacques Rousseau", attributes: { nacionalidade: "Suíça", seculo: 18, area: "Contrato Social", contribuicao: ["Contrato Social", "Nobre Selvagem"] } },
    { id: "hegel", name: "Georg Hegel", attributes: { nacionalidade: "Alemanha", seculo: 19, area: "Idealismo", contribuicao: ["Dialética", "Fenomenologia do Espírito"] } },
    { id: "sartre", name: "Jean-Paul Sartre", attributes: { nacionalidade: "França", seculo: 20, area: "Existencialismo", contribuicao: ["Má-Fé", "O Ser e o Nada"] } },
  ],

  sociologia: [
    { id: "durkheim", name: "Émile Durkheim", attributes: { nacionalidade: "França", seculo: 19, area: "Funcionalismo", contribuicao: ["Fato Social", "O Suicídio"] } },
    { id: "marx", name: "Karl Marx", attributes: { nacionalidade: "Alemanha", seculo: 19, area: "Marxismo", contribuicao: ["Luta de Classes", "O Capital"] } },
    { id: "weber", name: "Max Weber", attributes: { nacionalidade: "Alemanha", seculo: 19, area: "Compreensiva", contribuicao: ["Ação Social", "A Ética Protestante"] } },
    { id: "comte", name: "Auguste Comte", attributes: { nacionalidade: "França", seculo: 19, area: "Positivismo", contribuicao: ["Lei dos Três Estados", "Ordem e Progresso"] } },
    { id: "bourdieu", name: "Pierre Bourdieu", attributes: { nacionalidade: "França", seculo: 20, area: "Estruturalismo", contribuicao: ["Habitus", "Capital Cultural"] } },
    { id: "spencer", name: "Herbert Spencer", attributes: { nacionalidade: "Inglaterra", seculo: 19, area: "Evolutionismo", contribuicao: ["Sobrevivência dos Mais Aptos", "Sociologia Orgânica"] } },
    { id: "simmel", name: "Georg Simmel", attributes: { nacionalidade: "Alemanha", seculo: 19, area: "Formalismo", contribuicao: ["Metropolis e Saúde Mental", "Forma e Conteúdo"] } },
    { id: "parsons", name: "Talcott Parsons", attributes: { nacionalidade: "Estados Unidos", seculo: 20, area: "Funcionalismo", contribuicao: ["AGIL", "Sistema Social"] } },
    { id: "giddens", name: "Anthony Giddens", attributes: { nacionalidade: "Inglaterra", seculo: 20, area: "Estruturalização", contribuicao: ["Modernidade Reflexiva", "Terceira Via"] } },
    { id: "habermas", name: "Jürgen Habermas", attributes: { nacionalidade: "Alemanha", seculo: 20, area: "Teoria Comunicativa", contribuicao: ["Ação Comunicativa", "Esfera Pública"] } },
  ],
};