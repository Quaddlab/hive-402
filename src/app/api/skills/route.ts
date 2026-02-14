import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // We used to use 'pg' here to bypass Prisma cache.
    // Now we use prisma.$queryRawUnsafe to achieve the same "fresh" data without the extra dependency.

    // Fetch skills
    const skills = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM "Skill" ORDER BY "createdAt" DESC
    `);

    // Fetch reviews
    const allReviews = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM "Review"
    `);

    // Map reviews to skills
    const skillsWithRatings = skills.map((skill) => {
      // Filter reviews for this skill
      const skillReviews = allReviews.filter((r) => r.skillId === skill.id);

      const reviewCount = skillReviews.length;
      const averageRating =
        reviewCount > 0
          ? skillReviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount
          : 0;

      return {
        ...skill,
        rating: parseFloat(averageRating.toFixed(1)),
        reviewCount,
      };
    });

    return NextResponse.json(skillsWithRatings);
  } catch (error) {
    console.error("Skills API Error (PG):", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
