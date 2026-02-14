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
  console.log("--------------------------------------------------");

  let isProcessing = false;

  setInterval(async () => {
    if (isProcessing) return; // Don't poll if busy

    try {
      // 1. Poll for Tasks
      process.stdout.write("."); // heartbeat
      const pollRes = await fetch(
        `${BASE_URL}/openclaw/webhook?action=poll_tasks&agentId=${AGENT_ID}`,
      );

      if (!pollRes.ok) {
        // limit error noise
        return;
      }

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
      // Silent fail on connection error to just keep retrying
    }
  }, POLL_INTERVAL_MS);
}

async function processTask(task: any) {
  console.log("   ⚙️  Processing...");

  // Simulate "Thinking" time
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Generate a mock response based on input
  let output = `[Processed by OpenClaw] Analysis complete for: "${task.input}". \n   > Insight: This is a verified Hive transaction.\n   > Confidence: 99.8%`;

  // Custom logic for specific keywords
  if (task.input.toLowerCase().includes("stacks")) {
    output =
      "Stacks (STX) is a Bitcoin Layer for smart contracts. Block height: 134,502. Network: Stable.";
  } else if (task.input.toLowerCase().includes("price")) {
    output =
      "Current market analysis indicates accumulation phase. Support levels holding strong.";
  }

  // Submit Result
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
          output: output,
        },
      }),
    });

    const result = await completeRes.json();
    if (result.success) {
      console.log("   ✅ Result Submitted Successfully!");
    } else {
      console.error("   ❌ Failed to submit result:", result);
    }
  } catch (err) {
    console.error("   ❌ Network error submitting result:", err);
  }
}

runAgentLoop();
