import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Add explicit logging
    console.log("--> API /stats hit");

    // Ensure Prisma is connected or handle connection error gracefully
    const [skillCount, transferCount] = await Promise.all([
      prisma.skill.count().catch((err) => {
        console.error("Failed to count skills:", err);
        return 0; // Fallback
      }),
      prisma.order
        .count({
          where: { status: "settled" },
        })
        .catch((err) => {
          console.error("Failed to count orders:", err);
          return 0; // Fallback
        }),
    ]);

    return NextResponse.json({
      activeSkills: skillCount,
      transfers: transferCount,
    });
  } catch (error: any) {
    console.error("Stats API Fatal Error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Failed to fetch stats" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
