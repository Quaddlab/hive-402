import { NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/api/gemini";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  console.log("--> API /chat hit"); // Debug log
  try {
    const { message, history, skillIds } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // 1. Fetch installed skills context
    let taskInput = message;
    if (skillIds && Array.isArray(skillIds) && skillIds.length > 0) {
      try {
        const skills = await prisma.skill.findMany({
          where: { id: { in: skillIds } },
          select: {
            title: true,
            description: true,
            category: true,
            priceStx: true,
          },
        });

        if (skills.length > 0) {
          const contextBlock = skills
            .map(
              (s) =>
                `SKILL: ${s.title} (${s.category})\nDESCRIPTION: ${s.description}`,
            )
            .join("\n---\n");

          taskInput = `[INSTALLED CONTEXT]\n${contextBlock}\n\n[USER REQUEST]\n${message}`;
        }
      } catch (err) {
        console.error("Failed to fetch skill context:", err);
      }
    }

    // 2. Create a new Task for the Agent
    // Fallback to raw SQL if Prisma Client types are stuck in cache
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date();

    // We'll use raw SQL to guarantee insertion even if the typed model isn't generated yet
    // Note: We need to respect the actual table name. Usually "AgentTask" maps to "AgentTask" or "agent_tasks"
    // Let's try the typed way first, but wrap it.
    // Actually, let's just use specific raw query to be safe given the persistent error.

    // Check if we can use $executeRawUnsafe for speed in hackathon mode
    try {
      await prisma.agentTask.create({
        data: {
          id: taskId,
          userId: "user_demo",
          input: taskInput,
          status: "pending",
          createdAt: now,
          updatedAt: now,
          messages: {
            create: [{ role: "user", content: message }],
          },
        },
      });
    } catch (prismaError: any) {
      console.warn(
        "Prisma Model Create failed, trying raw SQL fallback...",
        prismaError.message,
      );
      // Fallback: Manually insert.
      // Note: Relation for messages might be tricky with raw SQL multiple inserts.
      // Let's just insert the task for now to unblock the flow.
      await prisma.$executeRawUnsafe(
        `INSERT INTO "AgentTask" ("id", "userId", "status", "input", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6)`,
        taskId,
        "user_demo",
        "pending",
        taskInput,
        now,
        now,
      );
      await prisma.$executeRawUnsafe(
        `INSERT INTO "AgentMessage" ("id", "taskId", "role", "content", "createdAt") VALUES ($1, $2, $3, $4, $5)`,
        `msg_${Date.now()}`,
        taskId,
        "user",
        message,
        now,
      );
    }

    // 2. Acknowledge receipt
    return NextResponse.json({
      response: "Command received. Dispatching to OpenClaw Agent Swarm...",
      taskId: taskId,
      status: "pending",
    });
  } catch (error: any) {
    console.error("Chat API Route Error Full Trace:", error);
    // Ensure we return JSON, not HTML, even for 500s
    return new NextResponse(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
