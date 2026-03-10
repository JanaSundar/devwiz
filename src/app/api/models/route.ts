import { NextResponse } from "next/server";

type HuggingFaceModel = {
  id: string;
  likes?: number;
  downloads?: number;
  gated?: boolean;
};

function isHuggingFaceModel(value: unknown): value is HuggingFaceModel {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { id?: unknown };
  return typeof candidate.id === "string";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // We only fetch standard text-generation models now for the generic LLM chat
    const url =
      "https://huggingface.co/api/models?pipeline_tag=text-generation&sort=downloads&direction=-1&limit=50";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`; // Send token if user has one to increase rate limits / authorized scope
    }

    const res = await fetch(url, { headers });

    if (!res.ok) {
      console.error("HF API Error:", res.status, res.statusText);
      return NextResponse.json(
        { error: `Failed to fetch models from Hugging Face (${res.status})` },
        { status: res.status },
      );
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Unexpected response format from Hugging Face API" },
        { status: 502 },
      );
    }

    // Filter out clearly unsuitable models or models that require gating
    // Note: HF Inference API (free tier) supports models up to ~10GB.
    // We'll trust downloads as a general proxy for usefulness.
    const models = data
      .filter(isHuggingFaceModel)
      .filter((model) => !model.id.toLowerCase().includes("gpt2"))
      .map((model) => ({
        id: model.id,
        likes: model.likes,
        downloads: model.downloads,
        gated: model.gated,
      }));

    return NextResponse.json({ models });
  } catch (error: unknown) {
    console.error("API /models route error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch models",
      },
      { status: 500 },
    );
  }
}
