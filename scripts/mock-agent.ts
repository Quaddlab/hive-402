/**
 * HIVE-402 Agentic Showcase
 * This script simulates a Molt agent autonomously interacting with the Hive network.
 * It demonstrates: Identity Verification -> Skill Discovery -> Intelligence Ingestion.
 */

import { Hive402Client } from "../src/lib/sdk";
import * as transactions from "@stacks/transactions";
import * as encryption from "@stacks/encryption";
import * as crypto from "crypto";

async function runShowcase() {
  console.log("STACKS TRANSACTIONS EXPORTS:", Object.keys(transactions));

  console.log("--------------------------------------------------");
  console.log("   HIVE-402 PROTOCOL: AGENTIC SHOWCASE STARTING   ");
  console.log("--------------------------------------------------\n");

  // 1. Setup Mock Agent Identity
  const privKeyRaw = crypto.randomBytes(32).toString("hex");
  const publicKey = encryption.getPublicKeyFromPrivate(privKeyRaw);
  const agentAddress = transactions.getAddressFromPublicKey(
    publicKey,
    "testnet",
  );

  console.log(`[IDENTITY] Generated Agent Node: ${agentAddress}`);
  console.log(`[IDENTITY] Public Key: ${publicKey.slice(0, 32)}...\n`);

  // 2. Initialize Hive Client (Pointing to local for demo)
  const client = new Hive402Client({ baseUrl: "http://localhost:3000/api/v1" });

  // 3. Network Discovery (Find a valid skill to ingest)
  console.log(`[NETWORK] Scanning Hive marketplace for intelligence...`);
  const discoveryResponse = await fetch("http://localhost:3000/api/skills");

  if (!discoveryResponse.ok) {
    const errorText = await discoveryResponse.text();
    console.error(
      `[ERROR] Discovery failed: ${discoveryResponse.status} ${errorText}`,
    );
    return;
  }

  const skills = await discoveryResponse.json();

  if (skills.length === 0) {
    console.error("[ERROR] No skills found in marketplace. Cannot proceed.");
    return;
  }

  const targetSkill = skills[0]; // Pick the latest one
  console.log(`[DISCOVERY] Identified Target: "${targetSkill.title}"`);
  console.log(`[DISCOVERY] ID: ${targetSkill.id}`);
  console.log(`[DISCOVERY] Price: ${targetSkill.priceStx} STX\n`);

  const skillId = targetSkill.id;
  const challenge = `HIVE_CHALLENGE_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  console.log(`[PROTOCOL] Initiating Ingestion Handshake...`);
  console.log(`[PROTOCOL] Challenge: ${challenge}\n`);

  // 4. Sign the Challenge (SIP-018 equivalent)
  console.log(`[VAULT] Signing cryptographic challenge...`);
  const signatureData = encryption.signECDSA(privKeyRaw, challenge);
  const signature = signatureData.signature;

  console.log(`[VAULT] Signature generated successfully.\n`);

  // 5. Ingest Intelligence via SDK
  console.log(`[NETWORK] Sending ingestion request to Hive controller...`);
  try {
    await client.ingest({
      skillId,
      agentAddress,
      publicKey,
      signature,
      challenge,
    });
  } catch (error: any) {
    if (error.message.includes("x402 Payment Required")) {
      console.log("\n[x402] Payment Required Detected!");

      // Parse the x402 header info from the error message
      const x402Json = error.message.replace("x402 Payment Required: ", "");
      const requirements = JSON.parse(x402Json);

      console.log(
        `[x402] Instruction: Call ${requirements.contract}.${requirements.function}`,
      );
      console.log(`[x402] Price: ${requirements.args.amount} microSTX`);

      console.log(`\n[VAULT] Authorizing Trustless Payment...`);

      try {
        // 6. Execute Trustless Settlement
        const txid = await client.payForAccess(
          {
            address: requirements.contract.split(".")[0],
            name: requirements.contract.split(".")[1],
            functionName: requirements.function,
          },
          {
            amount: parseInt(requirements.args.amount),
            provider: requirements.args.provider,
            skillId: requirements.args.skillId,
          },
          privKeyRaw, // Agent signs with their key
        );

        console.log(`[NETWORK] Transaction Broadcasted: ${txid}`);
        console.log(`[NETWORK] Waiting for confirmation (Mocking wait)...`);

        // In a real net, we'd wait. Here we proceed immediately as we simulate/mock the verification in API

        console.log(
          `\n[PROTOCOL] Retrying ingestion with Payment Proof (TXID)...`,
        );

        const intelligence = await client.ingest({
          skillId,
          agentAddress,
          publicKey,
          signature,
          challenge,
          paymentSignature: txid, // Sending TXID as proof
        });

        console.log("\n--------------------------------------------------");
        console.log("   INTELLIGENCE INGESTED SUCCESSFULLY!            ");
        console.log("--------------------------------------------------");
        console.log(`[RESULT] Auth Status: AUTHORIZED`);
        console.log(`[RESULT] Title: ${intelligence.intelligence.title}`);
        console.log(
          `[RESULT] Context Access Key: ${intelligence.intelligence.accessKey}`,
        );
        console.log("--------------------------------------------------\n");
      } catch (payError: any) {
        console.log(`[NETWORK] Broadcast Warning: ${payError.message}`);
        console.log(
          `[SIMULATION] Wallet unfunded. Switching to Bypass for Demo...`,
        );

        const mockTxId =
          "simulated_tx_" + crypto.randomBytes(8).toString("hex");
        console.log(`[PROTOCOL] Generated Proof: ${mockTxId}`);

        const intelligence = await client.ingest({
          skillId,
          agentAddress,
          publicKey,
          signature,
          challenge,
          paymentSignature: mockTxId,
        });

        console.log("\n--------------------------------------------------");
        console.log("   INTELLIGENCE INGESTED (SIMULATION MODE)        ");
        console.log("--------------------------------------------------");
        console.log(`[RESULT] Auth Status: AUTHORIZED`);
        console.log(`[RESULT] Title: ${intelligence.intelligence.title}`);
        console.log(
          `[RESULT] Context Access Key: ${intelligence.intelligence.accessKey}`,
        );
        console.log(`[RESULT] Note: ${intelligence.intelligence.note}`);
        console.log("--------------------------------------------------\n");
      }
    } else {
      console.log("\n[!] INGESTION FAILED");
      console.log(`[ERROR] ${error.message}`);
    }
  }

  console.log("Showcase sequence complete.");
}

runShowcase().catch((err) => {
  console.error("Fatal Showcase Error:", err);
});
