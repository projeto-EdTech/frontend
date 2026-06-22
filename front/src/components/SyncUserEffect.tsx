"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { decodeJWT } from "@/app/service/jwtDecoder";
// GA4: serviço centralizado de analytics (no-op seguro em dev e SSR)
import { setUserId, trackLogin, resetAnalytics } from "@/lib/core/analytics";

export default function SyncUserEffect() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const syncingRef = useRef(false);

  useEffect(() => {
    // 1. Limpeza ao deslogar
    if (status === "unauthenticated") {
      // Limpa rastros e identificação nos analytics
      resetAnalytics();

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

      // Limpar os cookies setados pelo backend
      document.cookie = "user_data=; Max-Age=0; path=/;";

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
            const hasTipo = decoded && typeof decoded.tipo !== "undefined";
            
            // Verificação adicional: o cookie 'user_data' também deve existir para que os Server Components funcionem
            const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('user_data='));

            if (decoded && decoded.email === email && decoded.id && hasTipo && hasCookie) {
                alreadySynced = true;
            }
        }
        
        // Se já sincronizou e tem o cookie necessário, não precisa chamar novamente
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

                    // GA4: identifica o usuário pelo UUID do banco (nunca e-mail/CPF)
                    // e registra o evento de login para métricas de retenção
                    const decoded = decodeJWT(token);
                    if (decoded?.id) {
                        setUserId(decoded.id, decoded.tipo);
                        trackLogin('oauth');
                    }

                    // Sincroniza dados de destino com sessionStorage do perfil
                    const targetExam = decoded?.prova_alvo || decoded?.targetExam || data?.prova_alvo || data?.targetExam || "";
                    const targetCourse = decoded?.curso_alvo || decoded?.targetCourse || data?.curso_alvo || data?.targetCourse || "";
                    const institution = decoded?.instituicao || decoded?.institution || data?.instituicao || data?.institution || "";

                    if (targetExam || targetCourse || institution) {
                      const profileSettings = {
                        profileIcon: decoded?.profileIcon || "Avatar/Camaleão_1.png",
                        useInitialAvatar: decoded?.useInitialAvatar ?? true,
                        institution,
                        targetExam,
                        targetCourse,
                      };
                      sessionStorage.setItem("userProfileSettings", JSON.stringify(profileSettings));
                      sessionStorage.setItem("user_profile_data", JSON.stringify(profileSettings));
                      console.log("[SyncUserEffect] 🔄 Configurações de destino do usuário sincronizadas do backend:", profileSettings);
                    }
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
