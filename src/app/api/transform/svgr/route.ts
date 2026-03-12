import { transform } from "@svgr/core";
import jsxPlugin from "@svgr/plugin-jsx";
import svgoPlugin from "@svgr/plugin-svgo";
import { NextResponse } from "next/server";
import prettier from "prettier";
import "@babel/preset-typescript"; // Explicitly import for Turbopack to find it
import { apiError, parseJsonBody, requirePost } from "@/lib/api";

export async function POST(req: Request) {
  const methodErr = requirePost(req);
  if (methodErr) return methodErr;

  const parsed = await parseJsonBody<{
    input?: string;
    options?: Record<string, unknown>;
  }>(req);
  if (parsed.error) return parsed.error;

  const { input, options = {} } = parsed.data;

  try {
    if (!input || typeof input !== "string") {
      return apiError("Valid SVG string is required", 400);
    }

    const opts = options ?? {};
    const icon = opts.icon === true;
    const typescript = opts.typescript === true;
    const memo = opts.memo === true;
    const svgo = opts.svgo !== false;
    const expandProps: "start" | "end" | false =
      opts.expandProps === "start"
        ? "start"
        : opts.expandProps === "none"
          ? false
          : "end";

    let jsx = await transform(
      input,
      {
        icon,
        typescript,
        memo,
        svgo,
        svgoConfig: (opts.svgoConfig as Record<string, unknown>) ?? undefined,
        expandProps,
        replaceAttrValues:
          (opts.replaceAttrValues as Record<string, string>) ?? undefined,
        prettier: false,
        plugins: [
          // Order determines the pipeline execution order
          svgoPlugin,
          jsxPlugin,
        ],
      },
      { componentName: "SvgComponent" },
    );

    try {
      jsx = await prettier.format(jsx, {
        parser: typescript ? "babel-ts" : "babel",
        semi: true,
        singleQuote: false,
        tabWidth: 2,
        useTabs: false,
        printWidth: 80,
      });
    } catch {
      // Prettier can fail on edge-case JSX; return raw output
    }

    return NextResponse.json({ output: jsx }, { status: 200 });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to transform SVG",
      500,
    );
  }
}
