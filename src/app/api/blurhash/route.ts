import { encode } from "blurhash";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");
    const xInput = Number(formData.get("xComp") ?? 4);
    const yInput = Number(formData.get("yComp") ?? 3);

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required." },
        { status: 400 },
      );
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
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate BlurHash.",
      },
      { status: 500 },
    );
  }
}
