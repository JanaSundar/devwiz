import { generateText, streamText } from "ai";
import { createHuggingFace } from "@ai-sdk/huggingface";
import { createGroq } from "@ai-sdk/groq";
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

  if (provider === "groq") {
    if (!apiKey && !process.env.GROQ_API_KEY) {
      throw new Error(
        "Groq API key is required. Set GROQ_API_KEY in environment or provide it in Settings."
      );
    }

    const groq = createGroq({
      apiKey: apiKey || process.env.GROQ_API_KEY,
    });

    return groq(selectedModel);
  }

  if (provider === "huggingface" || provider === "ai-sdk") {
    if (!apiKey && !process.env.HUGGINGFACE_API_KEY) {
      throw new Error(
        "HuggingFace API key is required. Set it in Settings or environment."
      );
    }

    const hf = createHuggingFace({
      apiKey: apiKey || process.env.HUGGINGFACE_API_KEY,
    });

    return hf(selectedModel);
  }

  // For other unsupported providers, default to Groq
  if (!apiKey && !process.env.GROQ_API_KEY) {
    throw new Error("Groq API key is required. Set GROQ_API_KEY in environment.");
  }

  const groq = createGroq({
    apiKey: apiKey || process.env.GROQ_API_KEY,
  });

  return groq(DEFAULT_MODELS.groq);
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const {
      messages,
      provider = "groq",
      model,
      systemPrompt = SYSTEM_PROMPT,
      apiKey,
      stream = false,
    } = body;

    if (!messages || messages.length === 0) {
      return Response.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const modelInstance = await getProviderModel(provider, model, apiKey);

    // Use streamText for streaming with useChat hook
    const result = await streamText({
      model: modelInstance,
      messages,
      system: systemPrompt,
    });

    // Return response that's compatible with useChat from @ai-sdk/react
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[v0] Chat API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    
    // Provide helpful error messages for missing API keys
    if (errorMessage.includes("API key")) {
      return Response.json(
        {
          error: `${errorMessage}. Please configure your API key in Settings or set the environment variable.`,
        },
        { status: 401 }
      );
    }
    
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
