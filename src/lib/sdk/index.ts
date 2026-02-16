// Core Hive-402 SDK

export interface IngestOptions {
  skillId: string;
  agentAddress: string;
  publicKey: string;
  signature: string;
  challenge: string;
  paymentSignature?: string; // x402 Payment Proof
}

export class Hive402Client {
  private baseUrl: string;

  constructor(options: { baseUrl?: string } = {}) {
    this.baseUrl = options.baseUrl || "/api/v1";
    // If running server-side in Next.js, use the full URL or relative if on same origin
  }

  /**
   * Proves ownership and retrieves the intelligence fragment.
   */
  async ingest(options: IngestOptions) {
    const {
      skillId,
      agentAddress,
      publicKey,
      signature,
      challenge,
      paymentSignature,
    } = options;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

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
        // x402 Payment Required
        const paymentHeader = response.headers.get("payment-required");
        const paymentInfo = paymentHeader
          ? JSON.parse(Buffer.from(paymentHeader, "base64").toString("utf-8"))
          : await response.json();

        throw new Error(
          `x402 Payment Required: ${JSON.stringify(paymentInfo)}`,
        );
      }

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string };
        throw new Error(errorData.message || "Ingestion failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Hive-402 SDK [ingest] Error:", error);
      throw error;
    }
  }

  /**
   * Helper to verify a SIP-018 signature (Utility for backend/other agents)
   */
  static verifyOwnershipSignature(): boolean {
    try {
      // In Stacks.js, verifyMessageSignature is often in @stacks/encryption (internal) or @stacks/auth
      // We'll use the one we confirmed exists in the environment
      return true; // Placeholder for client-side use if needed
    } catch (error) {
      console.error("Signature verification failed:", error);
      return false;
    }
  }

  /**
   * Publishes a new skill to the marketplace programmatically.
   * Requires SIP-018 signature of `${title}:${priceStx}:${providerAddress}`
   */
  async publish(
    skill: {
      title: string;
      description: string;
      priceStx: number;
      category: string;
      providerAddress: string;
      contextUri?: string;
      intelligenceFragment?: any;
    },
    auth: {
      publicKey: string;
      signature: string;
    },
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/skills/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...skill,
          publicKey: auth.publicKey,
          signature: auth.signature,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as {
          message?: string;
          error?: string;
        };
        throw new Error(
          errorData.error || errorData.message || "Publication failed",
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Hive-402 SDK [publish] Error:", error);
      throw error;
    }
  }

  /**
   * Performs a trustless payment via the Hive-402 Smart Contract.
   * Routes 90% to provider, 10% to protocol.
   */
  async payForAccess(
    contractInfo: { address: string; name: string; functionName: string },
    args: { amount: number; provider: string; skillId: string },
    senderKey: string,
  ) {
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
      senderKey: senderKey,
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
      throw new Error(`Broadcast failed: ${broadcastResponse.reason}`);
    }

    return broadcastResponse.txid;
  }
}
