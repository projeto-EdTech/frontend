export type RankType = 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';

export const RANK_ORDER: RankType[] = ['Bronze', 'Prata', 'Ouro', 'Diamante'];

/**
 * Compara se houve subida de ranking (o ranking atual é superior ao anterior).
 * 
 * @param previousRank O ranking antigo do usuário
 * @param currentRank O novo ranking do usuário
 * @returns true se o usuário subiu de ranking, false caso contrário
 */
export function isRankUp(previousRank: RankType, currentRank: RankType): boolean {
  const prevIndex = RANK_ORDER.indexOf(previousRank);
  const newIndex = RANK_ORDER.indexOf(currentRank);
  
  if (prevIndex === -1 || newIndex === -1) {
    return false;
  }
  
  return newIndex > prevIndex;
}

/**
 * Determina se a rota atual permite a exibição do popup de ranking-up.
 * Ele deve ser ocultado na tela de simulação de prova (/simulation/[university]),
 * mas exibido em outras telas, incluindo a página de resumo (/simulation/[university]/summary).
 * 
 * @param pathname Rota atual recuperada via usePathname()
 * @returns true se o popup puder ser exibido, false caso contrário
 */
export function shouldShowRankUpPopup(pathname: string): boolean {
  // Ignora se estiver na tela de simulação (ex: /simulation/enem, /simulation/fuvest)
  // Mas não ignora se for a página de resumo (/simulation/enem/summary)
  if (pathname.startsWith('/simulation') && !pathname.endsWith('/summary')) {
    return false;
  }
  return true;
}
