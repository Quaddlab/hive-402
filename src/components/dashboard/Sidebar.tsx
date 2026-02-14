"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Search,
  FlaskConical,
  Layers,
  Wallet,
  Settings,
  LogOut,
  ChevronRight,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStacks } from "@/components/providers/StacksProvider";

const menuItems = [
  { icon: Search, label: "Marketplace", href: "/dashboard" },
  { icon: FlaskConical, label: "AI Lab", href: "/dashboard/lab" },
  { icon: Layers, label: "My Skills", href: "/dashboard/my-skills" },
  { icon: Upload, label: "Upload Skill", href: "/dashboard/upload-skill" },
  { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { isConnected, address, bnsName, connectWallet, disconnectWallet } =
    useStacks();

  // Helper to shorten address
  const truncateAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-obsidian border-r border-border-muted flex flex-col z-40">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border-muted">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-6 h-6 gold-gradient rounded flex items-center justify-center">
            <Activity className="w-4 h-4 text-obsidian" strokeWidth={3} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            HIVE<span className="text-gold">402</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-4">
          Main Menu
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer",
                isActive
                  ? "bg-gold/10 text-gold border border-gold/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent",
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon
                  className={cn(
                    "w-4 h-4",
                    isActive
                      ? "text-gold"
                      : "text-slate-500 group-hover:text-white",
                  )}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}

        <div className="pt-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-4">
          User Settings
        </div>
        <Link
          href="/dashboard/settings"
          className="group flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-500 group-hover:text-white" />
          <span>General Settings</span>
        </Link>
      </div>

      {/* Bottom Profile/Logout */}
      <div className="p-4 border-t border-border-muted">
        {isConnected ? (
          <>
            <div className="p-3 glass-panel rounded-lg flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded bg-gold/20 flex items-center justify-center text-gold font-bold text-xs">
                {address ? address.slice(-2).toUpperCase() : "??"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {bnsName || truncateAddress(address || "")}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {bnsName ? "Verified Identity" : "Authenticated Node"}
                </p>
              </div>
            </div>

            <button
              onClick={disconnectWallet}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-400/5 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </>
        ) : (
          <button
            onClick={connectWallet}
            className="w-full flex items-center justify-center space-x-2 py-3 gold-gradient rounded-lg text-obsidian font-bold text-sm hover:opacity-90 transition-all border-none"
          >
            <Wallet className="w-4 h-4" />
            <span>Connect Wallet</span>
          </button>
        )}
        <div className="mt-8 flex items-center space-x-2 px-2 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">
            {isConnected ? "Node Active" : "Initializing..."}
          </span>
        </div>
      </div>
    </aside>
  );
};
