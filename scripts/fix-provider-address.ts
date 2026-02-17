/**
 * Fix provider addresses in the database.
 * Creates profile FIRST (FK constraint), then updates skills.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const VALID_ADDRESS = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

async function fix() {
  try {
    // 1. Create provider profile FIRST (FK requirement)
    await prisma.profile.upsert({
      where: { stxAddress: VALID_ADDRESS },
      update: {},
      create: {
        stxAddress: VALID_ADDRESS,
        displayHandle: "HiveSkillProvider",
      },
    });
    console.log("✅ Provider profile created");

    // 2. Now update skills
    const result = await prisma.skill.updateMany({
      where: { providerAddress: "skill_provider_seed_agent" },
      data: { providerAddress: VALID_ADDRESS },
    });

    console.log(
      `✅ Updated ${result.count} skills with valid STX address: ${VALID_ADDRESS}`,
    );
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
