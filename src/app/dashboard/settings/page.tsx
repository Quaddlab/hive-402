"use client";

import React, { useState } from "react";
import { User, Bell, Shield, Eye, EyeOff, Save, Cpu } from "lucide-react";

export default function SettingsPage() {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
          General <span className="text-gold">Settings</span>
        </h1>
        <p className="text-slate-500 font-medium">
          Configure your intelligence node and communication protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Section */}
        <section className="glass-panel p-8 rounded-2xl border border-white/5 bg-white/1 space-y-6">
          <div className="flex items-center space-x-3 text-gold">
            <User className="w-5 h-5" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">
              Profile Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Display Handle
              </label>
              <input
                type="text"
                placeholder="@stacks_builder"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-gold/50 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Public Label
              </label>
              <select className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-gold/50 transition-all font-bold appearance-none cursor-pointer">
                <option>Intelligence Recipient</option>
                <option>Intelligence Provider</option>
                <option>Security Researcher</option>
              </select>
            </div>
          </div>
        </section>

        {/* AI Configuration Section */}
        <section className="glass-panel p-8 rounded-2xl border border-white/5 bg-white/1 space-y-6">
          <div className="flex items-center space-x-3 text-gold">
            <Cpu className="w-5 h-5" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">
              AI Lab Engine (Gemini Pro)
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gold/5 border border-gold/10 flex items-start space-x-4">
              <Shield className="w-5 h-5 text-gold mt-1" />
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Your API key is stored locally in your browser and is only used
                to facilitate direct requests to Google&apos;s Gemini API during
                lab sessions.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  placeholder="AIzaSy..."
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 text-white font-mono focus:outline-none focus:border-gold/50 transition-all"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Global Communication Section */}
        <section className="glass-panel p-8 rounded-2xl border border-white/5 bg-white/1 space-y-6">
          <div className="flex items-center space-x-3 text-gold">
            <Bell className="w-5 h-5" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">
              Notification Protocol
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                id: "notif-1",
                label: "Payment Settlements",
                desc: "Alert when personal intelligence packs are purchased.",
              },
              {
                id: "notif-2",
                label: "Ingestion Updates",
                desc: "Status reports on active knowledge ingestion flows.",
              },
              {
                id: "notif-3",
                label: "Security Alerts",
                desc: "Critical alerts regarding smart contract vulnerabilities.",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-white/2 transition-colors group"
              >
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-gold transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {item.desc}
                  </p>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/5 border border-white/10 cursor-pointer">
                  <div className="h-4 w-4 transform rounded-full bg-slate-600 transition translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="flex items-center space-x-3 px-10 py-4 bg-gold text-obsidian font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(255,184,0,0.2)] active:scale-95">
            <Save className="w-5 h-5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 opacity-30 grayscale pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Node Status: Operational
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        </div>
        <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">
          Hive Protocol v0.4.02-Alpha · Build 2026.02.12
        </p>
      </div>
    </div>
  );
}
