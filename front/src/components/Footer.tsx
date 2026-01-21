"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function Footer() {
  const { data: session } = useSession();
  const userTier = session?.user?.tier ?? 'FREE';

  return (
    <footer className="relative footer-themed border-t themed-border backdrop-blur-xl">
      <div className="container mx-auto px-6 py-16 relative">
        {/* Background decorativo */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Coluna 1: Logo e Descrição */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-6">
            <Link href="/" className="group flex items-center mb-6 hover:scale-105 transition-all duration-300 w-fit">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                <Image src="/favicon.ico" alt="Vestibuline Logo" width={48} height={48} className="relative z-10" />
              </div>
              <span className="themed-logo-gradient font-bold text-2xl ml-3 group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-cyan-500 transition-all duration-300">
                Vestibuline
              </span>
            </Link>
            <p className="themed-text-secondary text-base leading-relaxed max-w-sm">
              🚀 Sua plataforma completa para <span className="font-semibold text-blue-600 dark:text-blue-400">dominar os estudos</span> e garantir a aprovação no vestibular! ✨
            </p>
          </div>

          {/* Coluna 2: Links da Plataforma */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg themed-text flex items-center gap-2">
              📚 <span>Plataforma</span>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/library" className="group inline-flex items-center themed-text-secondary hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-all duration-300 hover:translate-x-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 group-hover:bg-purple-500 transition-colors duration-300"></span>
                  Biblioteca
                </Link>
              </li>
              {userTier !== "Simula PRO" && (
                <li>
                  <Link href="/paidPlan" className="group inline-flex items-center themed-text-secondary hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-all duration-300 hover:translate-x-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 group-hover:bg-purple-500 transition-colors duration-300"></span>
                    Planos
                  </Link>
                </li>
              )}
              <li>
                <Link href="/blog" className="group inline-flex items-center themed-text-secondary hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-all duration-300 hover:translate-x-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 group-hover:bg-purple-500 transition-colors duration-300"></span>
                  News
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Empresa */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg themed-text flex items-center gap-2">
              🏢 <span>Empresa</span>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/#about" className="group inline-flex items-center themed-text-secondary hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-all duration-300 hover:translate-x-1">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3 group-hover:bg-cyan-500 transition-colors duration-300"></span>
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contato" className="group inline-flex items-center themed-text-secondary hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-all duration-300 hover:translate-x-1">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3 group-hover:bg-cyan-500 transition-colors duration-300"></span>
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Legal */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg themed-text flex items-center gap-2">
              ⚖️ <span>Legal</span>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="group inline-flex items-center themed-text-secondary hover:text-cyan-600 dark:hover:text-cyan-400 text-sm font-medium transition-all duration-300 hover:translate-x-1">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-3 group-hover:bg-blue-500 transition-colors duration-300"></span>
                  Termos de Serviço
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="group inline-flex items-center themed-text-secondary hover:text-cyan-600 dark:hover:text-cyan-400 text-sm font-medium transition-all duration-300 hover:translate-x-1">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-3 group-hover:bg-blue-500 transition-colors duration-300"></span>
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative mt-16 pt-8 border-t themed-border">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <p className="themed-text-secondary text-sm font-medium">
              © 2025 <span className="font-bold themed-text">Vestibuline</span>. Todos os direitos reservados. 💙
            </p>
            
            {/* Redes sociais com animações aprimoradas */}
            <div className="flex items-center gap-4">
              <span className="themed-text-secondary text-sm font-medium mr-2 animate-pulse">Siga-nos:</span>
              <div className="flex gap-3">
                {/* Instagram */}
                <a href="https://instagram.com/vestibuline" target="_blank" rel="noopener noreferrer" aria-label="Instagram" 
                   className="group relative p-2.5 themed-card-bg themed-border rounded-lg overflow-hidden transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20">
                  {/* Efeito de brilho */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  {/* Efeito de ondas */}
                  <div className="absolute inset-0 rounded-lg bg-pink-500 opacity-0 group-hover:opacity-20 scale-0 group-hover:scale-100 transition-all duration-500"></div>
                  {/* Partículas flutuantes */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" 
                       className="relative z-10 themed-text-secondary group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-all duration-300 group-hover:rotate-12" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
                  </svg>
                </a>
                
                {/* Twitter/X */}
                <a href="https://x.com/vestibuline" target="_blank" rel="noopener noreferrer" aria-label="Twitter" 
                   className="group relative p-2.5 themed-card-bg themed-border rounded-lg overflow-hidden transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 rounded-lg bg-blue-500 opacity-0 group-hover:opacity-20 scale-0 group-hover:scale-100 transition-all duration-500"></div>
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" 
                       className="relative z-10 themed-text-secondary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 group-hover:-rotate-12" viewBox="0 0 16 16">
                    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
                  </svg>
                </a>
                
                {/* Discord */}
                <a href="https://discord.gg/GZZjDKNk" target="_blank" rel="noopener noreferrer" aria-label="Discord" 
                   className="group relative p-2.5 themed-card-bg themed-border rounded-lg overflow-hidden transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 rounded-lg bg-indigo-500 opacity-0 group-hover:opacity-20 scale-0 group-hover:scale-100 transition-all duration-500"></div>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" 
                       className="relative z-10 themed-text-secondary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-300 group-hover:rotate-6" viewBox="0 0 16 16">
                    <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
                  </svg>
                </a>
                
                {/* TikTok */}
                <a href="https://www.tiktok.com/@vestibuline" target="_blank" rel="noopener noreferrer" aria-label="TikTok" 
                   className="group relative p-2.5 themed-card-bg themed-border rounded-lg overflow-hidden transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-500/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 rounded-lg bg-gray-600 opacity-0 group-hover:opacity-20 scale-0 group-hover:scale-100 transition-all duration-500"></div>
                  <div className="absolute top-0 left-1/2 w-1 h-1 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300 transform -translate-x-1/2"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" 
                       className="relative z-10 themed-text-secondary group-hover:text-gray-800 dark:group-hover:text-gray-300 transition-all duration-300 group-hover:scale-110" viewBox="0 0 16 16">
                    <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
                  </svg>
                </a>
                
                {/* YouTube */}
                <a href="https://www.youtube.com/@vestibuline" target="_blank" rel="noopener noreferrer" aria-label="YouTube" 
                   className="group relative p-2.5 themed-card-bg themed-border rounded-lg overflow-hidden transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 rounded-lg bg-red-500 opacity-0 group-hover:opacity-20 scale-0 group-hover:scale-100 transition-all duration-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300"></div>
                  <div className="absolute -top-1 -right-1 w-1 h-1 bg-red-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300 delay-150"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" 
                       className="relative z-10 themed-text-secondary group-hover:text-red-600 dark:group-hover:text-red-400 transition-all duration-300 group-hover:-rotate-6" viewBox="0 0 16 16">
                    <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}