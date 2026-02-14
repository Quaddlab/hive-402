"use client";

import React from "react";
import Link from "next/link";
import { Activity, LayoutDashboard, Wallet, ChevronRight } from "lucide-react";
import { useStacks } from "@/components/providers/StacksProvider";

export const Navbar = () => {
  const { isConnected, connectWallet } = useStacks();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-muted bg-obsidian/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 gold-gradient rounded flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all">
              <Activity className="w-5 h-5 text-obsidian" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-gold transition-colors font-sans">
              HIVE<span className="text-gold">402</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Marketplace
            </Link>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              How it works
            </a>
            <Link
              href="/docs"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Developers
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white hover:text-gold transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Launch App</span>
              </Link>
            ) : (
              <button
                onClick={() => connectWallet()}
                className="flex items-center space-x-2 px-5 py-2 bg-gold hover:bg-gold/90 text-obsidian rounded-md text-sm font-bold transition-all shadow-lg hover:shadow-gold/20 active:scale-95 group"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
