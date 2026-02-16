import { Hive402Client } from "../src/lib/sdk";

// Configuration
const AGENT_ID = "agent_local_worker_01";
const POLL_INTERVAL_MS = 3000; // Poll every 3 seconds
const BASE_URL = "http://localhost:3000/api";

async function runAgentLoop() {
  console.clear();
  console.log("🤖 OpenClaw Local Worker Node Starting...");
  console.log(`📡 Connecting to Hive Node at: ${BASE_URL}`);
  console.log(`🆔 Agent ID: ${AGENT_ID}`);
  console.log("⚠️  Mode: MARKETPLACE-DRIVEN (no built-in intelligence)");
  console.log("   Will recommend skills for wallet-signed purchase.");
  console.log("--------------------------------------------------");

  let isProcessing = false;

  setInterval(async () => {
    if (isProcessing) return;

    try {
      process.stdout.write(".");
      const pollRes = await fetch(
        `${BASE_URL}/openclaw/webhook?action=poll_tasks&agentId=${AGENT_ID}`,
      );

      if (!pollRes.ok) return;

      const pollData = await pollRes.json();
      const tasks = pollData.tasks || [];

      if (tasks.length > 0) {
        isProcessing = true;
        console.log(`\n\n🔔 DETECTED TASK [${tasks[0].id}]`);
        console.log(`   Input: "${tasks[0].input}"`);

        await processTask(tasks[0]);

        isProcessing = false;
        console.log("   Waiting for next task...");
      }
    } catch (error) {
      // Silent fail on connection error
    }
  }, POLL_INTERVAL_MS);
}

async function processTask(task: any) {
  console.log("   ⚙️  Agent has NO intelligence. Searching marketplace...");

  let output: any = {};

  try {
    // Step 1: Extract keywords
    const keywords = extractKeywords(task.input);
    console.log(`   🔍 Search keywords: "${keywords}"`);

    // Step 2: Search marketplace
    const searchRes = await fetch(
      `${BASE_URL}/skills/search?q=${encodeURIComponent(keywords)}`,
    );
    const skills = await searchRes.json();

    if (!Array.isArray(skills) || skills.length === 0) {
      // No skills found
      output = {
        type: "no_skills_found",
        text: `I searched the Hive Marketplace for "${keywords}" but found no matching intelligence packs.\n\n💡 Upload a relevant skill to the marketplace so I can learn!`,
      };
      console.log("   ❌ No matching skills found.");
    } else {
      // Found skills! Return as a recommendation (NOT auto-purchase)
      const bestMatch = skills[0];
      console.log(
        `   ✅ Found ${skills.length} skill(s). Recommending: "${bestMatch.title}"`,
      );
      console.log(`   💰 Price: ${bestMatch.priceStx} STX`);
      console.log(`   📤 Sending recommendation to UI for wallet approval...`);

      // Return structured data so the UI can render a purchase card
      output = {
        type: "skill_recommendation",
        text: `I found a matching intelligence pack on the marketplace. Purchase it to unlock the answer.`,
        skill: {
          id: bestMatch.id,
          title: bestMatch.title,
          description: bestMatch.description,
          priceStx: bestMatch.priceStx,
          category: bestMatch.category,
          providerAddress: bestMatch.providerAddress,
        },
        allResults: skills.slice(0, 3).map((s: any) => ({
          id: s.id,
          title: s.title,
          priceStx: s.priceStx,
          category: s.category,
        })),
      };
    }
  } catch (error: any) {
    console.error("   ❌ Marketplace error:", error.message);
    output = {
      type: "error",
      text: `Error accessing the Hive Marketplace: ${error.message}`,
    };
  }

  // Submit result
  try {
    const completeRes = await fetch(`${BASE_URL}/openclaw/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "task_result",
        agentId: AGENT_ID,
        publicKey: "mock_pk_local",
        signature: "mock_sig_local",
        payload: {
          taskId: task.id,
          status: "completed",
          output: JSON.stringify(output),
        },
      }),
    });

    const result = await completeRes.json();
    if (result.success) {
      console.log("   ✅ Recommendation sent to UI!");
    } else {
      console.error("   ❌ Failed to submit:", result);
    }
  } catch (err) {
    console.error("   ❌ Network error:", err);
  }
}

function extractKeywords(input: string): string {
  const stopWords = new Set([
    "i",
    "me",
    "my",
    "we",
    "our",
    "you",
    "your",
    "he",
    "she",
    "it",
    "they",
    "the",
    "a",
    "an",
    "is",
    "am",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "can",
    "may",
    "might",
    "shall",
    "need",
    "want",
    "help",
    "please",
    "with",
    "for",
    "to",
    "of",
    "in",
    "on",
    "at",
    "by",
    "from",
    "about",
    "into",
    "through",
    "just",
    "also",
    "so",
    "but",
    "and",
    "or",
    "if",
    "then",
    "that",
    "this",
    "what",
    "which",
    "who",
    "how",
    "when",
    "where",
    "why",
    "all",
    "each",
    "every",
    "both",
    "few",
    "some",
    "any",
    "no",
    "not",
    "only",
    "very",
    "really",
    "much",
    "more",
    "most",
    "like",
    "get",
    "got",
    "make",
    "know",
    "think",
    "say",
    "tell",
    "give",
    "take",
  ]);

  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  return words.length > 0 ? words.join(" ") : input.trim();
}

runAgentLoop();
