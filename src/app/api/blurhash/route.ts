import { encode } from "blurhash";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { apiError, requirePost } from "@/lib/api";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  const methodErr = requirePost(req);
  if (methodErr) return methodErr;

  try {
    const formData = await req.formData();
    const file = formData.get("image");
    const xInput = Number(formData.get("xComp") ?? 4);
    const yInput = Number(formData.get("yComp") ?? 3);

    if (!(file instanceof File)) {
      return apiError("Image file is required.", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("Image file must be less than 10MB.", 400);
    }

    const xComp = Math.min(
      9,
      Math.max(1, Number.isFinite(xInput) ? Math.round(xInput) : 4),
    );
    const yComp = Math.min(
      9,
      Math.max(1, Number.isFinite(yInput) ? Math.round(yInput) : 3),
    );

    const input = Buffer.from(await file.arrayBuffer());

    const { data, info } = await sharp(input)
      .rotate()
      .resize({
        width: 128,
        height: 128,
        fit: "inside",
        withoutEnlargement: true,
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const hash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      xComp,
      yComp,
    );

    return NextResponse.json({
      hash,
      width: info.width,
      height: info.height,
      xComp,
      yComp,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate BlurHash.";
    if (
      message.includes("unsupported image format") ||
      message.includes("Input")
    ) {
      return apiError(
        "Image format not supported. Use JPEG, PNG, or WebP.",
        400,
      );
    }
    return apiError(message, 500);
  }
}
