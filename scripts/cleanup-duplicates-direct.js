const { Client } = require("pg");
require("dotenv").config();

async function cleanupDirect() {
  console.log("--------------------------------------------------");
  console.log("   HIVE-402: DIRECT SQL CLEANUP                   ");
  console.log("--------------------------------------------------\n");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const targetTitle = "Autonomous Trading Algorithm V9";

  try {
    await client.connect();

    // Find all skills with the target title, ordered by creation (newest first)
    const res = await client.query(
      'SELECT id, "createdAt" FROM "Skill" WHERE title = $1 ORDER BY "createdAt" DESC',
      [targetTitle],
    );

    if (res.rows.length > 1) {
      console.log(
        `[FOUND] ${res.rows.length} duplicate entries for "${targetTitle}"`,
      );

      const toKeep = res.rows[0];
      const toDelete = res.rows.slice(1);

      console.log(`[KEEPING] ID: ${toKeep.id} (Created: ${toKeep.createdAt})`);

      for (const skill of toDelete) {
        console.log(`[DELETING] ID: ${skill.id} (Created: ${skill.createdAt})`);
        await client.query('DELETE FROM "Skill" WHERE id = $1', [skill.id]);
      }

      console.log(`\n[SUCCESS] Removed ${toDelete.length} duplicate entries.`);
    } else {
      console.log("[INFO] No duplicates found.");
    }
  } catch (err) {
    console.error("Direct Cleanup Error:", err);
  } finally {
    await client.end();
  }
}

cleanupDirect();
