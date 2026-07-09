"use client";

import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import {
  Check, CreditCard, Smartphone, FileText, Shield, Sparkles,
  ArrowRight, Lock, Rocket, Library, Activity,
  GraduationCap, Headset, ArrowLeft, Cpu, Lightbulb, BarChart3,
  User, Mail, Fingerprint, MapPin
} from "lucide-react";
import Image from 'next/image';
import { initMercadoPago } from '@mercadopago/sdk-react';
import LoginModal from "@/components/Login-modal";
import CreditCardForm from "@/components/payment/CreditCardForm";
import PixForm from "@/components/payment/PixForm";
import BoletoForm from "@/components/payment/BoletoForm";
import { type Plano } from "@/app/service/pricing.service";
import type { PaymentGatewayType } from "@/app/service/payment/payment-gateway.types";

const StripeCardForm = lazy(() => import("@/components/payment/StripeCardForm"));

// Icon mapping helper
const getIcon = (name: string) => {
  switch (name) {
    case 'Rocket': return <Rocket className="w-5 h-5" />;
    case 'Library': return <Library className="w-5 h-5" />;
    case 'Activity': return <Activity className="w-5 h-5" />;
    case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
    case 'Headset': return <Headset className="w-5 h-5" />;
    case 'Cpu': return <Cpu className="w-5 h-5" />;
    case 'Lightbulb': return <Lightbulb className="w-5 h-5" />;
    case 'BarChart3': return <BarChart3 className="w-5 h-5" />;
    default: return <Check className="w-5 h-5" />;
  }
};

interface PaidPlanFormData {
  plano: string;
  nomeCompleto: string;
  email: string;
  "CPF/CNPJ": string;
  address: string;
  paymentType: string;
  aceite: boolean;
}

interface PixData {
  payment_id: number;
  pixCode: string;
  qrCodeUrl: string;
}

interface PricingClientProps {
  initialPlans: Plano[];
  initialSession: any; // Using any for simplicity as per common repo patterns
}

export function PricingClient({ initialPlans, initialSession }: PricingClientProps) {
  const [cardGateway, setCardGateway] = useState<PaymentGatewayType>('stripe');
  const [gatewayChecked, setGatewayChecked] = useState(false);

  useEffect(() => {
    fetch('/api/gateway-health')
      .then(r => r.json())
      .then(health => {
        setCardGateway(health.creditCard ?? 'stripe');
      })
      .catch(() => setCardGateway('stripe'))
      .finally(() => setGatewayChecked(true));
  }, []);

  // Initialize MP SDK only when MP is the active CC gateway (fallback scenario)
  useEffect(() => {
    if (cardGateway === 'mercadopago' && process.env.NEXT_PUBLIC_MERCADO_PAGO_KEY) {
      initMercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_KEY, { locale: 'pt-BR' });
    }
  }, [cardGateway]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Checking auth status - if session passed from server is null, show login modal
  useEffect(() => {
    if (!initialSession) {
      setIsLoginModalOpen(true);
    }
  }, [initialSession]);

  const [currentPage, setCurrentPage] = useState("plan-selection"); 
  const [planoSelecionado, setPlanoSelecionado] = useState("anual");
  const [formData, setFormData] = useState<PaidPlanFormData>({
    plano: "anual",
    nomeCompleto: initialSession?.user?.name || "",
    email: initialSession?.user?.email || "",
    "CPF/CNPJ": "",
    address: "",
    paymentType: "",
    aceite: false
  });
  
  const [step, setStep] = useState(1);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [loadingPix, setLoadingPix] = useState(false);
  const [, setLoading] = useState(false);

  const availablePaymentMethods = useMemo(() => {
    const allMethods = [
      {
        id: "cartao",
        name: "Cartão de Crédito",
        description: "Visa, Mastercard, Elo e mais",
        icon: <CreditCard className="w-6 h-6" />,
        badge: "Mais usado",
        color: "blue"
      },
      {
        id: "Pix",
        name: "PIX",
        description: "Pagamento instantâneo",
        icon: <Smartphone className="w-6 h-6" />,
        color: "emerald"
      },
      {
        id: "boleto",
        name: "Boleto Bancário",
        description: "Vencimento em 3 dias úteis",
        icon: <FileText className="w-6 h-6" />,
        color: "orange"
      }
    ];

    if (planoSelecionado === 'mensal') {
      return allMethods.filter(method => method.id === 'cartao');
    }
    return allMethods;
  }, [planoSelecionado]);

  const handleInputChange = (field: keyof PaidPlanFormData, value: string | boolean) => {
    if (field === "CPF/CNPJ" && typeof value === 'string') {
      const digits = value.replace(/\D/g, '').slice(0, 14);
      let formatted = digits;
      
      if (digits.length <= 11) {
        // CPF: 000.000.000-00
        formatted = digits
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      } else {
        // CNPJ: 00.000.000/0000-00
        formatted = digits
          .replace(/^(\d{2})(\d)/, '$1.$2')
          .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
          .replace(/\.(\d{3})(\d)/, '.$1/$2')
          .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
      }
      
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    const docDigits = formData["CPF/CNPJ"].replace(/\D/g, "");
    const isDocValid = docDigits.length === 11 || docDigits.length === 14;
    const isAddressValid = formData.address.trim().length >= 10;

    return (
      formData.nomeCompleto && 
      formData.email && 
      isDocValid && 
      isAddressValid && 
      formData.paymentType && 
      formData.aceite
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    setCurrentPage("payment-details");
    setStep(2);
  };

  const selectedPlan = initialPlans.find(p => p.id === planoSelecionado);

  async function submitCreditCardPayment(token: string, gatewayHint: PaymentGatewayType, extraFields?: Record<string, unknown>) {
    setLoading(true);
    const nomeCompleto = formData.nomeCompleto.split(' ');
    const firstName = nomeCompleto[0];
    const lastName = nomeCompleto.slice(1).join(' ');

    try {
      const response = await fetch('/api/process-subscription/credit-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          transaction_amount: selectedPlan?.precoTotal,
          planId: planoSelecionado,
          gatewayHint,
          payer: {
            email: formData.email,
            first_name: firstName,
            last_name: lastName,
            identification: {
              type: 'CPF',
              number: formData['CPF/CNPJ'].replace(/\D/g, ''),
            },
          },
          ...extraFields,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Erro ao processar a assinatura.');

      setStep(3);
      setCurrentPage("payment-success");
    } catch (error: any) {
      alert(`Falha no pagamento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Handler for Stripe Elements form (receives PM ID)
  async function processStripePayment(pmId: string) {
    await submitCreditCardPayment(pmId, 'stripe');
  }

  // Handler for MercadoPago Brick form (fallback)
  async function processPayment(cardFormData: any) {
    await submitCreditCardPayment(cardFormData.token, 'mercadopago', {
      issuer_id: cardFormData.issuer_id,
      payment_method_id: cardFormData.payment_method_id,
      installments: cardFormData.installments,
    });
  }

  const processPixPayment = async () => {
    if (pixData) return;
    setLoadingPix(true);
  
    const nameParts = formData.nomeCompleto.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    try {
      const response = await fetch('/api/process-subscription/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_amount: selectedPlan?.precoTotal,
          payer: {
            email: formData.email,
            first_name: firstName,
            last_name: lastName,
            identification: {
              type: 'CPF',
              number: formData['CPF/CNPJ'].replace(/\D/g, ''),
            },
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Erro ao criar pagamento PIX');
      
      setPixData({
        payment_id: result.payment_id,
        pixCode: result.qr_code,
        qrCodeUrl: `data:image/jpeg;base64,${result.qr_code_base64}`,
      });
    } catch (error: any) {
      alert(`Falha ao gerar PIX: ${error.message}`);
    } finally {
      setLoadingPix(false);
    }
  };

  // Render Logic
  if (currentPage === "payment-details") {
    const nomeCompletoParts = formData.nomeCompleto.trim().split(/\s+/);
    const firstName = nomeCompletoParts[0] || '';
    const lastName = nomeCompletoParts.slice(1).join(' ') || '';
    const cleanedCpf = formData["CPF/CNPJ"].replace(/\D/g, '');

    const payerData = {
      firstName,
      lastName,
      email: formData.email,
      identification: {
        type: 'CPF' as const,
        number: cleanedCpf,
      }
    };

    return (
      <div className="space-y-12">
        {/* Back Button */}
        <button
          onClick={() => {
            setCurrentPage("plan-selection");
            setStep(1);
          }}
          className="flex items-center gap-2 text-[#0071e3] hover:opacity-80 mb-8 font-medium transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para seleção do plano
        </button>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-500 ${
                  step >= i ? 'bg-[#0071e3] text-white shadow-lg' : 'bg-[#e8e8ed] text-[#86868b]'
                }`}>
                  {i}
                </div>
                {i < 3 && (
                  <div className={`w-20 h-0.5 mx-3 rounded-full transition-all duration-500 ${
                    step > i ? 'bg-[#0071e3]' : 'bg-[#e8e8ed]'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-md ring-1 ring-[#d2d2d7]">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                {formData.paymentType === "cartao" && "Dados do Cartão"}
                {formData.paymentType === "Pix" && "Pagamento via PIX"}
                {formData.paymentType === "boleto" && "Boleto Bancário"}
              </h2>

              {formData.paymentType === "cartao" && gatewayChecked && (
                cardGateway === 'stripe' ? (
                  <Suspense fallback={<div className="h-64 animate-pulse bg-[#f5f5f7] rounded-2xl" />}>
                    <StripeCardForm
                      selectedPlan={selectedPlan}
                      onSubmit={processStripePayment}
                      onError={(msg) => alert(msg)}
                      payerEmail={formData.email}
                    />
                  </Suspense>
                ) : (
                  <CreditCardForm
                    key={payerData.identification.number}
                    selectedPlan={selectedPlan}
                    onSubmit={processPayment}
                    onError={(err: any) => alert(err.message)}
                    payerData={payerData}
                  />
                )
              )}
              {formData.paymentType === "Pix" && <PixForm pixData={pixData} loading={loadingPix} />}
              {formData.paymentType === "boleto" && (
                <BoletoForm
                  payerData={{
                    email: formData.email,
                    firstName,
                    lastName: lastName || firstName,
                    docType: 'CPF',
                    docNumber: cleanedCpf
                  }}
                  transactionAmount={selectedPlan?.precoTotal || 0}
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-md ring-1 ring-[#d2d2d7] sticky top-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-6">Resumo do Pedido</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#86868b]">Plano:</span>
                  <span className="font-semibold text-gray-700">{selectedPlan?.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868b]">Período:</span>
                  <span className="font-semibold text-gray-700">
                    {selectedPlan?.id === "anual" ? "12 meses" : "1 mês"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868b]">Cliente:</span>
                  <span className="font-semibold text-gray-700">{formData.nomeCompleto}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-700">Total:</span>
                  <span className="font-semibold text-[#0071e3]">
                    R$ {selectedPlan?.precoTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {formData.paymentType === 'Pix' && (
                <button
                  onClick={processPixPayment}
                  disabled={loadingPix || !!pixData}
                  className="w-full bg-[#0071e3] text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-[#0077ed] transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingPix ? "Gerando PIX..." : (pixData ? "Aguardando Pagamento" : "Gerar PIX")}
                </button>
              )}
              <p className="text-xs text-[#86868b] mt-4 text-center">
                🔒 Transação 100% segura e criptografada
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === "payment-success") {
    return (
      <div className="space-y-12">
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-500 ${
                  step >= i ? 'bg-[#34c759] text-white shadow-lg' : 'bg-[#e8e8ed] text-[#86868b]'
                }`}>
                  {step >= i ? <Check className="w-6 h-6" /> : i}
                </div>
                {i < 3 && (
                  <div className={`w-20 h-0.5 mx-3 rounded-full transition-all duration-500 ${
                    step > i ? 'bg-[#34c759]' : 'bg-[#e8e8ed]'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-8">
          <div className="relative flex items-center justify-center">
            <div className="absolute -left-20 md:-left-32 top-1/2 -translate-y-1/2 hidden md:block">
              <Image src="/Mascote/banners/Camaleão_17.png" alt="Mascote" width={120} height={120} />
            </div>
            <div className="w-32 h-32 bg-[#34c759] rounded-full flex items-center justify-center mx-auto shadow-xl">
              <Check className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -right-20 md:-right-32 top-1/2 -translate-y-1/2 hidden md:block">
              <Image src="/Mascote/banners/Camaleão_22.png" alt="Mascote" width={120} height={120} />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-700">Pagamento Confirmado!</h1>
            <p className="text-xl text-[#86868b] max-w-2xl mx-auto leading-relaxed">
              Parabéns! Sua assinatura do <strong>{selectedPlan?.nome}</strong> foi ativada com sucesso.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-md ring-1 ring-[#d2d2d7] max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-700">Detalhes da Compra</h3>
              <div className="px-4 py-2 bg-[#d1f4e0] text-[#007a3d] rounded-full text-sm font-semibold">✅ Confirmado</div>
            </div>
            <div className="space-y-4 text-left">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-[#86868b]">Plano:</span>
                <span className="font-semibold text-gray-700">{selectedPlan?.nome}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-[#86868b]">Cliente:</span>
                <span className="font-semibold text-gray-700">{formData.nomeCompleto}</span>
              </div>
              <div className="flex justify-between py-3 text-lg">
                <span className="font-semibold text-gray-700">Total Pago:</span>
                <span className="font-semibold text-[#34c759]">R$ {selectedPlan?.precoTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button onClick={() => window.location.href = "/library"} className="flex-1 bg-[#0071e3] text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-[#0077ed] transition-all duration-300">
              Começar a Estudar
            </button>
            <button onClick={() => window.location.href = "/profile"} className="flex-1 bg-white ring-1 ring-[#d2d2d7] text-gray-700 py-4 px-6 rounded-xl font-semibold text-base hover:shadow-md">
              Ver Meu Perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Step Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-500 ${
                step >= i ? 'bg-[#0071e3] text-white shadow-lg' : 'bg-[#e8e8ed] text-[#86868b]'
              }`}>
                {i}
              </div>
              {i < 3 && (
                <div className={`w-20 h-0.5 mx-3 rounded-full transition-all duration-500 ${
                  step > i ? 'bg-[#0071e3]' : 'bg-[#e8e8ed]'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialPlans.map((plano) => (
          <div
            key={plano.id}
            className={`relative group cursor-pointer transition-all duration-500 ${
              planoSelecionado === plano.id ? 'scale-[1.02]' : 'hover:scale-[1.01]'
            }`}
            onClick={() => {
              setPlanoSelecionado(plano.id);
              handleInputChange("plano", plano.id);
            }}
          >
            {plano.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white px-6 py-2 rounded-full text-xs font-semibold shadow-lg uppercase tracking-wide">
                  ⭐ MAIS POPULAR
                </div>
              </div>
            )}
            <div className={`relative rounded-3xl p-8 h-full flex flex-col bg-white transition-all duration-500 ${
              planoSelecionado === plano.id 
                ? 'shadow-2xl ring-2 ring-[#0071e3]' 
                : 'shadow-md hover:shadow-xl ring-1 ring-[#d2d2d7]'
            }`}>
              <div className="absolute -top-0 -right-0 z-20 hidden md:block">
                <Image src={plano.id === "anual" ? "/Mascote/banners/Camaleão_15.png" : "/Mascote/banners/Camaleão_11.png"} alt="Mascote" width={90} height={90} />
              </div>
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">{plano.nome}</h3>
                  <p className="text-[#86868b] mb-4">{plano.descricao}</p>
                  {plano.desconto && (
                    <div className="inline-flex items-center bg-[#d1f4e0] text-[#007a3d] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                      💰 {plano.desconto}
                    </div>
                  )}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-semibold text-gray-700">R$ {plano.precoMensal.toFixed(2)}</span>
                      <span className="text-lg text-[#86868b]">/mês</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 mb-8">
                  {plano.beneficios.map((beneficio, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${beneficio.color}15`, color: beneficio.color }}>
                        {getIcon(beneficio.iconeName)}
                      </div>
                      <span className="text-gray-700 text-sm font-medium">{beneficio.texto}</span>
                    </div>
                  ))}
                </div>
                <button type="button" className={`w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-300 ${
                  planoSelecionado === plano.id ? 'bg-[#0071e3] text-white' : 'bg-[#f5f5f7] text-gray-700'
                }`}>
                  {planoSelecionado === plano.id ? "Selecionado" : "Selecionar Plano"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form and Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-[#d2d2d7]/50 overflow-hidden relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3]">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Informações Pessoais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {[
                { field: "nomeCompleto", label: "Nome Completo", type: "text", icon: <User className="w-4 h-4" /> },
                { field: "email", label: "E-mail", type: "email", icon: <Mail className="w-4 h-4" /> },
                { field: "CPF/CNPJ", label: "CPF/CNPJ", type: "text", icon: <Fingerprint className="w-4 h-4" />, placeholder: "000.000.000-00" },
                { field: "address", label: "Endereço", type: "text", icon: <MapPin className="w-4 h-4" />, placeholder: "Rua, número, bairro..." }
              ].map((input) => (
                <div key={input.field} className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 ml-1 flex items-center gap-2">
                    {input.label}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0071e3] transition-colors">
                      {input.icon}
                    </div>
                    <input
                      type={input.type}
                      placeholder={input.placeholder}
                      value={formData[input.field as keyof PaidPlanFormData] as string}
                      onChange={(e) => handleInputChange(input.field as keyof PaidPlanFormData, e.target.value)}
                      disabled={input.field === "nomeCompleto" || input.field === "email"}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#f5f5f7]/50 border border-transparent rounded-2xl focus:bg-white focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium text-gray-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-[#d2d2d7]/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3]">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Forma de Pagamento</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {availablePaymentMethods.map((payment) => {
                const isSelected = formData.paymentType === payment.id;
                
                // Color mapping for selected state
                const colorConfigs: Record<string, { border: string, bg: string, text: string, iconBg: string, radio: string }> = {
                  blue: { 
                    border: 'border-[#0071e3]', 
                    bg: 'bg-[#0071e3]/5', 
                    text: 'text-[#0071e3]', 
                    iconBg: 'bg-[#0071e3]',
                    radio: 'border-[#0071e3] bg-[#0071e3]'
                  },
                  emerald: { 
                    border: 'border-[#34c759]', 
                    bg: 'bg-[#34c759]/5', 
                    text: 'text-[#34c759]', 
                    iconBg: 'bg-[#34c759]',
                    radio: 'border-[#34c759] bg-[#34c759]'
                  },
                  orange: { 
                    border: 'border-[#ff9500]', 
                    bg: 'bg-[#ff9500]/5', 
                    text: 'text-[#ff9500]', 
                    iconBg: 'bg-[#ff9500]',
                    radio: 'border-[#ff9500] bg-[#ff9500]'
                  }
                };

                const config = colorConfigs[payment.color || 'blue'];

                return (
                  <label 
                    key={payment.id} 
                    className={`relative flex flex-col p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 group ${
                      isSelected 
                        ? `${config.border} ${config.bg} shadow-md scale-[1.02]` 
                        : 'border-gray-100 hover:border-[#d2d2d7] hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      className="sr-only"
                      checked={isSelected} 
                      onChange={() => handleInputChange("paymentType", payment.id)} 
                    />
                    
                    {payment.badge && (
                      <div className={`absolute -top-3 right-4 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm ${config.iconBg}`}>
                        {payment.badge}
                      </div>
                    )}

                    <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                      isSelected ? `${config.iconBg} text-white` : 'bg-gray-100 text-gray-400'
                    }`}>
                      {payment.icon}
                    </div>

                    <div className="space-y-1">
                      <div className={`font-bold text-base ${isSelected ? config.text : 'text-gray-800'}`}>
                        {payment.name}
                      </div>
                      <div className="text-xs text-gray-500 font-medium leading-relaxed">
                        {payment.description}
                      </div>
                    </div>

                    <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? config.radio : 'border-gray-200'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[4]" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6 sticky top-8">
          <div className="bg-white rounded-3xl p-8 shadow-lg ring-1 ring-[#d2d2d7]/30">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ff9500]" />
              Resumo do Pedido
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="font-bold text-gray-800">{selectedPlan?.nome}</div>
                  <div className="text-xs text-gray-500">{selectedPlan?.descricao}</div>
                </div>
                <div className="font-bold text-gray-800">R$ {selectedPlan?.precoTotal.toFixed(2)}</div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-lg">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-2xl font-extrabold text-[#0071e3]">R$ {selectedPlan?.precoTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-1">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={formData.aceite}
                    onChange={(e) => handleInputChange("aceite", e.target.checked)}
                  />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                    formData.aceite ? 'bg-[#0071e3] border-[#0071e3]' : 'border-gray-300 group-hover:border-gray-400'
                  }`}>
                    {formData.aceite && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium leading-relaxed">
                  Li e aceito os <button type="button" className="text-[#0071e3] underline hover:text-[#0077ed]">termos de uso</button> e a política de privacidade.
                </span>
              </label>

              <button
                onClick={onSubmit}
                disabled={!validateForm()}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-[#0071e3]/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                  validateForm() 
                    ? 'bg-[#0071e3] text-white hover:bg-[#0077ed]' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {step === 1 ? "Finalizar Compra" : "Continuar"}
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-2">
                <Lock className="w-3 h-3" />
                Pagamento 100% Seguro
              </div>
            </div>
          </div>

          <div className="bg-[#f5f5f7] rounded-2xl p-6 flex items-center justify-center border border-gray-200/50 text-center">
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Dúvidas? <button onClick={() => window.location.href = "/contato"} type="button" className="text-[#0071e3] font-bold hover:underline cursor-pointer">Fale conosco</button> e garanta sua vaga.
            </p>
          </div>
        </div>
      </div>

      {/* Guarantee Section */}
      <div className="mt-12 bg-gradient-to-r from-[#34c759] to-[#30d158] rounded-2xl p-10 text-white text-center relative overflow-hidden">
        <div className="relative z-10">
          <Shield className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-3xl font-semibold mb-2">Garantia de 7 Dias</h3>
          <p>Se não ficar satisfeito, devolvemos 100% do seu investimento.</p>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectTo="/paidPlan"
        isRequired={!initialSession}
      />
    </div>
  );
}
