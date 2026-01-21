"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Smartphone, FileText } from "lucide-react";
import { ReactNode } from "react";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  badge?: string;
  color: string;
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethod: string;
  onSelect: (methodId: string) => void;
  disabled?: boolean;
}

const APPLE_SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

export default function PaymentMethodSelector({
  methods,
  selectedMethod,
  onSelect,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const getColorClasses = (id: string) => {
    if (id === "cartao")
      return "bg-[#0071e3]/10 text-[#0071e3]";
    if (id === "Pix")
      return "bg-[#34c759]/10 text-[#34c759]";
    return "bg-[#ff9500]/10 text-[#ff9500]";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      {methods.map((payment, index) => (
        <motion.div
          key={payment.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <label className="block cursor-pointer group">
            <motion.div
              whileHover={!disabled ? { y: -2 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              transition={APPLE_SPRING}
              className={`relative p-5 rounded-xl border transition-all duration-300 ${
                selectedMethod === payment.id
                  ? "border-[#0071e3] shadow-md bg-[#0071e3]/5"
                  : "border-gray-200 hover:border-[#86868b] bg-white"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {/* Badge */}
              {payment.badge && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, ...APPLE_SPRING }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md uppercase tracking-wide"
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  {payment.badge}
                </motion.div>
              )}

              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  name="paymentType"
                  value={payment.id}
                  checked={selectedMethod === payment.id}
                  onChange={(e) => !disabled && onSelect(e.target.value)}
                  disabled={disabled}
                  className="w-5 h-5 text-[#0071e3] focus:ring-[#0071e3]"
                />

                <motion.div
                  whileHover={!disabled ? { scale: 1.1 } : {}}
                  transition={APPLE_SPRING}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(
                    payment.id
                  )}`}
                >
                  {payment.icon}
                </motion.div>

                <div className="flex-1">
                  <div
                    className="text-base font-semibold text-gray-700"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    {payment.name}
                  </div>
                  <div
                    className="text-sm text-[#86868b]"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    {payment.description}
                  </div>
                </div>

                <AnimatePresence>
                  {selectedMethod === payment.id && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={APPLE_SPRING}
                      className="w-8 h-8 bg-[#0071e3] rounded-full flex items-center justify-center"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </label>
        </motion.div>
      ))}
    </motion.div>
  );
}
