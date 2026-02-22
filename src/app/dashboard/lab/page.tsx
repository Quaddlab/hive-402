"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useStacks } from "@/components/providers/StacksProvider";
import { Loader2 } from "lucide-react";
import TerminalDrawer from "./TerminalDrawer";
import SkillPurchaseCard from "./SkillPurchaseCard";
import MarkdownRenderer from "@/components/MarkdownRenderer";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

      // 2. Poll for Agent Completion using recursive setTimeout (no race conditions)
      const taskId = data.taskId;
      let attempts = 0;
      const maxAttempts = 60;
      let cancelled = false;

      const pollOnce = async () => {
        if (cancelled) return;
        attempts++;

        try {
          const statusRes = await fetch(
            `/api/openclaw/task-status?taskId=${taskId}`,
          );
          const statusData = await statusRes.json();

          if (cancelled) return; // Check again after await

          if (statusData.error) {
            addLog("System", `Polling error: ${statusData.error}`, "error");
            if (!cancelled) setTimeout(pollOnce, 1000);
            return;
          }

          const task = statusData.task;

          if (task.status === "completed") {
            cancelled = true; // Stop all future polls
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
                cleanOutput =
                  parsed.text ||
                  "I found a matching intelligence pack on the marketplace. Purchase it to unlock the answer.";
                skillData = parsed.skill;
                addLog(
                  "Node",
                  `Skill recommended: "${parsed.skill.title}" (${parsed.skill.priceStx} STX)`,
                  "success",
                );
              } else if (parsed.type === "no_skills_found") {
                cleanOutput = parsed.text;
              } else if (parsed.type === "answer") {
                cleanOutput = parsed.text;
                addLog(
                  "Node",
                  `Intelligence recalled from acquired skills: ${parsed.sources?.join(", ") || "Active Context"}`,
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
            return; // Done — no more polling
          }

          if (task.status === "failed") {
            cancelled = true;
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
            cancelled = true;
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
            return;
          }

          // Schedule next poll (only if not resolved)
          if (!cancelled) {
            setTimeout(pollOnce, 1000);
          }
        } catch (e: any) {
          console.error(e);
          // Retry on network error
          if (!cancelled && attempts < maxAttempts) {
            setTimeout(pollOnce, 1000);
          }
        }
      };

      // Start first poll after 1 second
      setTimeout(pollOnce, 1000);
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
      return [...prev, { ...skill, txId }];
    });
  };

  return (
    <div className="h-[calc(100vh-170px)] flex gap-6 relative">
      {/* Central Command (Chat) */}
      <div
        className={cn(
          "flex flex-col relative z-10 transition-all duration-300 min-w-0",
          isSidebarOpen ? "flex-1" : "w-full max-w-5xl mx-auto",
        )}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between px-2 py-4 mb-2 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <Bot className="w-4 h-4 text-gold" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide">
                Neural Link v1.0
              </p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-emerald-500 font-bold uppercase">
                  Connected
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className={cn(
                "flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors uppercase tracking-widest",
                isConsoleOpen
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : "bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/10",
              )}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console</span>
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "p-2 rounded-full transition-colors flex items-center justify-center",
                isSidebarOpen
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-white hover:bg-white/5",
              )}
              title={
                isSidebarOpen ? "Hide Context Sidebar" : "Show Context Sidebar"
              }
            >
              {isSidebarOpen ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto px-4 space-y-8 custom-scrollbar pb-48">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start gap-4 w-full group",
                isSidebarOpen ? "max-w-4xl mx-auto" : "max-w-4xl mx-auto",
                msg.role === "user" ? "flex-row-reverse" : "",
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gold/10 shrink-0 flex items-center justify-center border border-gold/20 mt-1">
                  <Bot className="w-4 h-4 text-gold" />
                </div>
              )}

              <div
                className={cn(
                  "text-[15px] leading-relaxed",
                  msg.role === "user"
                    ? "bg-white/10 px-5 py-3 rounded-2xl rounded-tr-sm text-white max-w-[80%]"
                    : "text-slate-300 w-full min-w-0 pt-1.5",
                )}
              >
                {msg.role === "assistant" ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  msg.content
                )}
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

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-obsidian via-obsidian/95 to-transparent pt-12 pb-2 z-20">
          <div className="max-w-3xl mx-auto px-4 w-full">
            <div className="relative bg-[#202020] border border-white/10 rounded-3xl shadow-2xl overflow-hidden focus-within:border-gold/30 focus-within:ring-1 focus-within:ring-gold/30 transition-all">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Message Neural Link..."
                className="w-full bg-transparent px-5 py-4 pr-14 text-[15px] text-white focus:outline-none placeholder:text-slate-500 resize-none custom-scrollbar scroll-py-2"
                rows={1}
                style={{ height: "56px" }}
              />
              <div className="absolute right-3 bottom-0 top-0 flex items-center">
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "p-2 rounded-full transition-all flex items-center justify-center",
                    input.trim() && !isLoading
                      ? "bg-white text-black hover:bg-slate-200 shadow-md transform scale-100"
                      : "bg-[#303030] text-slate-500 cursor-not-allowed transform scale-95",
                  )}
                >
                  {isLoading ? (
                    <Activity className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Send className="w-4 h-4 ml-0.5 mt-0.5" />
                  )}
                </button>
              </div>
            </div>
            <div className="text-center mt-3">
              <p className="text-[11px] text-slate-500">
                AI agents can make mistakes. Verify important information with
                OpenClaw.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Side Management (Intelligence) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
            animate={{ opacity: 1, width: 320, marginLeft: 24 }}
            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
            className="flex flex-col space-y-6 shrink-0 overflow-hidden"
          >
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

              {skills.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Status</span>
                    <span className="text-emerald-500">Settled</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gold shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span
                      className="truncate max-w-[120px]"
                      title={skills[skills.length - 1].txId}
                    >
                      TX:{" "}
                      {skills[skills.length - 1].txId
                        ? `${skills[skills.length - 1].txId.slice(0, 6)}...${skills[skills.length - 1].txId.slice(-4)}`
                        : "Verified"}
                    </span>
                    {skills[skills.length - 1].txId ? (
                      <a
                        href={`https://explorer.stacks.co/txid/${skills[skills.length - 1].txId}?chain=testnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:underline transition-all"
                      >
                        View on Stacks
                      </a>
                    ) : (
                      <span className="text-slate-500">Verified</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 opacity-50">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Status</span>
                    <span className="text-slate-500">Pending Action</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-gold transition-all duration-1000" />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="truncate max-w-[120px]">TX: None</span>
                    <span className="text-slate-500 cursor-not-allowed">
                      View on Stacks
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TerminalDrawer
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        logs={logs}
        status={agentStatus}
      />
    </div>
  );
}
