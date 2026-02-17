"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function SyncUserEffect() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const syncingRef = useRef(false);

  useEffect(() => {
    if (status === "authenticated") {
        const email = session?.user?.email || "";
        // Verifica se já temos os dados deste usuário no localStorage
        const storedData = localStorage.getItem("user_data");
        let alreadySynced = false;

        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                if (parsed.email === email && parsed.id) {
                    alreadySynced = true;
                }
            } catch (e) {
                console.error("Erro ao ler user_data do localStorage", e);
            }
        }
        
        // Se já sincronizou e tem ID, não precisa chamar novamente, a menos que forçado
        if (alreadySynced) return;
        
        if (syncingRef.current) return;
        syncingRef.current = true;

        (async () => {
        try {
            // A rota /api/sync-user agora pega os dados do token automaticamente
            // não precisamos enviar body, mas mantemos compatibilidade se necessário
            const res = await fetch("/api/sync-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                const data = await res.json();
                // O backend retorna: { id, tipoUsuario, newsLetter, ... }
                
                const userDataToStore = {
                    id: data.id,
                    name: session?.user?.name || "",
                    email: session?.user?.email || "",
                    tier: data.tipoUsuario, // Mapeia tipoUsuario -> tier
                    newsletter: data.newsLetter // Mapeia newsLetter -> newsletter
                };

                localStorage.setItem("user_data", JSON.stringify(userDataToStore));
                console.log("[SyncUserEffect] Dados do usuário salvos no localStorage:", userDataToStore);
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
