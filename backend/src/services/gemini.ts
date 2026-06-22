import { config } from "../config.js";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqChoice {
  message: GroqMessage;
}

interface GroqResponse {
  choices: GroqChoice[];
}

export async function generateContent(
  systemInstruction: string,
  userMessage: string
): Promise<string> {
  const apiKey = config.groqApiKey;
  if (!apiKey) {
    return "AI generation is not configured. Please set GROQ_API_KEY in your .env file.";
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: `${systemInstruction}\n\nYou are a helpful AI tutor for beginner students. Answer in maximum 2 sentences only. Be direct, simple, and beginner friendly. Never use bullet points or long paragraphs.` },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as GroqResponse;
  return data.choices?.[0]?.message?.content || "No response from AI.";
}
