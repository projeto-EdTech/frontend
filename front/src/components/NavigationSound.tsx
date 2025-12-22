"use client";

import { useEffect, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationSound() {
  const pathname = usePathname();
  const isInitialRender = useRef(true);

  // Cria o objeto de áudio de forma otimizada com useMemo.
  // O arquivo deve estar na pasta /public da sua aplicação.
  const navigationSound = useMemo(() => {
    if (typeof window !== 'undefined') { // Garante que o objeto Audio só seja criado no cliente
      const sound = new Audio('/swoosh-sound-effect.mp3');
      sound.volume = 0.25; // Opcional: Ajuste o volume (de 0.0 a 1.0)
      return sound;
    }
    return null;
  }, []);

  // Hook que executa a lógica sempre que a URL (pathname) muda.
  useEffect(() => {
    // Na primeira vez que a página carrega, não toca o som.
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // Para todas as navegações seguintes, toca o som.
    if (navigationSound) {
      navigationSound.currentTime = 0; // Garante que o som toque do início, mesmo em cliques rápidos
      navigationSound.play().catch(error => {
        // Captura erros caso o navegador bloqueie a reprodução automática
        console.error("Erro ao reproduzir o som de navegação:", error);
      });
    }
    // A lista de dependências garante que este efeito rode apenas quando o pathname mudar.
  }, [pathname, navigationSound]);

  return null; // Este componente não possui interface visual.
}
