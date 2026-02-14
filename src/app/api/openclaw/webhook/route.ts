import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Cl } from "@stacks/transactions";

// Helper to validate signature (mock for now, should use stacks/encryption)
const validateSignature = (
  message: string,
  signature: string,
  publicKey: string,
) => {
  // In production, use @stacks/encryption or similar to verify
  // For hackathon/demo, we assume if formatted correctly it's valid if we don't have the lib
  return true;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type, // 'task_result' | 'ingest'
      agentId,
      publicKey,
      signature,
      payload,
    } = body;

    // 1. Basic Validation
    if (!agentId || !publicKey || !signature || !payload) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 2. Log access for debugging
    console.log(`[OpenClaw Webhook] Received ${type} from ${agentId}`);

    // 3. Handle different OpenClaw actions
    if (type === "task_result") {
      const { taskId, output, status } = payload;

      const updatedTask = await prisma.agentTask.update({
        where: { id: taskId },
        data: {
          output: typeof output === "string" ? output : JSON.stringify(output),
          status: status || "completed",
        },
      });

      // Also add as a message so it appears in chat
      await prisma.agentMessage.create({
        data: {
          taskId,
          role: "assistant",
          content: typeof output === "string" ? output : JSON.stringify(output),
        },
      });

      return NextResponse.json({ success: true, taskId });
    } else if (type === "ingest") {
      // Direct ingestion logic (simplified version of /api/v1/ingest)
      const { title, description, price, category } = payload;

      const newSkill = await prisma.skill.create({
        data: {
          title,
          description,
          priceStx: parseFloat(price),
          category: category || "AI_AGENT",
          providerAddress: agentId,
          contextUri: `openclaw:${Date.now()}`, // placeholder
        },
      });

      return NextResponse.json({ success: true, skillId: newSkill.id });
    }

    return NextResponse.json({ error: "Unknown action type" }, { status: 400 });
  } catch (error: any) {
    console.error("[OpenClaw Webhook] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const action = searchParams.get("action") || "poll_tasks";
    const category = searchParams.get("category");
    const minPrice = searchParams.get("min_price");

    if (action === "poll_tasks") {
      if (!agentId)
        return NextResponse.json(
          { error: "Agent ID required for polling" },
          { status: 400 },
        );

      // Find pending tasks for this generic "OpenClaw" worker or specific agent
      // For this demo, we can have agents claim any pending task or user-specific ones
      const pendingTasks = await prisma.agentTask.findMany({
        where: { status: "pending" },
        orderBy: { createdAt: "asc" },
        take: 1,
      });

      if (pendingTasks.length === 0) {
        return NextResponse.json({ tasks: [] });
      }

      // Mark as processing
      const task = pendingTasks[0];
      await prisma.agentTask.update({
        where: { id: task.id },
        data: { status: "processing" }, // Lock it
      });

      return NextResponse.json({ tasks: [task] });
    }

    // Default: Discovery mode for agents to find skills (as requested)
    const skills = await prisma.skill.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(minPrice ? { priceStx: { gte: parseFloat(minPrice) } } : {}),
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        priceStx: true,
        category: true,
        providerAddress: true,
      },
    });

    return NextResponse.json({ skills });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
