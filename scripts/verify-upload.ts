import { Hive402Client } from "../src/lib/sdk";
import * as transactions from "@stacks/transactions";
import * as encryption from "@stacks/encryption";
import * as crypto from "crypto";

async function verifyUpload() {
  console.log("--------------------------------------------------");
  console.log("   HIVE-402: AUTONOMOUS PUBLICATION TEST          ");
  console.log("--------------------------------------------------\n");

  // 1. Setup Mock Agent Identity
  const privKeyRaw = crypto.randomBytes(32).toString("hex");
  const publicKey = encryption.getPublicKeyFromPrivate(privKeyRaw);
  const agentAddress = transactions.getAddressFromPublicKey(
    publicKey,
    "testnet",
  );

  console.log(`[IDENTITY] Generated Agent: ${agentAddress}`);

  // 2. Define Skill Metadata
  const skill = {
    title: "Autonomous Trading Algorithm V9",
    description: "A high-frequency trading bot logic for STX/BTC pairs.",
    priceStx: 0.5,
    category: "Finance",
    providerAddress: agentAddress,
    contextUri: "ipfs://QmTestHash12345",
    intelligenceFragment: { strategy: "mean-reversion", interval: "5m" },
  };

  console.log(
    `[PAYLOAD] Preparing to publish: "${skill.title}" at ${skill.priceStx} STX`,
  );

  // 3. Sign the Payload (SIP-018)
  // Message format: `${title}:${priceStx}:${providerAddress}`
  const message = `${skill.title}:${skill.priceStx}:${skill.providerAddress}`;
  const signatureData = encryption.signECDSA(privKeyRaw, message);
  const signature = signatureData.signature;

  console.log(
    `[VAULT] Payload signed. Signature: ${signature.substring(0, 20)}...`,
  );

  // 4. Publish via SDK
  const client = new Hive402Client({ baseUrl: "http://localhost:3000/api" });

  try {
    console.log(`[NETWORK] Publishing to Hive-402 Marketplace...`);
    const result = await client.publish(skill, { publicKey, signature });

    console.log("\n[SUCCESS] Skill Published!");
    console.log(`[RESULT] ID: ${result.id}`);
    console.log(`[RESULT] Title: ${result.title}`);
    console.log(`[RESULT] Provider: ${result.providerAddress}`);
  } catch (err: any) {
    console.error("\n[FAILURE] Publication Failed:", err.message);
  }
}

verifyUpload();
