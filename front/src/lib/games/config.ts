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

const EnigmaGame = dynamic(
  () => import('../../components/games/Enigma/enigma')
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
  'enigma': EnigmaGame,
};

// Função auxiliar para obter o componente pelo slug
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getGameComponent = (slug: string): ComponentType<any> | null => {
  return gameComponents[slug] || null;
};

// --- Helpers de Dados ---

export const getGameData = (slug: string) => {
  switch (slug) {
    case 'flash-cards':
      return { cards: flashCardsData };
    case 'lexoo':
      // Lexoo não precisa de dados estáticos, retorna vazio
      return {};
    case 'nexo':
      return {};
    case 'enigma':
      return {};
    default:
      return {};
  }
};