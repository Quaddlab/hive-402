import "dotenv/config";
import prisma from "@/lib/prisma";

async function verifyDbContent() {
  console.log("--------------------------------------------------");
  console.log("   HIVE-402: MARKETPLACE DB VERIFICATION          ");
  console.log("--------------------------------------------------\n");

  try {
    const skills = await prisma.skill.findMany({
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    if (skills.length > 0) {
      const latest = skills[0];
      console.log("[LATEST SKILL FOUND]");
      console.log(`ID: ${latest.id}`);
      console.log(`Title: "${latest.title}"`);
      console.log(`Price: ${latest.priceStx} STX`);
      console.log(`Category: ${latest.category}`);
      console.log(`Provider: ${latest.providerAddress}`);
      console.log(`Created: ${latest.createdAt}`);

      if (latest.title === "Autonomous Trading Algorithm V9") {
        console.log(
          "\n[VERIFIED] 'Autonomous Trading Algorithm V9' is in the database and will appear on the frontend.",
        );
      } else {
        console.log(
          "\n[WARNING] Latest skill does not match the expected autonomous upload.",
        );
      }
    } else {
      console.log("[ERROR] No skills found in database.");
    }
  } catch (error) {
    console.error("Verification Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDbContent();
