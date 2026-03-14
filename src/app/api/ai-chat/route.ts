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
      apiKey: apiKey || process.env.HUGGINGFACE_API_KEY,
    });

    return hf(selectedModel);
  }

  // For other providers, return a placeholder model
  // In production, you would integrate with their specific SDK
  console.warn(
    `Provider ${provider} not fully implemented. Using HuggingFace as fallback.`
  );
  const hf = createHuggingFace({
    apiKey: apiKey || process.env.HUGGINGFACE_API_KEY,
  });
  return hf(selectedModel);
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const {
      messages,
      provider = "huggingface",
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

    if (stream) {
      // Streaming response
      const { stream: textStream } = await streamText({
        model: modelInstance,
        messages,
        system: systemPrompt,
      });

      const encoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          for await (const chunk of textStream) {
            controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
          }
          controller.close();
        },
      });

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Non-streaming response
      const { text } = await generateText({
        model: modelInstance,
        messages,
        system: systemPrompt,
      });

      return Response.json({ text, provider });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
