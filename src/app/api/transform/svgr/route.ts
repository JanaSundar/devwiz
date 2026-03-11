import { transform } from "@svgr/core";
import jsxPlugin from "@svgr/plugin-jsx";
import svgoPlugin from "@svgr/plugin-svgo";
import { NextResponse } from "next/server";
import "@babel/preset-typescript"; // Explicitly import for Turbopack to find it

export async function POST(req: Request) {
  try {
    const { input, options = {} } = await req.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Valid SVG string is required" },
        { status: 400 },
      );
    }

    const jsx = await transform(
      input,
      {
        icon: options.icon ?? false,
        typescript: options.typescript ?? false,
        memo: options.memo ?? false,
        svgo: options.svgo ?? true,
        svgoConfig: options.svgoConfig ?? undefined,
        expandProps: options.expandProps || "end",
        replaceAttrValues: options.replaceAttrValues || undefined,
        plugins: [
          // Order determines the pipeline execution order
          svgoPlugin,
          jsxPlugin,
        ],
      },
      { componentName: "SvgComponent" },
    );

    return NextResponse.json({ output: jsx }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to transform SVG",
      },
      { status: 500 },
    );
  }
}
