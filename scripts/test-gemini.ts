import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function testGemini() {
  console.log("[DIAG] Testing Gemini Connectivity...");
  console.log("[DIAG] API Key exists:", !!process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // TEST 1: History starting with MODEL (This is likely the failure point)
  console.log("\n[TEST 1] History starting with 'model'...");
  try {
    const chat = model.startChat({
      history: [{ role: "model", parts: [{ text: "Hello, I am the agent." }] }],
    });
    await chat.sendMessage("Hi there.");
    console.log("[TEST 1] RESULT: Success (Surprising)");
  } catch (err: any) {
    console.log("[TEST 1] RESULT: Expected Failure ->", err.message);
  }

  // TEST 2: Valid History (User -> Model)
  console.log("\n[TEST 2] Valid alternating history...");
  try {
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "Wake up." }] },
        { role: "model", parts: [{ text: "I am awake." }] },
      ],
    });
    const result = await chat.sendMessage("What is 2+2?");
    const response = await result.response;
    console.log("[TEST 2] RESULT: Success ->", response.text());
  } catch (err: any) {
    console.log("[TEST 2] RESULT: Failure ->", err.message);
  }

  // TEST 3: Simulation of the Fix (Filtering)
  console.log("\n[TEST 3] Simulating 'User-First' Filter Fix...");
  try {
    const rawHistory = [
      { role: "model", parts: [{ text: "Agent initialized." }] }, // This would normally break it
      { role: "user", parts: [{ text: "Hello." }] },
    ];

    // THE FIX LOGIC:
    const firstUserIndex = rawHistory.findIndex((h) => h.role === "user");
    const filteredHistory =
      firstUserIndex !== -1 ? rawHistory.slice(firstUserIndex) : [];

    console.log(
      "[TEST 3] Filtered History starts with:",
      filteredHistory[0]?.role,
    );

    const chat = model.startChat({
      history: filteredHistory.map((h) => ({
        role: h.role === "assistant" ? "model" : h.role,
        parts: h.parts,
      })),
    });
    const result = await chat.sendMessage("Hi.");
    const response = await result.response;
    console.log(
      "[TEST 3] RESULT: Success ->",
      response.text().slice(0, 50) + "...",
    );
  } catch (err: any) {
    console.log("[TEST 3] RESULT: Failure ->", err.message);
  }
}

testGemini();
