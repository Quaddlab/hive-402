"use client";

import React, { useEffect } from "react";
import {
  Bell,
  Search,
  Globe,
  ChevronRight,
  ShieldCheck,
  LayoutGrid,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useUIState } from "@/context/UIStateContext";
import { useStacks } from "@/components/providers/StacksProvider";

export const Header = ({ title }: { title: string }) => {
  const { locale, setLocale, t } = useLocale();
  const { bnsName, address } = useStacks();
  const { setSearchOpen, setNotifOpen } = useUIState();

  // Helper to shorten address
  const truncateAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const displayName = bnsName || truncateAddress(address || "");

  // Handle Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSearchOpen]);

  const cycleLocale = () => {
    const locales: ("EN" | "ES" | "CN" | "DE")[] = ["EN", "ES", "CN", "DE"];
    const currentIndex = locales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % locales.length;
    setLocale(locales[nextIndex]);
  };

  return (
    <header className="h-16 border-b border-border-muted bg-obsidian sticky top-0 z-30 flex items-center justify-between px-8">
      {/* Search & Breadcrumbs */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center text-xs space-x-2 text-slate-500">
          <LayoutGrid className="w-3 h-3" />
          <ChevronRight className="w-3 h-3" />
          <span className="text-white font-medium uppercase tracking-widest">
            {title === "Intelligence Marketplace" ? t("marketplace") : title}
          </span>
        </div>

        <div
          onClick={() => setSearchOpen(true)}
          className="relative hidden lg:block group cursor-pointer"
        >
          {/* High-end "Command Palette" Trigger Design */}
          <div className="flex items-center space-x-3 h-10 px-4 bg-white/3 hover:bg-white/6 border border-white/5 hover:border-gold/40 rounded-lg transition-all duration-300 min-w-[320px] shadow-sm hover:shadow-gold/5">
            <Search className="w-4 h-4 text-slate-500 group-hover:text-gold transition-colors duration-300" />
            <span className="flex-1 text-sm font-medium text-slate-500 group-hover:text-slate-300 transition-colors duration-300">
              {t("search_placeholder")}
            </span>

            {/* Shortcut Pill - Modern glass style */}
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-black text-slate-600 group-hover:text-gold group-hover:border-gold/30 transition-all duration-300">
              <span className="opacity-50 text-[11px]">⌘</span>
              <span className="tracking-tighter">K</span>
            </div>
          </div>

          {/* Subtle bottom glow on hover */}
          <div className="absolute -bottom-1 left-4 right-4 h-px bg-linear-to-r from-transparent via-gold/0 group-hover:via-gold/40 to-transparent transition-all duration-500" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-6">
        {/* Network Badge */}
        {/* Network Badge */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest mr-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>{t("testnet")}</span>
        </div>

        <div className="flex items-center space-x-4">
          <div
            onClick={() => setNotifOpen(true)}
            className="relative cursor-pointer hover:bg-white/5 p-2 rounded-full transition-all group"
          >
            <Bell className="w-5 h-5 text-slate-400 group-hover:text-white" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-gold border border-obsidian rounded-full animate-bounce" />
          </div>

          <button
            onClick={cycleLocale}
            className="flex items-center space-x-3 px-4 py-2 bg-white/5 border border-border-muted hover:border-gold/30 rounded text-sm font-bold text-white transition-all cursor-pointer group"
          >
            <Globe className="w-4 h-4 text-gold group-hover:rotate-12 transition-transform" />
            <span>{locale}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
