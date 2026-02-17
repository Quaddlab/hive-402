import "dotenv/config";

const key = process.env.GEMINI_API_KEY || "";
const models = [
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
];

async function main() {
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Say hello in one sentence" }] }],
          }),
        },
      );
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`✅ ${model}: ${text.substring(0, 80)}`);
      } else {
        const errMsg =
          data?.error?.message?.substring(0, 100) || "Unknown error";
        console.log(`❌ ${model} (${res.status}): ${errMsg}`);
      }
    } catch (e: any) {
      console.log(`❌ ${model}: ${e.message}`);
    }
  }
}

main();
