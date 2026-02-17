import "dotenv/config";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

async function main() {
  console.log("Key present:", !!GEMINI_API_KEY);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    system_instruction: {
      parts: [
        {
          text: `You are an expert Clarity smart contract developer. 
You have the following knowledge: Comprehensive guide for building Clarity smart contracts on the Stacks blockchain. Covers: contract structure, public/private functions, data maps, STX transfers, trait implementation, and testing with Clarinet.`,
        },
      ],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "Write me a simple token contract in Clarity with mint and transfer functions.",
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 1500,
      temperature: 0.7,
    },
  };

  console.log("Calling Gemini REST API...");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  console.log("Status:", res.status);

  if (!res.ok) {
    console.error("Error:", await res.text());
    return;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (text) {
    console.log("\n✅ SUCCESS! Response:\n");
    console.log(text);
  } else {
    console.log("Unexpected response:", JSON.stringify(data, null, 2));
  }
}

main();
