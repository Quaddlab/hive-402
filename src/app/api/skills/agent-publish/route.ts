import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Internal API route for the OpenClaw Agent to publish skills.
 * This route bypasses SIP-018 signature verification since
 * the agent is a trusted, autonomous backend process.
 *
 * It validates the request via the agent's known ID instead.
 */

const TRUSTED_AGENT_ID = "agent_local_worker_01";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, priceStx, category, providerAddress, agentId } =
      body;

    // 1. Verify this is from our trusted agent
    if (agentId !== TRUSTED_AGENT_ID) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid agent identity" },
        { status: 401 },
      );
    }

    // 2. Validate required fields
    if (!title || !description || !priceStx || !category || !providerAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 3. Sanitize (strip script tags)
    const sanitizedTitle = title.replace(
      /<script\b[^>]*>([\s\S]*?)<\/script>/gim,
      "",
    );
    const sanitizedDesc = description.replace(
      /<script\b[^>]*>([\s\S]*?)<\/script>/gim,
      "",
    );

    // 4. Upsert agent profile
    await prisma.profile.upsert({
      where: { stxAddress: providerAddress },
      update: {},
      create: {
        stxAddress: providerAddress,
        displayHandle: "OpenClaw Agent",
      },
    });

    // 5. Create the skill
    const skill = await prisma.skill.create({
      data: {
        title: sanitizedTitle,
        description: sanitizedDesc,
        priceStx: parseFloat(priceStx),
        category,
        contextUri: "openclaw://agent-generated-" + Date.now(),
        providerAddress,
      },
    });

    console.log(
      `[Agent Publish] New skill created: "${skill.title}" (${skill.id})`,
    );

    return NextResponse.json(skill);
  } catch (error) {
    console.error("Agent Publish Error:", error);
    return NextResponse.json(
      { error: "Failed to publish agent-generated skill" },
      { status: 500 },
    );
  }
}
