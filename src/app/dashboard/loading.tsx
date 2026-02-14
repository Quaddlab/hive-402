"use client";

import React from "react";
import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <Activity
          className="w-12 h-12 text-gold animate-spin-slow"
          strokeWidth={1}
        />
        <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full" />
      </div>
      <div className="text-center">
        <p className="text-xs font-black text-white uppercase tracking-[0.3em]">
          Calibrating Neural Link
        </p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          Initializing Secure Context...
        </p>
      </div>
    </div>
  );
}
