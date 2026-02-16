"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Terminal,
  Zap,
  ShieldCheck,
  Plus,
  Bot,
  Settings2,
  Lock,
  Activity,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useStacks } from "@/components/providers/StacksProvider";
import { Loader2 } from "lucide-react";
import TerminalDrawer from "./TerminalDrawer";
import SkillPurchaseCard from "./SkillPurchaseCard";

export default function AILabPage() {
  const { address, isConnected } = useStacks();
  const [skills, setSkills] = useState<any[]>([]);
  const [messages, setMessages] = useState<
    { role: string; content: string; skillData?: any }[]
  >([
    {
      role: "assistant",
      content:
        "Agent initialized. Ready to process specialized context. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSkillsLoading, setIsSkillsLoading] = useState(true);

  // Console State
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [agentStatus, setAgentStatus] = useState<
    "idle" | "pending" | "processing" | "completed" | "failed"
  >("idle");

  const addLog = (
    source: "UI" | "API" | "DB" | "Network" | "Node" | "System" | "Status",
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
  ) => {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
    setLogs((prev) => [...prev, { timestamp, source, message, type }]);
  };

  React.useEffect(() => {
    const fetchMySkills = async () => {
      if (!address) return;
      try {
        const res = await fetch(`/api/user/skills?address=${address}`);
        const data = await res.json();
        setSkills(data.skills || []);
      } catch (e) {
        console.error("Failed to load your skills context:", e);
      } finally {
        setIsSkillsLoading(false);
      }
    };

    if (isConnected && address) {
      fetchMySkills();
    } else if (!isConnected) {
      setIsSkillsLoading(false);
    }
  }, [address, isConnected]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setAgentStatus("pending");
    setLogs([]); // Clear logs for new run
    setIsConsoleOpen(true); // Auto-open console

    addLog("UI", "Initializing agent request sequence...");

    try {
      // 1. Submit Task to OpenClaw Queue
      addLog("API", "POST /api/chat - Transmitting context payload...");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages.map((m) => ({
            role: m.role,
            parts: m.content,
          })),
          skillIds: skills.map((s) => s.id),
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      addLog(
        "DB",
        `Task ${data.taskId.slice(0, 8)}... created successfully.`,
        "success",
      );
      addLog("Network", "Broadcasting task to OpenClaw worker nodes...");

      // 2. Poll for Agent Completion
      const taskId = data.taskId;
      let attempts = 0;
      const maxAttempts = 60; // 60 * 1s = 60s timeout

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          // Poll the new status endpoint
          const statusRes = await fetch(
            `/api/openclaw/task-status?taskId=${taskId}`,
          );
          const statusData = await statusRes.json();

          if (statusData.error) {
            addLog("System", `Polling error: ${statusData.error}`, "error");
            return;
          }

          const task = statusData.task;

          // Check if status changed
          if (task.status === "processing" && agentStatus !== "processing") {
            setAgentStatus("processing");
            addLog(
              "Node",
              "Worker node claimed task. Processing context...",
              "warning",
            );
          }

          if (task.status === "completed") {
            clearInterval(pollInterval);
            setIsLoading(false);
            setAgentStatus("completed");

            addLog(
              "Node",
              "Computation complete. Result signature verified.",
              "success",
            );
            addLog("System", "Injecting response into Neural Link interface.");

            // Parse output — check if it's a structured recommendation
            let cleanOutput = task.output;
            let skillData: any = null;
            try {
              const parsed = JSON.parse(task.output);
              if (parsed.type === "skill_recommendation" && parsed.skill) {
                // Agent found a skill — render purchase card
                cleanOutput =
                  parsed.text || "I found a matching skill on the marketplace.";
                skillData = parsed.skill;
                addLog(
                  "Node",
                  `Skill recommended: "${parsed.skill.title}" (${parsed.skill.priceStx} STX)`,
                  "success",
                );
              } else if (parsed.text) {
                cleanOutput = parsed.text;
              } else if (parsed.content) {
                cleanOutput = parsed.content;
              }
            } catch (e) {
              // use raw string
            }

            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: cleanOutput,
                ...(skillData ? { skillData } : {}),
              },
            ]);
            return;
          }

          if (task.status === "failed") {
            clearInterval(pollInterval);
            setIsLoading(false);
            setAgentStatus("failed");
            addLog("Node", "Worker reported execution failure.", "error");
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: "Agent execution failed. Check console for logs.",
              },
            ]);
            return;
          }

          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsLoading(false);
            setAgentStatus("failed");
            addLog(
              "System",
              "Operation timed out. No worker response.",
              "error",
            );
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: "Agent timed out. Please check console.",
              },
            ]);
          }
        } catch (e: any) {
          console.error(e);
          // Don't spam logs with poll errors
        }
      }, 1000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reach Neural Link.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Connection Interrupted: ${errorMessage}`,
        },
      ]);
      addLog("System", `Critical Error: ${errorMessage}`, "error");
      setIsLoading(false);
      setAgentStatus("failed");
    }
  };

  const handlePurchaseComplete = (skill: any, txId: string) => {
    addLog(
      "System",
      `Skill "${skill.title}" purchased! TX: ${txId}`,
      "success",
    );
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `✅ **Intelligence Acquired!**\n\n**${skill.title}** has been purchased and injected into your context.\n\n**Description:** ${skill.description}\n\n**TX:** ${txId}\n\nThis intelligence is now available for future queries.`,
      },
    ]);
    // Add to active context
    setSkills((prev) => {
      if (prev.find((s) => s.id === skill.id)) return prev;
      return [...prev, skill];
    });
  };

  return (
    <div className="h-[calc(100vh-170px)] flex gap-6 relative">
      {/* Central Command (Chat) */}
      <div className="flex-1 flex flex-col glass-panel rounded-lg overflow-hidden relative z-10">
        {/* Chat Header */}
        <div className="h-14 border-b border-border-muted bg-white/5 flex items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest">
                Neural Link v1.0
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-emerald-500 font-bold uppercase">
                  Active
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-white/5 rounded transition-colors text-slate-500 hover:text-white">
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-start space-x-4 max-w-[85%]",
                msg.role === "user"
                  ? "ml-auto flex-row-reverse space-x-reverse"
                  : "",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded shrink-0 flex items-center justify-center",
                  msg.role === "user" ? "bg-slate-800" : "bg-gold/20",
                )}
              >
                {msg.role === "user" ? (
                  <div className="text-[10px] font-bold text-slate-400">ME</div>
                ) : (
                  <Activity className="w-4 h-4 text-gold" />
                )}
              </div>
              <div
                className={cn(
                  "p-4 rounded-lg border text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-slate-900 border-border-muted text-slate-300"
                    : "bg-white/5 border-border-muted text-white",
                )}
              >
                {msg.content}
                {msg.skillData && (
                  <div className="mt-3">
                    <SkillPurchaseCard
                      skill={msg.skillData}
                      onPurchaseComplete={handlePurchaseComplete}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-gold animate-pulse">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Neural Link Ingesting Context...
              </span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-obsidian border-t border-border-muted relative z-20">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Inject command or prompt..."
              className="w-full bg-white/5 border border-border-muted rounded-md p-4 pr-16 text-sm text-white focus:outline-none focus:border-gold/50 transition-all placeholder:text-slate-600 resize-none h-20"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className={cn(
                "absolute bottom-4 right-4 p-2 gold-gradient rounded-md text-obsidian shadow-lg transition-all",
                isLoading
                  ? "opacity-50 grayscale cursor-not-allowed"
                  : "hover:shadow-gold/20 active:scale-95",
              )}
            >
              {isLoading ? (
                <Activity className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-3 px-2">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              System Ready: 2048 Tokens available
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                className={cn(
                  "flex items-center space-x-1.5 text-[10px] cursor-pointer transition-colors uppercase tracking-wider font-bold",
                  isConsoleOpen
                    ? "text-gold"
                    : "text-slate-500 hover:text-white",
                )}
              >
                <Terminal className="w-3 h-3" />
                <span>Console</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Management (Intelligence) */}
      <div className="w-80 flex flex-col space-y-6">
        {/* Active Context */}
        <div className="glass-panel rounded-lg p-6 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-gold" />
              <span>Active Context</span>
            </h3>
            <span className="px-1.5 py-0.5 rounded bg-gold/20 text-[10px] font-bold text-gold uppercase">
              {skills.length} Installed
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="p-4 bg-white/5 border border-gold/20 rounded-md relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 rotate-45 translate-x-8 -translate-y-8" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-tighter">
                    {skill.category}
                  </span>
                  <ShieldCheck className="w-3 h-3 text-gold" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  {skill.title}
                </h4>
                <p className="text-[10px] text-slate-500 line-clamp-2">
                  {skill.description}
                </p>
              </div>
            ))}

            {skills.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
                  No active intelligence detected.
                </p>
              </div>
            )}

            {/* Empty States */}
            <button className="w-full py-6 border border-dashed border-border-muted rounded-lg flex flex-col items-center justify-center space-y-2 hover:border-gold group transition-all cursor-pointer">
              <Plus className="w-5 h-5 text-slate-600 group-hover:text-gold transition-colors" />
              <span className="text-[10px] font-bold text-slate-600 group-hover:text-white uppercase tracking-widest">
                Inject Skill Pack
              </span>
            </button>
          </div>
        </div>

        {/* Settlement Status */}
        <div className="glass-panel rounded-lg p-6">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center space-x-2 mb-6">
            <Lock className="w-4 h-4 text-slate-500" />
            <span>x402 Verification</span>
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span>Status</span>
              <span className="text-emerald-500">Settled</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gold shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span className="truncate max-w-[120px]">TX: 0x4f2...a9d</span>
              <span className="text-gold cursor-pointer hover:underline">
                View on Stacks
              </span>
            </div>
          </div>
        </div>
      </div>

      <TerminalDrawer
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        logs={logs}
        status={agentStatus}
      />
    </div>
  );
}
