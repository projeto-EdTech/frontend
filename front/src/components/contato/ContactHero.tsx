'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { staggerContainer } from './contactAnimations'

interface ContactHeroProps {
  isInView: boolean
}

export function ContactHero({ isInView }: ContactHeroProps) {
  const { theme } = useTheme()

  return (
    <motion.div
      className="text-center mb-16 md:mb-20 relative"
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
      variants={staggerContainer}
    >
      {/* Mascote esquerdo */}
      <motion.div
        className="hidden lg:block absolute -left-20 top-0 w-40 h-40"
        initial={{ opacity: 0, x: -100, rotate: -20 }}
        animate={isInView ? { opacity: 1, x: 0, rotate: 0 } : {}}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      >
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image
            src="/Mascote/banners/Camaleão_1.png"
            alt="Mascote Vestibuline"
            width={160}
            height={160}
            className="drop-shadow-2xl"
          />
        </motion.div>
      </motion.div>

      {/* Mascote direito */}
      <motion.div
        className="hidden lg:block absolute -right-20 top-10 w-36 h-36"
        initial={{ opacity: 0, x: 100, rotate: 20 }}
        animate={isInView ? { opacity: 1, x: 0, rotate: 0 } : {}}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [5, -5, 5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <Image
            src="/Mascote/banners/Camaleão_3.png"
            alt="Mascote Vestibuline"
            width={140}
            height={140}
            className="drop-shadow-2xl"
          />
        </motion.div>
      </motion.div>

      {/* Badge */}
      <motion.div
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border ${
          theme === 'dark'
            ? 'bg-gray-800/80 text-gray-300 border-white/10'
            : 'bg-gray-100/80 text-gray-700 border-black/5'
        }`}
        variants={{
          initial: { opacity: 0, scale: 0.8, y: 20 },
          animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
        }}
        whileHover={{ scale: 1.05 }}
      >
        <MessageCircle size={14} />
        Estamos aqui para ajudar
      </motion.div>

      {/* Título H1 */}
      <motion.h1
        className={`text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-tight tracking-tight ${
          theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
        }`}
        variants={{
          initial: { opacity: 0, y: 40 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } },
        }}
      >
        Entre em Contato
      </motion.h1>

      {/* Subtítulo */}
      <motion.p
        className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}
        variants={{
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4 } },
        }}
      >
        Tem dúvidas, sugestões ou precisa de ajuda? Nossa equipe está pronta para
        responder suas perguntas e oferecer o melhor suporte possível.
      </motion.p>
    </motion.div>
  )
}
