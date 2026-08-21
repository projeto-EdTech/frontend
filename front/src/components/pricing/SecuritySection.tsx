"use client";

import { motion } from "framer-motion";
import { Shield, Check } from "lucide-react";
import Image from "next/image";

interface SecuritySectionProps {
  isAccepted: boolean;
  onChange: (value: boolean) => void;
  mascoteImage?: string;
  termsLink?: string;
  privacyLink?: string;
}

const APPLE_SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

export default function SecuritySection({
  isAccepted,
  onChange,
  mascoteImage,
  termsLink = "/terms",
  privacyLink = "/privacy",
}: SecuritySectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-[#34c759] to-[#30d158] rounded-2xl p-8 relative overflow-hidden shadow-md"
    >
      {/* Mascote no canto */}
      {mascoteImage && (
        <div className="absolute right-6 -top-2 bottom-0 hidden md:block">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" as const }}
          >
            <Image
              src={mascoteImage}
              alt="Mascote seguro"
              width={120}
              height={120}
              className="drop-shadow-xl"
            />
          </motion.div>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4 mb-6"
      >
        <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center shadow-sm">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2
            className="text-xl font-semibold text-white"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Segurança e Privacidade
          </h2>
          <p
            className="text-white/90"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Seus dados estão protegidos
          </p>
        </div>
      </motion.div>

      {/* Checkbox Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, ...APPLE_SPRING }}
        className="bg-white/95 backdrop-blur-xl rounded-xl p-6 shadow-sm"
      >
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative mt-1">
            <input
              type="checkbox"
              checked={isAccepted}
              onChange={(e) => onChange(e.target.checked)}
              className="sr-only"
            />
            <motion.div
              animate={{
                backgroundColor: isAccepted ? "#34c759" : "#ffffff",
                borderColor: isAccepted ? "#34c759" : "#e0e0e0",
              }}
              transition={APPLE_SPRING}
              whileHover={{ borderColor: "#34c759" }}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                isAccepted ? "bg-[#34c759] border-[#34c759]" : "border-gray-200"
              }`}
            >
              {isAccepted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={APPLE_SPRING}
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.div>
          </div>
          <div
            className="text-sm text-gray-700 leading-relaxed"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Concordo com os{" "}
            <a
              href={termsLink}
              className="text-[#0071e3] hover:underline font-semibold"
            >
              Termos de Uso
            </a>{" "}
            e{" "}
            <a
              href={privacyLink}
              className="text-[#0071e3] hover:underline font-semibold"
            >
              Política de Privacidade
            </a>
          </div>
        </label>
      </motion.div>
    </motion.div>
  );
}
