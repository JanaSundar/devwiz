import { createHash, getHashes } from "node:crypto";
import { hash as bcryptHash, compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { apiError, parseJsonBody, requirePost } from "@/lib/api";

export const runtime = "nodejs";

type Action =
  | "digest"
  | "digest-verify"
  | "digest-recover"
  | "bcrypt-hash"
  | "bcrypt-verify";

function parseText(payload: unknown) {
  return typeof payload === "string" ? payload : "";
}

export async function GET() {
  return NextResponse.json({
    algorithms: Array.from(new Set(getHashes())).sort(),
  });
}

export async function POST(req: Request) {
  const methodErr = requirePost(req);
  if (methodErr) return methodErr;

  const parsed = await parseJsonBody<Record<string, unknown>>(req);
  if (parsed.error) return parsed.error;

  const body = parsed.data;

  try {
    const action = (body?.action ?? "") as Action;

    if (action === "digest") {
      const text = parseText(body?.text);
      const algorithm = parseText(body?.algorithm);
      const outputEncoding =
        body?.outputEncoding === "base64" ? "base64" : "hex";
      const available = getHashes();

      if (!algorithm || !available.includes(algorithm)) {
        return NextResponse.json(
          { error: "Unsupported hash algorithm." },
          { status: 400 },
        );
      }

      const digest = createHash(algorithm).update(text).digest(outputEncoding);
      return NextResponse.json({ digest, algorithm, outputEncoding });
    }

    if (action === "digest-verify") {
      const text = parseText(body?.text);
      const target = parseText(body?.targetDigest);
      const algorithm = parseText(body?.algorithm);
      const outputEncoding =
        body?.outputEncoding === "base64" ? "base64" : "hex";
      const available = getHashes();

      if (!algorithm || !available.includes(algorithm)) {
        return NextResponse.json(
          { error: "Unsupported hash algorithm." },
          { status: 400 },
        );
      }

      if (!target) {
        return NextResponse.json(
          { error: "Target hash is required." },
          { status: 400 },
        );
      }

      const computed = createHash(algorithm)
        .update(text)
        .digest(outputEncoding);
      const valid =
        outputEncoding === "hex"
          ? computed.toLowerCase() === target.trim().toLowerCase()
          : computed === target.trim();
      return NextResponse.json({ valid, computed });
    }

    if (action === "digest-recover") {
      const target = parseText(body?.targetDigest);
      const algorithm = parseText(body?.algorithm);
      const outputEncoding =
        body?.outputEncoding === "base64" ? "base64" : "hex";
      const candidates = Array.isArray(body?.candidates)
        ? body.candidates.filter((v: unknown) => typeof v === "string")
        : [];
      const available = getHashes();

      if (!algorithm || !available.includes(algorithm)) {
        return NextResponse.json(
          { error: "Unsupported hash algorithm." },
          { status: 400 },
        );
      }

      if (!target) {
        return NextResponse.json(
          { error: "Target hash is required." },
          { status: 400 },
        );
      }

      if (!candidates.length) {
        return NextResponse.json(
          { error: "Provide at least one candidate." },
          { status: 400 },
        );
      }

      const normalizedTarget =
        outputEncoding === "hex" ? target.trim().toLowerCase() : target.trim();
      for (const candidate of candidates) {
        const computed = createHash(algorithm)
          .update(candidate)
          .digest(outputEncoding);
        const matched =
          outputEncoding === "hex"
            ? computed.toLowerCase() === normalizedTarget
            : computed === normalizedTarget;
        if (matched) {
          return NextResponse.json({ found: true, text: candidate });
        }
      }

      return NextResponse.json({ found: false });
    }

    if (action === "bcrypt-hash") {
      const text = parseText(body?.text);
      const roundsInput = Number(body?.rounds ?? 10);
      const rounds = Math.min(
        14,
        Math.max(
          4,
          Number.isFinite(roundsInput) ? Math.round(roundsInput) : 10,
        ),
      );
      const digest = await bcryptHash(text, rounds);
      return NextResponse.json({ digest, rounds });
    }

    if (action === "bcrypt-verify") {
      const text = parseText(body?.text);
      const digest = parseText(body?.digest);

      if (!digest) {
        return NextResponse.json(
          { error: "BCrypt hash is required." },
          { status: 400 },
        );
      }

      const valid = await compare(text, digest);
      return NextResponse.json({ valid });
    }

    return apiError("Invalid action.", 400);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Hash request failed.",
      500,
    );
  }
}
