"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  ExternalLink,
  ShieldCheck,
  History,
  Coins,
  CreditCard,
  Zap,
} from "lucide-react";

import { useStacks } from "@/components/providers/StacksProvider";
import { Loader2 } from "lucide-react";

export default function WalletPage() {
  const { address, isConnected } = useStacks();
  const [balance, setBalance] = React.useState<string>("0.00");
  const [isLoading, setIsLoading] = React.useState(true);
  const [transactions] = React.useState([
    {
      id: "tx-721",
      type: "inbound",
      amount: "+45.00",
      description: "Sale: Clarity Security Expert",
      status: "Confirmed",
      timestamp: "2 hours ago",
    },
    {
      id: "tx-718",
      type: "outbound",
      amount: "-8.50",
      description: "Purchase: Stacks DeFi Patterns",
      status: "Confirmed",
      timestamp: "10 hours ago",
    },
  ]);

  React.useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return;
      try {
        // Fetch from Stacks API
        const res = await fetch(
          `https://api.testnet.hiro.so/extended/v1/address/${address}/balances`,
        );
        const data = await res.json();
        const stxBalance = parseInt(data.stx.balance) / 1000000;
        setBalance(
          stxBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        );
      } catch (e) {
        console.error("Balance fetch failed:", e);
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected && address) {
      fetchBalance();
    } else if (!isConnected) {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header & Balance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 relative overflow-hidden p-8 rounded-3xl bg-linear-to-br from-gold/20 via-gold/5 to-transparent border border-gold/30 group shadow-[0_0_50px_-12px_rgba(255,184,0,0.1)]"
        >
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
            <Coins className="w-32 h-32 text-gold group-hover:rotate-12 transition-transform duration-1000" />
          </div>

          <div className="relative space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30">
                <Wallet className="w-5 h-5 text-gold" />
              </div>
              <span className="text-xs font-black text-white uppercase tracking-[0.2em]">
                Primary Wallet Balance
              </span>
            </div>

            <div>
              <div className="flex items-baseline space-x-3">
                <h2 className="text-6xl font-black text-white tracking-tighter">
                  {balance}
                </h2>
                <span className="text-2xl font-black text-gold">STX</span>
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-widest mt-2">
                ≈ $982.40 USD (Testnet)
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="flex items-center space-x-2 px-6 py-3 bg-white/5 border border-white/10 hover:border-gold/50 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-lg hover:bg-gold/5 group/btn">
                <ArrowUpRight className="w-4 h-4 text-gold group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                <span>Send STX</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 bg-white/5 border border-white/10 hover:border-gold/50 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-lg hover:bg-gold/5 group/btn">
                <ArrowDownLeft className="w-4 h-4 text-gold group-hover/btn:translate-y-0.5 group-hover/btn:-translate-x-0.5 transition-transform" />
                <span>Receive</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 bg-gold text-obsidian font-black rounded-xl text-xs uppercase tracking-widest hover:bg-gold-light transition-all shadow-lg hover:scale-[1.02]">
                <RefreshCcw className="w-4 h-4" />
                <span>Faucet</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Network & Security Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-3xl bg-white/2 border border-white/5 flex flex-col justify-between space-y-8"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Network Status
              </span>
              <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Stacks Testnet</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">
                Protocol Integrations
              </span>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold text-white uppercase tracking-tight">
                      x402 Protocol
                    </span>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold text-white uppercase tracking-tight">
                      SIP-010 Tokens
                    </span>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 font-mono text-[10px] text-slate-500 break-all leading-relaxed">
            <span className="text-slate-400 font-bold block mb-1">
              WALLET_ADDRESS:
            </span>
            {address || "NOT_CONNECTED"}
          </div>
        </motion.div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-3">
            <History className="w-5 h-5 text-gold" />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
              Recent Settlements
            </h3>
          </div>
          <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors underline decoration-gold/50 underline-offset-4">
            View All Explorer txs
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/1">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Transaction / Detail
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Timestamp
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Amount
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Internal Status
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx, i) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-white/2 transition-all"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border ${tx.type === "inbound" ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-gold/10 border-gold/20 text-gold"}`}
                        >
                          {tx.type === "inbound" ? (
                            <ArrowDownLeft className="w-5 h-5" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white tracking-tight uppercase group-hover:text-gold transition-colors">
                            {tx.description}
                          </p>
                          <p className="text-[10px] text-slate-600 font-bold tracking-widest uppercase mt-0.5">
                            ID: {tx.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-medium text-slate-500">
                        {tx.timestamp}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`text-sm font-black tracking-tight ${tx.type === "inbound" ? "text-green-500" : "text-white"}`}
                      >
                        {tx.amount} STX
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-2.5 py-1 rounded bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-500 uppercase">
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-gold/30 text-slate-600 hover:text-gold transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 text-center border-t border-white/5 bg-white/1">
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
              End of Transmission
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
