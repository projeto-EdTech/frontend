export type Metrica = {
  topico: string;
  percentual: number;
};

export type DataStats = {
  geral: Record<string, Metrica[]>;
  vestibulares: Record<string, Record<string, Metrica[]>>;
};

export const dataStats: DataStats = {
  geral: {
    matematica: [
      { topico: "Geometria Plana", percentual: 11 },
      { topico: "Geometria Espacial", percentual: 11 },
      { topico: "Funções", percentual: 11 },
      { topico: "Trigonometria", percentual: 11 },
      { topico: "Grandezas Proporcionais", percentual: 8 },
      { topico: "Geometria Analítica", percentual: 6 },
      { topico: "Probabilidades", percentual: 5 },
      { topico: "Logaritmos", percentual: 4 },
      { topico: "Análise Combinatória", percentual: 3 },
      { topico: "Aritmética", percentual: 3 },
      { topico: "Demais Assuntos (< que 2%) cada", percentual: 27 },
    ],
    fisica: [
      { topico: "Mecânica", percentual: 40 },
      { topico: "Óptica", percentual: 20 },
      { topico: "Termodinâmica", percentual: 15 },
      { topico: "Eletromagnetismo", percentual: 25 },
    ],
    quimica: [
      { topico: "Orgânica", percentual: 30 },
      { topico: "Inorgânica", percentual: 30 },
      { topico: "Fisico-química", percentual: 20 },
      { topico: "Bioquímica", percentual: 20 },
    ],
    biologia: [
      { topico: "Citologia", percentual: 25 },
      { topico: "Genética", percentual: 30 },
      { topico: "Ecologia", percentual: 20 },
      { topico: "Evolução", percentual: 25 },
    ],
    historia: [
      { topico: "Brasil Colonial", percentual: 30 },
      { topico: "Brasil República", percentual: 35 },
      { topico: "História Geral", percentual: 35 },
    ],
    geografia: [
      { topico: "Geografia Física", percentual: 40 },
      { topico: "Geografia Humana", percentual: 35 },
      { topico: "Cartografia", percentual: 25 },
    ],
    filosofia: [
      { topico: "Filosofia Antiga", percentual: 25 },
      { topico: "Filosofia Moderna", percentual: 30 },
      { topico: "Filosofia Contemporânea", percentual: 25 },
      { topico: "Ética", percentual: 20 },
    ],
    sociologia: [
      { topico: "Sociologia Clássica", percentual: 30 },
      { topico: "Sociologia Contemporânea", percentual: 25 },
      { topico: "Movimentos Sociais", percentual: 25 },
      { topico: "Cultura", percentual: 20 },
    ],
    ingles: [
      { topico: "Reading Comprehension", percentual: 40 },
      { topico: "Grammar", percentual: 30 },
      { topico: "Vocabulary", percentual: 30 },
    ],
  },

  // Estatísticas específicas por vestibular
  vestibulares: {
    fuvest: {
      matematica: [
        { topico: "Álgebra", percentual: 80 },
        { topico: "Geometria", percentual: 30 },
        { topico: "Trigonometria", percentual: 25 },
        { topico: "Probabilidade", percentual: 15 },
        { topico: "Estatística", percentual: 12 },
      ],
      fisica: [
        { topico: "Mecânica", percentual: 45 },
        { topico: "Óptica", percentual: 25 },
        { topico: "Termodinâmica", percentual: 20 },
        { topico: "Eletromagnetismo", percentual: 30 },
      ],
      quimica: [
        { topico: "Orgânica", percentual: 35 },
        { topico: "Inorgânica", percentual: 28 },
        { topico: "Fisico-química", percentual: 25 },
        { topico: "Bioquímica", percentual: 22 },
      ],
    },
    
    unicamp: {
      matematica: [
        { topico: "Álgebra", percentual: 70 },
        { topico: "Geometria", percentual: 35 },
        { topico: "Trigonometria", percentual: 30 },
        { topico: "Probabilidade", percentual: 20 },
        { topico: "Estatística", percentual: 15 },
      ],
      fisica: [
        { topico: "Mecânica", percentual: 50 },
        { topico: "Óptica", percentual: 18 },
        { topico: "Termodinâmica", percentual: 22 },
        { topico: "Eletromagnetismo", percentual: 35 },
      ],
      quimica: [
        { topico: "Orgânica", percentual: 40 },
        { topico: "Inorgânica", percentual: 25 },
        { topico: "Fisico-química", percentual: 25 },
        { topico: "Bioquímica", percentual: 18 },
      ],
    },

    unesp: {
      matematica: [
        { topico: "Álgebra", percentual: 65 },
        { topico: "Geometria", percentual: 28 },
        { topico: "Trigonometria", percentual: 22 },
        { topico: "Probabilidade", percentual: 12 },
        { topico: "Estatística", percentual: 8 },
      ],
      fisica: [
        { topico: "Mecânica", percentual: 38 },
        { topico: "Óptica", percentual: 22 },
        { topico: "Termodinâmica", percentual: 18 },
        { topico: "Eletromagnetismo", percentual: 28 },
      ],
      quimica: [
        { topico: "Orgânica", percentual: 32 },
        { topico: "Inorgânica", percentual: 32 },
        { topico: "Fisico-química", percentual: 18 },
        { topico: "Bioquímica", percentual: 15 },
      ],
    },

    enem: {
      matematica: [
        { topico: "Álgebra", percentual: 45 },
        { topico: "Geometria", percentual: 35 },
        { topico: "Trigonometria", percentual: 15 },
        { topico: "Probabilidade", percentual: 25 },
        { topico: "Estatística", percentual: 30 },
      ],
      fisica: [
        { topico: "Mecânica", percentual: 35 },
        { topico: "Óptica", percentual: 15 },
        { topico: "Termodinâmica", percentual: 20 },
        { topico: "Eletromagnetismo", percentual: 30 },
      ],
      quimica: [
        { topico: "Orgânica", percentual: 25 },
        { topico: "Inorgânica", percentual: 25 },
        { topico: "Fisico-química", percentual: 25 },
        { topico: "Bioquímica", percentual: 25 },
      ],
    },

    ita: {
      matematica: [
        { topico: "Álgebra", percentual: 85 },
        { topico: "Geometria", percentual: 40 },
        { topico: "Trigonometria", percentual: 35 },
        { topico: "Probabilidade", percentual: 20 },
        { topico: "Estatística", percentual: 15 },
      ],
      fisica: [
        { topico: "Mecânica", percentual: 60 },
        { topico: "Óptica", percentual: 30 },
        { topico: "Termodinâmica", percentual: 35 },
        { topico: "Eletromagnetismo", percentual: 45 },
      ],
    },

    ime: {
      matematica: [
        { topico: "Álgebra", percentual: 90 },
        { topico: "Geometria", percentual: 45 },
        { topico: "Trigonometria", percentual: 40 },
        { topico: "Probabilidade", percentual: 25 },
        { topico: "Estatística", percentual: 20 },
      ],
      fisica: [
        { topico: "Mecânica", percentual: 55 },
        { topico: "Óptica", percentual: 25 },
        { topico: "Termodinâmica", percentual: 30 },
        { topico: "Eletromagnetismo", percentual: 40 },
      ],
    },
    
    // Adicione mais vestibulares conforme necessário...
  },
};

// Função utilitária para buscar dados
export function getStatsData(subject: string, vestibular?: string): Metrica[] {
  // Se vestibular específico for fornecido e existir
  if (vestibular && vestibular !== "geral" && dataStats.vestibulares[vestibular]?.[subject]) {
    return dataStats.vestibulares[vestibular][subject];
  }
  
  // Fallback para estatísticas gerais
  return dataStats.geral[subject] || [];
}