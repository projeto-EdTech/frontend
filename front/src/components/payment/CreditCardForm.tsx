"use client"

/*
 * CREDIT CARD FORM - Design System macOS
 * Cores: #0071e3 (Primary), #34c759 (Success), #f5f5f7 (BG)
 * Tipografia: -apple-system, BlinkMacSystemFont
 *
 * Gateway: STRIPE (Payment Element).
 * PIX e boleto seguem no Mercado Pago — ver `PixForm.tsx` e `BoletoForm.tsx`.
 *
 * O cartão nunca chega ao nosso servidor: o Payment Element troca os dados direto com a
 * Stripe e a confirmação usa o `clientSecret` criado por
 * `/api/process-subscription/credit-card`.
 *
 * A Stripe não oferece pagamento parcelado em BRL, então o plano anual é cobrado à vista
 * e o mensal vira assinatura recorrente.
 */

import { useState, useMemo } from "react";
import { CreditCard, Lock } from "lucide-react";
import { loadStripe, type Stripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Image from "next/image";

interface Plan {
    precoTotal: number;
}

interface PayerData {
    firstName: string;
    lastName: string;
    email: string;
    identification: {
        type: string;
        number: string;
    };
}

export type BillingMode = "payment" | "subscription";

interface CreditCardFormProps {
    /** Client secret devolvido pela rota de criação da cobrança. */
    clientSecret: string;
    billingMode: BillingMode;
    selectedPlan: Plan | undefined;
    payerData: PayerData;
    /**
     * Recebe o id do PaymentIntent confirmado. A tela de sucesso o envia para
     * `/api/subscriptions/activate`, que reconsulta a Stripe antes de liberar o tier — o id
     * sozinho não prova nada, é só a chave da consulta.
     */
    onSuccess: (paymentIntentId: string) => void;
    onError: (error: { message: string }) => void;
}

/**
 * Carregado uma única vez no escopo do módulo: `loadStripe` dispara o download do
 * Stripe.js e recriá-lo a cada render remontaria o Element.
 */
let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise(): Promise<Stripe | null> {
    if (!stripePromise) {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");
    }
    return stripePromise;
}

/**
 * Aparência do Payment Element espelhando o design macOS usado no restante do checkout.
 */
const appearance: StripeElementsOptions["appearance"] = {
    theme: "flat",
    variables: {
        colorPrimary: "#0071e3",
        colorBackground: "#ffffff",
        colorText: "#1d1d1f",
        colorTextSecondary: "#86868b",
        colorDanger: "#ff3b30",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSizeBase: "15px",
        borderRadius: "8px",
        spacingUnit: "4px",
    },
    rules: {
        ".Input": {
            border: "1px solid #d2d2d7",
            padding: "12px 16px",
            boxShadow: "none",
        },
        ".Input:focus": {
            border: "1px solid #0071e3",
            boxShadow: "0 0 0 4px rgba(0, 113, 227, 0.1)",
        },
        ".Input--invalid": {
            border: "1px solid #ff3b30",
            boxShadow: "0 0 0 4px rgba(255, 59, 48, 0.1)",
        },
        ".Label": {
            color: "#86868b",
            fontSize: "13px",
            fontWeight: "600",
        },
    },
};

/**
 * Campos + botão de confirmação. Precisa viver dentro de `<Elements>` para acessar os
 * hooks `useStripe` / `useElements`.
 */
function StripeCardFields({
    billingMode,
    selectedPlan,
    payerData,
    onSuccess,
    onError,
}: Omit<CreditCardFormProps, "clientSecret">) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);

    const valorFormatado = (selectedPlan?.precoTotal ?? 0).toFixed(2).replace(".", ",");
    const rotuloBotao =
        billingMode === "subscription"
            ? `Assinar por R$ ${valorFormatado}/mês`
            : `Pagar R$ ${valorFormatado} à vista`;

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!stripe || !elements) return;

        setSubmitting(true);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                // `if_required` mantém o usuário na página quando não há desafio 3-D Secure.
                redirect: "if_required",
                confirmParams: {
                    return_url: `${window.location.origin}/paidPlan`,
                    payment_method_data: {
                        billing_details: {
                            name: `${payerData.firstName} ${payerData.lastName}`.trim(),
                            email: payerData.email,
                        },
                    },
                },
            });

            if (error) {
                onError({ message: error.message ?? "Não foi possível confirmar o pagamento." });
                return;
            }

            if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
                onSuccess(paymentIntent.id);
                return;
            }

            onError({ message: "Pagamento não foi concluído. Tente novamente." });
        } catch {
            onError({ message: "Erro inesperado ao confirmar o pagamento." });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement options={{ layout: "tabs" }} />

            <button
                type="submit"
                disabled={!stripe || submitting}
                className="w-full bg-[#0071e3] text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-[#0077ed] transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
                {submitting ? (
                    <span className="flex items-center justify-center gap-3">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Processando pagamento...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-3">
                        <Lock className="w-5 h-5" />
                        {rotuloBotao}
                    </span>
                )}
            </button>
        </form>
    );
}

export default function CreditCardForm({
    clientSecret,
    billingMode,
    selectedPlan,
    payerData,
    onSuccess,
    onError,
}: CreditCardFormProps) {
    const options = useMemo<StripeElementsOptions>(
        () => ({ clientSecret, appearance, locale: "pt-BR" }),
        [clientSecret]
    );

    return (
        <div className="space-y-6 relative">
            {/* Mascote de boas-vindas - contexto amigável */}
            <div className="relative bg-gradient-to-br from-[#e5f3ff] to-[#d6ebff] rounded-2xl p-6 ring-1 ring-[#b3d9ff] overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0071e3]/5 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                            src="/Mascote/banners/Camaleão_1.png"
                            alt="Mascote Vestibuline"
                            width={96}
                            height={96}
                            className="object-contain transition-transform duration-700 hover:scale-110"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                            Estamos quase lá! 🎉
                        </h3>
                        <p className="text-[#86868b] leading-relaxed" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                            Complete o pagamento e comece sua jornada de preparação com o Vestibuline
                        </p>
                    </div>
                </div>
            </div>

            {/* Título da seção com design consistente */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0071e3] to-[#0077ed] rounded-xl flex items-center justify-center shadow-sm">
                    <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-[#1d1d1f]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                        Dados do Cartão
                    </h3>
                    <p className="text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                        {billingMode === "subscription"
                            ? "Assinatura mensal com renovação automática"
                            : "Cobrança única, à vista"}
                    </p>
                </div>
            </div>

            {/* Container do formulário da Stripe */}
            <div className="bg-white rounded-2xl ring-1 ring-[#d2d2d7] p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <Elements stripe={getStripePromise()} options={options}>
                    <StripeCardFields
                        billingMode={billingMode}
                        selectedPlan={selectedPlan}
                        payerData={payerData}
                        onSuccess={onSuccess}
                        onError={onError}
                    />
                </Elements>
            </div>

            {/* Elementos de segurança como no resto do site */}
            <div className="bg-gradient-to-r from-[#34c759] to-[#30d158] rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
                <div className="absolute top-2 right-2 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center shadow-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                            Transação 100% Segura
                        </h4>
                        <p className="text-sm font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                            Seus dados são protegidos por criptografia SSL
                        </p>
                    </div>
                    {/* Mascote de segurança */}
                    <div className="hidden md:block relative w-20 h-20 flex-shrink-0">
                        <Image
                            src="/Mascote/banners/Camaleão_5.png"
                            alt="Mascote Segurança"
                            width={80}
                            height={80}
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* Banner de incentivo com mascote */}
            <div className="relative bg-gradient-to-br from-[#0071e3] to-[#005bb5] rounded-2xl p-6 text-white overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-white/5"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative flex items-center justify-between gap-6">
                    <div className="flex-1">
                        <h4 className="font-semibold text-2xl mb-3" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                            💪 Invista no seu futuro!
                        </h4>
                        <p className="text-white/90 leading-relaxed mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                            Milhares de estudantes já conquistaram suas aprovações com o Vestibuline.
                            Você é o próximo!
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <div className="bg-white/15 backdrop-blur-xl px-4 py-2 rounded-lg ring-1 ring-white/20">
                                <p className="text-xs font-semibold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                    ✅ +10.000 questões
                                </p>
                            </div>
                            <div className="bg-white/15 backdrop-blur-xl px-4 py-2 rounded-lg ring-1 ring-white/20">
                                <p className="text-xs font-semibold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                    📊 Análise detalhada
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="hidden lg:block relative w-32 h-32 flex-shrink-0">
                        <Image
                            src="/Mascote/banners/Camaleão_3.png"
                            alt="Mascote Motivação"
                            width={128}
                            height={128}
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
