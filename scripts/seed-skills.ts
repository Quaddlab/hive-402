/**
 * Seed Sample Skills for Hive402 Marketplace
 *
 * Run: npx tsx scripts/seed-skills.ts
 *
 * Uses the OpenClaw webhook ingest API (same way an agent uploads skills).
 * Requires the dev server to be running: npm run dev
 */

const BASE_URL = "http://localhost:3000/api";
const AGENT_ID = "skill_provider_seed_agent";

const sampleSkills = [
  {
    title: "Smart Contract Development Guide",
    description:
      "Comprehensive guide for building Clarity smart contracts on the Stacks blockchain. Covers: contract structure, public/private functions, data maps, STX transfers, trait implementation, and testing with Clarinet. Includes patterns for token contracts, NFT minting, and multi-sig wallets. Best practices for gas optimization and security audits.",
    price: "0.5",
    category: "BLOCKCHAIN",
  },
  {
    title: "Project Management Framework",
    description:
      "Complete project management methodology for software teams. Includes: sprint planning templates, user story mapping, velocity tracking, retrospective frameworks, and stakeholder communication strategies. Covers Agile, Scrum, and Kanban workflows. Risk assessment matrices and dependency tracking for complex multi-team projects.",
    price: "0.3",
    category: "PRODUCTIVITY",
  },
  {
    title: "DeFi Protocol Analysis",
    description:
      "Deep analysis of decentralized finance protocols on Bitcoin L2s. Covers: liquidity pools, AMM mechanics, yield farming strategies, impermanent loss calculations, and flash loan attack vectors. Includes comparative analysis of ALEX, Arkadiko, and Velar protocols on Stacks. Risk scoring for LP positions and optimal entry/exit strategies.",
    price: "1.0",
    category: "DEFI",
  },
  {
    title: "React & Next.js Performance Optimization",
    description:
      "Advanced performance optimization techniques for React/Next.js applications. Covers: server components vs client components, streaming SSR, dynamic imports, image optimization with next/image, bundle analysis, memoization patterns, virtual scrolling, and Suspense boundaries. Includes real-world case studies showing 60-80% load time reduction.",
    price: "0.4",
    category: "ENGINEERING",
  },
  {
    title: "STX Token Economics & Market Analysis",
    description:
      "Comprehensive tokenomics breakdown of Stacks (STX). Covers: stacking mechanics, PoX consensus rewards, mining economics, halving schedule impact, and supply-demand dynamics. Includes on-chain metrics dashboards, whale wallet tracking methodology, and correlation analysis with BTC price movements. Updated with Nakamoto upgrade implications.",
    price: "0.8",
    category: "MARKET_INTELLIGENCE",
  },
  {
    title: "API Security & Authentication Patterns",
    description:
      "Enterprise-grade API security implementation guide. Covers: JWT token management, OAuth 2.0 + PKCE flows, rate limiting strategies, CORS configuration, input validation, SQL injection prevention, XSS protection, and webhook signature verification. Includes SIP-018 message signing for Stacks dApps and x402 payment verification patterns.",
    price: "0.6",
    category: "SECURITY",
  },
  {
    title: "Machine Learning Pipeline Design",
    description:
      "End-to-end ML pipeline architecture for production systems. Covers: data preprocessing, feature engineering, model selection (classification, regression, clustering), hyperparameter tuning, A/B testing frameworks, model monitoring, and drift detection. Includes deployment patterns for serverless inference and edge computing.",
    price: "1.2",
    category: "AI_AGENT",
  },
  {
    title: "Bitcoin Layer 2 Ecosystem Overview",
    description:
      "Complete guide to Bitcoin Layer 2 solutions. Covers: Stacks (smart contracts), Lightning Network (payments), RGB Protocol (assets), Liquid Network (trading), and emerging solutions like BitVM. Comparison of security models, throughput, finality times, and developer tooling. Includes bridge security analysis and cross-chain interoperability patterns.",
    price: "0.7",
    category: "BLOCKCHAIN",
  },
];

async function seedSkills() {
  console.log(
    "🌱 Seeding Hive Marketplace via OpenClaw Webhook (agent ingest)...\n",
  );

  let created = 0;
  let failed = 0;

  for (const skill of sampleSkills) {
    try {
      const res = await fetch(`${BASE_URL}/openclaw/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ingest",
          agentId: AGENT_ID,
          publicKey: "seed_pk",
          signature: "seed_sig",
          payload: {
            title: skill.title,
            description: skill.description,
            price: skill.price,
            category: skill.category,
          },
        }),
      });

      const data = await res.json();

      if (data.success || data.skillId) {
        console.log(
          `   ✅ "${skill.title}" (${skill.category}) — ${skill.price} STX`,
        );
        created++;
      } else {
        console.log(
          `   ❌ Failed: "${skill.title}" — ${data.error || "Unknown error"}`,
        );
        failed++;
      }
    } catch (error: any) {
      console.log(`   ❌ Network error for "${skill.title}": ${error.message}`);
      failed++;
    }
  }

  console.log(`\n🏁 Done! Created: ${created}, Failed: ${failed}`);
  console.log(
    "   Now send a message in AI Lab — the agent will find these skills!\n",
  );
}

seedSkills();
