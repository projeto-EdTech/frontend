"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Zap, Brain, Crown, ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface PremiumFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  featureDescription?: string;
}

export default function PremiumFeatureModal({ 
  isOpen, 
  onClose, 
  featureName = "VestIA",
  featureDescription = "Seu tutor de IA personalizado"
}: PremiumFeatureModalProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleUpgrade = () => {
    router.push("/paidPlan");
    onClose();
  };

  if (!mounted || !isOpen) return null;

  const benefits = [
    { icon: Brain, text: "IA avançada para tirar dúvidas 24/7" },
    { icon: Zap, text: "Respostas instantâneas e personalizadas" },
    { icon: Sparkles, text: "Análise de arquivos e imagens" },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(8px)" }}
    >
      {/* Modal Container - macOS Style */}
      <div 
        className="relative w-full max-w-lg mx-4 animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glassmorphism Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-2xl shadow-2xl border border-white/20">
          
          {/* Gradient Background Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
          </div>
          {/* Content */}
          <div className="relative z-10 p-8 pt-6">
            
            {/* Header with Mascot */}
            <div className="text-center mb-6">
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-4">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                  Recurso Premium
                </span>
              </div>

              {/* Mascot */}
              <div className="relative w-28 h-28 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-2xl" />
                <Image
                  src="/Mascote/banners/Camaleão_6.png"
                  alt="Mascote Vestibuline"
                  fill
                  className="object-contain drop-shadow-xl relative z-10"
                  priority
                />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                {featureName}
              </h2>
              <p className="text-base text-gray-600 font-medium">
                {featureDescription}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6" />

            {/* Info Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 mb-6 border border-gray-200/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Desbloqueie o poder da IA
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    O VestIA é exclusivo para assinantes do plano <span className="font-semibold text-purple-600">Simula PRO</span>. 
                    Tenha acesso ilimitado ao seu tutor pessoal de IA.
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {benefit.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="space-y-3">
              {/* Primary CTA */}
              <button
                onClick={handleUpgrade}
                className="group relative w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-base transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] overflow-hidden cursor-pointer"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5" />
                  <span>Fazer Upgrade para Simula PRO</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>

              {/* Secondary action */}
              <button
                onClick={() => {
                  onClose();
                  router.push("/");
                }}
                className="w-full py-3 px-6 rounded-xl text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors duration-200 hover:bg-gray-200 cursor-pointer"
              >
                Talvez mais tarde
              </button>
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-gray-500 mt-4">
              Cancele quando quiser • Sem compromisso
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
