import { useEffect, useState } from "react"

export function useIsMobile(query: string = "(max-width: 768px)"): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)

    // Define o estado inicial
    setIsMobile(mediaQuery.matches)

    // Adiciona um listener para mudanças
    const handler = (event: MediaQueryListEvent) => setIsMobile(event.matches)
    mediaQuery.addEventListener("change", handler)

    // Limpa o listener ao desmontar o componente
    return () => mediaQuery.removeEventListener("change", handler)
  }, [query])

  return isMobile
}