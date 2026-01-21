"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Check, Clock, Shield } from "lucide-react";
import { ReactNode } from "react";

interface HeroFeature {
  icon: ReactNode;
  text: string;
}

interface HeroSectionProps {
  title: string;
  subtitle: string;
  features: HeroFeature[];
  badge?: string;
  leftMascote?: string;
  rightMascote?: string;
}

const APPLE_SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

export default function HeroSection({
  title,
  subtitle,
  features,
  badge,
  leftMascote,
  rightMascote,
}: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0071e3] to-[#005bb5]">
      <div className="absolute inset-0 bg-black opacity-5"></div>
      <div className="absolute inset-0 backdrop-blur-3xl"></div>

      {/* Mascote esquerdo - Flutuante */}
      {leftMascote && (
        <motion.div
          className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 hidden md:block"
          animate={{ y: ["-50%", "-53%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut" as const,
          }}
        >
          <motion.div whileHover={{ scale: 1.05 }} transition={APPLE_SPRING}>
            <Image
              src={leftMascote}
              alt="Mascote"
              width={180}
              height={180}
              className="drop-shadow-2xl"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Mascote direito - Flutuante */}
      {rightMascote && (
        <motion.div
          className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 hidden md:block"
          animate={{ y: ["-50%", "-47%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut" as const,
            delay: 0.5,
          }}
        >
          <motion.div whileHover={{ scale: 1.05 }} transition={APPLE_SPRING}>
            <Image
              src={rightMascote}
              alt="Mascote"
              width={220}
              height={220}
              className="drop-shadow-2xl"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-6 py-20 text-center text-white">
        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, ...APPLE_SPRING }}
            className="inline-flex items-center px-5 py-2.5 bg-white/15 backdrop-blur-xl rounded-full text-sm font-semibold mb-8 border border-white/20 shadow-lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {badge}
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl md:text-7xl font-semibold mb-6 tracking-tight"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-xl md:text-2xl font-light mb-10 max-w-3xl mx-auto leading-relaxed"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {subtitle}
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + idx * 0.1 }}
              className="flex items-center gap-2"
            >
              {feature.icon}
              <span>{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
