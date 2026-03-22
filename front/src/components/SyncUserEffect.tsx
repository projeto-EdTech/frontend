"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { decodeJWT } from "@/app/service/jwtDecoder";

export default function SyncUserEffect() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const syncingRef = useRef(false);

  useEffect(() => {
    // 1. Limpeza ao deslogar
    if (status === "unauthenticated") {
      const keysToClear = [
        "user_data",
        "flashcard_count",
        "flashcard_last_date",
        "flashcard_daily_stats"
      ];
      
      let cleared = false;
      keysToClear.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          cleared = true;
        }
      });

      if (cleared) {
        console.log("[SyncUserEffect] 🧹 Dados do usuário limpos ao deslogar");
      }
      return;
    }

    // 2. Sincronização ao logar
    if (status === "authenticated") {
        const email = session?.user?.email || "";
        // Verifica se já temos o JWT deste usuário no localStorage
        const storedToken = localStorage.getItem("user_data");
        let alreadySynced = false;

        if (storedToken) {
            const decoded = decodeJWT(storedToken);
            // Verifica se o token pertence ao mesmo usuário, tem ID e usa o campo 'tipo' correto
            // Se o token ainda usa o campo legado 'type' (sem 'tipo'), força re-sincronização
            const hasTipo = decoded && typeof decoded.tipo !== "undefined";
            if (decoded && decoded.email === email && decoded.id && hasTipo) {
                alreadySynced = true;
            }
        }
        
        // Se já sincronizou e tem ID e campo 'tipo' correto no token, não precisa chamar novamente
        if (alreadySynced) return;
        
        if (syncingRef.current) return;
        syncingRef.current = true;

        (async () => {
        try {
            const res = await fetch("/api/sync-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                const data = await res.json();
                // O backend retorna uma string JWT ou { token: "..." }
                const token = typeof data === 'string' ? data : data.token;
                
                if (token) {
                    localStorage.setItem("user_data", token);
                    console.log("[SyncUserEffect] JWT do usuário salvo no localStorage");
                } else {
                    console.warn("[SyncUserEffect] Token não encontrado na resposta");
                }
            } else {
                console.warn("[SyncUserEffect] Erro na resposta da API:", res.status);
            }
        } catch (e) {
            console.error("Falha ao sincronizar usuário (effect)", e);
        } finally {
            syncingRef.current = false;
        }
        })();
    }
  }, [status, session]);

  return null;
}
