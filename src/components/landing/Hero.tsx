"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Share2, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

import { useStacks } from "@/components/providers/StacksProvider";
import { useRouter } from "next/navigation";

export const Hero = () => {
  const { isConnected, connectWallet } = useStacks();
  const router = useRouter();

  const handleExplore = () => {
    if (isConnected) {
      router.push("/dashboard");
    } else {
      connectWallet();
    }
  };

  const scrollToFeatures = () => {
    const element = document.getElementById("how-it-works");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Orbs - Enhanced for "Wow" factor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none -z-10 overflow-hidden">
        {/* Centered ambient glow directly behind headline */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/15 rounded-full blur-[160px]" />

        <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-gold/20 bg-gold/5 text-gold text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Zap className="w-3 h-3" />
            <span>Real-time Knowledge Transfer</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
          >
            The Marketplace for <br />
            <span className="text-gradient">AI Agent Intelligence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto"
          >
            Don&apos;t train your agents from scratch. Acquire specialized skill
            packs via P2P knowledge transfer, instantly verifiable through the
            x402 payment protocol.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <button
              onClick={handleExplore}
              className="w-full sm:w-auto px-10 py-4 bg-gold hover:bg-gold/90 text-obsidian rounded-md font-extrabold transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] active:scale-95 flex items-center justify-center space-x-3 group cursor-pointer"
            >
              <span>Explore Skills</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={scrollToFeatures}
              className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 text-white rounded-md font-bold transition-all border border-white/10 active:scale-95 flex items-center justify-center space-x-3 cursor-pointer"
            >
              <span>How it Works</span>
            </button>
          </motion.div>
        </div>

        {/* Feature Cards / Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="glass-panel p-8 rounded-lg group hover:border-gold/30 transition-all">
            <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center mb-6 group-hover:bg-gold/10 transition-colors">
              <Bot className="w-6 h-6 text-gold" />
            </div>
            <h3 className="text-xl font-bold mb-3">Agent Native</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Designed specifically for autonomous agents to discover, purchase,
              and ingest knowledge without human intervention.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-lg group hover:border-gold/30 transition-all">
            <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center mb-6 group-hover:bg-gold/10 transition-colors">
              <Zap className="w-6 h-6 text-gold" />
            </div>
            <h3 className="text-xl font-bold mb-3">x402 Verified</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every transaction is gated by the Stacks blockchain, ensuring
              secure and immediate settlement of digital assets.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-lg group hover:border-gold/30 transition-all">
            <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center mb-6 group-hover:bg-gold/10 transition-colors">
              <Share2 className="w-6 h-6 text-gold" />
            </div>
            <h3 className="text-xl font-bold mb-3">Skill Marketplace</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Access curated context vectors for smart contracts, DeFi analysis,
              and blockchain security audit patterns.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
