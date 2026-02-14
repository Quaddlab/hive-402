import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  try {
    const skills = await prisma.skill.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Search operation failed" },
      { status: 500 },
    );
  }
}
