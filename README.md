# 🐝 Hive-402: The Decentralized Intelligence Protocol

[![Built on Stacks](https://img.shields.io/badge/Built%20on-Stacks-purple)](https://www.stacks.co)
[![Powered by OpenClaw](https://img.shields.io/badge/Powered%20by-OpenClaw-blue)](#)
[![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black)](https://nextjs.org/)

**Hive-402** is a revolutionary decentralized marketplace and specialized AI Lab built entirely on the Stacks blockchain. It solves the critical problem of isolated AI agents by providing a trustless, peer-to-peer network for creating, purchasing, and exchanging verified "Intelligence Fragments" (skills, knowledge packs, and contextual models).

Instead of training every AI agent from scratch, developers can instantly equip their agents with specialized, ready-to-use capabilities securely settled via smart contracts on Bitcoin layer 2 (Stacks).

---

## 🏗️ System Architecture

Hive-402 features a robust, multi-layer architecture bridging Web3 settlement with Web2-scale asynchronous processing.

```text
+------------------------+           +--------------------------+
|                        |           |                          |
|   Next.js App Router   |<=========>|  PostgreSQL / Supabase   |
|   (Frontend / UI)      |           |  (State & Task DB)       |
|                        |           |                          |
+-----------+------------+           +------------+-------------+
            |                                     |
    [SIP-018 Purchase]                    [Task Execution / Polling]
            |                                     |
            v                                     v
+------------------------+           +--------------------------+
|                        |           |                          |
|   Stacks Blockchain    |           |  OpenClaw Worker Node    |
|   (Clarity Contracts)  |           |  (Async Inference)       |
|                        |           |                          |
+------------------------+           +--------------------------+
```

---

## ⚙️ Core Protocol Mechanisms

### 1. Trustless x402 Settlement

All transactions on the Hive-402 marketplace adhere to a strict trustless settlement model. When an intelligence fragment is purchased, funds are dynamically routed through custom **Clarity** smart contracts (e.g., `hive-payment-splitter.clar`).

- **90%** of the transaction value is instantly routed to the skill creator.
- **10%** is routed to the Hive-402 Protocol treasury to sustain the network.
- **SIP-018 structured data signatures** are mathematically required to prove wallet ownership before an agent can download the acquired intelligence fragment.

### 2. The OpenClaw Execution Network

We migrated the intelligence execution layer from centralized inference providers directly to **OpenClaw**, an asynchronous, decentralized processing network.

When a user interacts with an installed skill in the **AI Lab**:

1. The Next.js frontend pushes an interaction task to the relational database.
2. A generic OpenClaw worker node (simulated locally via `scripts/run-agent.ts`) constantly polls for queued tasks.
3. The worker picks up the task, processes the specialized AI prompt, and streams the output directly back into the database.
4. The frontend UI optimistically updates in real-time as the decentralized network fulfills the task.

```text
[ User ]
   |
   | 1. Execute "Smart Contract Audit" Skill
   v
[ Next.js API ]
   |
   | 2. CREATE Task (Status: "PENDING")
   v
[ Postgres Database ] <-----------------------------------+
   |                                                      |
   | 4. Claim Task (Status -> "PROCESSING")               | 3. POLL for "PENDING" tasks
   v                                                      |    (Every 2 seconds)
[ OpenClaw Worker ] --------------------------------------+
   |
   | 5. Performs heavy, specialized inference
   | 6. UPDATE Task (Status -> "COMPLETED", Payload: Result)
   v
[ Postgres Database ]
   |
   | 7. Webhook / Polling delivery of Result
   v
[ Next.js API ] ---> [ User ]
```

---

## 💻 Tech Stack Deep Dive

- **Frontend Framework**: Next.js 14 (App Router) ensuring optimal server-side rendering, streaming interfaces, and SEO.
- **Styling UI/UX**: Tailwind CSS coupled with Framer Motion explicitly designed for a premium, sleek dark-mode aesthetic with liquid-smooth animations.
- **Database Architecture**: Prisma ORM backed by PostgreSQL (Supabase) for robust, highly relational state tracking (Users, Market Skills, Queued Tasks).
- **Blockchain Identity**: Integrated strictly with Stacks.js and `@stacks/connect` for seamless Web3 WebWallet login and integrated BNS (Bitcoin Name System) resolution.
- **Protocol SDK**: The internal `@hive402/sdk` unifies on-chain interactions and data ingestion for external developers attempting to programmatically interact with the Stacks chain.

---

## 🛠️ Getting Started Locally

### 1. Prerequisites

- **Node.js**: v18 or heavily recommended v20+
- **Database**: A PostgreSQL connection string (Supabase is recommended for easiest setup)
- **Web3 Wallet**: Leather Wallet or Xverse Wallet extension for testing Stacks blockchain interactions in the browser.

### 2. Environment Setup

Configure your local `.env` file at the root of the project:

```env
# Database Credentials
DATABASE_URL="postgresql://user:password@localhost:5432/hive402"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database

Push the Prisma schema to your target PostgreSQL database to shape its architecture.

```bash
npx prisma generate
npx prisma db push

# (Optional) Seed the database with dummy marketplace skills exactly for testing UI
node prisma/seed.js
```

### 4. Boot Up the Platform

Hive-402 requires two background processes to function comprehensively.

**First**, start the web interface:

```bash
npm run dev
```

**Second**, open an entirely separate terminal window and start the local OpenClaw worker node. This simulates a decentralized network worker picking up and solving AI Lab tasks asynchronously:

```bash
npx tsx scripts/run-agent.ts
```

Your full decentralized intelligence lab is absolutely live and accessible at `http://localhost:3000`.

---

## 🛡️ Protocol Security

Hive-402 enforces a rigid **Trustless Settlement Flow**:

1. User requests to purchase a skill.
2. STX funds are securely locked in a pre-audited Clarity contract.
3. The platform validates cryptographic ownership strictly via SIP-018 signatures.
4. Ownership is provably granted on-chain.
5. Funds are algorithmically dispersed to the respective provider.

---

## 📄 License

Hive-402 is dual-licensed under standard MIT terms and specialized OpenClaw protocol terms. All rights reserved.
