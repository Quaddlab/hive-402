import React from "react";
import { X, Monitor, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileWalletModal = ({
  isOpen,
  onClose,
}: MobileWalletModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-100 bg-obsidian/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-101 w-full max-w-[340px] px-4"
          >
            <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl bg-obsidian/95 relative overflow-hidden">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mb-4 border border-gold/20 relative">
                  <Smartphone className="w-5 h-5 text-gold absolute -left-1 opacity-50" />
                  <Monitor className="w-6 h-6 text-gold relative z-10" />
                </div>

                <h3 className="text-[16px] font-bold text-white mb-2 leading-tight">
                  Desktop Required
                </h3>

                <p className="text-[14px] text-slate-400 leading-relaxed mb-6">
                  Please switch to desktop to connect your wallet and use the
                  Hive-402 application securely.
                </p>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-md text-[14px] font-bold transition-all border border-white/10"
                >
                  Understood
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
