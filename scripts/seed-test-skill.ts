import prisma from "../src/lib/prisma";

async function seedTestSkill() {
  const address = process.argv[2];

  if (!address) {
    console.error("Usage: npx tsx scripts/seed-test-skill.ts <STX_ADDRESS>");
    process.exit(1);
  }

  console.log(`[SEED] Granting 'Clarity Security Master' to: ${address}`);

  try {
    // 1. Ensure Profile Exists
    const profile = await prisma.profile.upsert({
      where: { stxAddress: address },
      update: {},
      create: {
        stxAddress: address,
        bnsName: "tester.btc",
        displayHandle: "Tester",
      },
    });

    // 2. Create the Skill (if not already there)
    const skill = await prisma.skill.upsert({
      where: { id: "clp_security_master_01" },
      update: {},
      create: {
        id: "clp_security_master_01",
        title: "Clarity Security Master",
        description:
          "Expert-level insight into Clarity vulnerabilities, re-entrancy patterns, and post-condition audits. Optimized for Hive-402 ingestion.",
        priceStx: 25,
        category: "Security",
        contextUri: "ipfs://test-vec-01",
        providerAddress: address,
      },
    });

    console.log(
      `[SUCCESS] Skill '${skill.title}' is now active in your AI Lab.`,
    );
    console.log(
      `[NEXT] Open the AI Lab in your browser and verify the 'Active Context' sidebar.`,
    );
  } catch (error) {
    console.error("[ERROR] Seeding failed:", error);
  }
}

seedTestSkill();
