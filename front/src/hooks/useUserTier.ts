"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { normalizeTier, isPaidTier, type Tier } from "@/app/service/jwtDecoder";
import { fetchUserClaims, USER_SYNCED_EVENT } from "@/lib/userClaims";

export type { Tier };

/**
 * Tier do aluno logado.
 *
 * O tier mora no claim `tipo` do JWT — e o JWT vive só no cookie `user_data` HttpOnly, que o
 * JavaScript não consegue ler. Quem decodifica é `GET /api/user/me`, no servidor, que já devolve
 * a grafia normalizada.
 *
 * Não há polling: a rota é consultada na montagem e nos dois eventos que significam "a sessão
 * mudou" — `user_synced` (mesma aba: login, ativação de assinatura) e `storage` (outras abas).
 * Um `setInterval` aqui viraria uma requisição a cada ciclo, por aba aberta.
 *
 * CACHE STRATEGY: no-store — dado de sessão
 */
export function useUserTier() {
  const { data: session, status } = useSession();
  const [tier, setTier] = useState<Tier>("FREE");
  const [loading, setLoading] = useState(true);

  // Fallback quando a rota não responde: a sessão NextAuth pode trazer o tier.
  const tierDaSessao = normalizeTier(session?.user?.tier);

  const checkTier = useCallback(
    async (signal?: AbortSignal) => {
      const claims = await fetchUserClaims(signal);

      if (signal?.aborted) return;

      setTier(claims ? normalizeTier(claims.tier) : tierDaSessao);
      setLoading(false);
    },
    [tierDaSessao]
  );

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated") {
      setTier("FREE");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    checkTier(controller.signal);

    // `storage` só dispara em OUTRAS abas. Na mesma aba — caso da ativação de assinatura em
    // /paidPlan — quem avisa é o CustomEvent.
    const aoMudarStorage = (e: StorageEvent) => {
      if (e.key === "user_data") checkTier();
    };
    const aoSincronizar = () => checkTier();

    window.addEventListener("storage", aoMudarStorage);
    window.addEventListener(USER_SYNCED_EVENT, aoSincronizar);

    return () => {
      controller.abort();
      window.removeEventListener("storage", aoMudarStorage);
      window.removeEventListener(USER_SYNCED_EVENT, aoSincronizar);
    };
  }, [status, checkTier]);

  const isPro = isPaidTier(tier);

  return { tier, isPro, loading };
}
