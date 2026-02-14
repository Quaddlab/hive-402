"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  X,
  Shield,
  Lock,
  Wallet,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillName: string;
  price: string;
}

export const PaymentModal = ({
  isOpen,
  onClose,
  skillName,
  price,
}: PaymentModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-obsidian/90 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-panel p-0 rounded-lg border-2 border-gold/20 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden"
          >
            {/* Progress Stripe */}
            <div className="h-1 gold-gradient w-full animate-shimmer" />

            {/* Header */}
            <div className="p-6 border-b border-border-muted flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-gold animate-spin-slow" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">
                    x402 Verification
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                    Stacks Protocol Settlement
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Purchase Request
                </p>
                <h3 className="text-2xl font-black text-white">{skillName}</h3>
                <div className="inline-flex items-center py-1 px-3 bg-white/5 border border-border-muted rounded text-xl font-black text-white space-x-2">
                  <span>{price}</span>
                  <span className="text-gold text-sm">STX</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded border border-border-muted group cursor-help transition-all hover:border-blue-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded">
                      <Lock className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                      Protocol Type
                    </span>
                  </div>
                  <span className="text-xs font-black text-white">
                    HTTP 402
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded border border-border-muted group cursor-help transition-all hover:border-gold/30">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gold/10 rounded">
                      <Shield className="w-4 h-4 text-gold" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                      Settlement
                    </span>
                  </div>
                  <span className="text-xs font-black text-white">
                    P2P Atomic
                  </span>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-4 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 className="w-8 h-8 text-gold animate-spin" />
                  <p className="text-xs font-bold text-white uppercase tracking-widest">
                    Awaiting Signature...
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  Please approve the transaction in your Leather wallet. No
                  micro-fees will be charged for verification on Testnet.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white/5 border-t border-border-muted flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 overflow-hidden">
                <Wallet className="w-3 h-3 text-slate-600" />
                <span className="truncate max-w-[150px]">SP1P...GGM</span>
              </div>
              <div className="flex items-center space-x-1 text-[10px] font-bold text-gold cursor-pointer hover:underline">
                <span>View Protocol</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
