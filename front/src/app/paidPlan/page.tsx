import { Suspense } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PricingDataServer } from "@/components/pricing/PricingDataServer";
import { PricingSkeleton } from "@/components/Skeletons/PricingSkeleton";
import { Sparkles, Check, Clock, Shield } from "lucide-react";
import Image from 'next/image';

/**
 * CACHE STRATEGY: ISR - revalidate 3600s
 * Motivo: Os planos de preço não mudam com frequência, mas devem ser atualizados sem deploy.
 */
export const revalidate = 3600;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />
      
      {/* Hero Section - Deliver immediately */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0071e3] to-[#005bb5]">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="absolute inset-0 backdrop-blur-3xl"></div>
        
        {/* Mascotes - LCP considerations */}
        <div className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 hidden md:block transition-transform duration-700 hover:scale-110">
          <Image 
            src="/Mascote/banners/Camaleão_13.png" 
            alt="Mascote Vestibuline" 
            width={180} 
            height={180}
            className="drop-shadow-2xl"
            priority
          />
        </div>

        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 hidden md:block transition-transform duration-700 hover:scale-110">
          <Image 
            src="/Mascote/banners/Camaleão_19.png" 
            alt="Mascote Vestibuline" 
            width={220} 
            height={220}
            className="drop-shadow-2xl"
            priority
          />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center text-white">
          <div className="inline-flex items-center px-5 py-2.5 bg-white/15 backdrop-blur-xl rounded-full text-sm font-semibold mb-8 border border-white/20 shadow-lg">
            <Sparkles className="w-4 h-4 mr-2" />
            Oferta Limitada no plano anual - 17% OFF
          </div>
          
          <h1 className="text-5xl md:text-7xl font-semibold mb-6 tracking-tight">
            Evolua Sua Preparação para o Vestibular
          </h1>
          
          <p className="text-xl md:text-2xl font-light mb-10 max-w-3xl mx-auto leading-relaxed">
            Transforme sua preparação com inteligência artificial e alcance seus objetivos mais rápido
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Mais de 50,000 questões</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Acesso imediato</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Garantia de 7 dias</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto py-16 px-6">
        {/* Suspense handles the streaming of plan data */}
        <Suspense fallback={<PricingSkeleton />}>
          <PricingDataServer />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}