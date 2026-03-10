import { createHuggingFace } from "@ai-sdk/huggingface";
import { streamText } from "ai";
import type { NextRequest } from "next/server";

const DEFAULT_MODEL = "Qwen/Qwen2.5-Coder-32B-Instruct";

export async function POST(req: NextRequest) {
  try {
    const { messages, system, model, apiKey } = await req.json();

    // Allow passing apiKey via body, otherwise fallback to an env var or a default (like in your settings flow).
    // Since UIGeneratorClient doesn't currently prompt for an API key, it might need one or the server might use a hardcoded fallback if available.
    // For now, if no API key is passed, we check the request or return an error.
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Hugging Face token is required. Pass apiKey in body.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const selectedModel = model || DEFAULT_MODEL;
    const hf = createHuggingFace({ apiKey });

    const result = streamText({
      model: hf(selectedModel),
      messages,
      ...(system && { system }),
    });

    return result.toTextStreamResponse();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Chat API Error]", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
