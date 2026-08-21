'use client'

import { motion } from 'framer-motion'
import { Instagram, MessageSquare, Heart } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { staggerContainer, staggerItem } from './contactAnimations'

interface SocialLinksSectionProps {
  isInView: boolean
}

const SOCIAL_CARDS = [
  {
    icon: Instagram,
    title: 'Instagram',
    description: 'Acompanhe nossas novidades',
    linkLabel: '@vestibuline',
    href: 'https://www.instagram.com/Vestibuline/',
    colorDark: 'from-pink-500/20 to-yellow-500/20 border-pink-500/30',
    colorLight: 'from-pink-50 to-yellow-50/80 border-pink-200/50',
    iconDark: 'text-pink-400',
    iconLight: 'text-pink-600',
    linkDark: 'text-pink-400 hover:text-pink-300',
    linkLight: 'text-pink-600 hover:text-pink-500',
    external: true,
  },
  {
    icon: MessageSquare,
    title: 'Discord',
    description: 'Participe da nossa comunidade',
    linkLabel: 'Entrar no Discord',
    href: 'https://discord.gg/GZZjDKNk',
    colorDark: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30',
    colorLight: 'from-indigo-50 to-purple-50/80 border-indigo-200/50',
    iconDark: 'text-indigo-400',
    iconLight: 'text-indigo-600',
    linkDark: 'text-indigo-400 hover:text-indigo-300',
    linkLight: 'text-indigo-600 hover:text-indigo-500',
    external: true,
  },
  {
    icon: Heart,
    title: 'Feedback',
    description: 'Compartilhe sua experiência',
    linkLabel: 'Deixar Feedback',
    href: '#formulario',
    colorDark: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    colorLight: 'from-purple-50 to-pink-50/80 border-purple-200/50',
    iconDark: 'text-purple-400',
    iconLight: 'text-purple-600',
    linkDark: 'text-purple-400 hover:text-purple-300',
    linkLight: 'text-purple-600 hover:text-purple-500',
    external: false,
  },
]

export function SocialLinksSection({ isInView }: SocialLinksSectionProps) {
  const { theme } = useTheme()

  const cardBg = theme === 'dark'
    ? 'bg-white/5 border-white/10 hover:bg-white/10'
    : 'bg-gray-50/50 border-black/5 hover:bg-gray-100/50'
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
  const textMuted = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'

  return (
    <motion.div
      className={`backdrop-blur-sm rounded-[28px] p-10 md:p-12 border shadow-lg ${
        theme === 'dark' ? 'bg-[#1d1d1f]/90 border-white/5' : 'bg-white/90 border-black/5'
      }`}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Título da seção */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className={`text-3xl md:text-4xl font-semibold tracking-tight mb-4 ${textPrimary}`}>
          Outras Formas de Contato
        </h2>
        <p className={`text-lg ${textMuted}`}>
          Escolha a forma mais conveniente para se conectar
        </p>
      </motion.div>

      {/* Grid de cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="initial"
        animate={isInView ? 'animate' : 'initial'}
      >
        {SOCIAL_CARDS.map(card => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              className={`group rounded-[24px] p-8 text-center shadow-md transition-all duration-300 border ${cardBg}`}
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div
                className={`w-16 h-16 rounded-[12px] flex items-center justify-center mx-auto mb-5 shadow-md bg-gradient-to-br border ${
                  theme === 'dark' ? card.colorDark : card.colorLight
                }`}
              >
                <Icon className={theme === 'dark' ? card.iconDark : card.iconLight} size={32} />
              </div>
              <h3 className={`font-semibold tracking-tight mb-3 text-xl ${textPrimary}`}>{card.title}</h3>
              <p className={`mb-6 leading-relaxed ${textMuted}`}>{card.description}</p>
              <a
                href={card.href}
                target={card.external ? '_blank' : undefined}
                rel={card.external ? 'noopener noreferrer' : undefined}
                className={`inline-flex items-center gap-2 font-semibold ${
                  theme === 'dark' ? card.linkDark : card.linkLight
                }`}
              >
                {card.linkLabel}
              </a>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
