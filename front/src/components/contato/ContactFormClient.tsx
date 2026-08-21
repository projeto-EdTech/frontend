'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { fadeInRight, staggerContainer, staggerItem } from './contactAnimations'
import { initEmailJS, sendContactEmail, type ContactEmailData } from './emailService'

interface ContactFormClientProps {
  initialNome?: string
  initialEmail?: string
  isInView: boolean
}

const ASSUNTO_OPTIONS = [
  { value: 'duvida-tecnica', label: 'Dúvida Técnica' },
  { value: 'problemas-acesso', label: 'Problemas de Acesso' },
  { value: 'sugestao', label: 'Sugestão' },
  { value: 'planos-precos', label: 'Planos e Preços' },
  { value: 'cancelamento', label: 'Cancelamento' },
  { value: 'outros', label: 'Outros' },
]

type FormData = ContactEmailData
type SubmitStatus = 'idle' | 'success' | 'error'

export function ContactFormClient({ initialNome = '', initialEmail = '', isInView }: ContactFormClientProps) {
  const { theme } = useTheme()
  const [formData, setFormData] = useState<FormData>({
    nome: initialNome,
    email: initialEmail,
    assunto: '',
    mensagem: '',
  })
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  // Inicializar EmailJS uma única vez
  useEffect(() => {
    try {
      initEmailJS()
    } catch (err) {
      console.warn('[EmailJS] Não foi possível inicializar:', err)
    }
  }, [])

  // Sincronizar dados da sessão quando disponíveis
  useEffect(() => {
    if (initialNome || initialEmail) {
      setFormData(prev => ({
        ...prev,
        nome: initialNome || prev.nome,
        email: initialEmail || prev.email,
      }))
    }
  }, [initialNome, initialEmail])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
    },
    [],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')
    setSubmitStatus('idle')

    try {
      await sendContactEmail(formData)
      setSubmitStatus('success')
      setSubmitMessage('Mensagem enviada com sucesso! 🎯')
      setFormData({ nome: '', email: '', assunto: '', mensagem: '' })
    } catch (error: unknown) {
      console.error('[ContactForm] Erro ao enviar e-mail:', error)
      const err = error as Record<string, string>
      const msg = err?.text || err?.message || 'Erro desconhecido'
      setSubmitStatus('error')
      setSubmitMessage(`Ops! Algo deu errado: ${msg}. Vamos tentar novamente?`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = Boolean(formData.nome && formData.email && formData.assunto && formData.mensagem)

  // Classes reutilizáveis
  const inputBase = 'w-full px-4 py-3 border rounded-[12px] focus:outline-none transition-all duration-300 placeholder:text-gray-400'
  const getInputCls = (field: string) => {
    const focused = focusedField === field
    if (focused) {
      return `${inputBase} ${theme === 'dark' ? 'border-blue-500/50 bg-blue-500/5 text-white' : 'border-blue-500 bg-blue-50/50'}`
    }
    return `${inputBase} ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white hover:border-white/20' : 'border-black/10 hover:border-black/20'}`
  }
  const labelCls = `block text-sm font-semibold mb-2.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`

  return (
    <motion.div className="xl:col-span-2 md:col-span-1" variants={fadeInRight}>
      <motion.div
        className={`backdrop-blur-sm rounded-[28px] p-10 md:p-12 shadow-lg border ${
          theme === 'dark' ? 'bg-[#1d1d1f]/90 border-white/5' : 'bg-white/90 border-black/5'
        }`}
      >
        {/* Cabeçalho */}
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, x: 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div
            className={`w-12 h-12 rounded-[12px] flex items-center justify-center shadow-md ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                : 'bg-gradient-to-br from-purple-50 to-pink-50/80 border border-purple-200/50'
            }`}
          >
            <Send className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} size={24} />
          </div>
          <h2
            className={`text-2xl md:text-3xl font-semibold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
            }`}
          >
            Envie sua Mensagem
          </h2>
        </motion.div>

        {/* Mensagem de status */}
        {submitMessage && (
          <motion.div
            className={`mb-6 px-5 py-4 rounded-[12px] flex items-center gap-3 border ${
              submitStatus === 'success'
                ? theme === 'dark'
                  ? 'bg-green-900/20 text-green-300 border-green-500/30'
                  : 'bg-green-50 text-green-700 border-green-200/50'
                : theme === 'dark'
                  ? 'bg-red-900/20 text-red-300 border-red-500/30'
                  : 'bg-red-50 text-red-700 border-red-200/50'
            }`}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {submitStatus === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{submitMessage}</span>
          </motion.div>
        )}

        {/* Formulário */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Nome + Email */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            variants={staggerContainer}
            initial="initial"
            animate={isInView ? 'animate' : 'initial'}
          >
            <motion.div variants={staggerItem}>
              <label className={labelCls}>Nome Completo *</label>
              <div className="relative">
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('nome')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={getInputCls('nome')}
                  placeholder="Digite seu nome completo"
                />
                {formData.nome && (
                  <CheckCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
            </motion.div>

            <motion.div variants={staggerItem}>
              <label className={labelCls}>Email *</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={getInputCls('email')}
                  placeholder="seu@email.com"
                />
                {formData.email && (
                  <CheckCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Assunto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <label className={labelCls}>Assunto *</label>
            <div className="relative">
              <select
                name="assunto"
                value={formData.assunto}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('assunto')}
                onBlur={() => setFocusedField(null)}
                required
                className={`${getInputCls('assunto')} cursor-pointer`}
              >
                <option value="">Selecione um assunto</option>
                {ASSUNTO_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {formData.assunto && (
                <CheckCircle size={18} className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500" />
              )}
            </div>
          </motion.div>

          {/* Mensagem */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <label className={labelCls}>Mensagem *</label>
            <div className="relative">
              <textarea
                name="mensagem"
                value={formData.mensagem}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('mensagem')}
                onBlur={() => setFocusedField(null)}
                required
                rows={6}
                maxLength={500}
                className={`${getInputCls('mensagem')} resize-none`}
                placeholder="Descreva sua dúvida, sugestão ou problema em detalhes..."
              />
              {formData.mensagem && (
                <CheckCircle size={18} className="absolute right-4 top-4 text-green-500" />
              )}
            </div>
            <motion.div
              className={`text-right text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
              animate={{
                color: formData.mensagem.length > 450
                  ? '#ef4444'
                  : theme === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            >
              {formData.mensagem.length}/500 caracteres
            </motion.div>
          </motion.div>

          {/* Botão de envio */}
          <motion.button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={`w-full py-4 px-8 rounded-[12px] font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
              isFormValid && !isSubmitting
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] hover:shadow-blue-500/30 cursor-pointer'
                : theme === 'dark'
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-gray-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileTap={isFormValid && !isSubmitting ? { scale: 0.97 } : {}}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Enviar Mensagem</span>
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  )
}
