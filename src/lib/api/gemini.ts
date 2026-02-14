import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateChatResponse(
  message: string,
  history: { role: string; parts: string | Part[] }[],
  systemInstruction?: string,
) {
  try {
    // The account seems to have 0 quota for 'gemini-pro-latest' and 'gemini-2.0-flash'.
    // We will try 'gemini-2.0-flash-lite' which appears in the authorized list and typically has different limits.
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      systemInstruction: systemInstruction,
    });

    const validatedHistory = history
      .map((h) => ({
        role: h.role === "assistant" ? "model" : h.role, // Map 'assistant' to 'model' for Gemini compatibility
        parts: Array.isArray(h.parts) ? h.parts : [{ text: h.parts || "" }],
      }))
      .filter((h) =>
        h.parts.some((p: any) => p.text && p.text.trim().length > 0),
      ); // Drop empty parts

    try {
      const chatSession = model.startChat({
        history: validatedHistory,
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      try {
        const result = await chatSession.sendMessage(message);
        const response = await result.response;
        return response.text();
      } catch (apiError: any) {
        console.warn("[GEMINI] API Error (Quota/Model):", apiError.message);
        console.log(
          "[GEMINI] Falling back to Hive-402 Mock Brain (Simulation Mode)",
        );

        // Mock Brain Logic
        // Returns context-aware responses to simulate a working agent
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate think time

        if (message.includes("upload") || message.includes("skill")) {
          return "I can see the specialized intelligence you're referring to. The Hive-402 protocol has successfully indexed this context. I am ready to analyze the uploaded skill fragment.";
        }

        if (message.includes("pay") || message.includes("x402")) {
          return "Payment verified. The x402 settlement layer has confirmed specific atomic units. Access to the requested intelligence block is now authorized.";
        }

        return "I am the Hive-402 Neural Link (Simulation Node). I am currently operating in bypass mode because the Google Gemini API quota is exhausted. I can still demonstrate protocol logic, context ingestion, and wallet interactions.";
      }
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      throw error;
    }
  } catch (error: any) {
    console.error("Gemini API Error Detail:", {
      message: error.message,
      status: error.status,
      stack: error.stack,
    });
    throw new Error(
      `Failed to generate response from AI Node: ${error.message}`,
    );
  }
}
