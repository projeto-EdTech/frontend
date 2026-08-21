"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
} from "lucide-react";

export interface RecentExam {
  name: string;
  date: string;
  score: number;
  logo?: string;
  totalQuestions?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  timeUsed?: number;
  accuracy?: number;
}

function formatTime(seconds: number): string {
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")} min`;
  }
  const totalMins = Math.floor(seconds / 60);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return `${hours}:${mins.toString().padStart(2, "0")} h`;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  colorClass: string;
  iconBg: string;
  mascote: string;
}

function StatCard({
  icon,
  value,
  label,
  colorClass,
  iconBg,
  mascote,
}: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 border ${colorClass} flex flex-col items-center gap-2`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1 ${iconBg}`}
      >
        {icon}
      </div>
      <span className="text-2xl font-black tabular-nums">{value}</span>
      <span className="text-xs font-semibold text-center leading-tight opacity-80">
        {label}
      </span>
      <div className="absolute -bottom-2 -right-2 opacity-25 pointer-events-none">
        <Image
          src={mascote}
          alt=""
          width={64}
          height={64}
          className="w-16 h-16 object-contain"
        />
      </div>
    </div>
  );
}

interface SimulationModalProps {
  exam: RecentExam;
  onClose: () => void;
}

export default function SimulationModal({
  exam,
  onClose,
}: SimulationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  const accuracy =
    exam.accuracy ??
    (exam.totalQuestions && exam.correctAnswers != null
      ? Math.round((exam.correctAnswers / exam.totalQuestions) * 100)
      : null);

  const statCards = [
    {
      icon: <FileText size={22} className="text-white" />,
      value: exam.totalQuestions ?? "—",
      label: "Total de Questões",
      colorClass: "bg-blue-50 border-blue-200 text-blue-900",
      iconBg: "bg-blue-500",
      mascote: "/Mascote/banners/Camaleão_5.png",
    },
    {
      icon: <CheckCircle2 size={22} className="text-white" />,
      value: exam.correctAnswers ?? "—",
      label: "Respostas Corretas",
      colorClass: "bg-green-50 border-green-200 text-green-900",
      iconBg: "bg-green-500",
      mascote: "/Mascote/banners/Camaleão_2.png",
    },
    {
      icon: <XCircle size={22} className="text-white" />,
      value: exam.incorrectAnswers ?? "—",
      label: "Respostas Incorretas",
      colorClass: "bg-red-50 border-red-200 text-red-900",
      iconBg: "bg-red-500",
      mascote: "/Mascote/banners/Camaleão_triste/Camaleão_1.png",
    },
    {
      icon: <Clock size={22} className="text-white" />,
      value: exam.timeUsed != null ? formatTime(exam.timeUsed) : "—",
      label: "Tempo Utilizado",
      colorClass: "bg-purple-50 border-purple-200 text-purple-900",
      iconBg: "bg-purple-500",
      mascote: "/Mascote/banners/Camaleão_9.png",
    },
    {
      icon: <TrendingUp size={18} className="text-white" />,
      value: accuracy != null ? `${accuracy}%` : "—",
      label: "Taxa de Acerto",
      colorClass: "bg-orange-50 border-orange-200 text-orange-900",
      iconBg: "bg-orange-500",
      mascote: "/Mascote/banners/Camaleão_1.png",
    },
  ];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[10000] overflow-y-auto bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full max-w-[680px] bg-[var(--card-bg)] backdrop-blur-3xl rounded-[28px] shadow-[0_32px_80px_rgba(0,0,0,0.18)] border border-[var(--border-color)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white text-gray-400 border border-gray-200 flex items-center justify-center hover:!bg-red-500/10 hover:!border-red-400/40 hover:!text-red-500 transition-all cursor-pointer"
          >
            <X size={14} />
          </button>

          {/* Header */}
          <div className="relative p-8 pb-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/6 to-indigo-500/6 pointer-events-none" />

            <div className="flex items-center gap-4 relative">
              <div className="relative w-18 h-18 rounded-2xl bg-white border border-[var(--border-color)] flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
                {exam.logo ? (
                  <Image
                    src={`/Logo_universidades/${exam.logo}`}
                    alt={exam.name}
                    fill
                    className="object-cover p-1"
                  />
                ) : (
                  <Trophy size={24} className="text-[var(--text-secondary)]" />
                )}
              </div>

              <div className="flex-1 min-w-0 pr-8">
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                  Simulado Concluído com Sucesso
                </h1>
                <p className="text-base text-[var(--text-secondary)] font-medium truncate mt-1">
                  {exam.name}
                </p>
                <p className="text-sm text-[var(--text-secondary)] opacity-60 mt-0.5">
                  {exam.date}
                </p>
              </div>
            </div>

            {/* Missão Cumprida badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="relative mt-5 flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-4 rounded-2xl shadow-md shadow-green-500/20"
            >
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold text-base leading-none">
                  Missão Cumprida!
                </p>
                <p className="text-green-100 text-sm leading-none mt-1">
                  Você demonstrou dedicação e foco
                </p>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="px-8 pb-8">
            <p className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] opacity-60 mb-4">
              📊 Resumo do Simulado
            </p>

            {exam.totalQuestions != null ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {statCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.15 + i * 0.06,
                      type: "spring",
                      stiffness: 260,
                      damping: 22,
                    }}
                    className={i === 4 ? "col-span-2 md:col-span-1" : ""}
                  >
                    <StatCard {...card} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-[var(--text-secondary)] opacity-60 mb-1">
                  Score obtido
                </p>
                <p className="text-5xl font-black text-green-500 tabular-nums">
                  {exam.score}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">pts</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>,
    document.body,
  );
}

export function SimulationModalWrapper({
  exam,
  onClose,
}: {
  exam: RecentExam | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {exam && <SimulationModal exam={exam} onClose={onClose} />}
    </AnimatePresence>
  );
}
