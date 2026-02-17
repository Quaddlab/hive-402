import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const key = process.env.GEMINI_API_KEY || "";
  console.log("API Key present:", !!key);
  console.log("Key prefix:", key.slice(0, 10) + "...");

  const genAI = new GoogleGenerativeAI(key);

  // Try multiple models
  const models = ["gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-pro"];

  for (const modelName of models) {
    console.log(`\n--- Testing model: ${modelName} ---`);
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction:
          "You are an expert Clarity smart contract developer.",
      });

      const result = await model.generateContent(
        "Write a simple hello world Clarity contract",
      );
      const response = await result.response;
      const text = response.text();
      console.log(`✅ ${modelName} WORKS! Response length: ${text.length}`);
      console.log(`   Preview: ${text.substring(0, 150)}...`);
      return; // Stop at first working model
    } catch (err: any) {
      console.error(`❌ ${modelName} FAILED: ${err.message}`);
      if (err.status) console.error(`   Status: ${err.status}`);
      if (err.errorDetails)
        console.error(`   Details:`, JSON.stringify(err.errorDetails));
    }
  }

  console.log("\n--- All models failed. Trying REST API directly ---");
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
    );
    const data = await res.json();
    if (data.models) {
      console.log("Available models:");
      data.models.forEach((m: any) => {
        console.log(`  - ${m.name} (${m.displayName})`);
      });
    } else {
      console.log("API response:", JSON.stringify(data, null, 2));
    }
  } catch (e: any) {
    console.error("REST API also failed:", e.message);
  }
}

main();
