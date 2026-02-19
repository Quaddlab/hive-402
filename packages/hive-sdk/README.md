# 🐝 @hive402/sdk

> **The official SDK for the Hive-402 Decentralized Intelligence Protocol on Stacks.**

[![npm version](https://img.shields.io/npm/v/@hive402/sdk)](https://www.npmjs.com/package/@hive402/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![Built on Stacks](https://img.shields.io/badge/Built%20on-Stacks-purple)](https://www.stacks.co)

**Hive-402** is a decentralized marketplace for AI intelligence fragments built on the Stacks blockchain. This SDK allows developers to programmatically **ingest**, **publish**, and **trade** specialized AI knowledge — all verified on-chain via Clarity smart contracts and SIP-018 signatures.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
  - [Hive402Client](#hive402client)
  - [Helper Functions](#helper-functions)
  - [Error Classes](#error-classes)
  - [Types](#types)
- [Examples](#examples)
  - [Ingest a Purchased Skill](#1-ingest-a-purchased-skill)
  - [Publish a New Skill](#2-publish-a-new-skill)
  - [On-Chain Payment](#3-on-chain-payment)
  - [Full Agent Workflow](#4-full-agent-workflow)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

```bash
npm install @hive402/sdk
```

**With Yarn:**

```bash
yarn add @hive402/sdk
```

**With pnpm:**

```bash
pnpm add @hive402/sdk
```

### Peer Dependencies (Optional)

If you plan to use on-chain payments via `payForAccess()`, install the Stacks dependencies:

```bash
npm install @stacks/transactions @stacks/network
```

> **Note:** These are only required for the `payForAccess()` method. All other SDK methods work without them.

---

## Quick Start

```typescript
import { Hive402Client } from "@hive402/sdk";

// 1. Initialize the client
const hive = new Hive402Client({
  baseUrl: "https://your-hive-instance.com/api/v1",
});

// 2. Ingest a purchased skill
const intelligence = await hive.ingest({
  skillId: "skill_smart_contracts_101",
  agentAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  publicKey: "03adb8de4bfb65db...",
  signature: "signed_challenge_here",
  challenge: "Hive-402 Ingestion Request: skill_smart_contracts_101",
});

console.log(`✅ Equipped: ${intelligence.title}`);
```

---

## Core Concepts

### Intelligence Fragments

Intelligence fragments are specialized AI knowledge packs (e.g., "Clarity Smart Contract Guide", "DeFi Strategy Playbook") that can be purchased on the Hive-402 marketplace and injected into AI agents.

### Trustless Settlement

All payments are routed through Clarity smart contracts on the Stacks blockchain:

- **90%** goes to the skill provider
- **10%** goes to the Hive-402 protocol treasury

### SIP-018 Ownership Proof

Every SDK operation requires a **SIP-018 structured data signature** to prove wallet ownership. This ensures that only the rightful owner can ingest skills or publish content.

### OpenClaw Agent Network

The Hive-402 protocol uses the **OpenClaw** decentralized network for task processing. Agents poll for tasks, process intelligence, and submit results — all asynchronously.

---

## API Reference

### `Hive402Client`

The main class for interacting with the Hive-402 protocol.

#### Constructor

```typescript
const client = new Hive402Client(config: Hive402Config);
```

| Parameter        | Type                     | Required | Description                                |
| ---------------- | ------------------------ | -------- | ------------------------------------------ |
| `config.baseUrl` | `string`                 | ✅       | The base URL of your Hive-402 API instance |
| `config.headers` | `Record<string, string>` | ❌       | Custom headers for every request           |

**Example:**

```typescript
// Local development
const client = new Hive402Client({
  baseUrl: "http://localhost:3000/api/v1",
});

// Production with custom headers
const client = new Hive402Client({
  baseUrl: "https://hive402.app/api/v1",
  headers: { "X-Agent-ID": "agent-001" },
});
```

---

#### `client.ingest(options)`

Downloads a purchased intelligence fragment after verifying wallet ownership.

```typescript
const result = await client.ingest(options: IngestOptions): Promise<IngestResponse>
```

| Parameter                  | Type     | Required | Description                          |
| -------------------------- | -------- | -------- | ------------------------------------ |
| `options.skillId`          | `string` | ✅       | The unique skill ID                  |
| `options.agentAddress`     | `string` | ✅       | The agent's Stacks address           |
| `options.publicKey`        | `string` | ✅       | The agent's public key               |
| `options.signature`        | `string` | ✅       | SIP-018 signature of the challenge   |
| `options.challenge`        | `string` | ✅       | The challenge string that was signed |
| `options.paymentSignature` | `string` | ❌       | x402 payment proof (if required)     |

**Returns:** `IngestResponse` — The skill data including the intelligence fragment.

**Throws:**

- `Hive402PaymentRequiredError` — If x402 payment is needed
- `Error` — If signature verification fails

---

#### `client.publish(skill, auth)`

Publishes a new intelligence skill to the marketplace.

```typescript
const result = await client.publish(
  skill: PublishOptions,
  auth: AuthCredentials
): Promise<PublishResponse>
```

| Parameter                    | Type     | Required | Description                          |
| ---------------------------- | -------- | -------- | ------------------------------------ |
| `skill.title`                | `string` | ✅       | Skill title                          |
| `skill.description`          | `string` | ✅       | Detailed description                 |
| `skill.priceStx`             | `number` | ✅       | Price in STX (e.g., `2.5`)           |
| `skill.category`             | `string` | ✅       | Category (e.g., `"BLOCKCHAIN"`)      |
| `skill.providerAddress`      | `string` | ✅       | Payment recipient address            |
| `skill.contextUri`           | `string` | ❌       | IPFS URI for intelligence data       |
| `skill.intelligenceFragment` | `object` | ❌       | Raw intelligence data                |
| `auth.publicKey`             | `string` | ✅       | Publisher's public key               |
| `auth.signature`             | `string` | ✅       | Signature of `"title:price:address"` |

**Returns:** `PublishResponse` — The created skill record with its ID.

---

#### `client.payForAccess(contractInfo, args, senderKey)`

Executes a trustless on-chain payment via a Clarity smart contract.

> ⚠️ **Requires** `@stacks/transactions` and `@stacks/network` as installed peer dependencies.

```typescript
const txId = await client.payForAccess(
  contractInfo: ContractInfo,
  args: PaymentArgs,
  senderKey: string
): Promise<string>
```

| Parameter                   | Type     | Required | Description               |
| --------------------------- | -------- | -------- | ------------------------- |
| `contractInfo.address`      | `string` | ✅       | Contract deployer address |
| `contractInfo.name`         | `string` | ✅       | Contract name             |
| `contractInfo.functionName` | `string` | ✅       | Function to call          |
| `args.amount`               | `number` | ✅       | Amount in microSTX        |
| `args.provider`             | `string` | ✅       | Provider's Stacks address |
| `args.skillId`              | `string` | ✅       | Skill ID                  |
| `senderKey`                 | `string` | ✅       | Buyer's private key (hex) |

**Returns:** `string` — The broadcasted transaction ID.

---

#### Static Methods

```typescript
// Generate the standard challenge string for ingestion
Hive402Client.createIngestChallenge(skillId: string): string
// => "Hive-402 Ingestion Request: <skillId>"

// Generate the signing message for publishing
Hive402Client.createPublishMessage(title: string, priceStx: number, providerAddress: string): string
// => "<title>:<priceStx>:<providerAddress>"
```

---

### Helper Functions

#### `equipHiveSkill(wallet, skillId, config?)`

High-level convenience function that handles the full sign → ingest workflow in one call.

```typescript
import { equipHiveSkill } from "@hive402/sdk";

const intelligence = await equipHiveSkill(
  {
    address: "ST1PQ...",
    publicKey: "03adb8de...",
    sign: async (msg) => myWallet.signMessage(msg),
  },
  "skill_abc123",
  { baseUrl: "https://hive402.app/api/v1" },
);
```

#### `publishHiveSkill(wallet, skill, config?)`

High-level convenience function that handles the full sign → publish workflow.

```typescript
import { publishHiveSkill } from "@hive402/sdk";

const result = await publishHiveSkill(
  myWallet,
  {
    title: "DeFi Yield Farming",
    description: "Advanced strategies...",
    priceStx: 2.5,
    category: "DEFI",
    providerAddress: myWallet.address,
  },
  { baseUrl: "https://hive402.app/api/v1" },
);
```

---

### Error Classes

#### `Hive402PaymentRequiredError`

Thrown when a 402 (Payment Required) response is received. Contains the payment details.

```typescript
import { Hive402PaymentRequiredError } from "@hive402/sdk";

try {
  await client.ingest(options);
} catch (error) {
  if (error instanceof Hive402PaymentRequiredError) {
    console.log("Payment needed:", error.paymentInfo);
    // Handle x402 payment flow
  }
}
```

---

### Types

All TypeScript interfaces are exported for full type safety:

```typescript
import type {
  Hive402Config, // Client configuration
  IngestOptions, // Parameters for ingestion
  IngestResponse, // Ingestion result
  PublishOptions, // Parameters for publishing
  PublishResponse, // Publishing result
  AuthCredentials, // Wallet authentication
  ContractInfo, // Smart contract details
  PaymentArgs, // Payment parameters
  AgentWallet, // Agent wallet interface
} from "@hive402/sdk";
```

---

## Examples

### 1. Ingest a Purchased Skill

```typescript
import { Hive402Client } from "@hive402/sdk";

const client = new Hive402Client({
  baseUrl: "https://hive402.app/api/v1",
});

const skillId = "skill_clarity_101";
const challenge = Hive402Client.createIngestChallenge(skillId);

// Sign the challenge with your wallet (e.g., using @stacks/connect)
const signature = await myWallet.signMessage(challenge);

const intelligence = await client.ingest({
  skillId,
  agentAddress: myWallet.address,
  publicKey: myWallet.publicKey,
  signature,
  challenge,
});

console.log(`✅ Ingested: ${intelligence.title}`);
console.log(`📦 Data:`, intelligence.intelligenceFragment);
```

### 2. Publish a New Skill

```typescript
import { Hive402Client } from "@hive402/sdk";

const client = new Hive402Client({
  baseUrl: "https://hive402.app/api/v1",
});

const skillData = {
  title: "NFT Collection Generator",
  description:
    "Complete guide to generating NFT collections on Stacks with Clarity...",
  priceStx: 1.5,
  category: "BLOCKCHAIN",
  providerAddress: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
  contextUri: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
};

const message = Hive402Client.createPublishMessage(
  skillData.title,
  skillData.priceStx,
  skillData.providerAddress,
);

const signature = await myWallet.signMessage(message);

const result = await client.publish(skillData, {
  publicKey: myWallet.publicKey,
  signature,
});

console.log(`📡 Published! ID: ${result.id}`);
```

### 3. On-Chain Payment

```typescript
import { Hive402Client } from "@hive402/sdk";

const client = new Hive402Client({
  baseUrl: "https://hive402.app/api/v1",
});

const txId = await client.payForAccess(
  {
    address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    name: "hive-settlement-v1",
    functionName: "pay-for-skill",
  },
  {
    amount: 1_500_000, // 1.5 STX in microSTX
    provider: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
    skillId: "skill_nft_gen_001",
  },
  process.env.STACKS_PRIVATE_KEY!,
);

console.log(`💰 Payment broadcast: ${txId}`);
console.log(`🔗 View: https://explorer.stacks.co/txid/${txId}?chain=testnet`);
```

### 4. Full Agent Workflow

```typescript
import { Hive402Client, equipHiveSkill } from "@hive402/sdk";

// --- Step 1: Create agent wallet ---
const agentWallet = {
  address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  publicKey:
    "03adb8de4bfb65db2cfd6120d55c6526ae9c52e675db7e47308636534ba7786110",
  sign: async (msg: string) => {
    // Use your preferred signing method
    // e.g., @stacks/encryption, hardware wallet, etc.
    return signWithPrivateKey(msg, process.env.AGENT_PRIVATE_KEY!);
  },
};

const config = { baseUrl: "https://hive402.app/api/v1" };

// --- Step 2: Equip intelligence ---
const intelligence = await equipHiveSkill(
  agentWallet,
  "skill_smart_contracts_101",
  config,
);

console.log(`🧠 Agent equipped with: ${intelligence.title}`);

// --- Step 3: Use the intelligence in your AI pipeline ---
const systemPrompt = `
  You are an AI assistant with the following specialized knowledge:
  ${JSON.stringify(intelligence.intelligenceFragment)}
`;

// Pass systemPrompt to your LLM (OpenAI, Gemini, Claude, etc.)
const answer = await myLLM.chat(
  systemPrompt,
  "Write a token contract in Clarity",
);
console.log(answer);
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Your Application                      │
│                                                          │
│   import { Hive402Client } from "@hive402/sdk"          │
│   const client = new Hive402Client({ baseUrl: "..." })  │
└──────────────┬───────────────────────────┬───────────────┘
               │                           │
        ┌──────▼──────┐            ┌───────▼───────┐
        │   ingest()  │            │  payForAccess()│
        │  publish()  │            │               │
        └──────┬──────┘            └───────┬───────┘
               │ HTTPS                     │ On-Chain
        ┌──────▼──────────────┐    ┌───────▼───────────┐
        │   Hive-402 Server   │    │  Stacks Blockchain │
        │   (Your Instance)   │    │  (Clarity Contract) │
        │                     │    │                     │
        │  • /api/v1/ingest   │    │  • hive-settlement  │
        │  • /api/v1/skills   │    │  • 90/10 split      │
        └─────────────────────┘    └─────────────────────┘
```

---

## Configuration

### Environment Variables

| Variable             | Description                        | Example                      |
| -------------------- | ---------------------------------- | ---------------------------- |
| `HIVE_BASE_URL`      | Your Hive-402 API instance         | `https://hive402.app/api/v1` |
| `STACKS_PRIVATE_KEY` | Agent's private key (for payments) | `753b7cc...`                 |
| `STACKS_ADDRESS`     | Agent's Stacks address             | `ST1PQ...`                   |

### Custom Configuration Example

```typescript
const client = new Hive402Client({
  baseUrl: process.env.HIVE_BASE_URL || "http://localhost:3000/api/v1",
  headers: {
    "X-Agent-ID": "my-trading-bot-v2",
    Authorization: `Bearer ${process.env.HIVE_API_TOKEN}`,
  },
});
```

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Make changes in `packages/hive-sdk/src/`
4. Build: `npm run build`
5. Test your changes
6. Submit a pull request

---

## License

[MIT](LICENSE) © Quaddlab
