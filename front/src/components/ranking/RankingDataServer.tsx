import { getUniversities, getRankingData } from "@/app/service/ranking.service";
import RankingClient from "./RankingClient";

/**
 * RankingDataServer - Server Component
 * 
 * Fetches initial data for the ranking page on the server.
 * This prevents TTFB blocking and allows streaming via Suspense.
 */
export async function RankingDataServer() {
  // Parallel fetch to avoid waterfalls
  const [universities, rankingData] = await Promise.all([
    getUniversities(),
    getRankingData('geral', 'mensal')
  ]);

  return (
    <RankingClient 
      initialUniversities={universities} 
      initialRankingData={rankingData} 
    />
  );
}
