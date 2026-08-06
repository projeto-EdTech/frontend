"use client";

import { useEffect, useRef } from "react";
import {
    PENDING_PAYMENT_KEY,
    parsePendingPayment,
    isPendingPaymentExpired,
    shouldClearOnStatus,
} from "@/app/service/pendingPayment";
import { notifyUserSynced } from "@/lib/userClaims";

/**
 * Pergunta, no próximo acesso do aluno, se aquela cobrança pendente já compensou.
 *
 * É a rede de segurança do **boleto**. PIX tem polling enquanto o QR está na tela e cartão ativa
 * na tela de confirmação; o boleto compensa em dias e quem ativa é o webhook que chega direto
 * ao BFF Java. Isto cobre o intervalo entre o pagamento e o aluno voltar ao site.
 *
 * O navegador manda só o `paymentId`. `/api/subscriptions/activate` encaminha ao BFF, que
 * reconsulta a gateway, confere a titularidade contra a sessão e só então libera — o mesmo
 * modelo de confiança do polling do PIX, com o JWT do próprio aluno como credencial.
 *
 * Uma tentativa por carregamento de página. Não é polling: se voltar 202, espera a próxima
 * visita. Um boleto leva dias, não segundos.
 *
 * CACHE STRATEGY: no-store — consulta de pagamento, sem cache
 */
export function usePendingPaymentReconciliation(enabled: boolean): void {
    // Guarda contra StrictMode, que monta o efeito duas vezes em desenvolvimento.
    const jaTentouRef = useRef(false);

    useEffect(() => {
        if (!enabled || jaTentouRef.current) return;

        const entry = parsePendingPayment(localStorage.getItem(PENDING_PAYMENT_KEY));

        if (!entry) return;

        if (isPendingPaymentExpired(entry, Date.now())) {
            localStorage.removeItem(PENDING_PAYMENT_KEY);
            return;
        }

        jaTentouRef.current = true;

        const controller = new AbortController();

        (async () => {
            try {
                const response = await fetch("/api/subscriptions/activate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        gateway: entry.gateway,
                        paymentId: entry.paymentId,
                    }),
                    signal: controller.signal,
                    cache: "no-store",
                });

                if (response.status === 200) {
                    // O JWT novo foi gravado pela rota no cookie `user_data` HttpOnly; o
                    // navegador não recebe o token. O evento faz `useUserTier` reler e o tier
                    // valer sem reload.
                    notifyUserSynced();

                    console.info("[PendingPayment] Cobrança pendente ativada.");
                }

                if (shouldClearOnStatus(response.status)) {
                    localStorage.removeItem(PENDING_PAYMENT_KEY);
                }
            } catch (error) {
                if (controller.signal.aborted) return;
                // O aluno já pagou: nada de erro na tela. Fica para a próxima visita.
                console.error("[PendingPayment] Falha ao reconciliar:", error);
            }
        })();

        return () => controller.abort();
    }, [enabled]);
}
