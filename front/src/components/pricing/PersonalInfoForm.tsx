"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export interface PersonalInfoField {
  field: string;
  label: string;
  type: "text" | "email" | "tel";
  placeholder: string;
}

interface PersonalInfoFormProps {
  fields: PersonalInfoField[];
  values: Record<string, string | boolean>;
  onChange: (field: string, value: string | boolean) => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
}

const STAGGER_CONTAINER = {
  animate: { transition: { staggerChildren: 0.05 } },
};

const ITEM_VARIANT = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function PersonalInfoForm({
  fields,
  values,
  onChange,
  icon,
  title,
  subtitle,
}: PersonalInfoFormProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-md ring-1 ring-[#d2d2d7]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-[#0071e3] to-[#0077ed] rounded-xl flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <h2
            className="text-2xl font-semibold text-gray-700"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {title}
          </h2>
          <p
            className="text-[#86868b]"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {subtitle}
          </p>
        </div>
      </motion.div>

      {/* Campos */}
      <motion.div
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {fields.map((input, idx) => (
          <motion.div key={input.field} variants={ITEM_VARIANT} className="group">
            <label
              className="block text-sm font-semibold text-gray-700 mb-2"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {input.label}
            </label>
            <motion.input
              type={input.type}
              placeholder={input.placeholder}
              value={(values[input.field] as string) || ""}
              onChange={(e) => onChange(input.field, e.target.value)}
              disabled={input.field === "nomeCompleto" || input.field === "email"}
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring" as const, stiffness: 260, damping: 26 }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 transition-all duration-200 disabled:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:text-[#86868b]"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
