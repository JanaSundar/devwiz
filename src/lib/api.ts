import { NextResponse } from "next/server";

/** Consistent API error response shape */
export function apiError(message: string, status: number = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Require POST method; returns 405 if not. */
export function requirePost(req: Request): NextResponse | null {
  if (req.method !== "POST") {
    return apiError(`Method ${req.method} not allowed`, 405);
  }
  return null;
}

/** Safely parse JSON body. Returns parsed data or an error response. */
export async function parseJsonBody<T = Record<string, unknown>>(
  req: Request,
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  let text: string;
  try {
    text = await req.text();
  } catch {
    return { data: null, error: apiError("Failed to read request body", 400) };
  }

  if (!text.trim()) {
    return { data: null, error: apiError("Request body is required", 400) };
  }

  try {
    const data = JSON.parse(text) as T;
    return { data, error: null };
  } catch (err) {
    const msg =
      err instanceof SyntaxError
        ? "Invalid JSON in request body"
        : err instanceof Error
          ? err.message
          : "Invalid request body";
    return { data: null, error: apiError(msg, 400) };
  }
}

/** Wrap a handler with standard error handling. */
export function withApiErrorHandler<T>(
  handler: () => Promise<T>,
  fallbackMessage: string = "An unexpected error occurred",
): Promise<T | NextResponse> {
  return handler().catch((err) => {
    const message =
      err instanceof Error ? err.message : String(err) || fallbackMessage;
    return apiError(message, 500);
  });
}
