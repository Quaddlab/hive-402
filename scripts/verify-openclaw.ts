import { Hive402Client } from "../src/lib/sdk";

async function verifyOpenClawIntegration() {
  console.log("🔍 Verifying OpenClaw Integration...");
  const baseUrl = "http://localhost:3000/api";

  // 1. Simulate User Creating a Task (Chat)
  console.log("\n[1] User sends message to AI Lab...");
  const chatRes = await fetch(`${baseUrl}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Analyze the latest Stacks block for me.",
    }),
  });

  const chatData = await chatRes.json();
  console.log("   Creates Task ID:", chatData.taskId);

  if (!chatData.taskId) throw new Error("Failed to create task");

  // 2. Simulate OpenClaw Agent Polling for Tasks
  console.log("\n[2] OpenClaw Agent polls for pending tasks...");
  const pollRes = await fetch(
    `${baseUrl}/openclaw/webhook?action=poll_tasks&agentId=agent_007`,
  );
  const pollData = await pollRes.json();

  console.log("   Agent received tasks:", pollData.tasks?.length);
  const task = pollData.tasks?.[0];

  if (!task || task.id !== chatData.taskId) {
    throw new Error("Agent did not receive the correct task");
  }
  console.log("   Task Content:", task.input);

  // 3. Simulate Agent Processing & Replying
  console.log("\n[3] Agent processes task and posts result...");
  const completeRes = await fetch(`${baseUrl}/openclaw/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "task_result",
      agentId: "agent_007",
      publicKey: "mock_pk",
      signature: "mock_sig",
      payload: {
        taskId: task.id,
        status: "completed",
        output:
          "I have analyzed block #13452. It contains 45 transactions with total volume of 5000 STX. Network healthy.",
      },
    }),
  });

  const completeData = await completeRes.json();
  console.log("   Completion Result:", completeData);

  if (!completeData.success) throw new Error("Failed to complete task");

  console.log("\n✅ OpenClaw Integration Verified Successfully!");
}

verifyOpenClawIntegration().catch((e) => {
  console.error("\n❌ Verification Failed:", e);
  process.exit(1);
});
