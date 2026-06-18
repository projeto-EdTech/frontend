"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { decodeJWT } from "@/app/service/jwtDecoder";

export type Tier = "FREE" | "Simula PRO" | "TEACHER" | "ADMIN";

export function useUserTier() {
  const { data: session, status } = useSession();
  const [tier, setTier] = useState<Tier>("FREE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTier = () => {
      // Mock user always gets Simula PRO tier without any backend token
      if (session?.user?.email === 'fegrolla0210@gmail.com' || session?.user?.email === 'fegrolla0210@gmail.com') {
        setTier('Simula PRO');
        setLoading(false);
        return;
      }

      // 1. Tente ler do localStorage (prioridade para simulação/dados sincronizados)
      const storedToken = localStorage.getItem("user_data");
      if (storedToken) {
        const decoded = decodeJWT(storedToken);
        if (decoded && decoded.tipo) {
          setTier(decoded.tipo as Tier);
          setLoading(false);
          return;
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

  const isPro = tier === "Simula PRO" || tier === "TEACHER" || tier === "ADMIN";
  const isFree = tier === "FREE";

  return { tier, isPro, isFree, loading };
}
