"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export type Tier = "FREE" | "SIMULAPRO" | "TEACHER" | "ADMIN";

export function useUserTier() {
  const { data: session, status } = useSession();
  const [tier, setTier] = useState<Tier>("FREE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTier = () => {
      // 1. Tente ler do localStorage (prioridade para simulação/dados sincronizados)
      const storedData = localStorage.getItem("user_data");
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          if (parsed.tier) {
            setTier(parsed.tier as Tier);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Erro ao ler tier do localStorage", e);
        }
      }

      // 2. Fallback para a sessão (se disponível)
      if (session?.user?.tier) {
        setTier(session.user.tier as Tier);
      } else {
        setTier("FREE");
      }
      setLoading(false);
    };

    if (status !== "loading") {
      checkTier();
    }

    // Listener para mudanças no storage (mesma aba ou outras abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_data") {
        checkTier();
      }
    };
    
    // Custom event dispatchado pelo SyncUserEffect (se implementarmos isso) ou apenas polling
    // Por enquanto, vamos fazer um polling suave ou depender do mount
    const interval = setInterval(checkTier, 2000); // Verifica a cada 2s para garantir sincronia rápida após login

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [session, status]);

  const isPro = tier === "SIMULAPRO" || tier === "TEACHER" || tier === "ADMIN";

  return { tier, isPro, loading };
}
