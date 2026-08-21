"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface Plan {
  precoTotal: number;
}

interface StripeCardFormProps {
  selectedPlan: Plan | undefined;
  onSubmit: (token: string) => Promise<void>;
  onError: (message: string) => void;
  payerEmail: string;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#1d1d1f",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: "15px",
      fontSmoothing: "antialiased",
      "::placeholder": { color: "#86868b" },
    },
    invalid: {
      color: "#ff3b30",
      iconColor: "#ff3b30",
    },
  },
  hidePostalCode: true,
};

function StripeCardInner({ selectedPlan, onSubmit, onError, payerEmail }: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { email: payerEmail },
      });

      if (error) {
        onError(error.message ?? "Erro ao processar cartão.");
        return;
      }

      await onSubmit(paymentMethod.id);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      {/* Header com mascote */}
      <div className="relative bg-gradient-to-br from-[#e5f3ff] to-[#d6ebff] rounded-2xl p-6 ring-1 ring-[#b3d9ff] overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0071e3]/5 rounded-full blur-3xl" />
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
            <h3
              className="text-2xl font-semibold text-[#1d1d1f] mb-2"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Estamos quase lá! 🎉
            </h3>
            <p
              className="text-[#86868b] leading-relaxed"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Complete o pagamento e comece sua jornada de preparação com o Vestibuline
            </p>
          </div>
        </div>
      </div>

      {/* Título da seção */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-[#0071e3] to-[#0077ed] rounded-xl flex items-center justify-center shadow-sm">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3
            className="text-xl font-semibold text-[#1d1d1f]"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            Dados do Cartão
          </h3>
          <p
            className="text-[#86868b]"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            Preencha as informações do seu cartão
          </p>
        </div>
      </div>

      {/* Stripe Card Element */}
      <div className="bg-white rounded-2xl ring-1 ring-[#d2d2d7] p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
        <div className="border border-[#d2d2d7] rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-[#0071e3]/20 focus-within:border-[#0071e3] transition-all duration-200">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>

        <p
          className="text-xs text-[#86868b]"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          Valor total: R$ {selectedPlan?.precoTotal?.toFixed(2).replace(".", ",") ?? "–"}
        </p>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-gradient-to-r from-[#0071e3] to-[#0077ed] hover:from-[#005bb5] hover:to-[#0071e3] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          {loading ? "Processando..." : "Finalizar Pagamento"}
        </button>
      </div>

      {/* Banner de segurança */}
      <div className="bg-gradient-to-r from-[#34c759] to-[#30d158] rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-2 right-2 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4
              className="font-semibold text-lg mb-1"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Transação 100% Segura
            </h4>
            <p
              className="text-sm font-normal"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Seus dados são protegidos por criptografia SSL
            </p>
          </div>
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

      {/* Banner motivacional */}
      <div className="relative bg-gradient-to-br from-[#0071e3] to-[#005bb5] rounded-2xl p-6 text-white overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-white/5" />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between gap-6">
          <div className="flex-1">
            <h4
              className="font-semibold text-2xl mb-3"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              💪 Invista no seu futuro!
            </h4>
            <p
              className="text-white/90 leading-relaxed mb-4"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Milhares de estudantes já conquistaram suas aprovações com o Vestibuline. Você é o próximo!
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
    </form>
  );
}

export default function StripeCardForm(props: StripeCardFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <StripeCardInner {...props} />
    </Elements>
  );
}
