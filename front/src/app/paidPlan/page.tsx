"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginModal from "@/components/Login-modal";
import CreditCardForm from "@/components/payment/CreditCardForm";
import PixForm from "@/components/payment/PixForm";
import BoletoForm from "@/components/payment/BoletoForm";
import PlanCard from "@/components/pricing/PlanCard";
import ProgressIndicator from "@/components/pricing/ProgressIndicator";
import PaymentMethodSelector from "@/components/pricing/PaymentMethodSelector";
import PersonalInfoForm from "@/components/pricing/PersonalInfoForm";
import SecuritySection from "@/components/pricing/SecuritySection";
import GuaranteeSection from "@/components/pricing/GuaranteeSection";
import HeroSection from "@/components/pricing/HeroSection";

import {
  Check,
  CreditCard,
  Smartphone,
  FileText,
  Shield,
  Clock,
  ArrowLeft,
  Rocket,
  Activity,
  Cpu,
  Lightbulb,
  GraduationCap,
  BarChart3,
  Headset,
  Library,
} from "lucide-react";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { initMercadoPago } from "@mercadopago/sdk-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// CONSTANTS & ANIMATIONS
// ============================================================================

const APPLE_SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };
const FADE_UP = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] as const },
};

// ============================================================================
// INTERFACES
// ============================================================================

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

interface Benefit {
  texto: string;
  icone: React.ReactNode;
  color: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ModernPaidPlan() {
  initMercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_KEY!, {
    locale: "pt-BR",
  });

  const { data: session, status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    if (status === "unauthenticated") {
      setIsLoginModalOpen(true);
    }
  }, [status]);

  // ============================================================================
  // STATE
  // ============================================================================

  const [currentPage, setCurrentPage] = useState("plan-selection");
  const [planoSelecionado, setPlanoSelecionado] = useState("anual");
  const [formData, setFormData] = useState<PaidPlanFormData>({
    plano: "anual",
    nomeCompleto: "",
    email: "",
    "CPF/CNPJ": "",
    address: "",
    paymentType: "",
    aceite: false,
  });

  const [, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [loadingPix, setLoadingPix] = useState(false);

  // ============================================================================
  // DATA & COMPUTED VALUES
  // ============================================================================

  const beneficiosPadrao: Benefit[] = [
    {
      texto: "Acesso ilimitado a simulados",
      icone: <Rocket className="w-5 h-5" />,
      color: "#5856D6",
    },
    {
      texto: "Biblioteca de provas",
      icone: <Library className="w-5 h-5" />,
      color: "#007AFF",
    },
    {
      texto: "Estatística em tempo real",
      icone: <Activity className="w-5 h-5" />,
      color: "#34C759",
    },
    {
      texto: "Resolução com IA (PRO)",
      icone: <Cpu className="w-5 h-5" />,
      color: "#FF2D55",
    },
    {
      texto: "Plano de estudos otimizado",
      icone: <Lightbulb className="w-5 h-5" />,
      color: "#FFCC00",
    },
    {
      texto: "Consulta de notas de corte",
      icone: <GraduationCap className="w-5 h-5" />,
      color: "#FF3B30",
    },
    {
      texto: "Estatísticas avançadas",
      icone: <BarChart3 className="w-5 h-5" />,
      color: "#5E5CE6",
    },
    {
      texto: "Suporte prioritário 24/7",
      icone: <Headset className="w-5 h-5" />,
      color: "#FF9500",
    },
  ];

  const planos = [
    {
      id: "anual",
      nome: "Simula Pro Anual",
      descricao: "O melhor custo-benefício",
      precoMensal: 41.5,
      precoTotal: 497,
      desconto: "Estude o ano todo e ganhe 2 meses grátis!",
      popular: true,
      beneficios: beneficiosPadrao,
      mascoteImage: "/Mascote/banners/Camaleão_15.png",
    },
    {
      id: "mensal",
      nome: "Simula Pro Mensal",
      descricao: "Flexibilidade total",
      precoMensal: 50,
      precoTotal: 50,
      popular: false,
      beneficios: beneficiosPadrao,
      mascoteImage: "/Mascote/banners/Camaleão_11.png",
    },
  ];

  const availablePaymentMethods = useMemo(() => {
    const allMethods = [
      {
        id: "cartao",
        name: "Cartão de Crédito",
        description: "Visa, Mastercard, Elo e mais",
        icon: <CreditCard className="w-6 h-6" />,
        badge: "Mais usado",
        color: "blue",
      },
      {
        id: "Pix",
        name: "PIX",
        description: "Pagamento instantâneo",
        icon: <Smartphone className="w-6 h-6" />,
        color: "emerald",
      },
      {
        id: "boleto",
        name: "Boleto Bancário",
        description: "Vencimento em 3 dias úteis",
        icon: <FileText className="w-6 h-6" />,
        color: "orange",
      },
    ];

    return planoSelecionado === "mensal"
      ? allMethods.filter((method) => method.id === "cartao")
      : allMethods;
  }, [planoSelecionado]);

  useEffect(() => {
    if (session) {
      setFormData((prev) => ({
        ...prev,
        nomeCompleto: session.user?.name || "",
        email: session.user?.email || "",
      }));
    }
  }, [session]);

  const selectedPlan = planos.find((p) => p.id === planoSelecionado);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInputChange = (
    field: keyof PaidPlanFormData,
    value: string | boolean,
  ) => {
    if (field === "CPF/CNPJ" && typeof value === "string") {
      const digitsOnly = value.replace(/\D/g, "");
      const limitedValue = digitsOnly.slice(0, 14);
      setFormData((prev) => ({ ...prev, [field]: limitedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    return (
      formData.nomeCompleto &&
      formData.email &&
      formData["CPF/CNPJ"] &&
      formData.address &&
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

  const processPayment = async (cardFormData: {
    token: string;
    issuer_id: string;
    payment_method_id: string;
    installments: number;
  }) => {
    setLoading(true);
    const nomeCompleto = formData.nomeCompleto.split(" ");
    const firstName = nomeCompleto[0];
    const lastName = nomeCompleto.slice(1).join(" ");

    try {
      const response = await fetch("/api/process-subscription/credit-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: cardFormData.token,
          issuer_id: cardFormData.issuer_id,
          payment_method_id: cardFormData.payment_method_id,
          transaction_amount: selectedPlan?.precoTotal,
          installments: cardFormData.installments,
          payer: {
            email: formData.email,
            first_name: firstName,
            last_name: lastName,
            identification: {
              type: "CPF",
              number: formData["CPF/CNPJ"].replace(/\D/g, ""),
            },
          },
          planId: planoSelecionado,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Erro ao processar a assinatura.");
      }

      setStep(3);
      setCurrentPage("payment-success");
    } catch (error: unknown) {
      console.error("Erro ao processar pagamento:", error);
      alert(
        `Falha no pagamento: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error: unknown) => {
    console.error("Erro no formulário de pagamento:", error);
    alert(
      `Ocorreu um erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    );
  };

  const processPixPayment = async () => {
    if (pixData) return;
    setLoadingPix(true);

    const nameParts = formData.nomeCompleto.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || firstName;

    try {
      const response = await fetch("/api/process-subscription/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_amount: selectedPlan?.precoTotal,
          payer: {
            email: formData.email,
            first_name: firstName,
            last_name: lastName,
            identification: {
              type: "CPF",
              number: formData["CPF/CNPJ"].replace(/\D/g, ""),
            },
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Erro ao criar pagamento PIX");
      }

      if (!result.qr_code || !result.qr_code_base64 || !result.payment_id) {
        throw new Error("Dados do PIX inválidos");
      }

      setPixData({
        payment_id: result.payment_id,
        pixCode: result.qr_code,
        qrCodeUrl: `data:image/jpeg;base64,${result.qr_code_base64}`,
      });
    } catch (error) {
      console.error("Erro ao processar PIX:", error);
      alert(
        `Falha ao gerar PIX: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      );
    } finally {
      setLoadingPix(false);
    }
  };

  // ============================================================================
  // RENDER: PAYMENT DETAILS PAGE
  // ============================================================================

  if (currentPage === "payment-details") {
    const nomeCompleto = formData.nomeCompleto.trim().split(/\s+/);
    const firstName = nomeCompleto[0] || "";
    const lastName = nomeCompleto.slice(1).join(" ") || "";
    const cleanedCpf = formData["CPF/CNPJ"].replace(/\D/g, "");

    const payerData = {
      firstName,
      lastName,
      email: formData.email,
      identification: { type: "CPF", number: cleanedCpf },
    };

    return (
      <motion.div
        key="payment"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={FADE_UP}
        className="min-h-screen bg-[#f5f5f7]"
      >
        <Header />
        <main className="max-w-6xl mx-auto py-12 px-6">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => {
              setCurrentPage("plan-selection");
              setStep(1);
            }}
            className="flex items-center gap-2 text-[#0071e3] hover:opacity-80 mb-8 font-medium"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para seleção do plano
          </motion.button>

          <ProgressIndicator currentStep={step} variant="default" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, ...APPLE_SPRING }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Payment Methods */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="bg-white rounded-2xl p-8 shadow-md ring-1 ring-[#d2d2d7]"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#34c759] to-[#30d158] rounded-xl flex items-center justify-center shadow-sm">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-semibold text-gray-700"
                      style={{
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    >
                      Forma de Pagamento
                    </h2>
                    <p
                      className="text-[#86868b]"
                      style={{
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    >
                      Escolha como deseja pagar
                    </p>
                  </div>
                </div>

                <PaymentMethodSelector
                  methods={availablePaymentMethods}
                  selectedMethod={formData.paymentType}
                  onSelect={(methodId) =>
                    handleInputChange("paymentType", methodId)
                  }
                />
              </motion.div>

              <div className="bg-white rounded-2xl p-8 shadow-md ring-1 ring-[#d2d2d7]">
                <h2
                  className="text-2xl font-semibold text-gray-700 mb-6"
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  {formData.paymentType === "cartao" && "Dados do Cartão"}
                  {formData.paymentType === "Pix" && "Pagamento via PIX"}
                  {formData.paymentType === "boleto" && "Boleto Bancário"}
                </h2>

                {formData.paymentType === "cartao" && (
                  <CreditCardForm
                    key={payerData.identification.number}
                    selectedPlan={selectedPlan}
                    onSubmit={processPayment}
                    onError={handlePaymentError}
                    payerData={payerData}
                  />
                )}
                {formData.paymentType === "Pix" && (
                  <PixForm pixData={pixData} loading={loadingPix} />
                )}
                {formData.paymentType === "boleto" && (
                  <BoletoForm
                    payerData={{
                      email: formData.email,
                      firstName: formData.nomeCompleto.split(" ")[0],
                      lastName:
                        formData.nomeCompleto.split(" ").slice(1).join(" ") ||
                        formData.nomeCompleto.split(" ")[0],
                      docType: "CPF",
                      docNumber: formData["CPF/CNPJ"].replace(/\D/g, ""),
                    }}
                    transactionAmount={selectedPlan?.precoTotal || 0}
                  />
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, ...APPLE_SPRING }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-md ring-1 ring-[#d2d2d7] sticky top-6">
                <h3
                  className="text-xl font-semibold text-gray-700 mb-6"
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Resumo do Pedido
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-[#86868b]">Plano:</span>
                    <span className="font-semibold">{selectedPlan?.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#86868b]">Período:</span>
                    <span className="font-semibold">
                      {selectedPlan?.id === "anual" ? "12 meses" : "1 mês"}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold text-[#0071e3]">
                      R$ {selectedPlan?.precoTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {formData.paymentType === "Pix" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={processPixPayment}
                    disabled={loadingPix || !!pixData}
                    className="w-full bg-[#0071e3] text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {loadingPix
                      ? "Gerando PIX..."
                      : pixData
                        ? "Aguardando Pagamento"
                        : "Gerar PIX"}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </motion.div>
    );
  }

  // ============================================================================
  // RENDER: SUCCESS PAGE
  // ============================================================================

  if (currentPage === "payment-success") {
    return (
      <motion.div
        key="success"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={APPLE_SPRING}
        className="min-h-screen bg-[#f5f5f7]"
      >
        <Header />
        <main className="max-w-5xl mx-auto py-12 px-6">
          <ProgressIndicator currentStep={3} variant="success" />

          <div className="space-y-8">
            <div className="relative flex items-center justify-center">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring" as const }}
                className="absolute -left-20 md:-left-32 hidden md:block"
              >
                <Image
                  src="/Mascote/banners/Camaleão_17.png"
                  alt="Happy"
                  width={120}
                  height={120}
                />
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring" as const,
                  stiffness: 200,
                  damping: 10,
                  delay: 0.5,
                }}
                className="w-32 h-32 bg-[#34c759] rounded-full flex items-center justify-center shadow-2xl"
              >
                <Check className="w-16 h-16 text-white" />
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring" as const }}
                className="absolute -right-20 md:-right-32 hidden md:block"
              >
                <Image
                  src="/Mascote/banners/Camaleão_22.png"
                  alt="Happy"
                  width={120}
                  height={120}
                />
              </motion.div>
            </div>

            <div className="text-center">
              <h1
                className="text-5xl font-semibold text-gray-700 mb-4"
                style={{
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                Pagamento Confirmado!
              </h1>
              <p className="text-xl text-[#86868b]">
                Sua assinatura foi ativada com sucesso!
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => (window.location.href = "/library")}
                className="px-8 py-4 bg-[#0071e3] text-white rounded-xl font-semibold"
              >
                Começar a Estudar
              </button>
              <button
                onClick={() => (window.location.href = "/profile")}
                className="px-8 py-4 bg-white ring-1 ring-[#d2d2d7] rounded-xl"
              >
                Ver Meu Perfil
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </motion.div>
    );
  }

  // ============================================================================
  // RENDER: PLAN SELECTION PAGE
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />
      <AnimatePresence mode="wait">
        {currentPage === "plan-selection" && (
          <motion.div
            key="selection"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={FADE_UP}
          >
            <HeroSection
              title="Evolua Sua Preparação para o Vestibular"
              subtitle="Transforme sua preparação com inteligência artificial e alcance seus objetivos mais rápido"
              badge="Oferta Limitada no plano anual - 17% OFF"
              features={[
                {
                  icon: <Check className="w-5 h-5" />,
                  text: "Mais de 50,000 questões",
                },
                {
                  icon: <Clock className="w-5 h-5" />,
                  text: "Acesso imediato",
                },
                {
                  icon: <Shield className="w-5 h-5" />,
                  text: "Garantia de 7 dias",
                },
              ]}
              leftMascote="/Mascote/banners/Camaleão_13.png"
              rightMascote="/Mascote/banners/Camaleão_19.png"
            />

            <main className="max-w-6xl mx-auto py-16 px-6">
              <ProgressIndicator currentStep={step} />

              {/* Plan Selection */}
              <div className="mb-20">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-semibold text-gray-700 mb-4">
                    Escolha Seu Plano
                  </h2>
                  <p className="text-[#86868b] text-lg">
                    Selecione o plano que melhor se adapta
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                  {planos.map((plano) => (
                    <PlanCard
                      key={plano.id}
                      {...plano}
                      isSelected={planoSelecionado === plano.id}
                      onSelect={() => {
                        setPlanoSelecionado(plano.id);
                        handleInputChange("plano", plano.id);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Personal Info Form */}
              <PersonalInfoForm
                fields={[
                  {
                    field: "nomeCompleto",
                    label: "Nome Completo",
                    type: "text",
                    placeholder: "Digite seu nome",
                  },
                  {
                    field: "email",
                    label: "E-mail",
                    type: "email",
                    placeholder: "exemplo@gmail.com",
                  },
                  {
                    field: "CPF/CNPJ",
                    label: "CPF/CNPJ",
                    type: "text",
                    placeholder: "Digite seu CPF",
                  },
                  {
                    field: "address",
                    label: "Endereço",
                    type: "text",
                    placeholder: "Seu endereço completo",
                  },
                ]}
                values={formData as unknown as Record<string, string | boolean>}
                onChange={(field: string, value: string | boolean) => {
                  handleInputChange(field as keyof PaidPlanFormData, value);
                }}
                icon={
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
                title="Informações Pessoais"
                subtitle="Preencha seus dados para continuar"
              />

              {/* Payment Methods */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-50px" }}
                className="bg-white rounded-2xl p-8 shadow-md ring-1 ring-[#d2d2d7] mt-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#34c759] to-[#30d158] rounded-xl flex items-center justify-center shadow-sm">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-semibold text-gray-700"
                      style={{
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    >
                      Forma de Pagamento
                    </h2>
                    <p className="text-[#86868b]">Escolha como deseja pagar</p>
                  </div>
                </div>
                <PaymentMethodSelector
                  methods={availablePaymentMethods}
                  selectedMethod={formData.paymentType}
                  onSelect={(method) =>
                    handleInputChange("paymentType", method)
                  }
                />
              </motion.div>

              {/* Spacing with Visual Separator */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true, margin: "-50px" }}
                className="relative py-8"
              >
              </motion.div>

              {/* Security Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <SecuritySection
                  isAccepted={formData.aceite}
                  onChange={(value) => handleInputChange("aceite", value)}
                  mascoteImage="/Mascote/banners/Camaleão_26.png"
                />
              </motion.div>

              {/* Submit Button */}
              <div className="text-center mt-8">
                <motion.button
                  type="button"
                  onClick={onSubmit}
                  disabled={!validateForm()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-12 py-4 bg-[#0071e3] text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  Continuar para Pagamento
                </motion.button>
              </div>

              {/* Guarantee Section */}
              <GuaranteeSection
                title="Garantia de 7 Dias ou Seu Dinheiro de Volta"
                description="Teste nossa plataforma sem riscos. Se não ficar satisfeito, devolvemos 100% do seu investimento."
                features={[
                  {
                    icon: <Check className="w-5 h-5" />,
                    text: "Reembolso rápido",
                  },
                  {
                    icon: <Check className="w-5 h-5" />,
                    text: "Sem perguntas",
                  },
                  { icon: <Check className="w-5 h-5" />, text: "100% seguro" },
                ]}
                mascoteImage="/Mascote/banners/Camaleão_24.png"
              />
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectTo="/paidPlan"
        isRequired={status === "unauthenticated"}
      />
      <Footer />
    </div>
  );
}
