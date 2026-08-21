export interface Beneficio {
  texto: string;
  iconeName: 'Rocket' | 'Library' | 'Activity' | 'GraduationCap' | 'Headset' | 'Cpu' | 'Lightbulb' | 'BarChart3';
  color: string;
}

export interface Plano {
  id: string;
  nome: string;
  descricao: string;
  precoMensal: number;
  precoTotal: number;
  desconto?: string;
  popular: boolean;
  beneficios: Beneficio[];
}

const beneficiosPadrao: Beneficio[] =
  [
    { texto: "Acesso ilimitado a simulados", iconeName: 'Rocket', color: '#5856D6' },
    { texto: "Biblioteca de provas", iconeName: 'Library', color: '#007AFF' },
    { texto: "Estatística em tempo real", iconeName: 'Activity', color: '#34C759' },
    { texto: "Consulta de notas de corte", iconeName: 'GraduationCap', color: '#FF3B30' },
    { texto: "Suporte prioritário 24/7", iconeName: 'Headset', color: '#FF9500' },
    { texto: "Resolução com IA (PRO)", iconeName: 'Cpu', color: '#FF2D55' },
    { texto: "Plano de estudos otimizado", iconeName: 'Lightbulb', color: '#FFCC00' },
    { texto: "Estatísticas avançadas", iconeName: 'BarChart3', color: '#5E5CE6' },
  ];

export async function getPlanos(): Promise<Plano[]> {
  // Simulate network delay to the BFF Java
  await new Promise(resolve => setTimeout(resolve, 600));

  return [
    {
      id: "anual",
      nome: "Simula Pro Anual",
      descricao: "O melhor custo-benefício",
      precoMensal: 41.5,
      precoTotal: 497,
      desconto: "Estude o ano todo e ganhe 2 meses grátis!",
      popular: true,
      beneficios: beneficiosPadrao
    },
    {
      id: "mensal",
      nome: "Simula Pro Mensal",
      descricao: "Flexibilidade total",
      precoMensal: 50,
      precoTotal: 50,
      popular: false,
      beneficios: beneficiosPadrao
    }
  ];
}
