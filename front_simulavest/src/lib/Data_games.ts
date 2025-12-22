export interface MinigameData {
  id: number;
  title: string;
  slug: string; // URL-friendly name
  description: string;
  iconName: 'zap' | 'spellcheck' | 'Grid3x3';
  difficulty: string;
  color: string;
  bgGlow: string;
  borderColor: string;
  status: 'available' | 'premium' | 'coming-soon';
  featured: boolean;
}

export const minigamesData: MinigameData[] = [
  {
    id: 1,
    title: "Flash Cards",
    slug: "flash-cards",
    description: "Responda perguntas rápidas através de cartões interativos",
    iconName: "zap",
    difficulty: "Fácil",
    color: "from-yellow-400 to-orange-500",
    bgGlow: "bg-yellow-400/20",
    borderColor: "border-yellow-400",
    status: "available",
    // Destaque adicionado
    featured: true,
  },
  {
    id: 2,
    title: "Lexoo",
    slug: "lexoo",
    description: "Um jogo diário de palavras para expandirem seu vocabulário de forma divertida.",
    iconName: "spellcheck",
    difficulty: "Médio",
    color: "from-blue-500 to-indigo-600",
    bgGlow: "bg-indigo-500/20",
    borderColor: "border-indigo-500",
    status: "available",
    featured: true,
  },
  {
    id: 3,
    title: "Nexo",
    slug: "nexo",
    description: "Encontre as conexões entre 16 palavras e organize-as em 4 grupos temáticos.",
    iconName: "Grid3x3",
    difficulty: "Médio",
    color: "from-purple-500 to-pink-600",
    bgGlow: "bg-purple-500/20",
    borderColor: "border-purple-500",
    status: "available",
    featured: false,
  }
  // Outros jogos podem ser adicionados aqui
];