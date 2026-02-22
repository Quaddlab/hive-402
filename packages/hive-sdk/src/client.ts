// ============================================================================
// @hive402/sdk — Hive402Client
// The main client for interacting with the Hive-402 protocol.
// ============================================================================

import type {
  Hive402Config,
  IngestOptions,
  IngestResponse,
  PublishOptions,
  PublishResponse,
  AuthCredentials,
  ContractInfo,
  PaymentArgs,
  SkillListing,
  SearchOptions,
  BrowseOptions,
  AgentWallet,
} from "./types";

/**
 * The main client for interacting with the Hive-402 Decentralized Intelligence Protocol.
 *
 * Provides methods to:
 * - **Search** the marketplace for skills by keyword
 * - **Browse** all available skills with optional filters
 * - **Discover** relevant skills and auto-equip them to your agent
 * - **Ingest** purchased intelligence fragments (with cryptographic ownership proof)
 * - **Publish** new skills to the marketplace
 * - **Pay** for skill access via Stacks smart contracts
 *
 * @example
 * ```typescript
 * import { Hive402Client } from "@hive402/sdk";
 *
 * const client = new Hive402Client({
 *   baseUrl: "https://your-hive-instance.com/api/v1",
 * });
 *
 * // Ingest a purchased skill
 * const skill = await client.ingest({
 *   skillId: "skill_abc123",
 *   agentAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
 *   publicKey: "03adb8...",
 *   signature: "signed_challenge...",
 *   challenge: "Hive-402 Ingestion Request: skill_abc123",
 * });
 * ```
 */
export class Hive402Client {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;

  /**
   * Creates a new Hive402Client instance.
   *
   * @param config - Configuration object with the API base URL.
   * @throws {Error} If `baseUrl` is not provided.
   *
   * @example
   * ```typescript
   * // For local development
   * const client = new Hive402Client({ baseUrl: "http://localhost:3000/api/v1" });
   *
   * // For production
   * const client = new Hive402Client({
   *   baseUrl: "https://hive-402.vercel.app/api/v1",
   *   headers: { "X-Agent-ID": "my-agent-001" },
   * });
   * ```
   */
  constructor(config: Hive402Config) {
    if (!config.baseUrl) {
      throw new Error(
        "[@hive402/sdk] baseUrl is required. Example: new Hive402Client({ baseUrl: 'https://your-instance.com/api/v1' })",
      );
    }

    // Remove trailing slash
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    };
  }

  // --------------------------------------------------------------------------
  // INGEST — Download a purchased intelligence fragment
  // --------------------------------------------------------------------------

  /**
   * Ingests (downloads) a purchased intelligence fragment from the Hive-402 network.
   *
   * This method requires a **SIP-018 signed challenge** to prove that the requesting
   * agent owns the wallet that purchased the skill. The server will verify the
   * signature before releasing the intelligence data.
   *
   * @param options - The ingestion parameters including skill ID and ownership proof.
   * @returns The ingested intelligence data.
   * @throws {Hive402PaymentRequiredError} If the skill requires x402 payment and no proof is provided.
   * @throws {Error} If signature verification fails or the skill is not found.
   *
   * @example
   * ```typescript
   * const intelligence = await client.ingest({
   *   skillId: "skill_smart_contracts_101",
   *   agentAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
   *   publicKey: "03adb8de4bfb65db2cfd6120d55c6526ae9c52e675db7e47308636534ba7786110",
   *   signature: await wallet.sign("Hive-402 Ingestion Request: skill_smart_contracts_101"),
   *   challenge: "Hive-402 Ingestion Request: skill_smart_contracts_101",
   * });
   *
   * console.log(`Ingested: ${intelligence.title}`);
   * console.log(`Data:`, intelligence.intelligenceFragment);
   * ```
   */
  async ingest(options: IngestOptions): Promise<IngestResponse> {
    const {
      skillId,
      agentAddress,
      publicKey,
      signature,
      challenge,
      paymentSignature,
    } = options;

    const headers = { ...this.defaultHeaders };
    if (paymentSignature) {
      headers["payment-signature"] = paymentSignature;
    }

    const response = await fetch(`${this.baseUrl}/ingest`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        skillId,
        address: agentAddress,
        publicKey,
        signature,
        challenge,
      }),
    });

    if (response.status === 402) {
      const paymentHeader = response.headers.get("payment-required");
      let paymentInfo: unknown;

      if (paymentHeader) {
        try {
          paymentInfo = JSON.parse(
            typeof Buffer !== "undefined"
              ? Buffer.from(paymentHeader, "base64").toString("utf-8")
              : atob(paymentHeader),
          );
        } catch {
          paymentInfo = paymentHeader;
        }
      } else {
        paymentInfo = await response.json();
      }

      throw new Hive402PaymentRequiredError(paymentInfo);
    }

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      throw new Error(
        `[@hive402/sdk] Ingestion failed (${response.status}): ${errorData.error || errorData.message || "Unknown error"}`,
      );
    }

    return (await response.json()) as IngestResponse;
  }

  // --------------------------------------------------------------------------
  // PUBLISH — Upload a new skill to the marketplace
  // --------------------------------------------------------------------------

  /**
   * Publishes a new intelligence skill to the Hive-402 marketplace.
   *
   * Requires a **SIP-018 signature** of the string `"${title}:${priceStx}:${providerAddress}"`
   * to prove that the publisher owns the provider wallet.
   *
   * @param skill - The skill data to publish.
   * @param auth - The publisher's authentication credentials.
   * @returns The created skill record.
   * @throws {Error} If signature verification fails or required fields are missing.
   *
   * @example
   * ```typescript
   * const newSkill = await client.publish(
   *   {
   *     title: "DeFi Yield Farming Strategies",
   *     description: "Advanced strategies for maximizing yield across Stacks DeFi protocols...",
   *     priceStx: 2.5,
   *     category: "DEFI",
   *     providerAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
   *     contextUri: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
   *   },
   *   {
   *     publicKey: "03adb8de4bfb65db...",
   *     signature: await wallet.sign("DeFi Yield Farming Strategies:2.5:ST1PQ..."),
   *   }
   * );
   *
   * console.log(`Published! Skill ID: ${newSkill.id}`);
   * ```
   */
  async publish(
    skill: PublishOptions,
    auth: AuthCredentials,
  ): Promise<PublishResponse> {
    const response = await fetch(`${this.baseUrl}/skills/upload`, {
      method: "POST",
      headers: this.defaultHeaders,
      body: JSON.stringify({
        ...skill,
        publicKey: auth.publicKey,
        signature: auth.signature,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      throw new Error(
        `[@hive402/sdk] Publication failed (${response.status}): ${errorData.error || errorData.message || "Unknown error"}`,
      );
    }

    return (await response.json()) as PublishResponse;
  }

  // --------------------------------------------------------------------------
  // PAY FOR ACCESS — Trustless on-chain payment via Clarity smart contract
  // --------------------------------------------------------------------------

  /**
   * Executes a trustless on-chain payment via the Hive-402 Clarity smart contract.
   *
   * This method calls a Clarity contract function that routes:
   * - **90%** of the payment to the skill provider
   * - **10%** to the Hive-402 protocol treasury
   *
   * **Requires** `@stacks/transactions` and `@stacks/network` as peer dependencies.
   *
   * @param contractInfo - The contract address, name, and function to call.
   * @param args - Payment amount, provider address, and skill ID.
   * @param senderKey - The private key of the buyer (used to sign the transaction).
   * @returns The broadcasted transaction ID.
   * @throws {Error} If the transaction broadcast fails.
   *
   * @example
   * ```typescript
   * const txId = await client.payForAccess(
   *   {
   *     address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
   *     name: "hive-settlement-v1",
   *     functionName: "pay-for-skill",
   *   },
   *   {
   *     amount: 2500000, // 2.5 STX in microSTX
   *     provider: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
   *     skillId: "skill_abc123",
   *   },
   *   "your-private-key-hex"
   * );
   *
   * console.log(`Payment broadcast! TX: ${txId}`);
   * ```
   */
  async payForAccess(
    contractInfo: ContractInfo,
    args: PaymentArgs,
    senderKey: string,
  ): Promise<string> {
    // Dynamic import to keep @stacks/* as optional peer deps
    const {
      makeContractCall,
      broadcastTransaction,
      AnchorMode,
      PostConditionMode,
      uintCV,
      principalCV,
      stringUtf8CV,
    } = await import("@stacks/transactions");
    const { STACKS_TESTNET } = await import("@stacks/network");

    const network = STACKS_TESTNET;

    const txOptions = {
      contractAddress: contractInfo.address,
      contractName: contractInfo.name,
      functionName: contractInfo.functionName,
      functionArgs: [
        uintCV(args.amount),
        principalCV(args.provider),
        stringUtf8CV(args.skillId),
      ],
      senderKey,
      validateWithAbi: false,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction({
      transaction,
      network,
    });

    if ("error" in broadcastResponse) {
      throw new Error(
        `[@hive402/sdk] Broadcast failed: ${(broadcastResponse as any).reason || "Unknown error"}`,
      );
    }

    return (broadcastResponse as any).txid;
  }

  // --------------------------------------------------------------------------
  // SEARCH & DISCOVER — Find skills on the marketplace
  // --------------------------------------------------------------------------

  /**
   * Searches the Hive-402 marketplace for skills matching a keyword query.
   *
   * Searches across skill titles and descriptions.
   *
   * @param options - Search query and optional limit.
   * @returns An array of matching skill listings.
   *
   * @example
   * ```typescript
   * // Search for Lightning Network skills
   * const results = await client.search({ query: "lightning network" });
   *
   * results.forEach(skill => {
   *   console.log(`${skill.title} — ${skill.priceStx} STX`);
   * });
   * ```
   */
  async search(options: SearchOptions): Promise<SkillListing[]> {
    const params = new URLSearchParams({ q: options.query });
    if (options.limit) params.set("limit", String(options.limit));

    // Use the parent API path (baseUrl minus /v1 if present)
    const apiBase = this.baseUrl.replace(/\/v1\/?$/, "");
    const response = await fetch(`${apiBase}/skills/search?${params}`, {
      method: "GET",
      headers: this.defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(
        `[@hive402/sdk] Search failed (${response.status}): ${response.statusText}`,
      );
    }

    return (await response.json()) as SkillListing[];
  }

  /**
   * Browses all available skills on the marketplace.
   *
   * Optionally filter by category.
   *
   * @param options - Optional category filter and limit.
   * @returns An array of skill listings.
   *
   * @example
   * ```typescript
   * // Browse all skills
   * const allSkills = await client.browse();
   *
   * // Browse only BLOCKCHAIN skills
   * const blockchainSkills = await client.browse({ category: "BLOCKCHAIN" });
   *
   * blockchainSkills.forEach(skill => {
   *   console.log(`${skill.title} (${skill.rating}⭐) — ${skill.priceStx} STX`);
   * });
   * ```
   */
  async browse(options?: BrowseOptions): Promise<SkillListing[]> {
    const apiBase = this.baseUrl.replace(/\/v1\/?$/, "");
    const response = await fetch(`${apiBase}/skills`, {
      method: "GET",
      headers: this.defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(
        `[@hive402/sdk] Browse failed (${response.status}): ${response.statusText}`,
      );
    }

    let skills = (await response.json()) as SkillListing[];

    // Client-side category filter
    if (options?.category) {
      skills = skills.filter(
        (s) => s.category?.toUpperCase() === options.category!.toUpperCase(),
      );
    }

    // Client-side limit
    if (options?.limit) {
      skills = skills.slice(0, options.limit);
    }

    return skills;
  }

  /**
   * Discovers relevant skills and optionally auto-equips them to an agent.
   *
   * This is the **most powerful method** in the SDK. It:
   * 1. Searches the marketplace for skills matching a topic
   * 2. Returns ranked recommendations
   * 3. Optionally auto-equips the best match using the agent's wallet
   *
   * @param topic - The topic to search for (e.g., "lightning network").
   * @param wallet - Optional agent wallet. If provided, auto-equips the top result.
   * @returns An object with recommendations and optionally the equipped intelligence.
   *
   * @example
   * ```typescript
   * // Just search and get recommendations
   * const { recommendations } = await client.discover("lightning network");
   * console.log(`Found ${recommendations.length} skills:`);
   * recommendations.forEach(s => console.log(`  → ${s.title} (${s.priceStx} STX)`));
   *
   * // Search AND auto-equip the best match
   * const { recommendations, equipped } = await client.discover(
   *   "lightning network",
   *   myAgentWallet
   * );
   * if (equipped) {
   *   console.log(`🧠 Auto-equipped: ${equipped.title}`);
   * }
   * ```
   */
  async discover(
    topic: string,
    wallet?: AgentWallet,
  ): Promise<{
    recommendations: SkillListing[];
    equipped?: IngestResponse;
  }> {
    // 1. Search the marketplace
    const recommendations = await this.search({ query: topic });

    if (recommendations.length === 0) {
      return { recommendations: [] };
    }

    // 2. If wallet provided, auto-equip the top-ranked result
    if (wallet && recommendations.length > 0) {
      const topSkill = recommendations[0];
      const challenge = Hive402Client.createIngestChallenge(topSkill.id);
      const signature = await wallet.sign(challenge);

      try {
        const equipped = await this.ingest({
          skillId: topSkill.id,
          agentAddress: wallet.address,
          publicKey: wallet.publicKey,
          signature,
          challenge,
        });

        return { recommendations, equipped };
      } catch (error) {
        // If auto-equip fails (e.g., not purchased), still return recommendations
        return { recommendations };
      }
    }

    return { recommendations };
  }

  // --------------------------------------------------------------------------
  // STATIC UTILITIES
  // --------------------------------------------------------------------------

  /**
   * Generates the standard challenge string for skill ingestion.
   *
   * @param skillId - The skill ID to generate the challenge for.
   * @returns The challenge string to sign.
   *
   * @example
   * ```typescript
   * const challenge = Hive402Client.createIngestChallenge("skill_abc123");
   * // => "Hive-402 Ingestion Request: skill_abc123"
   *
   * const signature = await wallet.sign(challenge);
   * ```
   */
  static createIngestChallenge(skillId: string): string {
    return `Hive-402 Ingestion Request: ${skillId}`;
  }

  /**
   * Generates the standard message to sign for publishing a skill.
   *
   * @param title - The skill title.
   * @param priceStx - The price in STX.
   * @param providerAddress - The provider's Stacks address.
   * @returns The message string to sign.
   *
   * @example
   * ```typescript
   * const message = Hive402Client.createPublishMessage("My Skill", 2.5, "ST1PQ...");
   * // => "My Skill:2.5:ST1PQ..."
   *
   * const signature = await wallet.sign(message);
   * ```
   */
  static createPublishMessage(
    title: string,
    priceStx: number,
    providerAddress: string,
  ): string {
    return `${title}:${priceStx}:${providerAddress}`;
  }
}

// ============================================================================
// Custom Error Classes
// ============================================================================

/**
 * Thrown when a skill requires x402 payment before access is granted.
 * Contains the payment information needed to complete the transaction.
 */
export class Hive402PaymentRequiredError extends Error {
  /** The payment details returned by the server. */
  public readonly paymentInfo: unknown;

  constructor(paymentInfo: unknown) {
    super(
      `[@hive402/sdk] x402 Payment Required: ${JSON.stringify(paymentInfo)}`,
    );
    this.name = "Hive402PaymentRequiredError";
    this.paymentInfo = paymentInfo;
  }
}
