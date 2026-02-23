import "dotenv/config";

// Configuration
const AGENT_ID = "agent_local_worker_01";
const DEFAULT_POLL_INTERVAL_MS = 15000;
const BASE_URL = "http://localhost:3000/api";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const AGENT_STX_ADDRESS = process.env.AGENT_STX_ADDRESS || "";

// Gemini REST API — the agent's internal brain
const GEMINI_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
];

async function callGeminiREST(
  model: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini ${model} returned ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`Empty response from ${model}`);
  return text;
}

async function generateAnswer(
  skillContext: string,
  userQuestion: string,
): Promise<string> {
  const systemPrompt = `You are an expert AI assistant powered by the OpenClaw protocol on the Hive-402 network.
You have been given specialized knowledge through purchased intelligence packs.
Use ONLY the following acquired intelligence to answer the user's question.
If asked about code, provide REAL working code examples with proper formatting in markdown code blocks.
Use \`\`\`clarity for Clarity smart contract code blocks.
If you're asked to debug, analyze the code carefully and provide fixes.
Be detailed, technical, and precise. Format your response with markdown.

IMPORTANT: If the user's question is NOT covered by your acquired intelligence below, you MUST respond with EXACTLY the text "__NO_MATCH__" and nothing else. Do NOT say "I cannot help" or "my intelligence doesn't cover this". Just respond with "__NO_MATCH__" so the system can search the marketplace for the right skill pack.

## YOUR ACQUIRED INTELLIGENCE:
${skillContext}`;

  // Try each model in order until one works
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`   🤖 Trying model: ${model}...`);
      const answer = await callGeminiREST(model, systemPrompt, userQuestion);
      console.log(`   ✅ Success with ${model} (${answer.length} chars)`);
      return answer;
    } catch (err: any) {
      console.error(`   ⚠️  ${model} failed: ${err.message.substring(0, 100)}`);
    }
  }

  // All models failed
  return `⚠️ All AI models are currently unavailable. Your acquired intelligence covers:\n\n${skillContext}\n\nPlease try again in a moment.`;
}

// ===== AUTONOMOUS RESEARCH & PUBLISH =====

interface ResearchResult {
  title: string;
  description: string;
  category: string;
  complexity: number; // 1-5
  content: string;
}

function determinePricing(complexity: number): number {
  if (complexity <= 2) return 0.5;
  if (complexity === 3) return 1.5;
  if (complexity === 4) return 3.0;
  return 5.0;
}

async function researchTopic(
  userQuestion: string,
): Promise<ResearchResult | null> {
  const researchPrompt = `You are a world-class researcher and technical writer for the OpenClaw AI Intelligence Network.
A user asked about a topic that has NO existing skill pack in our marketplace.
Your job is to DEEPLY RESEARCH this topic and create a comprehensive intelligence brief that can be sold as a skill pack.

IMPORTANT: Respond with ONLY a valid JSON object (no markdown, no code fences, no extra text).
The JSON must have these exact fields:
{
  "title": "A professional, marketplace-ready title for this skill (max 60 chars)",
  "description": "A detailed 2-3 sentence description of what this intelligence pack covers. Be specific about the topics, techniques, and knowledge included.",
  "category": "One of: SECURITY, BLOCKCHAIN, DEVELOPMENT, AI, DEVOPS, NETWORKING, DATA, OTHER",
  "complexity": <number 1-5 where 1=basic intro, 3=intermediate guide, 5=expert-level deep dive>,
  "content": "The FULL intelligence brief. This should be 500-1500 words of expert-level, actionable technical knowledge. Include concepts, best practices, code examples where applicable, common pitfalls, and real-world advice. Format with markdown headings and bullet points."
}`;

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`   🔬 Researching with ${model}...`);
      const raw = await callGeminiREST(model, researchPrompt, userQuestion);

      // Clean the response (remove possible markdown code fences)
      const cleaned = raw
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const result = JSON.parse(cleaned) as ResearchResult;

      // Validate the structure
      if (!result.title || !result.description || !result.content) {
        throw new Error("Missing required fields in research output");
      }

      console.log(
        `   ✅ Research complete: "${result.title}" (complexity: ${result.complexity}/5)`,
      );
      return result;
    } catch (err: any) {
      console.error(
        `   ⚠️  Research with ${model} failed: ${err.message.substring(0, 100)}`,
      );
    }
  }

  return null;
}

async function publishSkill(research: ResearchResult): Promise<any | null> {
  const priceStx = determinePricing(research.complexity);

  try {
    console.log(`   📤 Publishing to marketplace at ${priceStx} STX...`);
    const res = await fetch(`${BASE_URL}/skills/agent-publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: research.title,
        description: research.description + "\n\n" + research.content,
        priceStx: priceStx.toString(),
        category: research.category,
        providerAddress: AGENT_STX_ADDRESS,
        agentId: AGENT_ID,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Publish failed: ${res.status} - ${errText}`);
    }

    const skill = await res.json();
    console.log(`   ✅ Published! Skill ID: ${skill.id}`);
    return { ...skill, priceStx };
  } catch (err: any) {
    console.error(`   ❌ Publish error: ${err.message}`);
    return null;
  }
}

async function runAgentLoop() {
  console.clear();
  console.log("🤖 OpenClaw Local Worker Node Starting...");
  console.log(`📡 Connecting to Hive Node at: ${BASE_URL}`);
  console.log(`🆔 Agent ID: ${AGENT_ID}`);
  console.log(`🧠 Mode: CONTEXT-AWARE (Gemini-powered intelligence)`);
  console.log("   Will answer from acquired skills or recommend new ones.");
  console.log("--------------------------------------------------");

  let isProcessing = false;
  let currentPollInterval = DEFAULT_POLL_INTERVAL_MS;

  const poll = async () => {
    if (isProcessing) {
      setTimeout(poll, currentPollInterval);
      return;
    }

    try {
      process.stdout.write(".");
      const pollRes = await fetch(
        `${BASE_URL}/openclaw/webhook?action=poll_tasks&agentId=${AGENT_ID}`,
      );

      if (!pollRes.ok) {
        // If the server is rejecting us (e.g. 500 DB error), back off
        if (pollRes.status >= 500) {
          currentPollInterval = Math.min(currentPollInterval * 1.5, 60000);
          console.log(
            `\n⚠️ Server error. Backing off to ${currentPollInterval / 1000}s...`,
          );
        }
        setTimeout(poll, currentPollInterval);
        return;
      }

      // Success, reset backoff
      currentPollInterval = DEFAULT_POLL_INTERVAL_MS;

      const pollData = await pollRes.json();
      const tasks = pollData.tasks || [];

      if (tasks.length > 0) {
        isProcessing = true;
        console.log(`\n\n🔔 DETECTED TASK [${tasks[0].id}]`);
        console.log(`   Input: "${tasks[0].input.substring(0, 100)}..."`);

        await processTask(tasks[0]);

        isProcessing = false;
        console.log("   Waiting for next task...");
      }
    } catch (error) {
      // Silent fail on connection error, but back off slightly
      currentPollInterval = Math.min(currentPollInterval * 1.5, 60000);
    }

    setTimeout(poll, currentPollInterval);
  };

  // Start polling
  setTimeout(poll, currentPollInterval);
}

async function processTask(task: any) {
  let output: any = {};

  // Step 0: Check for Installed Context
  const contextMatch = task.input.match(
    /\[INSTALLED CONTEXT\]([\s\S]*?)\[USER REQUEST\]/,
  );
  const userRequest = contextMatch
    ? task.input.split("[USER REQUEST]")[1].trim()
    : task.input;

  if (contextMatch) {
    const contextText = contextMatch[1].trim();
    console.log("   🧠 Context detected! Using acquired intelligence...");
    console.log(`   📖 User Question: "${userRequest}"`);

    // Use Gemini to generate a real, contextual answer
    const answer = await generateAnswer(contextText, userRequest);

    // Check if the model says the context doesn't cover this topic
    if (
      answer.trim() === "__NO_MATCH__" ||
      answer.trim().startsWith("__NO_MATCH__")
    ) {
      console.log(
        "   ⚠️ Installed skills don't cover this topic. Searching marketplace...",
      );
      // Fall through to marketplace search below
    } else {
      console.log("   ✅ Intelligent answer generated from acquired skills!");

      output = {
        type: "answer",
        text: answer,
        sources: ["Acquired Intelligence Pack"],
      };

      await submitResult(task.id, output);
      return;
    }
  } else {
    console.log("   ⚙️  No relevant context found. Searching marketplace...");
  }

  // Use the clean user request for searching
  try {
    const keywords = extractKeywords(userRequest);
    console.log(`   🔍 Search keywords: "${keywords}"`);

    // Step 2: Search marketplace
    const searchRes = await fetch(
      `${BASE_URL}/skills/search?q=${encodeURIComponent(keywords)}`,
    );
    const skills = await searchRes.json();

    if (!Array.isArray(skills) || skills.length === 0) {
      // No skills found — AUTONOMOUS RESEARCH & PUBLISH
      console.log(
        "   ❌ No matching skills found. Initiating autonomous research...",
      );

      const research = await researchTopic(userRequest);

      if (research) {
        const publishedSkill = await publishSkill(research);

        if (publishedSkill) {
          console.log(
            `   🎉 Agent autonomously created: "${publishedSkill.title}"`,
          );
          output = {
            type: "skill_recommendation",
            text: `I couldn't find an existing skill pack, so I **researched this topic and created a new intelligence pack** for you!\n\n🤖 **"${publishedSkill.title}"** is now available on the marketplace.\n\nPurchase it to unlock the full intelligence.`,
            skill: {
              id: publishedSkill.id,
              title: publishedSkill.title,
              description: research.description,
              priceStx: publishedSkill.priceStx,
              category: research.category,
              providerAddress: AGENT_STX_ADDRESS,
            },
            allResults: [
              {
                id: publishedSkill.id,
                title: publishedSkill.title,
                priceStx: publishedSkill.priceStx,
                category: research.category,
              },
            ],
          };
        } else {
          output = {
            type: "no_skills_found",
            text: `I researched "${keywords}" but couldn't publish the skill pack. Please try again.`,
          };
        }
      } else {
        output = {
          type: "no_skills_found",
          text: `I searched the Hive Marketplace for "${keywords}" but found no matching intelligence packs, and my research engine is currently unavailable.\n\n💡 Upload a relevant skill to the marketplace so I can learn!`,
        };
      }
    } else {
      // Found skills! Return as a recommendation (NOT auto-purchase)
      const bestMatch = skills[0];
      console.log(
        `   ✅ Found ${skills.length} skill(s). Recommending: "${bestMatch.title}"`,
      );
      console.log(`   💰 Price: ${bestMatch.priceStx} STX`);
      console.log(`   📤 Sending recommendation to UI for wallet approval...`);

      // Return structured data so the UI can render a purchase card
      output = {
        type: "skill_recommendation",
        text: `I found a matching intelligence pack on the marketplace. Purchase it to unlock the answer.`,
        skill: {
          id: bestMatch.id,
          title: bestMatch.title,
          description: bestMatch.description,
          priceStx: bestMatch.priceStx,
          category: bestMatch.category,
          providerAddress: bestMatch.providerAddress,
        },
        allResults: skills.slice(0, 3).map((s: any) => ({
          id: s.id,
          title: s.title,
          priceStx: s.priceStx,
          category: s.category,
        })),
      };
    }
  } catch (error: any) {
    console.error("   ❌ Marketplace error:", error.message);
    output = {
      type: "error",
      text: `Error accessing the Hive Marketplace: ${error.message}`,
    };
  }

  // Submit result
  await submitResult(task.id, output);
}

async function submitResult(taskId: string, output: any) {
  try {
    const completeRes = await fetch(`${BASE_URL}/openclaw/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "task_result",
        agentId: AGENT_ID,
        publicKey: "mock_pk_local",
        signature: "mock_sig_local",
        payload: {
          taskId: taskId,
          status: "completed",
          output: JSON.stringify(output),
        },
      }),
    });

    const result = await completeRes.json();
    if (result.success) {
      console.log("   ✅ Result sent to UI!");
    } else {
      console.error("   ❌ Failed to submit:", result);
    }
  } catch (err) {
    console.error("   ❌ Network error:", err);
  }
}

function extractKeywords(input: string): string {
  const stopWords = new Set([
    "i",
    "me",
    "my",
    "we",
    "our",
    "you",
    "your",
    "he",
    "she",
    "it",
    "they",
    "the",
    "a",
    "an",
    "is",
    "am",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "can",
    "may",
    "might",
    "shall",
    "need",
    "want",
    "help",
    "please",
    "with",
    "for",
    "to",
    "of",
    "in",
    "on",
    "at",
    "by",
    "from",
    "about",
    "into",
    "through",
    "just",
    "also",
    "so",
    "but",
    "and",
    "or",
    "if",
    "then",
    "that",
    "this",
    "what",
    "which",
    "who",
    "how",
    "when",
    "where",
    "why",
    "all",
    "each",
    "every",
    "both",
    "few",
    "some",
    "any",
    "no",
    "not",
    "only",
    "very",
    "really",
    "much",
    "more",
    "most",
    "like",
    "get",
    "got",
    "make",
    "know",
    "think",
    "say",
    "tell",
    "give",
    "take",
  ]);

  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  return words.length > 0 ? words.join(" ") : input.trim();
}

runAgentLoop();
