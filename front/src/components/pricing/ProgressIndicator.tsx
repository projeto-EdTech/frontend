"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  variant?: "default" | "success";
}

const APPLE_SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

export default function ProgressIndicator({
  currentStep,
  totalSteps = 3,
  variant = "default",
}: ProgressIndicatorProps) {
  const bgColor = variant === "success" ? "#34c759" : "#0071e3";
  const completedBgColor = variant === "success" ? "#34c759" : "#0071e3";

  return (
    <motion.div
      className="flex items-center justify-center mb-12"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-4">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNumber = i + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <div key={stepNumber} className="flex items-center">
              <motion.div
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor:
                    stepNumber <= currentStep ? bgColor : "#e8e8ed",
                  color: stepNumber <= currentStep ? "#ffffff" : "#86868b",
                }}
                transition={APPLE_SPRING}
                className="w-12 h-12 rounded-full flex items-center justify-center font-semibold shadow-sm"
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  stepNumber
                )}
              </motion.div>

              {stepNumber < totalSteps && (
                <motion.div
                  animate={{
                    backgroundColor:
                      currentStep > stepNumber ? completedBgColor : "#e8e8ed",
                  }}
                  className="w-20 h-0.5 mx-3 rounded-full transition-colors duration-500"
                />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
