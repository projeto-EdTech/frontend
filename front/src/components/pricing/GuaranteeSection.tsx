"use client";

import { motion } from "framer-motion";
import { Shield, Check } from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";

interface GuaranteeFeature {
  icon: ReactNode;
  text: string;
}

interface GuaranteeProps {
  title: string;
  description: string;
  features: GuaranteeFeature[];
  mascoteImage?: string;
}

const APPLE_SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

export default function GuaranteeSection({
  title,
  description,
  features,
  mascoteImage,
}: GuaranteeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-12 bg-gradient-to-r from-[#34c759] to-[#30d158] rounded-2xl p-10 text-white text-center relative overflow-hidden shadow-lg"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-white/5"></div>
      <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

      {/* Mascote */}
      {mascoteImage && (
        <div className="absolute left-0 top-0 bottom-0 hidden md:block">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: "spring" as const }}
          >
            <Image
              src={mascoteImage}
              alt="Garantia"
              width={150}
              height={150}
              className="drop-shadow-2xl"
            />
          </motion.div>
        </div>
      )}

      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, ...APPLE_SPRING }}
          className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm"
        >
          <Shield className="w-8 h-8 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-semibold mb-4"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {title}
        </motion.h3>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg mb-6 max-w-2xl mx-auto"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {description}
        </motion.p>

        {/* Features */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.4 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 },
              }}
              className="flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              {feature.text}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
