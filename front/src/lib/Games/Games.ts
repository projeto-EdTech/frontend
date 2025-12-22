import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { flashCardsData } from '../../components/games/flash-card_game/lib/flash-cardData';

// --- Configuração dos Jogos ---

// Importação dinâmica dos componentes de UI dos jogos
const FlashCardGame = dynamic(
  () => import('../../components/games/flash-card_game/Flash-card')
);
const LexooGame = dynamic(
  () => import('../../components/games/Lexoo/Lexoo')
);

const NexoGame = dynamic(
  () => import('../../components/games/Nexo/Nexo')
);

// --- Tipagens ---
export interface GameComponentProps {
  onComplete?: (score: { correct: number; total: number }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// --- Mapeamento (Slug -> Componente) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const gameComponents: Record<string, ComponentType<any>> = {
  'flash-cards': FlashCardGame,
  'lexoo': LexooGame,
  'nexo': NexoGame,
};

// Função auxiliar para obter o componente pelo slug
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getGameComponent = (slug: string): ComponentType<any> | null => {
  return gameComponents[slug] || null;
};

// --- Dados Estáticos (Banco de Questões) ---


// --- Helpers de Dados ---

export const getGameData = (slug: string) => {
  switch (slug) {
    case 'flash-cards':
      return { cards: flashCardsData };
    case 'lexoo':
      // Lexoo não precisa de dados estáticos, retorna vazio
      return {};
    default:
      return {};
  }
};