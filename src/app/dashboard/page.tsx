"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Star,
  Shield,
  Clock,
  ArrowRight,
  ExternalLink,
  Layers,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function MarketplacePage() {
  const [skills, setSkills] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ activeSkills: 0, transfers: 0 });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, statsRes] = await Promise.all([
          fetch("/api/skills"),
          fetch("/api/stats"),
        ]);
        const skillsData = await skillsRes.json();
        const statsData = await statsRes.json();
        setSkills(skillsData);
        setStats(statsData);
      } catch (e) {
        console.error("Failed to load data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "security":
        return Shield;
      case "defi":
        return Zap;
      case "architecture":
        return Clock;
      default:
        return Layers;
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
    <div className="space-y-10">
      {/* Welcome & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Marketplace
          </h1>
          <p className="text-slate-400">
            Discover and acquire specialized intelligence for your AI agents.
          </p>
        </div>

        <div className="flex items-center space-x-4 overflow-x-auto pb-2 sm:pb-0">
          <div className="glass-panel px-6 py-3 rounded-lg flex items-center space-x-4 min-w-[160px]">
            <div className="w-2 h-2 rounded-full bg-gold" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                Active Skills
              </p>
              <p className="text-xl font-bold text-white">
                {stats.activeSkills.toLocaleString()}+
              </p>
            </div>
          </div>
          <div className="glass-panel px-6 py-3 rounded-lg flex items-center space-x-4 min-w-[160px]">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                Transfers
              </p>
              <p className="text-xl font-bold text-white">
                {(stats.transfers / 1000).toFixed(1)}K
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {skills.map((skill, idx) => {
          const IconComponent = getIcon(skill.category);
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group"
            >
              <div className="glass-panel p-5 rounded-lg h-full flex flex-col border border-border-muted hover:border-white/10 transition-all bg-[#0D0F12]">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center text-gold group-hover:bg-gold/10 transition-all">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-bold px-2 py-1 bg-white/5 rounded text-slate-400">
                    <Star className="w-3 h-3 text-gold fill-gold" />
                    <span>
                      {skill.rating > 0 ? skill.rating.toFixed(1) : "New"}
                    </span>
                    <span className="text-[10px] text-slate-600 ml-1">
                      ({skill.reviewCount})
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-1">
                    {skill.category}
                  </p>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gold transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6 line-clamp-2">
                    {skill.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-border-muted flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                      Price
                    </p>
                    <p className="text-base font-black text-white">
                      {skill.priceStx.toFixed(1)}{" "}
                      <span className="text-[10px] text-gold">STX</span>
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/skill/${skill.id}`}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-gold text-white hover:text-obsidian rounded font-bold text-sm transition-all active:scale-95 group/btn"
                  >
                    <span>Select</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Upload Placeholder */}
        <div className="border border-dashed border-border-muted rounded-lg flex flex-col items-center justify-center p-8 text-center hover:border-gold/50 cursor-pointer transition-all group">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-gold/10 transition-all">
            <ExternalLink className="w-6 h-6 text-slate-600 group-hover:text-gold" />
          </div>
          <h3 className="text-lg font-bold text-slate-400 group-hover:text-white transition-colors">
            Sell your expertise
          </h3>
          <p className="text-xs text-slate-500 mt-2">
            Publish your context packs and earn STX.
          </p>
        </div>
      </div>
    </div>
  );
}
