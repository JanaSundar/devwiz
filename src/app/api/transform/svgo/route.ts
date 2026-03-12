import { NextResponse } from "next/server";
import { optimize } from "svgo";
import { apiError, parseJsonBody, requirePost } from "@/lib/api";

export async function POST(req: Request) {
  const methodErr = requirePost(req);
  if (methodErr) return methodErr;

  const parsed = await parseJsonBody<{
    input?: string;
    options?: Record<string, unknown>;
  }>(req);
  if (parsed.error) return parsed.error;

  const { input, options } = parsed.data;

  try {
    if (!input || typeof input !== "string") {
      return apiError("Valid SVG string is required", 400);
    }

    const multipass = options?.multipass === false ? false : true;
    const pretty = options?.pretty === false ? false : true;
    const formatOnly = options?.formatOnly === true;
    const removeDimensions = options?.removeDimensions === true;
    const convertColors = options?.convertColors === false ? false : true;
    const cleanupIds = options?.cleanupIds === false ? false : true;

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
      return apiError(String(result.error), 400);
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
    return apiError(
      error instanceof Error ? error.message : "Failed to optimize SVG",
      500,
    );
  }
}
