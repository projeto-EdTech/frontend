"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Acompanha um PIX até ele ser pago.
 *
 * O PIX é assíncrono: o aluno sai da aba, paga no app do banco e volta. Sem isso a tela do
 * QR code ficava parada para sempre, mesmo depois do pagamento cair — só o webhook ficava
 * sabendo, e o aluno nunca via a tela de confirmação.
 *
 * Quem decide se está pago é `/api/subscriptions/activate`, que consulta o Mercado Pago no
 * servidor. Este hook só pergunta; a resposta 200 já vem com o tier ativado.
 *
 * CACHE STRATEGY: no-store — consulta de pagamento, sem cache
 */

export type PixPaymentStatus = "idle" | "pending" | "paid" | "failed" | "expired";

export interface PixPaymentResult {
    status: PixPaymentStatus;
    /** Corpo da resposta de sucesso, para a tela 3 não repetir a chamada. */
    activation: PixActivationResponse | null;
}

/**
 * Sem `token`: o JWT novo é gravado pela rota no cookie `user_data` HttpOnly e **não volta ao
 * navegador**. Quem precisa do tier atualizado pergunta a `GET /api/user/me`.
 */
export interface PixActivationResponse {
    activated: boolean;
    status?: string;
    tier?: string | null;
    expiresAt?: string | null;
    pending?: boolean;
}

/** Cadência: rápido no começo, quando é mais provável o aluno estar pagando naquele instante. */
const INTERVALO_INICIAL_MS = 5_000;
const INTERVALO_TARDIO_MS = 10_000;
const TROCA_DE_CADENCIA_MS = 2 * 60_000;
/** O código PIX gerado pelo Mercado Pago e anunciado na UI vale 30 minutos. */
const LIMITE_MS = 30 * 60_000;

export function usePixPaymentStatus(
    paymentId: number | string | null,
    enabled: boolean
): PixPaymentResult {
    const [status, setStatus] = useState<PixPaymentStatus>("idle");
    const [activation, setActivation] = useState<PixActivationResponse | null>(null);

    // `useRef` para o timer não reiniciar a cada render e não sobreviver ao unmount.
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!enabled || paymentId == null) {
            setStatus("idle");
            return;
        }

        const controller = new AbortController();
        const inicio = Date.now();
        let encerrado = false;

        const limpar = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };

        const agendar = () => {
            if (encerrado) return;

            const decorrido = Date.now() - inicio;

            if (decorrido >= LIMITE_MS) {
                encerrado = true;
                setStatus("expired");
                return;
            }

            const intervalo =
                decorrido < TROCA_DE_CADENCIA_MS ? INTERVALO_INICIAL_MS : INTERVALO_TARDIO_MS;

            timeoutRef.current = setTimeout(consultar, intervalo);
        };

        const consultar = async () => {
            if (encerrado) return;

            // Aba oculta não consulta: o aluno está no app do banco, e cada consulta bate na
            // API do Mercado Pago. `visibilitychange` retoma assim que ele volta.
            if (typeof document !== "undefined" && document.hidden) {
                agendar();
                return;
            }

            try {
                const response = await fetch("/api/subscriptions/activate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ gateway: "mercadopago", paymentId: String(paymentId) }),
                    signal: controller.signal,
                    cache: "no-store",
                });

                if (encerrado) return;

                if (response.status === 200 || response.status === 202) {
                    const data = (await response.json()) as PixActivationResponse;

                    // 202 tem dois significados: PIX pendente (continua) ou pago com o BFF
                    // ainda sem endpoint (`pending: true`) — nesse caso o dinheiro entrou e a
                    // tela pode avançar.
                    if (response.status === 200 || data.pending) {
                        encerrado = true;
                        setActivation(data);
                        setStatus("paid");
                        return;
                    }

                    setStatus("pending");
                    agendar();
                    return;
                }

                if (response.status === 409) {
                    encerrado = true;
                    setStatus("failed");
                    return;
                }

                // 401/403/404/500: não vale insistir em loop — o webhook reconcilia depois.
                encerrado = true;
                setStatus("pending");
            } catch (error) {
                if (controller.signal.aborted) return;
                // Falha de rede é transitória; segue tentando dentro do limite de 30 min.
                console.error("Falha ao consultar o pagamento PIX:", error);
                agendar();
            }
        };

        const aoVoltarParaAba = () => {
            if (encerrado || document.hidden) return;
            limpar();
            consultar();
        };

        setStatus("pending");
        consultar();
        document.addEventListener("visibilitychange", aoVoltarParaAba);

        return () => {
            encerrado = true;
            controller.abort();
            limpar();
            document.removeEventListener("visibilitychange", aoVoltarParaAba);
        };
    }, [paymentId, enabled]);

    return { status, activation };
}
