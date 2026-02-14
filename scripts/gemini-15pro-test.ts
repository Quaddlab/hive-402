import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function verify15Pro() {
  console.log("[VERIFY] Testing gemini-1.5-pro baseline...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(
      "Say 'Hive 1.5 Pro Operational'",
    );
    const response = await result.response;
    console.log("[SUCCESS] AI Response:", response.text());
  } catch (e: any) {
    console.error("[FAILURE] Error code:", e.status);
    console.error("[FAILURE] Error message:", e.message);
  }
}

verify15Pro();
