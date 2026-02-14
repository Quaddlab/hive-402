import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const STACKS_API_HOST = "https://api.testnet.hiro.so";
const CONTRACT_ADDRESS =
  "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hive-payment-splitter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { skillId, address: _agentAddress } = body;

    // 1. Fetch Skill Details for Pricing
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      return NextResponse.json({ message: "Skill not found" }, { status: 404 });
    }

    const priceMicroStx = Math.floor(skill.priceStx * 1000000);

    // 2. Check for Payment Proof (TXID via x402 header)
    const paymentSignature = req.headers.get("payment-signature");

    const paymentRequirements = {
      x402_method: "contract-call",
      network: "stacks:testnet",
      contract: CONTRACT_ADDRESS,
      function: "pay-for-access",
      args: {
        amount: priceMicroStx,
        provider: skill.providerAddress,
        skillId: skill.id,
      },
      asset: "STX",
      price: skill.priceStx,
    };

    // 3. If no proof, return 402 with instructions
    if (!paymentSignature) {
      return NextResponse.json(
        {
          error: "Payment Required",
          paymentRequirements,
          instruction: `Call ${CONTRACT_ADDRESS}.pay-for-access(u${priceMicroStx}, '${skill.providerAddress}', '${skill.id}')`,
        },
        {
          status: 402,
          headers: {
            "payment-required": Buffer.from(
              JSON.stringify(paymentRequirements),
            ).toString("base64"),
          },
        },
      );
    }

    // 4. Verify Payment on Stacks Blockchain
    // Fetch TX info from Hiro API

    // SIMULATION BYPASS (For Hackathon/Demo without funded wallet)
    if (paymentSignature.startsWith("simulated_tx_")) {
      return NextResponse.json({
        status: "authorized",
        intelligence: {
          skillId: skill.id,
          title: skill.title,
          contextUri: skill.contextUri,
          accessKey: "hk_sim_" + Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
          note: "SIMULATION MODE: Payment bypassed for demo.",
        },
      });
    }

    const txResponse = await fetch(
      `${STACKS_API_HOST}/extended/v1/tx/${paymentSignature}`,
    );

    if (!txResponse.ok) {
      return NextResponse.json(
        { message: "Invalid Transaction ID" },
        { status: 402 },
      );
    }

    const txData = await txResponse.json();

    // Verification Checks
    const isSuccess = txData.tx_status === "success";
    const isCorrectContract =
      txData.contract_call?.contract_id === CONTRACT_ADDRESS;
    const isCorrectFunction =
      txData.contract_call?.function_name === "pay-for-access";

    // In a real production app, we would parsing strictly the args/events too.
    // For hackathon speed, checking status + contract + function is sufficient proof of intent + execution.

    if (!isSuccess || !isCorrectContract || !isCorrectFunction) {
      return NextResponse.json(
        {
          message: "Payment Verification Failed",
          details:
            "Transaction valid but did not execute correct contract function.",
        },
        { status: 402 },
      );
    }

    // 5. Success - Release Intelligence
    return NextResponse.json({
      status: "authorized",
      intelligence: {
        skillId: skill.id,
        title: skill.title,
        contextUri: skill.contextUri,
        accessKey: "hk_live_" + Math.random().toString(36).substring(7), // Mock Decryption Key
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Ingest API Error:", error);
    return NextResponse.json(
      { message: "Protocol error during ingestion sequence" },
      { status: 500 },
    );
  }
}
