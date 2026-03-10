import { NextResponse } from "next/server";
import { optimize } from "svgo";

export async function POST(req: Request) {
  try {
    const { input, options } = await req.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Valid SVG string is required" },
        { status: 400 },
      );
    }

    const multipass = options?.multipass ?? true;
    const pretty = options?.pretty ?? true;
    const formatOnly = options?.formatOnly ?? false;
    const removeDimensions = options?.removeDimensions ?? false;
    const convertColors = options?.convertColors ?? true;
    const cleanupIds = options?.cleanupIds ?? true;

    const plugins: Array<{
      name: string;
      active?: boolean;
      params?: Record<string, unknown>;
    }> = [
      {
        name: "preset-default",
        params: {
          overrides: {
            removeViewBox: false,
            ...(convertColors ? {} : { convertColors: false }),
            ...(cleanupIds ? {} : { cleanupIds: false }),
          },
        },
      },
    ];

    if (!formatOnly && removeDimensions) {
      plugins.push({ name: "removeDimensions" });
    }

    const result = optimize(input, {
      multipass: formatOnly ? false : multipass,
      plugins: (formatOnly ? [] : plugins) as never,
      js2svg: {
        pretty,
        indent: 2,
      },
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const before = Buffer.byteLength(input, "utf8");
    const after = Buffer.byteLength(result.data, "utf8");
    const savedBytes = Math.max(0, before - after);
    const savedPercent =
      before > 0 ? Math.round((savedBytes / before) * 1000) / 10 : 0;

    return NextResponse.json(
      {
        output: result.data,
        stats: { before, after, savedBytes, savedPercent },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to optimize SVG",
      },
      { status: 500 },
    );
  }
}
