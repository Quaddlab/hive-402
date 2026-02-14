"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, ArrowRight, Zap, Shield, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";

export const SearchModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/skills/search?q=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        // Ensure data is an array
        setResults(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Search failed:", e);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const getIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "security":
        return Shield;
      case "defi":
        return Zap;
      default:
        return Cpu;
    }
  };

  const handleSelectResult = (id: string) => {
    router.push(`/dashboard/skill/${id}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-obsidian/60"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#0D0F12] border border-white/10 rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Top scanning line animation */}
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"
            />

            <div className="p-6 flex items-center space-x-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="flex items-center justify-center"
                  >
                    <Command className="w-5 h-5 text-gold" />
                  </motion.div>
                ) : (
                  <Search className="w-5 h-5 text-gold" />
                )}
              </div>
              <input
                autoFocus
                type="text"
                placeholder="Initialize intelligence search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-lg text-white focus:outline-none placeholder:text-slate-600 font-bold tracking-tight"
              />
              <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                <span className="opacity-40">ESC to close</span>
              </div>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {query === "" ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                      Quick Ingestion Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3 px-2">
                      <div className="p-4 rounded-xl border border-white/5 text-slate-500 text-xs text-center opacity-50 italic col-span-2">
                        Enter keyword to begin search sequence...
                      </div>
                    </div>
                  </div>
                </div>
              ) : results.length === 0 && !isLoading ? (
                <div className="p-10 text-center opacity-30">
                  <Command className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">
                    No intelligence matches found
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 px-2">
                  {results.map((item) => {
                    const Icon = getIcon(item.category);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectResult(item.id)}
                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all group text-left"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/30 transition-all shadow-inner">
                            <Icon className="w-6 h-6 text-slate-400 group-hover:text-gold transition-all group-hover:scale-110" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-white mb-0.5 group-hover:text-gold transition-colors">
                              {item.title}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-slate-500 font-black uppercase tracking-widest border border-white/5 group-hover:text-slate-400">
                                Skill
                              </span>
                              <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">
                                {item.category}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] font-black text-slate-700 uppercase opacity-0 group-hover:opacity-100 transition-all">
                            Execute
                          </span>
                          <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-gold transition-all -translate-x-2 group-hover:translate-x-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-none">
                    Node: hive-alpha-01
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-50" />
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-none">
                    Latency: 14ms
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-black uppercase">
                <Command className="w-3 h-3" />
                <span> + ↵ to finalize</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
