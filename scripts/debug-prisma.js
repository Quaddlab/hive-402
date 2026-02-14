const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config();

async function debugPrisma() {
  console.log("-----------------------------------------");
  console.log("   DEBUG: PRISMA CLIENT (ADAPTER MODE)   ");
  console.log("-----------------------------------------");

  const connectionString = process.env.DATABASE_URL;
  console.log(
    `[INIT] DB URL starts with: ${connectionString ? connectionString.substring(0, 15) + "..." : "UNDEFINED"}`,
  );

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("[1] Connecting to DB...");
    await prisma.$connect();
    console.log("[PASS] Connected.");

    console.log("[2] Testing GET /api/skills query...");
    const skills = await prisma.skill.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    console.log(`[PASS] Query successful. Found ${skills.length} skills.`);
    if (skills.length > 0) {
      console.log(`[DATA] First skill rating: ${skills[0].rating}`);
      console.log(
        `[DATA] First skill reviews: ${JSON.stringify(skills[0].reviews)}`,
      );
    }
  } catch (error) {
    console.error("\n[FAIL] Prisma Client Error:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

debugPrisma();
