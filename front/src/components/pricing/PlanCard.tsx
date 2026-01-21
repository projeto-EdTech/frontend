"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Check, ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface Benefit {
  texto: string;
  icone: ReactNode;
  color: string;
}

interface PlanCardProps {
  id: string;
  nome: string;
  descricao: string;
  precoMensal: number;
  precoTotal: number;
  desconto?: string;
  beneficios: Benefit[];
  popular: boolean;
  isSelected: boolean;
  mascoteImage?: string;
  onSelect: () => void;
}

const APPLE_SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };
const FADE_UP = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] as const },
};

export default function PlanCard({
  id,
  nome,
  descricao,
  precoMensal,
  precoTotal,
  desconto,
  beneficios,
  popular,
  isSelected,
  mascoteImage,
  onSelect,
}: PlanCardProps) {
  return (
    <motion.div
      variants={FADE_UP}
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`relative cursor-pointer transition-shadow duration-500 rounded-3xl ${
        isSelected ? "shadow-2xl" : "shadow-md hover:shadow-xl"
      }`}
      onClick={onSelect}
    >
      {/* Badge de Popular */}
      {popular && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, ...APPLE_SPRING }}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white px-6 py-2 rounded-full text-xs font-semibold shadow-lg uppercase tracking-wide" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            ⭐ MAIS POPULAR
          </div>
        </motion.div>
      )}

      <div
        className={`relative rounded-3xl p-8 h-full flex flex-col bg-white overflow-hidden transition-all duration-500 ${
          isSelected
            ? "ring-2 ring-[#0071e3]"
            : "ring-1 ring-[#d2d2d7]"
        }`}
      >
        {/* Gradiente sutil no selecionado */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/5 to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Mascote no card */}
        {mascoteImage && (
          <div className="absolute -top-0 -right-0 z-20 hidden md:block">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={APPLE_SPRING}
            >
              <Image
                src={mascoteImage}
                alt="Mascote plano"
                width={90}
                height={90}
                className="drop-shadow-2xl"
              />
            </motion.div>
          </div>
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-semibold text-gray-700 mb-2"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              {nome}
            </motion.h3>
            <p className="text-[#86868b] mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              {descricao}
            </p>

            {/* Desconto Badge */}
            {desconto && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, ...APPLE_SPRING }}
                className="inline-flex items-center bg-[#d1f4e0] text-[#007a3d] px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                💰 {desconto}
              </motion.div>
            )}

            {/* Preço */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-4"
            >
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                  R$ {precoMensal.toFixed(2)}
                </span>
                <span className="text-lg text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                  /mês
                </span>
              </div>
              <p className="text-sm text-[#86868b] mt-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                {id === "anual"
                  ? `R$ ${precoTotal.toFixed(2)} cobrado em parcela única`
                  : "Cobrança mensal, cancele quando quiser"}
              </p>
            </motion.div>
          </div>

          {/* Benefícios */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.2,
                },
              },
            }}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-3 mb-8 flex-grow"
          >
            {beneficios.map((beneficio, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="flex items-center gap-3 group/item"
              >
                <motion.div
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover/item:scale-110 shadow-sm border border-black/5"
                  style={{ backgroundColor: `${beneficio.color}15`, color: beneficio.color }}
                  whileHover={{ scale: 1.1 }}
                >
                  {beneficio.icone}
                </motion.div>
                <span className="text-gray-700 text-[14.5px] font-medium leading-tight" style={{ fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  {beneficio.texto}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Botão de Seleção */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={APPLE_SPRING}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-300 ${
              isSelected
                ? "bg-[#0071e3] text-white shadow-md hover:bg-[#0077ed]"
                : "bg-[#f5f5f7] text-gray-700 hover:bg-[#e8e8ed]"
            }`}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            {isSelected ? (
              <span className="flex items-center justify-center">
                <Check className="w-5 h-5 mr-2" />
                Selecionado
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Selecionar Plano
                <ArrowRight className="w-5 h-5 ml-2" />
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
