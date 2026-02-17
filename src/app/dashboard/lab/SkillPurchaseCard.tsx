"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Loader2,
  ShoppingCart,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStacks } from "@/components/providers/StacksProvider";
import { openSTXTransfer } from "@stacks/connect";
import { STACKS_TESTNET } from "@stacks/network";

interface SkillData {
  id: string;
  title: string;
  description: string;
  priceStx: number;
  category: string;
  providerAddress: string;
}

interface SkillPurchaseCardProps {
  skill: SkillData;
  onPurchaseComplete: (skill: SkillData, txId: string) => void;
}

export default function SkillPurchaseCard({
  skill,
  onPurchaseComplete,
}: SkillPurchaseCardProps) {
  const { address, isConnected, connectWallet } = useStacks();
  const [purchasing, setPurchasing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setError(null);

    if (!isConnected) {
      connectWallet();
      return;
    }

    if (!address) {
      setError("Wallet address not found. Please reconnect.");
      return;
    }

    if (!skill.providerAddress) {
      setError("Skill provider address missing. Cannot process payment.");
      console.error("Missing providerAddress in skill data:", skill);
      return;
    }

    console.log("[Purchase] Starting wallet transaction...", {
      recipient: skill.providerAddress,
      amount: Math.floor(skill.priceStx * 1000000).toString(),
      memo: `HIVE-SKILL-${skill.id.slice(0, 8)}`,
    });

    setPurchasing(true);
    try {
      openSTXTransfer({
        recipient: skill.providerAddress,
        amount: Math.floor(skill.priceStx * 1000000).toString(),
        memo: `HIVE-SKILL-${skill.id.slice(0, 8)}`,
        network: STACKS_TESTNET,
        onFinish: async (data) => {
          // Record the order
          await fetch("/api/order/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              txid: data.txId,
              amountStx: skill.priceStx,
              buyerAddress: address,
              skillId: skill.id,
            }),
          });

          setPurchasing(false);
          onPurchaseComplete(skill, data.txId);
        },
        onCancel: () => {
          setPurchasing(false);
        },
      });
    } catch (error: any) {
      console.error("Purchase failed:", error);
      setError(
        error.message || "Transaction failed. Check your wallet extension.",
      );
      setPurchasing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md rounded-lg border border-gold/30 bg-gradient-to-br from-gold/5 to-transparent overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gold/10 border-b border-gold/20 flex items-center space-x-2">
        <Zap className="w-4 h-4 text-gold" />
        <span className="text-[10px] font-black text-gold uppercase tracking-widest">
          Intelligence Found on Marketplace
        </span>
      </div>

      {/* Skill Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">{skill.title}</h4>
            <span className="text-[10px] text-gold/80 font-bold uppercase tracking-wider">
              {skill.category}
            </span>
          </div>
          <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
        </div>

        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
          {skill.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
              Price
            </span>
            <p className="text-lg font-black text-white">
              {skill.priceStx} <span className="text-xs text-gold">STX</span>
            </p>
          </div>

          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className={cn(
              "flex items-center space-x-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
              purchasing
                ? "bg-white/10 text-slate-500 cursor-wait"
                : "gold-gradient text-obsidian hover:shadow-lg hover:shadow-gold/20 active:scale-95",
            )}
          >
            {purchasing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Purchase & Unlock</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[10px] text-slate-600 text-center">
          Your wallet will prompt you to sign the transaction
        </p>
        {error && (
          <p className="text-[10px] text-red-400 text-center mt-1 font-bold">
            ⚠️ {error}
          </p>
        )}
      </div>
    </motion.div>
  );
}
