import { createHuggingFace } from "@ai-sdk/huggingface";
import { streamText } from "ai";
import type { NextRequest } from "next/server";

const DEFAULT_MODEL = "Qwen/Qwen2.5-Coder-32B-Instruct";

const TOOL_PROMPTS: Record<
  string,
  (input: string) => { prompt: string; system?: string; temperature?: number }
> = {
  "ai-regex-explainer": (input) => {
    const isPrompt = !input.trim().startsWith("/");
    return {
      prompt: isPrompt
        ? `Generate a standard JavaScript Regular Expression (Regex) that does the following: ${input}\nReturn ONLY the raw regex pattern starting and ending with the '/' delimiter, and optionally any flags. Do NOT wrap it in a code block.`
        : `Explain this Regular Expression in clear, simple terms. Break down each part of it:\n${input}\nKeep your explanation concise and formatted in markdown.`,
    };
  },
  "ai-code-commenter": (input) => ({
    prompt: `You are an expert developer. I am going to give you some code. Your job is to return ONLY the EXACT SAME code, but beautifully commented. Add clear JSDoc style comments above functions, and brief inline comments for complex logic. DO NOT wrap the code in markdown blocks at all, ONLY return the raw code string.\n\nHere is the code:\n${input}`,
    temperature: 0.2,
  }),
  "ai-readme-writer": (input) => ({
    prompt: `Write a beautiful, comprehensive open-source README.md file based on the following project details/package.json. Include a Title, Badges (placeholder), Description, Installation, Usage, and License sections.\n\nProject details:\n${input}`,
    temperature: 0.7,
  }),
  "ai-mock-data": (input) => ({
    system:
      "You are a JSON mock data generator. The user provides a schema or prompt. Return ONLY valid JSON representing the mock data for that schema. Do NOT include markdown blocks, text, or explanations. Only the raw JSON string.",
    prompt: input,
    temperature: 0.5,
  }),
  "ai-commit-msg": (input) => ({
    system:
      "You are an expert developer. The user will provide a git diff. Generate a concise, conventional commit message for it. Only output the commit message, no markdown code blocks.",
    prompt: input,
    temperature: 0.2,
  }),
  "ai-error-explainer": (input) => ({
    system:
      "You are an expert debugger. The user will provide a stack trace or error message. Explain what the error means in plain English and suggest how to fix it. Keep it concise. Format your response in markdown.",
    prompt: input,
    temperature: 0.3,
  }),
};

export async function POST(req: NextRequest) {
  try {
    const { toolId, input, apiKey, model } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Hugging Face token is required. Set it in Settings.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const promptConfig = TOOL_PROMPTS[toolId];
    if (!promptConfig) {
      return new Response(
        JSON.stringify({ error: `Unknown AI tool: ${toolId}` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const selectedModel = model || DEFAULT_MODEL;
    const hf = createHuggingFace({ apiKey });
    const { prompt, system, temperature } = promptConfig(input);

    const result = streamText({
      model: hf(selectedModel),
      prompt,
      ...(system && { system }),
      ...(temperature !== undefined && { temperature }),
    });

    return result.toTextStreamResponse();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[AI Route Error]", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
