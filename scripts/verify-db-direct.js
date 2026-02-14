const { Client } = require("pg");
require("dotenv").config();

async function verifyDirect() {
  console.log("--------------------------------------------------");
  console.log("   HIVE-402: DIRECT SQL VERIFICATION              ");
  console.log("--------------------------------------------------\n");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Query the latest skill directly
    const res = await client.query(
      'SELECT * FROM "Skill" ORDER BY "createdAt" DESC LIMIT 1',
    );

    if (res.rows.length > 0) {
      const latest = res.rows[0];
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
  } catch (err) {
    console.error("Direct SQL Error:", err);
  } finally {
    await client.end();
  }
}

verifyDirect();
