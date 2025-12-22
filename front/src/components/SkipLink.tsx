"use client";

import { useAccessibility } from '@/contexts/AccessibilityContext';
import { ArrowDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SkipLink() {
  const { settings } = useAccessibility();
  const [sections, setSections] = useState<HTMLElement[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // 1. Encontra todas as seções com ID quando o componente é montado
  useEffect(() => {
    // CORREÇÃO: Usamos um seletor mais específico para pegar apenas as seções principais.
    // O seletor 'main > div[id]' pega todas as divs com 'id' que são filhas diretas do <main>.
    const mainElement = document.querySelector('main');
    if (mainElement) {
        const sectionElements = Array.from(
            mainElement.querySelectorAll<HTMLElement>(':scope > div[id]')
        );
        // Adicionamos o próprio <main> como a primeira seção (id="inicio")
        setSections([mainElement, ...sectionElements]);
    }

  }, []);

  // 2. Ouve o scroll para saber em qual seção o usuário está
  useEffect(() => {
    if (sections.length === 0) return;

    const handleScroll = () => {
      let activeIndex = 0;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();
        // Se o topo da seção estiver visível na metade superior da tela, ela é a ativa.
        if (rect.top <= window.innerHeight / 2) {
          activeIndex = i;
          break;
        }
      }
      setCurrentSectionIndex(activeIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Chama uma vez para definir o estado inicial corretamente
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // 3. Função para pular para a próxima seção
  const handleSkipToNext = () => {
    const nextIndex = currentSectionIndex + 1;
    if (nextIndex < sections.length) {
      sections[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 4. Só renderiza o botão se a funcionalidade estiver ativa e houver uma próxima seção
  if (!settings.keyboardNav || sections.length === 0 || currentSectionIndex >= sections.length - 1) {
    return null;
  }

  const nextSectionName = sections[currentSectionIndex + 1]?.id || '';

  return (
    <button
      onClick={handleSkipToNext}
      className="keyboard-nav-button"
      aria-label={`Pular para a próxima seção: ${nextSectionName}`}
    >
      <ArrowDown size={20} />
      <span>
        Pular para <strong>{nextSectionName}</strong>
      </span>
    </button>
  );
}

