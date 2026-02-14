/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const stxAddress = "SP2P...8N3G"; // Demo Address

  // 1. Create Demo Profile
  await prisma.profile.upsert({
    where: { stxAddress },
    update: {},
    create: {
      stxAddress,
      bnsName: "anthony.stx",
      displayHandle: "Anthony",
    },
  });

  // 2. Create Demo Skill
  await prisma.skill.upsert({
    where: { id: "demo-skill-id" },
    update: {},
    create: {
      id: "demo-skill-id",
      title: "Clarity Security Master",
      description:
        "Expert-level context on common Clarity vulnerabilities, re-entrancy patterns, and audit checklists. Includes specific nakamoto-release interaction patterns.",
      priceStx: 5.0,
      contextUri: "ipfs://neural-link-protocol-secure-1",
      category: "Security",
      providerAddress: stxAddress,
    },
  });

  console.log("Seeding completed: Demo Profile and Skill created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
