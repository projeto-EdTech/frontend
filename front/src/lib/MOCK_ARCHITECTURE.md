# Mock Data Architecture

## Overview

All routes that have equivalent static data in `src/lib/` use that data as their primary source.  
Real backend fetch blocks are preserved as comments — uncomment to restore when the Java BFF is ready.

---

## Static Data Files

| File | Domain | Exported By |
|---|---|---|
| `data/notaCorte.ts` | Cutoff scores (100+ courses/institutions) | `mockApiData`, `processCutoffResults`, `ApiResponse` |
| `data/stats.ts` | Subject distribution by vestibular | `dataStats`, `getStatsData(subject, vestibular?)` |
| `data/universities.ts` | University catalog (logos, slugs, exams) | `universities` |
| `data/ranking.ts` | Leaderboard by period | `getRankingData(university, period)` |
| `data/playlists.ts` | Community playlists + questions | `PLAYLISTS_MOCK`, `Playlist`, `Question` |
| `data/games.ts` | Minigame metadata | `minigamesData`, `MinigameData` |
| `data/profile.ts` | Profile stats for mock user | `mockProfileData`, `MockProfileData` |

---

## Route → Static Data Mapping

| Route | Method | Static Source | Status |
|---|---|---|---|
| `/api/Nota-corte` | GET | `mockApiData` from `data/notaCorte.ts` | **Static (backend commented out)** |
| `/api/Nota-corte` | POST | `processCutoffResults()` from `data/notaCorte.ts` | **Static (backend commented out)** |
| `/api/estatisticas/[subject]` | GET | `getStatsData()` from `data/stats.ts` | **Static (backend commented out)** |
| `/api/playlist` | GET | `PLAYLISTS_MOCK` from `data/playlists.ts` | **Static (always was)** |
| `/api/universities` | GET | `universities` from `data/universities.ts` | **Static fallback in `university.service.ts`** |
| `/api/ranking` | GET | `getRankingData()` from `data/ranking.ts` | **Static (always was via `ranking.service.ts`)** |
| `/api/games/flash-cards` | GET | No equivalent static data | Live backend required |
| `/api/simulations/*` | POST | No equivalent static data | Live backend required |
| `/api/ai/*` | POST | No equivalent static data | Live backend required |

---

## Mock User Bypass (`fegrolla0210@gmail.com`)

When the logged-in user's email matches `MOCK_EMAIL`, the app makes zero backend requests.  
All data comes from `src/lib/` statics. This is enforced at three layers:

### 1. Tier override — `src/hooks/useUserTier.ts`
```ts
if (session?.user?.email === 'fegrolla0210@gmail.com') {
  setTier('Simula PRO'); // PRO tier, no JWT required
  setLoading(false);
  return;
}
```

### 2. Profile data — `src/components/profile/ProfileClient.tsx`
```ts
const isMockUser = status === 'authenticated' && session?.user?.email === MOCK_EMAIL;

// SWR key null → no fetch fires
useSWR(isMockUser ? null : '/api/user/stats', fetcher, { ... });

// Mock useEffect loads static data instead
useEffect(() => {
  if (!isMockUser) return;
  setProfileData(mockProfileData as ProfileData);
  // ...
}, [isMockUser]);

// Ranking: uses getRankingData() (lib-only, no HTTP)
// Nota-corte debounce: bails early for mock user
if (isMockUser) return;
```

### 3. Ranking — `src/components/profile/ProfileClient.tsx`
```ts
if (isMockUser) {
  const data = await getRankingData('geral', 'mensal'); // lib-only
  const current = data.find(u => u.isCurrentUser) ?? null;
  setRankingData(current);
} else {
  // real fetch to /api/ranking
}
```

---

## Service Layer (all already static)

These service files in `src/app/service/` already use lib statics — no changes needed:

| Service | Static Source |
|---|---|
| `statistics.service.ts` | `getStatsData()` + `processCutoffResults()` |
| `university.service.ts` | `universities` from `data/universities.ts` (with env guard for production) |
| `playlist.service.ts` | `PLAYLISTS_MOCK` from `data/playlists.ts` |
| `game.service.ts` | `minigamesData` from `data/games.ts` |
| `ranking.service.ts` | `data/ranking.ts` generated data |

---

## How to Restore Live Backend for a Route

1. Open the route file.
2. Delete the static return at the top.
3. Uncomment the `/* REAL BACKEND */` block.
4. Remove the `isMockUser` guard in the calling client component if appropriate.

Routes that still hit the real backend (no static equivalent):
- `/api/games/flash-cards` — flash card question sets
- `/api/simulations/create` and `/api/simulations/create-mix` — question generation
- `/api/ai/chat`, `/api/ai/historico`, `/api/relatorio-IA` — AI endpoints
- `/api/planner/*` — Google Calendar integration
- `/api/subscribe`, `/api/process-subscription/*` — payment flow
- `/api/sync-user` — post-login JWT sync
