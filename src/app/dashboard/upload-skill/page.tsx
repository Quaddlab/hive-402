"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Shield,
  Zap,
  Globe,
  Database,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useStacks } from "@/components/providers/StacksProvider";

export default function UploadSkillPage() {
  const [step, setStep] = useState(1);
  const { address, isConnected } = useStacks();
  const [formData, setFormData] = useState({
    title: "",
    category: "Smart Contract Security",
    description: "",
    priceStx: "1.0",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState("");

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/skills/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          providerAddress: address,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setTxId("tx-" + data.id.slice(0, 10)); // Mocked TX ID for demo
        setStep(3);
      }
    } catch (e) {
      console.error("Upload failed:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[10px] font-black text-gold uppercase tracking-[0.2em]"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span>Intelligence Provider Protocol</span>
        </motion.div>
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase">
          Publish <span className="text-gold">Intelligence</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Technical knowledge packs are cryptographically signed and settled via
          the x402 protocol on Stacks.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black transition-all ${
                step >= s
                  ? "bg-gold/10 border-gold/40 text-gold shadow-[0_0_15px_rgba(255,184,0,0.1)]"
                  : "border-white/5 text-slate-700"
              }`}
            >
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : `0${s}`}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-px ${step > s ? "bg-gold/40" : "bg-white/5"}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Area */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel p-8 rounded-2xl border border-white/5 bg-white/1"
      >
        {step === 1 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Knowledge Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Clarity Security Expert"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-gold/50 transition-all font-bold placeholder:text-slate-700 placeholder:font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Intelligence Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-gold/50 transition-all font-bold appearance-none cursor-pointer"
                >
                  <option>Smart Contract Security</option>
                  <option>DeFi Architecture</option>
                  <option>L2 Fundamentals</option>
                  <option>Zk-Proof Knowledge</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Protocol Description
              </label>
              <textarea
                rows={4}
                placeholder="Explain the technical boundaries of this intelligence pack..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold/50 transition-all font-medium placeholder:text-slate-700"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.title || !formData.description}
              className="w-full py-4 bg-gold text-obsidian font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(255,184,0,0.2)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Initialize Node & Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-white/3 border border-white/5 space-y-4">
                <div className="flex items-center space-x-3 text-gold">
                  <Database className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Settlement Price
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={formData.priceStx}
                    onChange={(e) =>
                      setFormData({ ...formData, priceStx: e.target.value })
                    }
                    className="w-full h-14 bg-obsidian border border-white/10 rounded-xl pl-6 pr-16 text-2xl font-black text-white focus:outline-none focus:border-gold/50 transition-all"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gold text-sm tracking-widest">
                    STX
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 font-bold uppercase italic">
                  Payments are handled via x402 payment channels.
                </p>
              </div>

              <div className="p-6 rounded-2xl border-2 border-dashed border-gold/20 bg-gold/5 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:bg-gold/10 transition-all group">
                <Upload className="w-8 h-8 text-gold group-hover:scale-110 transition-transform" />
                <div>
                  <span className="block text-sm font-black text-white uppercase">
                    Upload Source
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                    PDF, MD, or JSON (Max 50MB)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-2 py-4 bg-gold text-obsidian font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(255,184,0,0.2)]"
              >
                {isSubmitting ? "Processing..." : "Sign & Finalize"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-10 text-center space-y-8">
            <div className="w-24 h-24 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(255,184,0,0.1)]">
              <CheckCircle2 className="w-12 h-12 text-gold" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
                Protocol Signed
              </h2>
              <p className="text-slate-500 font-medium">
                Your intelligence pack is now broadcasting to the marketplace.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/2 border border-white/5 max-w-sm mx-auto">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-600 tracking-widest uppercase mb-4">
                <span>On-Chain Status</span>
                <span className="text-green-500">Confirmed</span>
              </div>
              <div className="space-y-2 font-mono text-[10px] text-left text-slate-500 break-all leading-tight">
                <p className="text-white font-bold">INTERNAL_ID:</p>
                <p>{txId}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setStep(1);
                setFormData({
                  title: "",
                  category: "Smart Contract Security",
                  description: "",
                  priceStx: "1.0",
                });
              }}
              className="inline-flex items-center space-x-3 px-8 py-3 bg-white/5 border border-white/10 hover:border-gold/50 rounded text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-gold transition-all"
            >
              <span>Publish Another</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Tech Details Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Shield,
            title: "Verified Auth",
            desc: "Every pack is cryptographically linked to your wallet.",
          },
          {
            icon: Zap,
            title: "Instant Yield",
            desc: "Earn STX immediately upon successful ingestion.",
          },
          {
            icon: Globe,
            title: "Global Relay",
            desc: "Intelligence is edge-cached for instant retrieval.",
          },
        ].map((item, i) => (
          <div key={i} className="p-4 flex items-start space-x-3">
            <div className="p-2 rounded bg-white/5 border border-white/10">
              <item.icon className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">
                {item.title}
              </h4>
              <p className="text-[10px] text-slate-600 font-medium uppercase tracking-tighter">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
