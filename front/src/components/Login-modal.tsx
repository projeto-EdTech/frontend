"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { X } from "lucide-react"
import Image from "next/image"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  redirectTo?: string
}

export default function LoginModal({ isOpen, onClose, redirectTo }: LoginModalProps) {
  const [mounted, setMounted] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleLogin = async (provider: string) => {
    if (!agreed || loadingProvider) return
    setLoadingProvider(provider)
    try {
      const callbackUrl = redirectTo || `${window.location.pathname}?sync=1`;
      await signIn(provider, { callbackUrl });
    } finally {
      setLoadingProvider(null)
      onClose()
    }
  }

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div
        className="relative bg-white dark:backdrop-blur-md dark:bg-white w-full h-full sm:w-full sm:max-w-md sm:h-auto sm:max-h-[95vh] m-0 sm:mx-4 rounded-none sm:rounded-3xl border-0 sm:border border-gray-200 p-4 sm:p-6 xl:p-8 shadow-none sm:shadow-2xl shadow-gray-500/20 animate-in zoom-in-95 duration-300 transform scale-100 sm:scale-110 xl:scale-90 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col justify-center"
        onClick={(e) => e.stopPropagation()}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-red-500 hover:bg-red-100 rounded-full p-2 transition-all duration-300 z-50 cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="text-center relative z-10 w-full">
          
          {/* Mascote: Reduzido para w-40 (160px) no mobile para economizar altura */}
          <div className="flex justify-center mb-1 sm:mb-3 xl:mb-1">
            <div className="relative w-50 h-50 sm:w-35 sm:h-35 xl:w-[120px] xl:h-[120px] animate-in zoom-in duration-500">
              <Image
                src="/Mascote/banners/Camaleão_10.png"
                alt="Mascote SimulaVest"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Badge: Margens e paddings reduzidos no mobile */}
          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 sm:px-4 sm:py-2 xl:px-6 xl:py-2 rounded-full text-xs xl:text-sm font-semibold mb-2 sm:mb-4 xl:mb-1 shadow-lg shadow-purple-500/30 w-fit mx-auto">
            <span className="text-lg sm:text-lg xl:text-lg">🚀</span>
            <span>Bem-vindo ao SimulaVest</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-1 sm:mb-2 xl:mb-4">
            Faça Login
          </h2>
          
          <p className="text-gray-700 font-medium mb-3 sm:mb-4 text-md sm:text-sm xl:text-lg">
            Escolha sua forma preferida de entrar
          </p>

          {/* Grid: Gap reduzido de 3 para 2 no mobile */}
          <div className="grid grid-cols-1 gap-3 sm:gap-3 xl:gap-4 w-full">
            {/* Microsoft - Padding reduzido para p-3 no mobile */}
            <button
              onClick={() => handleLogin("azure-ad")}
              disabled={!agreed || loadingProvider === "azure-ad"}
              className="group relative overflow-hidden flex items-center justify-center gap-3 sm:gap-4 w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl sm:rounded-2xl p-3 sm:p-3.5 xl:p-5 shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-microsoft" viewBox="0 0 16 16">
                <path d="M7.462 0H0v7.19h7.462zM16 0H8.538v7.19H16zM7.462 8.211H0V16h7.462zm8.538 0H8.538V16H16z"/>
              </svg>
              <span className="text-md sm:text-sm xl:text-base font-semibold relative z-10">{loadingProvider === "azure-ad" ? "Entrando..." : "Continuar com Microsoft"}</span>
            </button>

            {/* Google */}
            <button
              onClick={() => handleLogin("google")}
              disabled={!agreed || loadingProvider === "google"}
              className="group relative overflow-hidden flex items-center justify-center gap-3 sm:gap-4 w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl sm:rounded-2xl p-3 sm:p-3.5 xl:p-5 shadow-lg shadow-red-500/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" viewBox="0 0 16 16">
                <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z"/>
              </svg>
              <span className="text-md sm:text-sm xl:text-base font-semibold relative z-10">{loadingProvider === "google" ? "Entrando..." : "Continuar com Google"}</span>
            </button>

            {/* Meta */}
            <button
              onClick={() => handleLogin("facebook")}
              disabled={!agreed || loadingProvider === "facebook"}
              className="group relative overflow-hidden flex items-center justify-center gap-3 sm:gap-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl sm:rounded-2xl p-3 sm:p-3.5 xl:p-5 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8.217 5.243C9.145 3.988 10.171 3 11.483 3 13.96 3 16 6.153 16.001 9.907c0 2.29-.986 3.725-2.757 3.725-1.543 0-2.395-.866-3.924-3.424l-.667-1.123-.118-.197a55 55 0 0 0-.53-.877l-1.178 2.08c-1.673 2.925-2.615 3.541-3.923 3.541C1.086 13.632 0 12.217 0 9.973 0 6.388 1.995 3 4.598 3q.477-.001.924.122c.31.086.611.22.913.407.577.359 1.154.915 1.782 1.714m1.516 2.224q-.378-.615-.727-1.133L9 6.326c.845-1.305 1.543-1.954 2.372-1.954 1.723 0 3.102 2.537 3.102 5.653 0 1.188-.39 1.877-1.195 1.877-.773 0-1.142-.51-2.61-2.87zM4.846 4.756c.725.1 1.385.634 2.34 2.001A212 212 0 0 0 5.551 9.3c-1.357 2.126-1.826 2.603-2.581 2.603-.777 0-1.24-.682-1.24-1.9 0-2.602 1.298-5.264 2.846-5.264q.137 0 .27.018"/>
              </svg>
              <span className="text-md sm:text-sm xl:text-base font-semibold relative z-10">{loadingProvider === "facebook" ? "Entrando..." : "Continuar com Meta"}</span>
            </button>

            {/* Discord */}
            <button
              onClick={() => handleLogin("discord")}
              disabled={!agreed || loadingProvider === "discord"}
              className="group relative overflow-hidden flex items-center justify-center gap-3 sm:gap-4 w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl sm:rounded-2xl p-3 sm:p-3.5 xl:p-5 shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-discord" viewBox="0 0 16 16">
                <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
              </svg>
              <span className="text-md sm:text-sm xl:text-base font-semibold relative z-10">{loadingProvider === "discord" ? "Entrando..." : "Continuar com Discord"}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-2 xl:mb-6 text-md xl:text-sm mt-3 sm:mt-4 xl:mt-6">
            <label htmlFor="terms-agreed" className="flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                id="terms-agreed"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="peer sr-only"
              />
              <span className="w-5 h-5 flex items-center justify-center rounded-md border-2 border-purple-500 bg-white dark:bg-gray-900 transition-all duration-200 peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 peer-checked:border-transparent shadow-sm peer-checked:shadow-[0_0_0_3px_rgba(168,85,247,0.15)]">
                <svg
                  className={`w-3 h-3 text-white transition-opacity duration-200 ${agreed ? "opacity-100" : "opacity-0"}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="ml-2 text-gray-700 dark:text-gray-400">
                Eu concordo com os{" "}
                <a href="/terms" target="_blank" className="font-semibold text-purple-600 hover:underline">
                  Termos
                </a>{" "}
                e{" "}
                <a href="/privacy" target="_blank" className="font-semibold text-purple-600 hover:underline">
                  Privacidade
                </a>
              </span>
            </label>
          </div>

          <div className="mt-3 sm:mt-4 xl:mt-8 flex items-center justify-center gap-3 text-xs xl:text-sm">
            <div className="relative">
              <div className="w-6 h-6 sm:w-8 sm:h-8 xl:w-10 xl:h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 dark:shadow-green-500/20">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 xl:w-5 xl:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <span className="bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent font-medium">
              Login 100% seguro
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}