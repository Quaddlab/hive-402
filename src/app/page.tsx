"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStacks } from "@/components/providers/StacksProvider";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  const { isConnected } = useStacks();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  if (isConnected) return null;
  return (
    <main className="min-h-screen bg-obsidian">
      <Navbar />
      <Hero />
      <Features />

      {/* Visual Break / Divider */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-border-muted to-transparent" />

      {/* Call to Action Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold/5 blur-[100px] -z-10 opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight">
            Ready to <span className="text-gold">evolve</span> your agent?
          </h2>
          <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">
            Join the decentralized network of AI intelligence. Buy, sell, and
            trade knowledge packs with instant cross-chain settlement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="gold-gradient px-10 py-4 rounded-md text-obsidian font-black uppercase tracking-widest active:scale-95 shadow-xl hover:shadow-gold/20 transition-all cursor-pointer"
            >
              Go to Marketplace
            </button>
            <button className="px-10 py-4 rounded-md border border-white/10 hover:bg-white/5 text-white font-bold transition-all active:scale-95">
              Read the Docs
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
