"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast = ({ message, type, isVisible, onClose }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const borders = {
    success: "border-emerald-500/20 bg-emerald-500/5",
    error: "border-red-500/20 bg-red-500/5",
    info: "border-blue-500/20 bg-blue-500/5",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            "fixed bottom-8 right-8 z-[100] w-full max-w-sm glass-panel p-4 rounded-lg flex items-start space-x-4 border overflow-hidden",
            borders[type],
          )}
        >
          <div className="shrink-0 pt-0.5">{icons[type]}</div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                System Notification
              </p>
              <button
                onClick={onClose}
                className="text-slate-600 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-medium text-white leading-relaxed">
              {message}
            </p>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className={cn(
                  "h-full",
                  type === "success"
                    ? "bg-emerald-500"
                    : type === "error"
                      ? "bg-red-500"
                      : "bg-blue-500",
                )}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
