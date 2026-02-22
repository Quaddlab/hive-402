"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  LayoutDashboard,
  Wallet,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useStacks } from "@/components/providers/StacksProvider";
import { MobileWalletModal } from "./MobileWalletModal";
import { AnimatePresence, motion } from "framer-motion";

export const Navbar = () => {
  const { isConnected, connectWallet } = useStacks();
  const [isMobileModalOpen, setIsMobileModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleConnectClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileModalOpen(true);
    } else {
      connectWallet();
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-muted bg-obsidian/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-[14px] sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 gold-gradient rounded flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all">
                <Activity className="w-5 h-5 text-obsidian" strokeWidth={2.5} />
              </div>
              <span className="text-[16px] md:text-xl font-bold tracking-tight text-white group-hover:text-gold transition-colors font-sans">
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

            {/* Actions - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {isConnected ? (
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 text-[14px] md:text-sm font-medium text-white hover:text-gold transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Launch App</span>
                </Link>
              ) : (
                <button
                  onClick={handleConnectClick}
                  className="flex items-center space-x-2 px-5 py-2 bg-gold hover:bg-gold/90 text-obsidian rounded-md text-[14px] md:text-sm font-bold transition-all shadow-lg hover:shadow-gold/20 active:scale-95 group cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>

            {/* Actions - Mobile */}
            <div className="flex md:hidden items-center space-x-2">
              {isConnected ? (
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-[12px] font-medium text-white hover:text-gold transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>App</span>
                </Link>
              ) : (
                <button
                  onClick={handleConnectClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-gold hover:bg-gold/90 text-obsidian rounded-md text-[12px] font-bold transition-all active:scale-95 group cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Connect</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform hidden sm:block" />
                </button>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 z-100 bg-obsidian/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-[240px] z-101 bg-obsidian border-l border-border-muted shadow-2xl p-6 flex flex-col"
            >
              <div className="flex justify-end mb-8 pt-2 hover:bg-transparent">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col space-y-6">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[16px] font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Marketplace
                </Link>
                <a
                  href="#how-it-works"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[16px] font-medium text-slate-300 hover:text-white transition-colors"
                >
                  How it works
                </a>
                <Link
                  href="/docs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[16px] font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Developers
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <MobileWalletModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />
    </>
  );
};
