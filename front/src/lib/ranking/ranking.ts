// DataRanking.ts

import { universities } from '../data/universities';

// O tipo de dado que simula a resposta crua do banco de dados para um usuário no ranking.
export type RawUserData = {
  id: number;
  usuario: string;
  pontos: number;
};

// A estrutura para armazenar os rankings de um período específico para uma universidade.
type RankingPeriod = {
  semanal: RawUserData[];
  mensal: RawUserData[];
  anual: RawUserData[];
};

// O tipo final que mapeia o 'slug' de uma universidade aos seus rankings.
export type RankingsByUniversity = {
  [universitySlug: string]: RankingPeriod;
};

/**
 * Função auxiliar para gerar um conjunto de dados de ranking.
 * @param scoreMultiplier - Um fator para diferenciar as pontuações entre os períodos.
 */
const generateRankingSet = (scoreMultiplier: number): RawUserData[] => {

  const currentUserForTest: RawUserData = {
    id: 0,
    usuario: "Felipe Grolla Freitas",
    pontos: 50000,
  };

  // 2. Gere 99 usuários aleatórios para completar a lista.
  const users = Array.from({ length: 99 }, (_, i) => {
    const firstNames = ["Ana", "Bruno", "Carlos", "Daniela", "Eduardo", "Fernanda", "Gabriel", "Helena", "Igor", "Juliana", "Lucas", "Mariana"];
    const lastNames = ["Silva", "Costa", "Dias", "Souza", "Lima", "Alves", "Pereira", "Santos", "Ferreira", "Oliveira", "Ribeiro", "Gomes"];
    
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return {
      id: i + 1, // IDs de 1 a 99 para não colidir com o ID 0 do usuário de teste.
      usuario: `${randomFirstName} ${randomLastName}`,
      pontos: Math.floor(Math.random() * 2000 * scoreMultiplier) + (1000 * scoreMultiplier),
    };
  });
  
  // 3. Adicione (injete) seu usuário de teste na lista.
  users.push(currentUserForTest);

  // 4. Ordene a lista completa (agora com 100 usuários) pela pontuação.
  return users.sort((a, b) => b.pontos - a.pontos);
};

/**
 * Gera a estrutura de dados completa com rankings para todas as universidades.
 */
const generateAllRankings = (): RankingsByUniversity => {
  const allRankings: RankingsByUniversity = {};

  // Itera sobre cada universidade da lista importada do dataUniversity.ts
  for (const university of universities) {
    // Usa o 'slug' da universidade como a chave, que já é o identificador ideal.
    const universitySlug = university.slug;

    // Gera os dados para cada período e atribui ao slug da universidade.
    allRankings[universitySlug] = {
      semanal: generateRankingSet(1.5),
      mensal: generateRankingSet(4),
      anual: generateRankingSet(10),
    };
  }

  // Adiciona manualmente a entrada para o Ranking Geral / Nacional
  allRankings['geral'] = {
    semanal: generateRankingSet(2.5),
    mensal: generateRankingSet(6),
    anual: generateRankingSet(15),
  };

  return allRankings;
};

// Exporte a estrutura de dados completa e gerada dinamicamente.
export const mockRankingsByUniversity: RankingsByUniversity = generateAllRankings();