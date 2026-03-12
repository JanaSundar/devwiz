import { NextResponse } from "next/server";
import { apiError, parseJsonBody, requirePost } from "@/lib/api";

export const runtime = "nodejs";

const ALLOWED_METHODS = new Set([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
]);

const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB request
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5MB response
const TIMEOUT_MS = 30_000;

// SSRF: block private/internal hosts (localhost allowed for local dev)
const BLOCKED_PATTERNS = [
  "10.",
  "172.16.",
  "172.17.",
  "172.18.",
  "172.19.",
  "172.2",
  "172.30.",
  "172.31.",
  "192.168.",
  "169.254.",
  ".local",
  ".internal",
];

function isBlockedUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return BLOCKED_PATTERNS.some(
    (p) =>
      host === p ||
      host.endsWith("." + p) ||
      (p.endsWith(".") && host.startsWith(p)) ||
      (p.endsWith(".") === false && host.startsWith(p)),
  );
}

type FormField = {
  key: string;
  value?: string;
  file?: { name: string; data: string };
};
type AuthConfig =
  | { type: "none" }
  | { type: "bearer"; token: string }
  | { type: "basic"; username: string; password: string }
  | { type: "apiKey"; key: string; value: string; addTo: "header" | "query" };

type ProxyRequest = {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  auth?: AuthConfig;
  bodyType?: "json" | "form" | "formUrlEncoded" | "raw";
  body?: string | null;
  formFields?: FormField[];
};

function applyAuth(
  headers: Record<string, string>,
  params: Record<string, string>,
  auth: AuthConfig | undefined,
): void {
  if (!auth || auth.type === "none") return;
  if (auth.type === "bearer" && auth.token?.trim()) {
    headers["Authorization"] = `Bearer ${auth.token.trim()}`;
  }
  if (auth.type === "basic" && auth.username?.trim()) {
    const cred = Buffer.from(
      `${auth.username}:${auth.password ?? ""}`,
    ).toString("base64");
    headers["Authorization"] = `Basic ${cred}`;
  }
  if (auth.type === "apiKey" && auth.key?.trim() && auth.value?.trim()) {
    if (auth.addTo === "query") {
      params[auth.key.trim()] = auth.value.trim();
    } else {
      headers[auth.key.trim()] = auth.value.trim();
    }
  }
}

export async function POST(req: Request) {
  const methodErr = requirePost(req);
  if (methodErr) return methodErr;

  const parsed = await parseJsonBody<ProxyRequest>(req);
  if (parsed.error) return parsed.error;

  const {
    method = "GET",
    url,
    headers = {},
    params = {},
    auth,
    bodyType = "json",
    body = null,
    formFields = [],
  } = parsed.data;

  const methodUpper = String(method).toUpperCase();
  if (!ALLOWED_METHODS.has(methodUpper)) {
    return apiError(`Method ${method} not allowed`, 400);
  }

  if (!url || typeof url !== "string") {
    return apiError("URL is required", 400);
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
  } catch {
    return apiError("Invalid URL format", 400);
  }

  const mergedParams = { ...params };
  applyAuth(headers, mergedParams, auth);

  for (const [k, v] of Object.entries(mergedParams)) {
    if (k && v != null) targetUrl.searchParams.set(k, String(v));
  }

  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return apiError("Only HTTP and HTTPS URLs are allowed", 400);
  }

  if (isBlockedUrl(targetUrl)) {
    return apiError(
      "Request to this URL is not allowed for security reasons",
      400,
    );
  }

  const filteredHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (typeof v === "string" && k.toLowerCase() !== "host") {
      filteredHeaders[k] = v;
    }
  }

  let fetchBody: string | FormData | URLSearchParams | undefined;
  const hasBody = !["GET", "HEAD"].includes(methodUpper);

  if (hasBody) {
    if (bodyType === "form" && Array.isArray(formFields)) {
      const formData = new FormData();
      for (const f of formFields) {
        const key = f?.key?.trim();
        if (!key) continue;
        if (f?.file?.data) {
          const buf = Buffer.from(f.file.data, "base64");
          const blob = new Blob([buf]);
          formData.append(key, blob, f.file.name || "file");
        } else {
          formData.append(key, String(f?.value ?? ""));
        }
      }
      fetchBody = formData;
      delete filteredHeaders["content-type"];
    } else if (bodyType === "formUrlEncoded" && Array.isArray(formFields)) {
      const search = new URLSearchParams();
      for (const f of formFields) {
        const key = f?.key?.trim();
        if (key) search.set(key, String(f?.value ?? ""));
      }
      fetchBody = search;
      filteredHeaders["content-type"] = "application/x-www-form-urlencoded";
    } else if ((bodyType === "json" || bodyType === "raw") && body != null) {
      const bodyStr = String(body);
      if (bodyStr.length > MAX_BODY_SIZE) {
        return apiError(
          `Request body exceeds ${MAX_BODY_SIZE / 1024}KB limit`,
          400,
        );
      }
      fetchBody = bodyStr;
      if (bodyType === "json" && !filteredHeaders["content-type"]) {
        filteredHeaders["content-type"] = "application/json";
      }
    }
  }

  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(targetUrl.toString(), {
      method: methodUpper,
      headers: Object.keys(filteredHeaders).length
        ? filteredHeaders
        : undefined,
      body: fetchBody,
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - start;

    const resHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      const lower = k.toLowerCase();
      if (lower !== "set-cookie" && lower !== "transfer-encoding") {
        resHeaders[k] = v;
      }
    });

    let resBody: string;
    const contentType = res.headers.get("content-type") ?? "";

    const contentLength = res.headers.get("content-length");

    if (
      contentType.includes("application/json") ||
      contentType.includes("text/")
    ) {
      const text = await res.text();
      if (text.length > MAX_RESPONSE_SIZE) {
        resBody = text.slice(0, MAX_RESPONSE_SIZE) + "\n\n... (truncated)";
      } else {
        resBody = text;
      }
    } else {
      await res.arrayBuffer();
      resBody = `[Binary response, ${contentLength ?? "unknown"} bytes]`;
    }

    return NextResponse.json({
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
      body: resBody,
      duration,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return apiError("Request timed out", 408);
      }
      return apiError(err.message, 500);
    }
    return apiError("Request failed", 500);
  }
}
