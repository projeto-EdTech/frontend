import { NextResponse } from 'next/server';
import { getBadgesConfig } from '@/app/service/badge.service';

/**
 * CACHE STRATEGY: ISR - revalidate 3600s
 * Motivo: Fornece as configurações de conquistas (badges) de forma dinâmica
 * para que o frontend não dependa de arquivos JSON locais estáticos.
 */
export async function GET() {
  try {
    const config = await getBadgesConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('[API Badges] Erro ao buscar configuração:', error);
    return NextResponse.json(
      { error: 'Falha ao carregar configuração das conquistas' },
      { status: 500 }
    );
  }
}
