import { generateChatResponse } from "../src/lib/api/gemini";
import * as dotenv from "dotenv";
dotenv.config();

async function verifyFinalFix() {
  console.log("[VERIFY] Starting Final Connection Test...");

  // Simulation of what the FRONTEND sends:
  const problematicHistory = [
    {
      role: "assistant",
      parts: "Agent initialized. Ready to process specialized context.",
    },
    { role: "user", parts: "Hello assistant." },
    { role: "model", parts: "Hello! How can I help?" },
  ];

  // Simulation of the API ROUTE logic:
  const firstUserIndex = problematicHistory.findIndex((h) => h.role === "user");
  const filteredHistory =
    firstUserIndex !== -1 ? problematicHistory.slice(firstUserIndex) : [];

  console.log(
    "[VERIFY] History successfully filtered. First message starts with:",
    filteredHistory[0]?.role,
  );

  try {
    const result = await generateChatResponse(
      "Confirm connection established.",
      filteredHistory as any,
      "You are a helpful test agent.",
    );
    console.log("[VERIFY] CONNECTION SUCCESSFUL!");
    console.log("[VERIFY] AI Response:", result);
    process.exit(0);
  } catch (err: any) {
    console.error("[VERIFY] CONNECTION FAILED:", err.message);
    process.exit(1);
  }
}

verifyFinalFix();
