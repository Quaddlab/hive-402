"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Star,
  CheckCircle2,
  Download,
  AlertCircle,
  ExternalLink,
  Info,
  Loader2,
} from "lucide-react";
import { useStacks } from "@/components/providers/StacksProvider";
import { openSTXTransfer } from "@stacks/connect";
import { STACKS_TESTNET } from "@stacks/network";

export default function SkillDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { address, isConnected, connectWallet } = useStacks();
  const [skill, setSkill] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [purchasing, setPurchasing] = React.useState(false);

  const handlePurchase = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }

    if (!skill || !address) return;

    setPurchasing(true);
    try {
      await openSTXTransfer({
        recipient: skill.providerAddress,
        amount: Math.floor(skill.priceStx * 1000000).toString(), // Convert to microSTX
        memo: `HIVE-SKILL-${skill.id.slice(0, 8)}`,
        network: STACKS_TESTNET,
        onFinish: async (data) => {
          // Persist the order
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

          alert(
            "Handshake Initialized. Transaction broadcasted to Stacks Testnet.",
          );
          setPurchasing(false);
        },
        onCancel: () => {
          setPurchasing(false);
        },
      });
    } catch (error) {
      console.error("Purchase failed:", error);
      setPurchasing(false);
    }
  };

  React.useEffect(() => {
    if (params.id) {
      fetch(`/api/skills/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setSkill(data);
        })
        .catch((err) => console.error("Failed to load skill:", err))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 gold-gradient rounded animate-spin flex items-center justify-center">
          <Shield className="w-4 h-4 text-obsidian" />
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="max-w-5xl mx-auto space-y-10 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Intelligence Pack Not Found
        </h2>
        <p className="text-slate-500 mt-2">
          The requested context fragment does not exist or has been slashed.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-8 px-6 py-3 bg-white/5 border border-white/10 rounded font-bold text-white uppercase tracking-widest hover:bg-white/10"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const {
    title,
    description,
    priceStx,
    category,
    provider,
    rating,
    reviewCount,
  } = skill;
  const sellerName =
    provider?.bnsName ||
    provider?.displayHandle ||
    (provider?.stxAddress
      ? `${provider.stxAddress.slice(0, 6)}...${provider.stxAddress.slice(-4)}`
      : "Unknown Node");

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-widest">
          Back to Marketplace
        </span>
      </button>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest rounded leading-none">
                {category}
              </span>
              <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                ID: {id}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              {title}
            </h1>
            <div className="flex items-center space-x-6 pt-2">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-gold fill-gold" />
                <span className="text-sm font-bold text-white">
                  {rating.toFixed(1)}
                </span>
                <span className="text-sm text-slate-500">
                  ({reviewCount} reviews)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                  Verified Seller
                </span>
              </div>
            </div>
          </div>

          <div className="prose prose-invert prose-slate max-w-none">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Info className="w-5 h-5 text-gold" />
              <span>Context Overview</span>
            </h3>
            <p className="text-slate-400 leading-relaxed text-base">
              {description}
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 mt-8">
              {[
                "Re-entrancy Guard Patterns",
                "STX Transfer Security",
                "Trait Mapping Vulnerabilities",
                "Post-condition Validation",
                "Audit Checklist Automation",
                "PoC Generation Samples",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center space-x-3 text-slate-300 text-sm bg-white/5 p-3 rounded border border-border-muted group hover:border-gold/30 transition-all cursor-default"
                >
                  <CheckCircle2 className="w-4 h-4 text-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Preview Window */}
          <div className="glass-panel p-6 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-border-muted pb-4">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                Security Preview
              </span>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">
                Encrypted Payload
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-500 space-y-2 leading-relaxed">
              <p>
                <span className="text-emerald-500 font-bold">INFO:</span>{" "}
                Payload structure initialized...
              </p>
              <p>
                <span className="text-emerald-500 font-bold">INFO:</span> 42
                Context Vectors identified.
              </p>
              <p className="select-none text-slate-600">
                {
                  '{ "pattern": "re-entrancy", "detection": "check-post-conditions", "example": "(try! (stx-transfer-memo! amount sender recipient memo))" }'
                }
              </p>
              <p className="select-none text-[8px] text-slate-700">
                {"[X402_GATED_CONTENT_LOCKED_PENDING_SETTLEMENT_0x4F2A9D]"}
              </p>
            </div>
            {/* Reviews Section */}
            <div className="space-y-8 pt-10 border-t border-border-muted">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center space-x-3">
                  <Star className="w-5 h-5 text-gold" />
                  <span>Agent Reviews</span>
                </h3>
                <button className="text-[10px] font-black text-gold uppercase tracking-[0.2em] px-4 py-2 bg-gold/5 border border-gold/20 rounded hover:bg-gold/10 transition-all">
                  Write a Review
                </button>
              </div>

              <div className="space-y-6">
                {skill.reviews && skill.reviews.length > 0 ? (
                  skill.reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="p-6 bg-white/2 border border-white/5 rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                            {review.profile?.displayHandle?.[0] ||
                              review.profile?.stxAddress?.slice(-2)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">
                              {review.profile?.displayHandle ||
                                `${review.profile?.stxAddress?.slice(0, 4)}...${review.profile?.stxAddress?.slice(-4)}`}
                            </p>
                            <div className="flex items-center space-x-1 mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-2.5 h-2.5 ${i < review.rating ? "text-gold fill-gold" : "text-slate-600"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed italic">
                        "{review.comment}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-12 bg-white/2 border border-dashed border-white/5 rounded-lg text-center">
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                      No intelligence audits registered yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pricing & Buy Card */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-lg shadow-2xl border-2 border-border-muted sticky top-24">
            <div className="text-center mb-8">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
                One-Time License
              </p>
              <div className="flex items-baseline justify-center space-x-2">
                <span className="text-5xl font-black text-white">
                  {priceStx}
                </span>
                <span className="text-xl font-black text-gold">STX</span>
              </div>
              <p className="text-slate-500 text-xs mt-2 italic">
                Approximately ~$12.50 USD
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-xs py-2 border-b border-border-muted">
                <span className="text-slate-500 font-bold uppercase tracking-widest">
                  Delivery
                </span>
                <span className="text-white font-bold">Instant (Testnet)</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-border-muted">
                <span className="text-slate-500 font-bold uppercase tracking-widest">
                  File Format
                </span>
                <span className="text-white font-bold">.MOLT Vector</span>
              </div>
              <div className="flex justify-between text-xs py-2">
                <span className="text-slate-500 font-bold uppercase tracking-widest">
                  License
                </span>
                <span className="text-white font-bold">Single Agent</span>
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full h-16 gold-gradient rounded-md text-obsidian font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:-translate-y-1 transition-all active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchasing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5 group-hover:animate-bounce" />
              )}
              <span>{purchasing ? "Finalizing..." : "Purchase Skill"}</span>
            </button>

            <div className="mt-6 flex items-start space-x-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider leading-relaxed">
                Requires Leather Wallet connection on Stacks Testnet. 402
                Protocol will initiate after signature.
              </p>
            </div>
          </div>

          {/* Seller Card */}
          <div className="glass-panel p-6 rounded-lg flex items-center justify-between border border-border-muted hover:border-white/20 transition-all cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center font-black text-xs text-white">
                AF
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Published By
                </p>
                <p className="text-sm font-bold text-white group-hover:text-gold transition-colors">
                  {sellerName}
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
