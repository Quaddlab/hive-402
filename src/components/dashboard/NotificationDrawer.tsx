"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Zap, ShieldAlert, Cpu } from "lucide-react";
import { useStacks } from "@/components/providers/StacksProvider";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "system";
  icon: React.ElementType;
}

const notifications: Notification[] = [
  {
    id: "1",
    title: "Neuro-Link Established",
    message:
      "Clarity Security Master skill fragment successfully ingested into your primary agent.",
    time: "2m ago",
    type: "success",
    icon: Zap,
  },
  {
    id: "2",
    title: "x402 Payment confirmed",
    message:
      "Transfer of 5.0 STX completed for high-priority DeFi patterns Pack.",
    time: "15m ago",
    type: "info",
    icon: Cpu,
  },
  {
    id: "3",
    title: "Security Patch Available",
    message:
      "A new version of the Bitcoin L2 fundamentals skill is now available on-chain.",
    time: "1h ago",
    type: "warning",
    icon: ShieldAlert,
  },
];

export const NotificationDrawer = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { address, isConnected } = useStacks();
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && isConnected && address) {
      setLoading(true);
      fetch(`/api/user/logs?address=${address}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setLogs(data);
        })
        .catch((err) => console.error("Failed to load logs:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, isConnected, address]);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return Zap;
      case "warning":
        return ShieldAlert;
      default:
        return Cpu;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Subdued for better background visibility */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-obsidian/80 z-40"
          />

          {/* Drawer - Industrial Command Side-panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-obsidian border-l border-white/10 z-50 shadow-2xl overflow-hidden"
          >
            {/* Top scanning line animation */}
            <motion.div
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            {/* Decorative line */}
            <div className="absolute top-0 left-0 w-px h-full bg-linear-to-b from-transparent via-gold/30 to-transparent" />

            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gold/5 flex items-center justify-center border border-gold/20 shadow-[0_0_15px_rgba(255,184,0,0.1)]">
                  <Bell className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">
                    System Logs
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    Intelligence Transfer Protocol
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all group"
              >
                <X className="w-5 h-5 text-slate-500 group-hover:text-white" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {logs.length === 0 && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 opacity-20">
                    <Cpu className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-10">
                    Zero events detected
                  </h3>
                  <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest max-w-[200px] leading-relaxed">
                    Intelligence transfer protocol is currently idle. Waiting
                    for x402 signatures.
                  </p>
                </div>
              )}

              {logs.map((notif) => {
                const Icon = getIcon(notif.type);
                return (
                  <div
                    key={notif.id}
                    className="p-5 rounded-2xl bg-white/2 border border-white/5 hover:border-gold/30 hover:bg-white/4 transition-all group"
                  >
                    <div className="flex items-start space-x-5">
                      <div className="mt-1 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/30 transition-all shadow-inner">
                        <Icon
                          className={`w-5 h-5 ${notif.type === "success" ? "text-green-500" : notif.type === "warning" ? "text-gold" : "text-blue-400"}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="flex-1 text-sm font-black text-white group-hover:text-gold transition-colors truncate uppercase tracking-tight">
                            {notif.title}
                          </h3>
                          <span className="text-[10px] font-black tracking-widest text-gold uppercase">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          {notif.message}
                        </p>

                        {/* Sub-status indicator */}
                        <div className="mt-4 flex items-center space-x-3 text-[9px] font-black uppercase tracking-widest">
                          <span className="text-slate-700">
                            Protocol: x402-v1
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-800" />
                          <span className="text-slate-700 truncate">
                            ID: {notif.id.slice(0, 12)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-8 border-b border-border-muted bg-white/2 relative overflow-hidden">
              <button className="w-full py-4 bg-white/3 border border-white/10 hover:border-gold/50 hover:bg-gold/5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all shadow-sm">
                Acknowledge All Events
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
