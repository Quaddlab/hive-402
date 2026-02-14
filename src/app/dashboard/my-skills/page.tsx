"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Shield,
  Cpu,
  ArrowUpRight,
  Settings2,
  Trash2,
  BrainCircuit,
} from "lucide-react";
import Link from "next/link";

import { useStacks } from "@/components/providers/StacksProvider";
import { Loader2 } from "lucide-react";

export default function MySkillsPage() {
  const { address, isConnected } = useStacks();
  const [skills, setSkills] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMySkills = async () => {
      if (!address) return;
      try {
        const res = await fetch(`/api/user/skills?address=${address}`);
        const data = await res.json();
        setSkills(data.skills || []);
      } catch (e) {
        console.error("Failed to load your skills:", e);
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected && address) {
      fetchMySkills();
    } else if (!isConnected) {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "security":
        return Shield;
      case "defi":
        return Zap;
      default:
        return Cpu;
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            My <span className="text-gold">Intelligence</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium">
            Manage and deploy your ingested knowledge packs.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-3">
              Active Skills:
            </span>
            <span className="text-lg font-black text-white">
              {skills.length.toString().padStart(2, "0")}
            </span>
          </div>
          <Link
            href="/dashboard/lab"
            className="flex items-center space-x-2 px-6 py-2.5 bg-gold text-obsidian font-black rounded text-xs uppercase tracking-widest hover:bg-gold-light transition-all shadow-[0_0_20px_rgba(255,184,0,0.3)] hover:scale-[1.02]"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Open AI Lab</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {skills.map((skill, i) => {
          const IconComponent = getIcon(skill.category);
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden p-6 bg-white/2 border border-white/5 rounded-2xl hover:border-gold/30 hover:bg-white/4 transition-all duration-500"
            >
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-gold-500/10 blur-[80px] group-hover:bg-gold-500/20 transition-all duration-700" />

              <div className="relative flex items-start justify-between">
                <div className="flex items-start space-x-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/30 transition-all shadow-inner">
                    <IconComponent className="w-8 h-8 text-slate-500 group-hover:text-gold transition-colors" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-xl font-black text-white tracking-tight uppercase group-hover:text-gold transition-colors">
                        {skill.title}
                      </h3>
                      <div className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-500 uppercase tracking-widest">
                        Active
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-widest text-slate-600">
                      <span>{skill.category}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-800" />
                      <span>Ready for Context</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 text-slate-500 hover:text-white transition-all">
                    <Settings2 className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/50 text-slate-500 hover:text-red-500 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="mt-6 text-sm text-slate-500 leading-relaxed font-medium">
                {skill.description}
              </p>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className="w-8 h-8 rounded-full bg-white/5 border border-obsidian flex items-center justify-center"
                    >
                      <Cpu className="w-4 h-4 text-slate-600" />
                    </div>
                  ))}
                </div>

                <Link
                  href={`/dashboard/skill/${skill.id}`}
                  className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all group"
                >
                  <span>Details</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          );
        })}

        {/* Empty Slot / Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-2 border-dashed border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 hover:border-gold/20 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-gold/20">
            <BrainCircuit className="w-8 h-8 text-slate-700 group-hover:text-gold/50 transition-colors" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Awaiting Intelligence
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Acquire more skills to fill this processing unit.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-gold transition-colors"
          >
            Explore Marketplace
          </Link>
        </motion.div>
      </div>

      {/* Lab Integration Teaser */}
      <div className="mt-12 p-8 rounded-2xl bg-linear-to-r from-gold/10 via-gold/5 to-transparent border border-gold/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-full bg-gold/5 blur-[60px] translate-x-32 group-hover:translate-x-16 transition-transform duration-1000" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-2 text-gold font-black text-xs uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
              Ready for Deployment
            </h2>
            <p className="text-slate-400 font-medium">
              All acquired skills are automatically synchronized with the AI Lab
              context. No configuration required.
            </p>
          </div>
          <Link
            href="/dashboard/lab"
            className="px-8 py-3 bg-white/5 border border-white/10 hover:border-gold/50 rounded text-xs font-black uppercase tracking-widest text-white hover:text-gold transition-all"
          >
            Switch to Commander Lab
          </Link>
        </div>
      </div>
    </div>
  );
}
