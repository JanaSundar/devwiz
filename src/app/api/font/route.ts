import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Fetch font from Google Fonts / unpkg server side (cacheable)
    const fontRes = await fetch(
      "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.woff",
      { cache: "force-cache" },
    );

    if (!fontRes.ok) {
      return new NextResponse("Failed to fetch font", { status: 500 });
    }

    const buffer = await fontRes.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "font/woff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Server error fetching font", { status: 500 });
  }
}
