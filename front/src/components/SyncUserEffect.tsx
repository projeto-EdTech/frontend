"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { usePendingPaymentReconciliation } from "@/hooks/usePendingPaymentReconciliation";
import { PENDING_PAYMENT_KEY } from "@/app/service/pendingPayment";
import { fetchUserClaims, notifyUserSynced } from "@/lib/core/userClaims";
// GA4: serviço centralizado de analytics (no-op seguro em dev e SSR)
import { setUserId, trackLogin, resetAnalytics } from "@/lib/core/analytics";

/** Cópia legada do JWT no localStorage. Ver a limpeza no efeito de migração abaixo. */
const CHAVE_LEGADA_DO_JWT = "user_data";

export default function SyncUserEffect() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const syncingRef = useRef(false);

  // Boleto pago dias atrás vira PRO aqui: este componente já roda global e já é o dono do
  // fluxo de sincronização. Só depois de autenticado — a rota de ativação exige sessão.
  usePendingPaymentReconciliation(status === "authenticated");

  // Migração: o JWT já foi gravado no localStorage por versões anteriores. Parar de escrever
  // não apaga o que ficou lá — e enquanto ficar, qualquer script na página consegue lê-lo.
  // Roda uma vez por carregamento, independente do estado da sessão.
  useEffect(() => {
    if (localStorage.getItem(CHAVE_LEGADA_DO_JWT)) {
      localStorage.removeItem(CHAVE_LEGADA_DO_JWT);
      console.log(
        "[SyncUserEffect] 🧹 Cópia antiga do JWT removida do localStorage",
      );
    }
  }, []);

  useEffect(() => {
    // 1. Limpeza ao deslogar
    if (status === "unauthenticated") {
      // Limpa rastros e identificação nos analytics
      resetAnalytics();

      const keysToClear = [
        // Mantida por segurança: cobre quem ainda tiver a cópia legada gravada.
        CHAVE_LEGADA_DO_JWT,
        // Reconciliação de boleto é por aluno: deixar a entrada de um faria a próxima
        // sessão perguntar pelo pagamento de outro (e levar 403).
        PENDING_PAYMENT_KEY,
        "flashcard_count",
        "flashcard_last_date",
        "flashcard_daily_stats",
      ];

      let cleared = false;
      keysToClear.forEach((key) => {
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
      if (syncingRef.current) return;
      syncingRef.current = true;

      (async () => {
        try {
          // Já existe JWT deste usuário no cookie? Quem sabe é o servidor, que lê o cookie
          // HttpOnly — o cliente não tem o token para conferir por conta própria.
          const claims = await fetchUserClaims();
          const email = session?.user?.email || "";

          if (claims && claims.email === email && claims.id) {
            return;
          }

          const res = await fetch("/api/sync-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) {
            console.warn(
              "[SyncUserEffect] Erro na resposta da API:",
              res.status,
            );
            return;
          }

          // O JWT não volta no corpo — vai só para o cookie HttpOnly. A resposta traz
          // apenas o que o cliente usa: identificação para os analytics.
          const data = await res.json();

          if (!data?.ok) {
            console.warn("[SyncUserEffect] Backend não devolveu sessão");
            return;
          }

          console.log(
            "[SyncUserEffect] Sessão sincronizada (JWT no cookie HttpOnly)",
          );

          // GA4: identifica o usuário pelo UUID do banco (nunca e-mail/CPF)
          // e registra o evento de login para métricas de retenção
          if (data.id) {
            setUserId(data.id, data.tipo);
            trackLogin("oauth");
          }

          // Avisa a aba: `useUserTier` refaz a leitura sem esperar reload.
          notifyUserSynced();
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
