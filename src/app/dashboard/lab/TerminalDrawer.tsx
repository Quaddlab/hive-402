import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X, ChevronDown, Activity, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  timestamp: string;
  source: "UI" | "API" | "DB" | "Network" | "Node" | "System" | "Status";
  message: string;
  type?: "info" | "success" | "warning" | "error";
}

interface TerminalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  status: "idle" | "pending" | "processing" | "completed" | "failed";
}

export default function TerminalDrawer({
  isOpen,
  onClose,
  logs,
  status,
}: TerminalDrawerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 h-80 bg-[#0a0a0a] border-t border-gold/20 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-50 flex flex-col font-mono"
        >
          {/* Header */}
          <div className="h-10 bg-white/5 border-b border-gold/10 flex items-center justify-between px-4 select-none">
            <div className="flex items-center space-x-3">
              <Terminal className="w-4 h-4 text-gold" />
              <span className="text-xs font-bold text-gold uppercase tracking-widest">
                OpenClaw Console Output
              </span>
              <div className="h-4 w-[1px] bg-white/10 mx-2" />
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    status === "processing"
                      ? "bg-amber-500 animate-pulse"
                      : status === "completed"
                        ? "bg-emerald-500"
                        : status === "failed"
                          ? "bg-red-500"
                          : "bg-slate-600",
                  )}
                />
                <span className="text-[10px] uppercase text-slate-400 font-bold">
                  {status === "processing"
                    ? "Processing Task..."
                    : status === "completed"
                      ? "Task Complete"
                      : "Idle"}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded transition-colors text-slate-500 hover:text-white"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Logs Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar text-xs"
          >
            {logs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-2">
                <Activity className="w-8 h-8 opacity-20" />
                <p>Waiting for system telemetry...</p>
              </div>
            )}
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start space-x-3 font-medium",
                  log.type === "error"
                    ? "text-red-400"
                    : log.type === "success"
                      ? "text-emerald-400"
                      : log.type === "warning"
                        ? "text-amber-400"
                        : "text-slate-300",
                )}
              >
                <span className="text-slate-600 shrink-0 select-none w-16">
                  {log.timestamp}
                </span>
                <span
                  className={cn(
                    "uppercase tracking-wider text-[10px] w-16 shrink-0 text-right select-none",
                    log.source === "UI"
                      ? "text-indigo-400"
                      : log.source === "API"
                        ? "text-blue-400"
                        : log.source === "DB"
                          ? "text-violet-400"
                          : log.source === "Node"
                            ? "text-gold"
                            : "text-slate-500",
                  )}
                >
                  [{log.source}]
                </span>
                <span className="flex-1 break-all">{log.message}</span>
              </div>
            ))}
            {status === "processing" && (
              <div className="flex items-center space-x-2 text-gold/50 pl-20 pt-2 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Syncing with network...</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
