import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address required" }, { status: 400 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        buyerAddress: address,
        status: "settled",
      },
      include: {
        skill: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    const logs = orders.map((order) => ({
      id: order.txid,
      title: "Intelligence Ingested",
      message: `${order.skill.title} fragment successfully integrated via x402 protocol.`,
      time: new Date(order.createdAt).toLocaleTimeString(),
      type: "success",
      amountStx: order.amountStx,
    }));

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Logs API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}
