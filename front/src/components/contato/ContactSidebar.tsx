'use client'

import { motion } from 'framer-motion'
import { Mail, Clock, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { fadeInLeft, scaleIn, staggerContainer, staggerItem } from './contactAnimations'

interface ContactSidebarProps {
  isInView: boolean
}

const FAQ_ITEMS = [
  'Como funciona o plano gratuito?',
  'Posso cancelar quando quiser?',
  'Como acompanhar meu progresso?',
]

export function ContactSidebar({ isInView }: ContactSidebarProps) {
  const { theme } = useTheme()

  const cardCls = `backdrop-blur-sm rounded-[28px] border shadow-lg ${
    theme === 'dark' ? 'bg-[#1d1d1f]/90 border-white/5' : 'bg-white/90 border-black/5'
  }`
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
  const textMuted = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const textBody = theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'

  return (
    <motion.div className="xl:col-span-1 space-y-6 hidden md:block" variants={fadeInLeft}>
      {/* Card principal */}
      <motion.div className={`${cardCls} p-8 relative overflow-hidden`} variants={scaleIn}>
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div
            className={`w-12 h-12 rounded-[12px] flex items-center justify-center shadow-md ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30'
                : 'bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-200/50'
            }`}
          >
            <MessageCircle className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={24} />
          </div>
          <h2 className={`text-2xl font-semibold tracking-tight ${textPrimary}`}>Fale Conosco</h2>
        </motion.div>

        <motion.div className="space-y-6" variants={staggerContainer}>
          {/* Email */}
          <motion.div className="group" variants={staggerItem}>
            <div className={`flex items-start gap-4 p-4 rounded-[12px] transition-all duration-300 ${hoverBg}`}>
              <div
                className={`w-12 h-12 rounded-[12px] flex items-center justify-center shadow-md ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30'
                    : 'bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-200/50'
                }`}
              >
                <Mail className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={22} />
              </div>
              <div>
                <h3 className={`font-semibold mb-1 text-lg tracking-tight ${textPrimary}`}>Email</h3>
                <p className={`font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  vestibuline@gmail.com
                </p>
                <p className={`text-sm mt-2 flex items-center gap-1 ${textMuted}`}>
                  <CheckCircle size={12} className="text-green-500" />
                  Respondemos em até 24 horas
                </p>
              </div>
            </div>
          </motion.div>

          {/* Horário */}
          <motion.div className="group" variants={staggerItem}>
            <div className={`flex items-start gap-4 p-4 rounded-[12px] transition-all duration-300 ${hoverBg}`}>
              <div
                className={`w-12 h-12 rounded-[12px] flex items-center justify-center shadow-md ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30'
                    : 'bg-gradient-to-br from-green-50 to-green-100/80 border border-green-200/50'
                }`}
              >
                <Clock className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} size={22} />
              </div>
              <div>
                <h3 className={`font-semibold mb-2 text-lg tracking-tight ${textPrimary}`}>
                  Horário de Atendimento
                </h3>
                <div className="space-y-1">
                  <p className={`font-medium ${textBody}`}>Segunda a Sexta: 9h às 18h</p>
                  <p className={`font-medium ${textBody}`}>Sábado: 9h às 14h</p>
                  <p className={`text-sm mt-2 ${textMuted}`}>Exceto feriados nacionais</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Card FAQ */}
      <motion.div
        className={`${cardCls} p-6`}
        variants={{
          initial: { opacity: 0, y: 40 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4 } },
        }}
      >
        <motion.h3
          className={`font-semibold tracking-tight mb-4 flex items-center gap-2 ${textPrimary}`}
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <AlertCircle className="text-amber-500" size={20} />
          Perguntas Frequentes
        </motion.h3>

        <motion.div
          className="space-y-3 text-sm"
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? 'animate' : 'initial'}
        >
          {FAQ_ITEMS.map((faq, index) => (
            <motion.div
              key={index}
              className={`flex items-start gap-2 transition-colors ${textBody}`}
              variants={staggerItem}
            >
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
              <span>{faq}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.a
          href="/faq"
          className={`inline-flex items-center gap-2 font-semibold mt-4 transition-all duration-300 ${
            theme === 'dark'
              ? 'text-blue-400 hover:text-blue-300'
              : 'text-blue-600 hover:text-blue-500'
          }`}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          Ver todas as perguntas →
        </motion.a>
      </motion.div>
    </motion.div>
  )
}
