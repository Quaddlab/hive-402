import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function helloGemini() {
  console.log("[BASELINE] Testing Baseline Generation...");
  const key = process.env.GEMINI_API_KEY || "";
  console.log("[BASELINE] Key prefix:", key.slice(0, 5) + "...");

  if (!key) {
    console.error("[BASELINE] ERROR: No API Key found in .env");
    process.exit(1);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Say 'System Operational'");
    const response = await result.response;
    console.log("[BASELINE] SUCCESS:", response.text());
  } catch (err: any) {
    console.error("[BASELINE] FAILED:", err.message);
    if (err.message.includes("404")) {
      console.log(
        "[BASELINE] TIP: Try model 'gemini-pro' or 'gemini-1.5-pro' instead.",
      );
    }
  }
}

helloGemini();
