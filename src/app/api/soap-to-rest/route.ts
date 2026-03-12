import {
  toJavaScript,
  toNodeAxios,
  toNodeHttp,
  toPython,
  toPythonHttp,
} from "curlconverter";
import { NextResponse } from "next/server";
import { apiError, parseJsonBody, requirePost } from "@/lib/api";

export const runtime = "nodejs";

type TargetKey =
  | "curl"
  | "javascript"
  | "node-axios"
  | "node-http"
  | "python"
  | "python-http";

const converters: Record<TargetKey, (curl: string) => string> = {
  curl: (c) => c,
  javascript: toJavaScript,
  "node-axios": toNodeAxios,
  "node-http": toNodeHttp,
  python: toPython,
  "python-http": toPythonHttp,
};

function buildCurlFromSoap(
  url: string,
  soapBody: string,
  soapAction?: string,
): string {
  const escapedBody = soapBody.replace(/'/g, "'\\''").replace(/\n/g, " ");
  const lines: string[] = [
    `curl -X POST '${url.replace(/'/g, "'\\''")}'`,
    `  -H 'Content-Type: text/xml; charset=utf-8'`,
  ];
  if (soapAction?.trim()) {
    lines.push(
      `  -H 'SOAPAction: ${soapAction.trim().replace(/'/g, "'\\''")}'`,
    );
  }
  lines.push(`  -d '${escapedBody}'`);
  return lines.join(" \\\n");
}

export async function POST(req: Request) {
  const methodErr = requirePost(req);
  if (methodErr) return methodErr;

  const parsed = await parseJsonBody<{
    url?: string;
    soapBody?: string;
    soapAction?: string;
    target?: string;
  }>(req);
  if (parsed.error) return parsed.error;

  const {
    url = "",
    soapBody = "",
    soapAction,
    target = "javascript",
  } = parsed.data;

  const urlStr = typeof url === "string" ? url.trim() : "";
  const bodyStr = typeof soapBody === "string" ? soapBody : "";

  if (!urlStr) {
    return apiError("URL is required.", 400);
  }

  if (!bodyStr.trim()) {
    return apiError("SOAP body is required.", 400);
  }

  try {
    new URL(urlStr);
  } catch {
    return apiError("Invalid URL format.", 400);
  }

  const targetKey = target as TargetKey;
  const converter = converters[targetKey];
  if (!converter) {
    return apiError(
      "Invalid target. Use: curl, javascript, node-axios, node-http, python, python-http",
      400,
    );
  }

  try {
    const curl = buildCurlFromSoap(urlStr, bodyStr, soapAction);
    const output = converter(curl);
    return NextResponse.json({ output });
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : "Failed to convert SOAP to REST.",
      500,
    );
  }
}
