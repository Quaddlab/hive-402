import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
  console.log("[DISCOVERY] Fetching available models...");
  try {
    const models = await genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    // Note: getGenerativeModel().listModels() might not be the direct way in all versions,
    // depends on the SDK. Let's try the direct listModels() if available or check the genAI object.

    // In newer SDKs:
    // const results = await genAI.listModels();

    // Let's try to find a way to list them or just try a set of known ones.
    const knownModels = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-1.0-pro",
      "gemini-pro",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest",
    ];

    for (const mName of knownModels) {
      try {
        const model = genAI.getGenerativeModel({ model: mName });
        await model.generateContent("test");
        console.log(`[DISCOVERY] Model '${mName}' is AVAILABLE.`);
      } catch (e: any) {
        console.log(`[DISCOVERY] Model '${mName}' FAILED: ${e.message}`);
      }
    }
  } catch (error: any) {
    console.error("[DISCOVERY] Error listing models:", error.message);
  }
}

listModels();
