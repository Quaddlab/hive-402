import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rating, comment, stxAddress } = body;

    if (!stxAddress || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify if user exists
    const profile = await prisma.profile.findUnique({
      where: { stxAddress },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Please connect wallet." },
        { status: 401 },
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        userId: stxAddress,
        skillId: id,
      },
    });

    // Update skill's average rating & review count
    const allReviews = await prisma.review.findMany({
      where: { skillId: id },
    });

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : Number(rating);

    await prisma.skill.update({
      where: { id },
      data: {
        rating: averageRating,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
