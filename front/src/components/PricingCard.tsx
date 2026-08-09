"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  Library,
  Activity,
  Cpu,
  Lightbulb,
  GraduationCap,
  BarChart3,
  Headset,
  Gift,
  Crown,
  Gem,
} from "lucide-react";

interface Benefit {
  icon: React.ReactNode;
  color?: string;
  text: string;
}

interface PricingCardProps {
  title: string;
  subtitle: string;
  pricePrefix?: string;
  priceMain: string;
  priceDecimal?: string;
  priceSuffix?: string;
  billingCycleInfo?: string;
  oldPrice?: string;
  badge?: string;
  highlighted?: boolean;
  icon: React.ReactNode;
  benefits: Benefit[];
  buttonText: string;
  buttonLink: string;
  buttonVariant: "primary" | "secondary" | "outline";
  onButtonClick?: (e: React.MouseEvent<any>) => void;
  delay?: number;
  isDark?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  subtitle,
  pricePrefix = "R$",
  priceMain,
  priceDecimal,
  priceSuffix,
  billingCycleInfo,
  oldPrice,
  badge,
  highlighted = false,
  icon,
  benefits,
  buttonText,
  buttonLink,
  buttonVariant,
  onButtonClick,
  delay = 0,
  isDark = false,
}) => {
  const isPrimary = buttonVariant === "primary";
  const isOutline = buttonVariant === "outline";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: delay, ease: "easeOut" }}
      whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.06)" }}
      className={`w-full max-w-[340px] md:max-w-[350px] mx-auto relative rounded-[12px] p-6 md:p-8 flex flex-col text-center transition-all duration-250 ease-out h-full min-h-[720px] ${
        highlighted
          ? `border-[2.5px] border-[#007AFF] shadow-[0_20px_40px_rgba(0,122,255,0.15)] scale-[1.02] lg:scale-105 z-10 p-6 md:p-10 rounded-[14px] min-h-[740px] ${isDark ? "bg-gray-900" : "bg-white"}`
          : `shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white/80 backdrop-blur-sm border border-black/[0.04]"}`
      }`}
    >
      {badge && (
        <div className={`absolute -top-[16px] left-1/2 -translate-x-1/2 z-20`}>
          <div className="bg-[#007AFF] text-white px-4 py-1.5 rounded-full text-[12px] font-bold tracking-[0.8px] shadow-[0_4px_12px_rgba(0,122,255,0.3)] uppercase whitespace-nowrap">
            {badge}
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        <div
          className={`flex justify-center mb-6 ${
            highlighted
              ? "text-[#007AFF] drop-shadow-[0_4px_8px_rgba(0,122,255,0.3)]"
              : isDark
                ? "text-gray-500"
                : "text-black/40"
          }`}
        >
          {highlighted ? (
            <div className="w-[48px] h-[48px] flex items-center justify-center">
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<any>, {
                    size: 48,
                  })
                : icon}
            </div>
          ) : (
            <div className="w-[40px] h-[40px] flex items-center justify-center">
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<any>, {
                    size: 40,
                  })
                : icon}
            </div>
          )}
        </div>

        <h3
          className={`${
            highlighted
              ? "text-[22pt] md:text-[26pt]"
              : "text-[24pt] md:text-[32px]"
          } font-bold mb-2 ${isDark ? "text-white" : "text-[#1d1d1f]"}`}
          style={{
            fontFamily:
              "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {title}
        </h3>
        <p
          className={`${
            highlighted ? "text-[14px]" : "text-[14px] md:text-[18px]"
          } font-normal mb-8 ${isDark ? "text-gray-400" : "text-black/50"}`}
          style={{
            fontFamily:
              "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {subtitle}
        </p>

        {highlighted && (
          <div className="inline-block mx-auto mb-8 px-4 py-2 bg-[#007AFF]/10 rounded-[8px] border border-[#007AFF]/10">
            <span
              className="text-[12pt] md:text-[14pt] font-bold text-[#007AFF]"
              style={{
                fontFamily:
                  "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Economize 20% agora
            </span>
          </div>
        )}

        <div className={`${highlighted ? "mb-10" : "mb-8"}`}>
          {oldPrice && (
            <div className="flex items-center justify-center gap-2 mb-1">
              <span
                className={`text-[14pt] md:text-[16pt] line-through ${isDark ? "text-gray-600" : "text-black/30"}`}
                style={{
                  fontFamily:
                    "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {oldPrice}
              </span>
            </div>
          )}
          <div className="flex items-baseline justify-center">
            <span
              className={`${
                highlighted
                  ? "text-[26pt] md:text-[34pt]"
                  : "text-[20pt] md:text-[32pt]"
              } font-bold mr-1 ${highlighted ? "text-[#007AFF]" : isDark ? "text-gray-500" : "text-black/40"}`}
              style={{
                fontFamily:
                  "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              {pricePrefix}
            </span>
            <span
              className={`${
                highlighted
                  ? "text-[44pt] md:text-[60pt] font-black"
                  : "text-[36pt] md:text-[64px] font-bold"
              } leading-none ${highlighted ? "text-[#007AFF]" : isDark ? "text-white" : "text-[#1d1d1f]"}`}
              style={{
                fontFamily:
                  "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              {priceMain}
            </span>
            {priceDecimal && (
              <span
                className={`${
                  highlighted
                    ? "text-[30pt] md:text-[42pt]"
                    : "text-[20pt] md:text-[42pt]"
                } font-bold leading-none ${highlighted ? "text-[#007AFF]" : isDark ? "text-white" : "text-[#1d1d1f]"}`}
                style={{
                  fontFamily:
                    "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {priceDecimal}
              </span>
            )}
            {priceSuffix && (
              <span
                className={`${
                  highlighted
                    ? "text-[16pt] md:text-[20pt]"
                    : "text-[14pt] md:text-[18pt]"
                } font-medium ml-1 ${isDark ? "text-gray-500" : "text-black/40"}`}
                style={{
                  fontFamily:
                    "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {priceSuffix}
              </span>
            )}
          </div>
          {billingCycleInfo && (
            <p
              className={`${
                highlighted
                  ? "text-[11pt] md:text-[13pt]"
                  : "text-[11pt] md:text-[13pt]"
              } font-medium mt-3 ${isDark ? "text-gray-500" : "text-black/40"}`}
              style={{
                fontFamily:
                  "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              {billingCycleInfo}
            </p>
          )}
          {!billingCycleInfo && !highlighted && (
            <p
              className={`text-[14px] md:text-[17px] font-medium mt-1 ${isDark ? "text-gray-500" : "text-black/40"}`}
              style={{
                fontFamily:
                  "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Para sempre
            </p>
          )}
        </div>

        <div
          className={`space-y-[12px] text-left ${highlighted ? "mb-10" : "mb-10"} flex-grow`}
        >
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className={`flex-shrink-0 ${
                  highlighted ? "w-[34px] h-[34px]" : "w-[32px] h-[32px]"
                } rounded-full flex items-center justify-center shadow-sm transition-all duration-300`}
                style={{
                  backgroundColor: benefit.color
                    ? `${benefit.color}15`
                    : "#34C75915",
                  color: benefit.color || "#34C759",
                }}
              >
                {benefit.icon}
              </div>
              <span
                className={`text-[14.5px] leading-tight ${
                  highlighted
                    ? `font-semibold ${isDark ? "text-white" : "text-[#1d1d1f]"}`
                    : `font-medium ${isDark ? "text-gray-300" : "text-black/60"}`
                }`}
                style={{
                  fontFamily:
                    "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {benefit.text}
              </span>
            </div>
          ))}
        </div>

        {buttonVariant === "outline" ? (
          <a
            href={buttonLink}
            onClick={onButtonClick}
            className={`h-[46px] w-full bg-transparent border-2 border-[#5856D6]/40 text-[#5856D6] font-semibold text-[15px] rounded-[10px] transition-all duration-200 flex items-center justify-center active:scale-[0.98] ${isDark ? "hover:bg-[#5856D6]/[0.12]" : "hover:bg-[#5856D6]/[0.05]"}`}
            style={{
              fontFamily:
                "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            {buttonText}
          </a>
        ) : highlighted ? (
          <a
            href={buttonLink}
            onClick={onButtonClick}
            className="h-[52px] w-full bg-[#007AFF] text-white font-bold text-[17px] rounded-[12px] shadow-[0_8px_20px_rgba(0,122,255,0.4)] hover:bg-[#0051D5] hover:shadow-[0_12px_28px_rgba(0,122,255,0.5)] transition-all duration-200 flex items-center justify-center active:scale-[0.97]"
            style={{
              fontFamily:
                "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            {buttonText}
          </a>
        ) : (
          <button
            onClick={onButtonClick}
            className={`h-[46px] w-full font-semibold text-[15px] rounded-[10px] transition-all duration-200 flex items-center justify-center active:scale-[0.98] ${isDark ? "bg-white/[0.07] border border-white/[0.12] text-gray-400 hover:bg-white/[0.12]" : "bg-black/[0.03] border border-black/[0.08] text-black/50 hover:bg-black/[0.06]"}`}
            style={{
              fontFamily:
                "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            {buttonText}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export { PricingCard };

import { Skeleton } from "@/components/ui/skeleton";

interface PricingPlansProps {
  loading: boolean;
  onPlanClick: (e: React.MouseEvent<any>) => void;
  isDark?: boolean;
}

/** Item de `/api/plans` — preço resolvido na Stripe. */
interface PlanPricing {
  id: string;
  amountCents: number;
  billingMode: "payment" | "subscription";
  interval: "month" | "year" | null;
  monthlyEquivalentCents: number;
}

/** Quebra um valor em reais nas partes inteira e decimal usadas pelo card. */
function splitPreco(reais: number): { main: string; decimal: string } {
  const [main, decimal] = reais.toFixed(2).split(".");
  return { main, decimal: `,${decimal}` };
}

export const PricingPlans: React.FC<PricingPlansProps> = ({
  loading,
  onPlanClick,
  isDark = false,
}) => {
  // Os preços exibidos precisam ser os mesmos que a Stripe vai cobrar; os literais
  // abaixo são apenas fallback caso a rota falhe.
  const [pricing, setPricing] = useState<PlanPricing[] | null>(null);

  useEffect(() => {
    let cancelado = false;

    fetch("/api/plans")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("falha"))))
      .then((data) => {
        if (!cancelado && Array.isArray(data?.plans)) setPricing(data.plans);
      })
      .catch((error) => console.error("Não foi possível carregar os preços:", error));

    return () => {
      cancelado = true;
    };
  }, []);

  const stripeAnual = pricing?.find((p) => p.id === "anual");
  const stripeMensal = pricing?.find((p) => p.id === "mensal");

  const anualEquivalenteMes = stripeAnual ? stripeAnual.monthlyEquivalentCents / 100 : 41.5;
  const anualTotal = stripeAnual ? stripeAnual.amountCents / 100 : 497;
  const mensalTotal = stripeMensal ? stripeMensal.amountCents / 100 : 50;

  const anualPreco = splitPreco(anualEquivalenteMes);
  const mensalPreco = splitPreco(mensalTotal);

  // Preço "de" é o custo de 12 meses no plano mensal; só faz sentido se for maior.
  const anualSemDesconto = mensalTotal * 12;
  const anualOldPrice =
    anualSemDesconto > anualTotal ? `R$ ${anualSemDesconto.toFixed(2)}` : undefined;

  const anualCicloInfo =
    stripeAnual?.billingMode === "payment"
      ? `Pago anualmente (R$ ${anualTotal.toFixed(2)} à vista)`
      : `Pago anualmente (R$ ${anualTotal.toFixed(2)}, renova todo ano)`;

  const mensalCicloInfo =
    stripeMensal?.billingMode === "payment"
      ? "Cobrança única de 1 mês"
      : "Cancele quando quiser";

  const plansData = [
    {
      title: "Gratuito",
      subtitle: "Para começar a explorar",
      priceMain: "0",
      icon: <Gift className="text-gray-700" size={48} />,
      benefits: [
        {
          icon: <Rocket className="w-full h-full p-1.5" />,
          text: "Acesso ilimitado a simulados",
        },
        {
          icon: <Library className="w-full h-full p-1.5" />,
          text: "Biblioteca de provas",
        },
        {
          icon: <Activity className="w-full h-full p-1.5" />,
          text: "Estatística em tempo real",
        },
      ],
      buttonText: "Começar Grátis",
      buttonLink: "/library",
      buttonVariant: "secondary" as const,
      onButtonClick: undefined,
      delay: 0,
    },
    {
      title: "Simula Pro Anual",
      subtitle: "Treine como um profissional",
      highlighted: true,
      badge: "Mais Popular",
      oldPrice: anualOldPrice,
      priceMain: anualPreco.main,
      priceDecimal: anualPreco.decimal,
      priceSuffix: "/mês",
      billingCycleInfo: anualCicloInfo,
      icon: <Crown />,
      benefits: [
        {
          icon: <Rocket className="w-full h-full p-1.5" />,
          color: "#5856D6",
          text: "Acesso ilimitado a simulados",
        },
        {
          icon: <Library className="w-full h-full p-1.5" />,
          color: "#007AFF",
          text: "Biblioteca de provas",
        },
        {
          icon: <Activity className="w-full h-full p-1.5" />,
          color: "#34C759",
          text: "Estatística em tempo real",
        },
        {
          icon: <GraduationCap className="w-full h-full p-1.5" />,
          color: "#FF3B30",
          text: "Consulta de notas de corte",
        },
        {
          icon: <Headset className="w-full h-full p-1.5" />,
          color: "#FF9500",
          text: "Suporte prioritário 24/7",
        },
      ],
      buttonText: "Assinar Plano Anual",
      buttonLink: "/paidPlan",
      buttonVariant: "primary" as const,
      onButtonClick: onPlanClick,
      delay: 0.1,
    },
    {
      title: "Simula Pro Mensal",
      subtitle: "Flexibilidade total",
      priceMain: mensalPreco.main,
      priceDecimal: mensalPreco.decimal,
      priceSuffix: "/mês",
      billingCycleInfo: mensalCicloInfo,
      icon: <Gem className="text-gray-700" size={48} />,
      benefits: [
        {
          icon: <Rocket className="w-full h-full p-1.5" />,
          color: "#5856D6",
          text: "Acesso ilimitado a simulados",
        },
        {
          icon: <Library className="w-full h-full p-1.5" />,
          color: "#007AFF",
          text: "Biblioteca de provas",
        },
        {
          icon: <Activity className="w-full h-full p-1.5" />,
          color: "#34C759",
          text: "Estatística em tempo real",
        },
        {
          icon: <GraduationCap className="w-full h-full p-1.5" />,
          color: "#FF3B30",
          text: "Consulta de notas de corte",
        },
        {
          icon: <Headset className="w-full h-full p-1.5" />,
          color: "#FF9500",
          text: "Suporte prioritário 24/7",
        },
      ],
      buttonText: "Assinar Agora",
      buttonLink: "/paidPlan",
      buttonVariant: "outline" as const,
      onButtonClick: onPlanClick,
      delay: 0.2,
    },
  ];

  if (loading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-96 rounded-2xl" />
        ))}
      </>
    );
  }

  return (
    <>
      {plansData.map((plan, index) => (
        <PricingCard key={index} {...plan} isDark={isDark} />
      ))}
    </>
  );
};

export default PricingCard;
