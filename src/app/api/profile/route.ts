import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { stxAddress: address },
      include: {
        skills: true,
      },
    });

    if (!profile) {
      // Auto-create profile if missing
      const newProfile = await prisma.profile.create({
        data: {
          stxAddress: address,
        },
      });
      return NextResponse.json(newProfile);
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { address, bnsName, displayHandle } = await request.json();

    const profile = await prisma.profile.upsert({
      where: { stxAddress: address },
      update: {
        bnsName,
        displayHandle,
      },
      create: {
        stxAddress: address,
        bnsName,
        displayHandle,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile Post Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
