import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { txid, amountStx, buyerAddress, skillId } = body;

    if (!txid || !amountStx || !buyerAddress || !skillId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create the order record in 'pending' state
    const order = await prisma.order.create({
      data: {
        txid,
        amountStx,
        buyerAddress,
        skillId,
        status: "settled", // Auto-settle for demo purposes (assumes client-side success)
      },
    });

    // Also add a log for the user
    await prisma.banRecord
      .create({
        data: {
          ipHash: `TX_${txid}`, // Using ipHash field as a generic log since it has a 1-to-1 with profile
          profileAddress: buyerAddress,
        },
      })
      .catch(() => {}); // Ignore duplicate logs for same TX

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order Creation API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
