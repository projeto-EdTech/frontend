import { minigamesData, type MinigameData } from "@/lib/Data_games";

/**
 * CACHE STRATEGY: ISR - revalidate 3600s
 * Motivo: A lista de jogos não muda com frequência.
 */
export async function getMinigames(): Promise<MinigameData[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return minigamesData;
}

export async function getMinigameBySlug(slug: string): Promise<MinigameData | undefined> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return minigamesData.find(game => game.slug === slug);
}
