import { NextResponse } from "next/server";
import prettier from "prettier";
import { apiError, parseJsonBody, requirePost } from "@/lib/api";

const MAX_INPUT = 500 * 1024; // 500KB

export async function POST(req: Request) {
  const methodErr = requirePost(req);
  if (methodErr) return methodErr;

  const parsed = await parseJsonBody<{
    content: string;
    type: "json" | "html";
  }>(req);
  if (parsed.error) return parsed.error;

  const { content, type } = parsed.data;
  if (!content || typeof content !== "string") {
    return apiError("content is required", 400);
  }
  if (content.length > MAX_INPUT) {
    return apiError(`Content exceeds ${MAX_INPUT / 1024}KB limit`, 400);
  }
  if (type !== "json" && type !== "html") {
    return apiError("type must be 'json' or 'html'", 400);
  }

  try {
    const formatted = await prettier.format(content, {
      parser: type,
      printWidth: 80,
    });
    return NextResponse.json({ formatted });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Format failed";
    return apiError(msg, 400);
  }
}
