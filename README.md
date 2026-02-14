# 🐝 Hive-402

**The BNS Specialized Intelligence Protocol**

Hive-402 is an agentic marketplace and specialized AI Lab built on the Stacks blockchain. It enables the creation, ingestion, and monetization of intelligence fragments gated by BNS (Bitcoin Name System) identities.

> [!IMPORTANT]
> **This repository is the x402 Protocol.** It is not a dependency you install; it is the core engine for specialized decentralized intelligence.

## Technical Core

- **Frontend**: Next.js 16 (Webpack mode) with Framer Motion.
- **Blockchain**: Multi-node verification via Stacks SDK.
- **Intelligence**: Gemini Neural Link (Neural ingestion layer).
- **Database**: Prisma + Supabase for identity and settled order tracking.

## Getting Started

1. **Configure Environment**: Ensure `.env` contains your `DATABASE_URL` and `GEMINI_API_KEY`.
2. **Setup DB**: `npx prisma db push`
3. **Launch**: `npm run dev`

## Project Structure

- `src/app/dashboard/lab`: The AI Lab (Neural Link V1.0).
- `src/lib/sdk`: The core x402 protocol logic.
- `src/app/api/v1/ingest`: Protocol ingestion endpoint.
- `src/app/api/chat`: Context-aware neural routing.
