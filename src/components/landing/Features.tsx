"use client";

import React from "react";
import { Search, Lock, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  DiscoveryGraphic,
  ProtocolGateGraphic,
  IngestionGraphic,
} from "./StoryGraphics";

const sections = [
  {
    graphic: DiscoveryGraphic,
    title: "Discover Intelligence",
    description:
      "Your agent doesn't need to learn from scratch. Access a global repository of verified skill fragments, security patterns, and domain-specific context vectors.",
    tags: ["Real-time Scan", "Verified Context", "P2P Knowledge"],
    icon: Search,
  },
  {
    graphic: ProtocolGateGraphic,
    title: "x402 Protocol Settlement",
    description:
      "Automated P2P settlement ensuring knowledge is only transferred upon verifiable payment. No middleman, no subscriptions, just pure agentic commerce.",
    tags: ["Atomic Swap", "Stacks L1/L2", "Zero-Trust"],
    icon: Lock,
  },
  {
    graphic: IngestionGraphic,
    title: "Instant Ingestion",
    description:
      "Intelligence is streamed directly into your agent's context window. Your AI instantly upgrades its capabilities, ready to perform specialized tasks immediately.",
    tags: ["Deep Integration", "Zero Training", "Infinite Scalability"],
    icon: Zap,
  },
];

export const Features = () => {
  return (
    <section
      id="how-it-works"
      className="py-16 md:py-32 relative overflow-hidden bg-obsidian"
    >
      <div className="max-w-7xl mx-auto px-[14px] sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-32">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[16px] md:text-4xl lg:text-6xl font-black mb-8 tracking-tighter leading-tight"
          >
            A New Paradigm for <br />
            <span className="text-gold">Knowledge Transfer</span>
          </motion.h2>
          <p className="text-slate-400 text-[14px] md:text-xl leading-relaxed">
            Hive-402 automates the entire lifecycle of AI skill acquisition,
            built on the ironclad security of the Stacks blockchain.
          </p>
        </div>

        <div className="space-y-20 md:space-y-40">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${idx % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-24`}
            >
              {/* Text Side (Shows first on mobile) */}
              <motion.div
                initial={{ opacity: 0, x: idx % 2 === 1 ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1 space-y-6 md:space-y-8 order-1 w-full"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center border border-gold/20">
                    <section.icon className="w-6 h-6 text-gold" />
                  </div>
                  <span className="text-[12px] md:text-xs font-black text-slate-500 uppercase tracking-[0.4em]">
                    Step 0{idx + 1}
                  </span>
                </div>

                <h3 className="text-[16px] md:text-3xl lg:text-5xl font-black text-white tracking-tight">
                  {section.title}
                </h3>

                {/* Image/Animation Side (Shows strictly under title on mobile ONLY) */}
                <div className="block md:hidden w-[calc(100%+28px)] -mx-[14px] py-4">
                  <div className="relative group w-full px-[14px]">
                    <div className="glass-panel rounded-lg overflow-hidden border border-white/5 bg-white/2 group-hover:border-gold/20 transition-all duration-700 w-full aspect-square sm:aspect-4/3">
                      <section.graphic />
                    </div>
                    {/* Decorative glow */}
                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-1/2 bg-gold/5 blur-2xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  </div>
                </div>

                <p className="text-slate-400 text-[14px] md:text-lg leading-relaxed font-medium">
                  {section.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  {section.tags.map((tag, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 rounded-md bg-white/5 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider"
                    >
                      {tag}
                    </div>
                  ))}
                </div>

                <div className="pt-2 md:pt-4">
                  <button className="flex items-center space-x-2 text-gold font-bold text-[14px] md:text-sm group cursor-pointer">
                    <span>Protocol Technicals</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>

              {/* Image/Animation Side (Shows on desktop strictly) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:block flex-1 w-full max-w-[500px] order-2"
              >
                <div className="relative group mx-auto">
                  <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 bg-white/2 group-hover:border-gold/20 transition-all duration-700">
                    <section.graphic />
                  </div>
                  {/* Decorative glow */}
                  <div className="absolute -inset-4 bg-gold/5 blur-2xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
