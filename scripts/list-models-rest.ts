import * as dotenv from "dotenv";
dotenv.config();

async function listModelsRest() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[REST] No API key found.");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  console.log("[REST] Fetching models from AI Studio...");
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("[REST] API Error:", data.error.message);
      return;
    }

    if (!data.models || data.models.length === 0) {
      console.log("[REST] No models returned for this key.");
      return;
    }

    console.log("[REST] Available Models:");
    data.models.forEach((m: any) => {
      console.log(` - ${m.name} (${m.displayName})`);
    });
  } catch (error: any) {
    console.error("[REST] Network error:", error.message);
  }
}

listModelsRest();
