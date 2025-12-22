import { flashCardsData } from '@/components/games/flash-card_game/lib/flash-cardData';
import { NextResponse } from 'next/server';
import { getGameData } from '@/lib/Games/Games';

/**
 * GET /api/games/Flash-cards
 * Retorna a lista de questões disponíveis para o jogo de Flash Cards
 */
export async function GET() {
  try {
    // Busca os dados do jogo utilizando a função do módulo Games.ts
    const gameData = getGameData('flash-cards');
    
    // Valida se os dados foram encontrados
    if (!gameData || !gameData.cards) {
      return NextResponse.json(
        { 
          error: 'Dados não encontrados',
          message: 'Não foi possível carregar as questões do Flash Cards'
        },
        { status: 404 }
      );
    }

    // Filtra apenas os cards disponíveis (available: true)
    const availableCards = gameData.cards.filter(card => card.available);

    return NextResponse.json(
      {
        success: true,
        data: {
          cards: availableCards,
          total: availableCards.length,
          subjects: [...new Set(availableCards.map(card => card.subject))],
          difficulties: ['easy', 'medium', 'hard']
        },
        timestamp: new Date().toISOString()
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );
  } catch (error) {
    // Log do erro no servidor
    console.error('Erro ao buscar dados do Flash Cards:', error);
    
    // Retorna resposta de erro ao cliente
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao processar sua solicitação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/games/Flash-cards
 * Permite filtrar questões por matéria e/ou dificuldade
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Se vier subject/difficulty, filtra normalmente
    if (body.subject || body.difficulty) {
      const { subject, difficulty } = body;
      const gameData = getGameData('flash-cards');
      if (!gameData || !gameData.cards) {
        return NextResponse.json(
          { error: 'Dados não encontrados', message: 'Não foi possível carregar as questões do Flash Cards' },
          { status: 404 }
        );
      }
      let filteredCards = gameData.cards;
      if (subject && subject !== 'Todas') {
        filteredCards = filteredCards.filter(card => card.subject === subject);
      }
      if (difficulty) {
        filteredCards = filteredCards.filter(card => card.difficulty === difficulty);
      }
      return NextResponse.json(
        {
          success: true,
          data: {
            cards: filteredCards,
            total: filteredCards.length,
            filters: { subject, difficulty }
          },
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      );
    }
    // Se vier correctIds, atualiza disponibilidade
    if (Array.isArray(body.correctIds)) {
      let updatedCount = 0;
      const updatedIds: number[] = [];
      for (const card of flashCardsData) {
        if (body.correctIds.includes(card.id) && card.available) {
          card.available = false;
          updatedCount++;
          updatedIds.push(card.id);
        }
      }

      // Log informativo no CLI sobre atualizações
      console.log('[Flash-cards][POST] Atualização de disponibilidade:', {
        recebidos: body.correctIds,
        atualizadosParaFalse: updatedIds,
        quantidadeAtualizada: updatedCount,
      });
      return NextResponse.json(
        {
          success: true,
          message: `${updatedCount} cards atualizados para available: false.`,
          updatedIds,
        },
        { status: 200 }
      );
    }
    // Se não vier nada válido
    return NextResponse.json(
      { error: 'Formato inválido', message: 'Envie subject/difficulty para filtro ou correctIds para atualização.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro ao processar POST dos Flash Cards:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', message: 'Ocorreu um erro ao processar sua solicitação', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
