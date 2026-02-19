// ============================================================================
// @hive402/sdk — Type Definitions
// ============================================================================

/**
 * Configuration options for initializing the Hive402Client.
 */
export interface Hive402Config {
  /**
   * The base URL of your Hive-402 API instance.
   * Must include the API version path.
   *
   * @example "https://your-hive-instance.com/api/v1"
   * @example "http://localhost:3000/api/v1"
   */
  baseUrl: string;

  /**
   * Optional custom headers to include with every request.
   * Useful for adding authorization tokens or custom identifiers.
   */
  headers?: Record<string, string>;
}

/**
 * Options required for ingesting (downloading) a purchased intelligence fragment.
 *
 * Ingestion requires a SIP-018 signed challenge to prove wallet ownership.
 */
export interface IngestOptions {
  /** The unique ID of the skill to ingest. */
  skillId: string;

  /** The Stacks address of the agent requesting access. */
  agentAddress: string;

  /** The public key associated with the agent's Stacks address. */
  publicKey: string;

  /**
   * SIP-018 signature of the challenge string.
   * Use `@stacks/encryption` or wallet signing to produce this.
   */
  signature: string;

  /**
   * The challenge string that was signed.
   * Convention: `"Hive-402 Ingestion Request: <skillId>"`
   */
  challenge: string;

  /**
   * Optional x402 payment proof signature.
   * Required if the skill uses x402 payment verification.
   */
  paymentSignature?: string;
}

/**
 * Options required for publishing a new skill to the marketplace.
 */
export interface PublishOptions {
  /** The title of the intelligence skill. */
  title: string;

  /** A detailed description of what the skill covers. */
  description: string;

  /** The price in STX tokens (e.g., 0.5 for 0.5 STX). */
  priceStx: number;

  /**
   * The skill category.
   * @example "BLOCKCHAIN", "AI", "SECURITY", "DEFI"
   */
  category: string;

  /** The Stacks address that will receive payments for this skill. */
  providerAddress: string;

  /** Optional URI pointing to the full intelligence context (e.g., IPFS hash). */
  contextUri?: string;

  /** Optional raw intelligence data to embed directly. */
  intelligenceFragment?: Record<string, unknown>;
}

/**
 * Authentication credentials for SDK operations.
 * Requires a SIP-018 signature to prove wallet ownership.
 */
export interface AuthCredentials {
  /** The Stacks public key of the signer. */
  publicKey: string;

  /**
   * SIP-018 signature proving ownership of the wallet.
   * For publishing: sign `"${title}:${priceStx}:${providerAddress}"`
   */
  signature: string;
}

/**
 * Configuration for making a trustless smart contract payment.
 */
export interface ContractInfo {
  /** The Stacks address that deployed the contract. */
  address: string;

  /** The name of the smart contract. */
  name: string;

  /** The public function to call on the contract. */
  functionName: string;
}

/**
 * Arguments for the on-chain payment function.
 */
export interface PaymentArgs {
  /** The payment amount in microSTX (1 STX = 1,000,000 microSTX). */
  amount: number;

  /** The Stacks address of the skill provider (payment recipient). */
  provider: string;

  /** The unique ID of the skill being purchased. */
  skillId: string;
}

/**
 * The response returned after a successful skill ingestion.
 */
export interface IngestResponse {
  /** The skill's unique identifier. */
  id: string;

  /** The skill title. */
  title: string;

  /** The skill description. */
  description: string;

  /** The ingested intelligence fragment data. */
  intelligenceFragment?: Record<string, unknown>;

  /** ISO 8601 timestamp of when the skill was created. */
  createdAt: string;
}

/**
 * The response returned after successfully publishing a skill.
 */
export interface PublishResponse {
  /** The newly created skill's unique identifier. */
  id: string;

  /** The skill title. */
  title: string;

  /** The on-chain transaction ID (if applicable). */
  txId?: string;

  /** ISO 8601 timestamp of when the skill was published. */
  createdAt: string;
}

/**
 * Represents a wallet interface for agent operations.
 * Used by helper functions like `equipHiveSkill()`.
 */
export interface AgentWallet {
  /** The Stacks address of the agent. */
  address: string;

  /** The agent's public key. */
  publicKey: string;

  /**
   * A function that signs a message string and returns the signature.
   * This should use SIP-018 structured data signing.
   */
  sign: (message: string) => Promise<string>;
}

/**
 * A skill listing returned from marketplace search/browse.
 */
export interface SkillListing {
  /** The skill's unique identifier. */
  id: string;

  /** The skill title. */
  title: string;

  /** The skill description. */
  description: string;

  /** The price in STX. */
  priceStx: number;

  /** The skill category. */
  category: string;

  /** The provider's Stacks address. */
  providerAddress: string;

  /** Average rating (0-5). */
  rating?: number;

  /** Number of reviews. */
  reviewCount?: number;

  /** ISO 8601 timestamp. */
  createdAt: string;
}

/**
 * Options for searching the marketplace.
 */
export interface SearchOptions {
  /** The search query (e.g., "lightning network", "DeFi"). */
  query: string;

  /** Maximum number of results to return (default: 10). */
  limit?: number;
}

/**
 * Options for browsing the marketplace.
 */
export interface BrowseOptions {
  /** Filter by category (e.g., "BLOCKCHAIN", "AI"). */
  category?: string;

  /** Maximum number of results to return. */
  limit?: number;
}
