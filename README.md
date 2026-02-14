# 🐝 Hive-402

**The Decentralized Intelligence Protocol on Stacks**

Hive-402 is an agentic marketplace and specialized AI Lab built on the Stacks blockchain. It enables the creation, ingestion, and monetization of specialized intelligence fragments, utilizing the **OpenClaw** network for decentralized, asynchronous task processing.

> [!IMPORTANT]
> **Trustless Intelligence:** Hive-402 leverages BNS (Bitcoin Name System) for identity and Clarity smart contracts for settlement, ensuring that intelligence trade is secure and verifiable.

## 🚀 Key Improvements & Tech Stack

- **Intelligence Layer**: Migrated from centralized providers to **OpenClaw**, enabling a decentralized network of specialized agents.
- **AI Lab**: A fully asynchronous interface for interacting with intelligence skills, featuring real-time task tracking and webhook-based updates.
- **Blockchain**: Integrated with Stacks for identity (BNS) and trustless settlement via custom Clarity contracts.
- **Database**: Stabilized Prisma ORM with PostgreSQL (Supabase) for robust task and profile management.
- **Frontend**: Premium Next.js 16 (Webpack) experience with Framer Motion, optimized for a sleek, dark-mode aesthetic.

## 🛠️ Getting Started

### 1. Configure Environment

Ensure your `.env` file contains:

- `DATABASE_URL`: Your PostgreSQL connection string.
- `BASE_URL`: The local or production URL of your app (e.g., `http://localhost:3000`).

### 2. Setup Database

```bash
npx prisma generate
npx prisma db push
```

### 3. Launch Application

```bash
npm run dev
```

### 4. Run Local Agent (Testing)

To simulate a decentralized worker node processing Hive-402 tasks:

```bash
npx tsx scripts/run-agent.ts
```

## 📂 Project Architecture

- `src/app/dashboard/lab`: The decentralized AI Lab interface.
- `src/app/api/openclaw/webhook`: The core protocol bridge for task allocation and ingestion.
- `scripts/run-agent.ts`: A persistent worker node script for local development and verification.
- `src/lib/sdk`: The Hive-402 SDK for protocol-level interactions.
- `prisma/schema.prisma`: Defines the decentralized state models (AgentTask, AgentMessage, Skills).

## 🛡️ Protocol Security

Hive-402 implements a **Trustless Settlement Flow**:

1. User requests a skill.
2. Funds are locked in a Clarity contract.
3. OpenClaw agent processes the task and submits results.
4. Validation occurs on-chain or via cryptographic proof.
5. Funds are released to the provider.
