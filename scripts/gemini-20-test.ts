import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function verify20() {
  console.log("[TEST] Testing gemini-2.0-flash...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Say 'Hive 2.0 Operational'");
    const response = await result.response;
    console.log("[SUCCESS] AI Response:", response.text());
  } catch (e: any) {
    console.error("[FAILURE] Error code:", e.status);
    console.error("[FAILURE] Error message:", e.message);
  }
}

verify20();
