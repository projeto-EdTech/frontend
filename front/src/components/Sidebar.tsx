"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, Globe, Star, TrendingUp, Moon, Sun } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSession } from "next-auth/react";
import { useUserTier } from "@/hooks/useUserTier";
import { useUniversityStorage } from "@/contexts/UniversityStorage";

interface Country {
  name: string;
  flag: string;
  href: string;
  universities: number;
  isPopular: boolean;
  isAvailable: boolean;
  region: string;
  status: 'available' | 'coming-soon';
}

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const { tier, isPro } = useUserTier();
  const { universities } = useUniversityStorage();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Derivar a lista de países baseada nos dados do contexto
  const countries: Country[] = useMemo(() => [
    {
      name: "Brasil",
      flag: "/Brazil-flag.svg",
      href: "/library",
      universities: universities.length,
      isPopular: true,
      isAvailable: true,
      region: "América do Sul",
      status: 'available'
    },
    /* Outros países podem ser adicionados aqui */
  ], [universities]);

  const totalUniversities = universities.length;

  // Hook para detectar se é dispositivo móvel
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint do Tailwind
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Animações de entrada
  useEffect(() => {
    const visibilityTimer = setTimeout(() => setIsVisible(true), 100);
    
    return () => {
      clearTimeout(visibilityTimer);
    };
  }, []);


  // ==================================================================
  // 2. RETORNO ANTECIPADO (EARLY RETURN) VEM *APÓS* TODOS OS HOOKS
  // ==================================================================
  if (isMobile) {
    return null;
  }

  // ==================================================================
  // 3. O RESTANTE DA LÓGICA E FUNÇÕES DO COMPONENTE
  // ==================================================================
  const isDarkMode = theme === 'dark';

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(countryName);
  };

  const getStatusColor = (status: string) => {
    if (isDarkMode) {
      switch (status) {
        case 'available': return 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30';
        case 'coming-soon': return 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30';
        default: return 'bg-gray-500/20 text-gray-400 ring-1 ring-gray-500/30';
      }
    } else {
      switch (status) {
        case 'available': return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
        case 'coming-soon': return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
        default: return 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';
      }
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'coming-soon': return 'Em breve';
      default: return 'Indisponível';
    }
  };

  return (
    <>
      <aside className={`
        w-full md:w-80 lg:w-72 rounded-2xl backdrop-blur-2xl p-4 md:p-5 lg:p-6 
        sticky top-8 h-fit transition-all duration-300 hover:shadow-2xl
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isDarkMode 
          ? 'bg-gradient-to-br from-[#1c1c1e]/95 via-slate-900/95 to-blue-950/90 border border-blue-500/20 shadow-xl shadow-blue-900/30' 
          : 'bg-gradient-to-br from-white/95 via-blue-50/80 to-purple-50/70 border border-blue-200/40 shadow-lg shadow-blue-500/10'
        }
      `}>

        {/* Header com Branding - Clean macOS Style */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`
                w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center
                transition-all duration-300 hover:scale-110 hover:rotate-6 active:scale-95
                ${isDarkMode 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/40' 
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30'
                }
              `}>
                <Globe className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-180" />
              </div>
              <div>
                <h2 className={`
                  text-base md:text-lg font-semibold transition-colors duration-200
                  ${isDarkMode ? 'text-white' : 'text-gray-900'}
                `}>
                  Países
                </h2>
                <p className={`text-xs font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Escolha sua região de estudo
                </p>
              </div>
            </div>
            
            {/* Toggle Theme Button - macOS Style */}
            <button
              onClick={handleThemeToggle}
              className={`
                w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300
                hover:scale-110 hover:rotate-12 active:scale-95 cursor-pointer
                ${isDarkMode 
                  ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-yellow-400 hover:from-amber-500/30 hover:to-orange-500/30 ring-1 ring-amber-500/30' 
                  : 'bg-gradient-to-br from-amber-50 to-orange-50 text-orange-600 hover:from-amber-100 hover:to-orange-100 ring-1 ring-orange-200/50'
                }
              `}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-180" />
              ) : (
                <Moon className="w-4 h-4 transition-transform duration-300 hover:rotate-180" />
              )}
            </button>
          </div>
          
          {/* Separador sutil com gradiente */}
          <div className={`
            h-px bg-gradient-to-r
            ${isDarkMode 
              ? 'from-transparent via-blue-500/30 to-transparent' 
              : 'from-transparent via-blue-300/50 to-transparent'
            }
          `}></div>
        </div>

      {/* Estatísticas - macOS Card Style colorido */}
      <div className={`
        mb-5 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group relative overflow-hidden
        ${isDarkMode 
          ? 'bg-gradient-to-br from-blue-600/20 via-cyan-600/15 to-purple-600/20 hover:from-blue-600/30 hover:via-cyan-600/25 hover:to-purple-600/30 ring-1 ring-blue-500/30' 
          : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 hover:from-blue-100 hover:via-cyan-100 hover:to-purple-100 ring-1 ring-blue-200/40'
        }
      `}>
        {/* Efeito de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
        
        <div className="flex items-center justify-between gap-4 relative z-10">
          {/* Conteúdo à esquerda */}
          <div className="flex-1 text-left">
            <div className={`
              text-3xl md:text-4xl font-bold mb-0.5 leading-none bg-gradient-to-r bg-clip-text text-transparent
              ${isDarkMode 
                ? 'from-blue-300 via-cyan-300 to-purple-300' 
                : 'from-blue-600 via-cyan-600 to-purple-600'
              }
            `}>
              {totalUniversities}
            </div>
            <div className={`text-xs font-medium leading-tight ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Vestibulares<br />disponíveis
            </div>
          </div>
          
          {/* Mascote à direita */}
          <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 relative transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <Image 
              src="/Mascote/banners/Camaleão_15.png" 
              alt="Mascote Vestibuline" 
              width={80} 
              height={80} 
              className="object-contain w-full h-full drop-shadow-xl" 
              priority
            />
          </div>
        </div>
      </div>

      {/* Lista de Países */}
      <div className="space-y-2.5">
        {universities.length === 0 ? (
          // Loading Skeletons - macOS Style
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className={`
                  flex items-center gap-3 p-3.5 rounded-xl
                  ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}
                `}>
                  <div className={`w-10 h-8 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`}></div>
                  <div className="flex-1">
                    <div className={`h-3.5 rounded-lg w-3/4 mb-1.5 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`}></div>
                    <div className={`h-3 rounded-lg w-1/2 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`}></div>
                  </div>
                  <div className={`w-7 h-5 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          countries.map((country) => (
            country.isAvailable ? (
              <Link href={country.href} key={country.name}>
                <div
                  className={`
                    group/item p-3.5 rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden
                    hover:scale-[1.02] active:scale-[0.98]
                    ${selectedCountry === country.name 
                      ? isDarkMode
                        ? 'bg-gradient-to-r from-blue-600/30 via-purple-600/25 to-pink-600/30 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/30' 
                        : 'bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 ring-2 ring-blue-400/50 shadow-md shadow-blue-400/20'
                      : isDarkMode
                        ? 'bg-white/5 hover:bg-gradient-to-r hover:from-blue-600/20 hover:via-purple-600/15 hover:to-pink-600/20 ring-1 ring-white/10 hover:ring-blue-500/30'
                        : 'bg-gray-50/80 hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 ring-1 ring-gray-200/50 hover:ring-blue-300/50'
                    }
                  `}
                  onClick={() => handleCountryClick(country.name)}
                >
                  {/* Barra lateral colorida */}
                  <div className={`
                    absolute left-0 top-1/2 -translate-y-1/2 h-12 rounded-r-full transition-all duration-300
                    ${selectedCountry === country.name 
                      ? 'w-1.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500' 
                      : 'w-0 group-hover/item:w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400'
                    }
                  `}></div>
                  
                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/item:translate-x-full transition-transform duration-700 pointer-events-none"></div>
                  
                  <div className="flex items-center gap-3 relative z-10">
                    {/* Container da Bandeira */}
                    <div className="relative group/flag">
                      <div className={`
                        w-10 h-8 rounded-lg overflow-hidden transition-all duration-300 shadow-md
                        group-hover/flag:scale-110 group-hover/flag:rotate-3 group-hover/flag:shadow-lg
                        ${isDarkMode ? 'ring-1 ring-white/20' : 'ring-1 ring-black/10'}
                      `}>
                        <Image 
                          src={country.flag} 
                          alt={country.name} 
                          width={40} 
                          height={32} 
                          className="object-cover w-full h-full transition-transform duration-300 group-hover/flag:scale-105" 
                        />
                      </div>
                      {/* Badge Popular */}
                      {country.isPopular && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50 animate-pulse">
                          <Star className="w-2 h-2 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Nome e informações */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={`
                          font-semibold text-sm truncate transition-colors duration-300
                          ${isDarkMode ? 'text-white' : 'text-gray-900'}
                        `}>
                          {country.name}
                        </h3>
                        {country.isPopular && (
                          <TrendingUp className="w-3.5 h-3.5 text-orange-500 ml-1 transition-transform duration-300 group-hover/item:scale-110" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {country.region}
                        </p>
                        <span className={`
                          text-xs px-2.5 py-0.5 rounded-full font-semibold transition-all duration-300 group-hover/item:scale-105
                          ${isDarkMode 
                            ? 'text-blue-300 bg-blue-500/20 ring-1 ring-blue-500/30' 
                            : 'text-blue-700 bg-blue-100 ring-1 ring-blue-200'
                          }
                        `}>
                          {country.universities}
                        </span>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="mt-1.5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold transition-all duration-300 group-hover/item:scale-105 ${getStatusColor(country.status)}`}>
                          {getStatusText(country.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              // Países indisponíveis
              <div
                key={country.name}
                className={`
                  p-3.5 rounded-xl cursor-not-allowed opacity-50 transition-all duration-200
                  ${isDarkMode ? 'bg-white/5 ring-1 ring-white/10' : 'bg-gray-50 ring-1 ring-gray-200/50'}
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Container da Bandeira em grayscale */}
                  <div className="relative">
                    <div className={`w-10 h-8 rounded-lg overflow-hidden grayscale ${isDarkMode ? 'ring-1 ring-white/10' : 'ring-1 ring-black/5'}`}>
                      <Image 
                        src={country.flag} 
                        alt={country.name} 
                        width={40} 
                        height={32} 
                        className="object-cover w-full h-full" 
                      />
                    </div>
                    {/* Badge Popular desabilitado */}
                    {country.isPopular && (
                      <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-400'}`}>
                        <Star className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Nome e informações desabilitadas */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={`font-medium text-sm truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {country.name}
                      </h3>
                      {country.isPopular && (
                        <TrendingUp className={`w-3 h-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {country.region}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'text-gray-600 bg-white/5' : 'text-gray-400 bg-gray-200'}`}>
                        {country.universities}
                      </span>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(country.status)}`}>
                        {getStatusText(country.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))
        )}
      </div>

      {/* Separador com gradiente */}
      <div className="my-5 flex items-center gap-3">
        <div className={`
          flex-1 h-px bg-gradient-to-r
          ${isDarkMode 
            ? 'from-transparent via-blue-500/30 to-blue-500/30' 
            : 'from-transparent via-blue-300/50 to-blue-300/50'
          }
        `}></div>
        <span className={`text-xs font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          Em breve mais países 🌎
        </span>
        <div className={`
          flex-1 h-px bg-gradient-to-l
          ${isDarkMode 
            ? 'from-transparent via-blue-500/30 to-blue-500/30' 
            : 'from-transparent via-blue-300/50 to-blue-300/50'
          }
        `}></div>
      </div>


      {/* Call-to-Action Premium - macOS Style colorido */}
      {!isPro && (
        <div className={`
          p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group
          ${isDarkMode 
            ? 'bg-gradient-to-br from-purple-600/25 via-pink-600/20 to-violet-600/25 ring-1 ring-purple-500/40 shadow-lg shadow-purple-600/20' 
            : 'bg-gradient-to-br from-purple-100 via-pink-100 to-violet-100 ring-1 ring-purple-300/50 shadow-md shadow-purple-400/20'
          }
        `}>
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
          
          <div className="text-center relative z-10">
            <div className={`
              w-10 h-10 rounded-xl mx-auto mb-2.5 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12
              ${isDarkMode 
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-purple-600/50' 
                : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/40'
              }
            `}>
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <h4 className={`
              text-sm font-bold mb-1
              ${isDarkMode ? 'text-white' : 'text-gray-700'}
            `}>
              Acesso Premium ⭐
            </h4>
            <p className={`text-xs mb-3.5 font-medium ${isDarkMode ? 'text-purple-200' : 'text-purple-800'}`}>
              Desbloqueie todos os países e universidades
            </p>
            <Link href="/paidPlan">
              <button className={`
                w-full py-2.5 text-white text-xs font-bold rounded-xl
                transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] hover:shadow-lg relative overflow-hidden group/btn cursor-pointer
                ${isDarkMode 
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 hover:from-purple-500 hover:via-pink-500 hover:to-violet-500 shadow-md shadow-purple-600/40' 
                  : 'bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 hover:from-purple-600 hover:via-pink-600 hover:to-violet-600 shadow-sm shadow-purple-500/30'
                }
              `}>
                {/* Efeito de brilho no botão */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500"></div>
                <span className="relative z-10">Fazer Upgrade 🚀</span>
              </button>
            </Link>
          </div>
        </div>
      )}
    </aside>
    </>
  );
}