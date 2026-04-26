"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft, BookOpen, Trophy, Users, Sparkles, Gamepad2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      {/* Background decorativo - Elementos flutuantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
      </div>

      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full">
          
          {/* Grid Layout - Split em duas colunas no desktop */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Coluna Esquerda - Visual e Mascote */}
            <div className="flex flex-col items-center lg:items-end space-y-6">
              {/* Mascote com efeito de destaque */}
              <div className="relative">
                {/* Glow effect atrás do mascote */}
                <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-2xl scale-110" />
                
                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                  <Image
                    src="/Mascote/banners/Camaleão_34.png"
                    alt="Mascote Vestibuline"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>

              {/* Stats decorativos */}
              <div className="flex gap-3 flex-wrap justify-center">
                <div className="px-4 py-2 bg-white backdrop-blur-md rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-gray-700">+10k Questões</span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white backdrop-blur-md rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-gray-700">+50k Alunos</span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white backdrop-blur-md rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-gray-700">+100 Universidades</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita - Conteúdo e Ações */}
            <div className="flex flex-col space-y-8">
              
              {/* Título e descrição */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="text-7xl md:text-8xl lg:text-9xl font-semibold text-gray-900 leading-none tracking-tight">
                    404
                  </h1>
                  <div className="h-1 w-20 bg-blue-500 rounded-full" />
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight tracking-tight">
                  Ops! Página não encontrada
                </h2>

                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
                  Parece que você se perdeu no caminho dos estudos. A página que você procura não existe ou foi movida.
                </p>
              </div>

              {/* Card de dica motivacional */}
              <div className="relative group">
                <div className="relative bg-blue-50 backdrop-blur-xl border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold !text-gray-800 mb-1">Dica de Estudo</h3>
                      <p className="text-sm !text-gray-400 leading-relaxed">
                        Não desista! Assim como nos vestibulares, alguns caminhos podem ser diferentes, mas sempre há uma solução!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões principais */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/"
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/30 !text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Home className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Voltar para Home</span>
                </Link>

                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Voltar</span>
                </button>
              </div>

              {/* Links rápidos com grid */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gray-300" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acesso Rápido
                  </span>
                  <div className="h-px flex-1 bg-gray-300" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/library"
                    className="group p-4 bg-white backdrop-blur-sm rounded-lg border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
                  >
                    <BookOpen className="w-5 h-5 text-blue-500 mb-2 transition-transform duration-200" />
                    <div className="font-semibold text-sm text-gray-900">Simulados</div>
                    <div className="text-xs text-gray-600 mt-0.5">Pratique agora</div>
                  </Link>

                  <Link
                    href="/Arena"
                    className="group p-4 bg-white backdrop-blur-sm rounded-lg border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
                  >
                    <Gamepad2 className="w-5 h-5 text-blue-500 mb-2 transition-transform duration-200" />
                    <div className="font-semibold text-sm text-gray-900">Arena</div>
                    <div className="text-xs text-gray-600 mt-0.5">Estude Jogando</div>
                  </Link>

                  <Link
                    href="/profile"
                    className="group p-4 bg-white backdrop-blur-sm rounded-lg border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
                  >
                    <Users className="w-5 h-5 text-blue-500 mb-2 transition-transform duration-200" />
                    <div className="font-semibold text-sm text-gray-900">Meu Perfil</div>
                    <div className="text-xs text-gray-600 mt-0.5">Ver progresso</div>
                  </Link>

                  <Link
                    href="/blog"
                    className="group p-4 bg-white backdrop-blur-sm rounded-lg border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
                  >
                    <Sparkles className="w-5 h-5 text-blue-500 mb-2 transition-transform duration-200" />
                    <div className="font-semibold text-sm text-gray-900">Blog</div>
                    <div className="text-xs text-gray-600 mt-0.5">Dicas e novidades</div>
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center sm:text-left">
                  © {new Date().getFullYear()} Vestibuline · Prepare-se para os principais vestibulares
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
