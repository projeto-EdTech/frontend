"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationSound() {
  const pathname = usePathname();
  const isInitialRender = useRef(true);

  // Guarda o objeto de áudio num ref: o React Compiler proíbe mutar (currentTime)
  // um valor vindo de useMemo. O arquivo deve estar na pasta /public da aplicação.
  const navigationSound = useRef<HTMLAudioElement | null>(null);

  // Cria o áudio uma única vez, só no cliente, na montagem.
  useEffect(() => {
    const sound = new Audio('/swoosh-sound-effect.mp3');
    sound.volume = 0.25; // Opcional: Ajuste o volume (de 0.0 a 1.0)
    navigationSound.current = sound;
  }, []);

  // Hook que executa a lógica sempre que a URL (pathname) muda.
  useEffect(() => {
    // Na primeira vez que a página carrega, não toca o som.
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // Para todas as navegações seguintes, toca o som.
    const sound = navigationSound.current;
    if (sound) {
      sound.currentTime = 0; // Garante que o som toque do início, mesmo em cliques rápidos
      sound.play().catch(error => {
        // Captura erros caso o navegador bloqueie a reprodução automática
        console.error("Erro ao reproduzir o som de navegação:", error);
      });
    }
    // A lista de dependências garante que este efeito rode apenas quando o pathname mudar.
  }, [pathname]);

  return null; // Este componente não possui interface visual.
}
