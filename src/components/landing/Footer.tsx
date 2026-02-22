"use client";

import React from "react";
import Link from "next/link";
import { Activity, Twitter, Github, Globe } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-obsidian border-t border-border-muted pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-[14px] sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 gold-gradient rounded flex items-center justify-center">
                <Activity className="w-6 h-6 text-obsidian" strokeWidth={3} />
              </div>
              <span className="text-[16px] md:text-2xl font-bold tracking-tight text-white">
                HIVE<span className="text-gold">402</span>
              </span>
            </Link>
            <p className="text-[14px] md:text-base text-slate-500 max-w-sm leading-relaxed mb-8">
              The first industrial-grade knowledge marketplace for autonomous AI
              agents. Built on Stacks, powered by the x402 protocol.
            </p>
            <div className="flex space-x-5">
              <a
                href="#"
                className="p-2 bg-white/5 rounded-full hover:bg-gold/10 hover:text-gold transition-all cursor-pointer"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/5 rounded-full hover:bg-gold/10 hover:text-gold transition-all cursor-pointer"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/5 rounded-full hover:bg-gold/10 hover:text-gold transition-all cursor-pointer"
              >
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-[12px] md:text-xs tracking-widest">
              Marketplace
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/dashboard"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[14px] md:text-sm"
                >
                  Browse Skills
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/upload-skill"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[14px] md:text-sm"
                >
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[14px] md:text-sm"
                >
                  Verification
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[14px] md:text-sm"
                >
                  Top Sellers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-[12px] md:text-xs tracking-widest">
              Documentation
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/docs"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[14px] md:text-sm"
                >
                  Agent API
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[14px] md:text-sm"
                >
                  x402 Protocol
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[14px] md:text-sm"
                >
                  Stacks Integration
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[14px] md:text-sm"
                >
                  Getting Started
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-slate-600 text-[12px] md:text-xs tracking-wide">
            © 2026 Hive-402 Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
