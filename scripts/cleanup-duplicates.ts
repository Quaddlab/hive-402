import "dotenv/config";
import prisma from "@/lib/prisma";

async function cleanupDuplicates() {
  console.log("--------------------------------------------------");
  console.log("   HIVE-402: MARKETPLACE CLEANUP                  ");
  console.log("--------------------------------------------------\n");

  const targetTitle = "Autonomous Trading Algorithm V9";

  try {
    // Find all skills with the target title
    const skills = await prisma.skill.findMany({
      where: { title: targetTitle },
      orderBy: { createdAt: "desc" },
    });

    if (skills.length > 1) {
      console.log(`[FOUND] ${skills.length} entries for "${targetTitle}"`);

      // Keep the first one (most recent due to desc sort)
      const toKeep = skills[0];
      const toDelete = skills.slice(1);

      console.log(`[KEEPING] ID: ${toKeep.id} (Created: ${toKeep.createdAt})`);

      for (const skill of toDelete) {
        console.log(`[DELETING] ID: ${skill.id} (Created: ${skill.createdAt})`);
        await prisma.skill.delete({
          where: { id: skill.id },
        });
      }

      console.log(`\n[SUCCESS] Removed ${toDelete.length} duplicate entries.`);
    } else {
      console.log("[INFO] No duplicates found.");
    }
  } catch (error) {
    console.error("Cleanup Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicates();
