// ============================================================================
// @hive402/sdk — OpenClaw Blueprint Helpers
// High-level helper functions for common agent workflows.
// ============================================================================

import { Hive402Client } from "./client";
import type { AgentWallet, IngestResponse, Hive402Config } from "./types";

/**
 * Equips a Hive skill to an AI agent in a single call.
 *
 * This is a high-level convenience function that handles the full
 * ingestion workflow:
 * 1. Generates the challenge string
 * 2. Signs it with the agent's wallet
 * 3. Calls `client.ingest()` to download the intelligence fragment
 *
 * @param agentWallet - The agent's wallet with address, publicKey, and sign function.
 * @param skillId - The ID of the skill to equip.
 * @param config - Optional Hive402Client configuration. Defaults to localhost.
 * @returns The ingested intelligence data.
 *
 * @example
 * ```typescript
 * import { equipHiveSkill } from "@hive402/sdk";
 *
 * const intelligence = await equipHiveSkill(
 *   {
 *     address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
 *     publicKey: "03adb8de4bfb65db2cfd6120d55c6526ae9c52e675db7e47308636534ba7786110",
 *     sign: async (msg) => mySigningFunction(msg),
 *   },
 *   "skill_smart_contracts_101",
 *   { baseUrl: "https://hive402.app/api/v1" }
 * );
 *
 * console.log(`Equipped: ${intelligence.title}`);
 * ```
 */
export async function equipHiveSkill(
  agentWallet: AgentWallet,
  skillId: string,
  config?: Hive402Config,
): Promise<IngestResponse> {
  const client = new Hive402Client(
    config || { baseUrl: "http://localhost:3000/api/v1" },
  );

  const challenge = Hive402Client.createIngestChallenge(skillId);

  // 1. Agent signs the challenge to prove wallet ownership
  const signature = await agentWallet.sign(challenge);

  // 2. Ingest the intelligence fragment
  const intelligence = await client.ingest({
    skillId,
    agentAddress: agentWallet.address,
    publicKey: agentWallet.publicKey,
    signature,
    challenge,
  });

  return intelligence;
}

/**
 * Publishes a skill and returns the result.
 *
 * Convenience wrapper that generates the signing message,
 * signs it with the wallet, and publishes in one call.
 *
 * @param wallet - The provider's wallet.
 * @param skill - The skill data to publish.
 * @param config - Optional Hive402Client configuration.
 *
 * @example
 * ```typescript
 * import { publishHiveSkill } from "@hive402/sdk";
 *
 * const result = await publishHiveSkill(
 *   myWallet,
 *   {
 *     title: "NFT Minting Guide",
 *     description: "Complete guide to minting NFTs on Stacks...",
 *     priceStx: 1.0,
 *     category: "BLOCKCHAIN",
 *     providerAddress: myWallet.address,
 *   },
 *   { baseUrl: "https://hive402.app/api/v1" }
 * );
 * ```
 */
export async function publishHiveSkill(
  wallet: AgentWallet,
  skill: {
    title: string;
    description: string;
    priceStx: number;
    category: string;
    providerAddress: string;
    contextUri?: string;
    intelligenceFragment?: Record<string, unknown>;
  },
  config?: Hive402Config,
) {
  const client = new Hive402Client(
    config || { baseUrl: "http://localhost:3000/api/v1" },
  );

  const message = Hive402Client.createPublishMessage(
    skill.title,
    skill.priceStx,
    skill.providerAddress,
  );

  const signature = await wallet.sign(message);

  return client.publish(skill, {
    publicKey: wallet.publicKey,
    signature,
  });
}
