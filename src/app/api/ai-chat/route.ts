import { generateText, streamText } from "ai";
import { createHuggingFace } from "@ai-sdk/huggingface";
import type { NextRequest } from "next/server";

type Provider = "groq" | "openrouter" | "huggingface" | "ai-sdk" | "assistant-ai";

interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  provider?: Provider;
  model?: string;
  systemPrompt?: string;
  apiKey?: string;
  stream?: boolean;
}

const DEFAULT_MODELS: Record<Provider, string> = {
  groq: "mixtral-8x7b-32768",
  openrouter: "mistralai/mistral-7b-instruct",
  huggingface: "Qwen/Qwen2.5-Coder-32B-Instruct",
  "ai-sdk": "Qwen/Qwen2.5-Coder-32B-Instruct",
  "assistant-ai": "gpt-3.5-turbo",
};

const SYSTEM_PROMPT = `You are a helpful AI assistant. Provide clear, concise, and accurate responses. Format code in markdown blocks when appropriate.`;

async function getProviderModel(
  provider: Provider,
  model: string | undefined,
  apiKey: string | undefined
) {
  const selectedModel = model || DEFAULT_MODELS[provider];

  // For now, we'll primarily support HuggingFace through AI SDK
  // Other providers would need their respective SDK packages
  if (provider === "huggingface" || provider === "ai-sdk") {
    if (!apiKey && !process.env.HUGGINGFACE_API_KEY) {
      throw new Error(
        "HuggingFace API key is required. Set it in Settings or environment."
      );
    }
    const hf = createHuggingFace({
      apiKey: apiKey || process.env.HUGGINGFACE_API_KEY || "",
    });
    return hf(selectedModel);
  }

  // For other providers, we'd implement similar logic
  // This is a placeholder that falls back to HuggingFace
  if (!apiKey && !process.env.HUGGINGFACE_API_KEY) {
    throw new Error(
      "HuggingFace API key is required. Set it in Settings or environment."
    );
  }
  const hf = createHuggingFace({
    apiKey: apiKey || process.env.HUGGINGFACE_API_KEY || "",
  });
  return hf(selectedModel);
}

export async function POST(req: NextRequest) {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as ChatRequest;
    const {
      messages,
      provider = "huggingface",
      model,
      systemPrompt = SYSTEM_PROMPT,
      apiKey,
      stream = true,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const providerModel = await getProviderModel(provider, model, apiKey);

    if (stream) {
      const result = streamText({
        model: providerModel,
        system: systemPrompt,
        messages,
      });

      return result.toTextStreamResponse();
    } else {
      const result = await generateText({
        model: providerModel,
        system: systemPrompt,
        messages,
      });

      return new Response(JSON.stringify({ text: result.text }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[AI Chat API Error]", message);
    return new Response(
      JSON.stringify({
        error: message || "Failed to process chat request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
