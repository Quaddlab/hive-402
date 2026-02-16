import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyECDSA } from "@stacks/encryption";
import { getAddressFromPublicKey } from "@stacks/transactions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      priceStx,
      category,
      providerAddress,
      contextUri,
      intelligenceFragment,
      publicKey,
      signature,
    } = body;

    // 0. Verify Identity (SIP-018)
    if (!publicKey || !signature) {
      return NextResponse.json(
        { error: "Protocol Violation: Missing cryptographic signature" },
        { status: 401 },
      );
    }

    // Verify address matches key
    const derivedAddress = getAddressFromPublicKey(publicKey, "testnet"); // Defaulting to testnet for now
    if (derivedAddress !== providerAddress) {
      return NextResponse.json(
        {
          error: "Identity Mismatch: Public key does not own provider address",
        },
        { status: 401 },
      );
    }

    const expectedMessage = `${title}:${priceStx}:${providerAddress}`;
    if (!verifyECDSA(expectedMessage, publicKey, signature)) {
      return NextResponse.json(
        { error: "Invalid Signature: Payload tampering detected" },
        { status: 401 },
      );
    }

    if (!title || !description || !priceStx || !category || !providerAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // --- Audit Lite: Validation Middleware ---

    // 1. Size Gating (Max 5MB)
    const bodySize = JSON.stringify(body).length;
    if (bodySize > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Intelligence fragment exceeds 5MB limit" },
        { status: 413 },
      );
    }

    // 2. Sanitization (Strip script tags)
    const sanitizedTitle = title.replace(
      /<script\b[^>]*>([\s\S]*?)<\/script>/gim,
      "",
    );
    const sanitizedDesc = description.replace(
      /<script\b[^>]*>([\s\S]*?)<\/script>/gim,
      "",
    );

    // 3. Injection Scan (Basic Prompt Injection filter)
    const injectionPatterns = [
      /ignore all previous/i,
      /you are now a/i,
      /forget everything/i,
      /system prompt/i,
    ];

    if (injectionPatterns.some((p) => p.test(description))) {
      return NextResponse.json(
        { error: "Malicious logic detected: Prompt injection attempt" },
        { status: 400 },
      );
    }

    // 4. Structural Integrity (Structural Check)
    if (intelligenceFragment && typeof intelligenceFragment !== "object") {
      return NextResponse.json(
        {
          error:
            "Structural Integrity Failure: Intelligence fragment must be a valid JSON object",
        },
        { status: 400 },
      );
    }

    await prisma.profile.upsert({
      where: { stxAddress: providerAddress },
      update: {},
      create: {
        stxAddress: providerAddress,
      },
    });

    const skill = await prisma.skill.create({
      data: {
        title: sanitizedTitle,
        description: sanitizedDesc,
        priceStx: parseFloat(priceStx),
        category,
        contextUri: contextUri || "ipfs://placeholder-fragment-" + Date.now(),
        providerAddress,
      },
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error("Upload Skill Error:", error);
    return NextResponse.json(
      { error: "Failed to publish skill" },
      { status: 500 },
    );
  }
}
