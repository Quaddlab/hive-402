import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    // Fetch user profile and their skills
    // Fetch skills purchased by the user (via Orders)
    const orders = await prisma.order.findMany({
      where: {
        buyerAddress: address,
        status: "settled",
      },
      include: {
        skill: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const skills = orders.map((order) => order.skill);
    return NextResponse.json({ skills });
  } catch (error) {
    console.error("User Skills API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
