'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { motion, useInView } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoginModal from '@/components/Login-modal'
import { useTheme } from '@/contexts/ThemeContext'
import { ContactHero } from '@/components/contato/ContactHero'
import { ContactSidebar } from '@/components/contato/ContactSidebar'
import { ContactFormClient } from '@/components/contato/ContactFormClient'
import { SocialLinksSection } from '@/components/contato/SocialLinksSection'

// CACHE STRATEGY: no-store — página autenticada, dados personalizados por usuário

export default function ContatoPage() {
  const { data: session, status } = useSession()
  const { theme } = useTheme()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  // Redirecionar não-autenticados para o modal de login
  useEffect(() => {
    if (status === 'unauthenticated') setIsLoginModalOpen(true)
  }, [status])

  // Refs para animações de scroll
  const heroRef = useRef(null)
  const formSectionRef = useRef(null)
  const socialSectionRef = useRef(null)

  const heroInView = useInView(heroRef, { once: true })
  const formInView = useInView(formSectionRef, { once: true, margin: '-50px' })
  const socialInView = useInView(socialSectionRef, { once: true, margin: '-50px' })

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-[#1d1d1f]' : 'bg-[#f5f5f7]'}`}>
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Orbs de fundo animados */}
        <motion.div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <motion.div
            className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] ${theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-500/5'}`}
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] ${theme === 'dark' ? 'bg-purple-600/10' : 'bg-purple-500/5'}`}
            animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <div className="container mx-auto px-6 md:px-8 py-12 md:py-20 relative z-10 max-w-7xl">
          {/* Hero */}
          <div ref={heroRef}>
            <ContactHero isInView={heroInView} />
          </div>

          {/* Grid: Sidebar + Formulário */}
          <motion.div
            ref={formSectionRef}
            className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16"
            initial="initial"
            animate={formInView ? 'animate' : 'initial'}
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
          >
            <ContactSidebar isInView={formInView} />
            <ContactFormClient
              initialNome={session?.user?.name ?? ''}
              initialEmail={session?.user?.email ?? ''}
              isInView={formInView}
            />
          </motion.div>

          {/* Links sociais */}
          <div ref={socialSectionRef}>
            <SocialLinksSection isInView={socialInView} />
          </div>
        </div>

        {/* Partículas flutuantes decorativas */}
        {[
          { cls: 'fixed top-20 right-10 w-4 h-4 bg-blue-400/20', dur: 4, delay: 0 },
          { cls: 'fixed bottom-32 left-10 w-6 h-6 bg-purple-400/20', dur: 6, delay: 2 },
          { cls: 'fixed top-1/2 left-5 w-3 h-3 bg-pink-400/30', dur: 5, delay: 1 },
        ].map((p, i) => (
          <motion.div
            key={i}
            className={`${p.cls} rounded-full pointer-events-none`}
            animate={{ y: [0, -15, 0], opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}
      </main>

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <Footer />
      </motion.div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectTo="/contato"
        isRequired={status === 'unauthenticated'}
      />
    </div>
  )
}
