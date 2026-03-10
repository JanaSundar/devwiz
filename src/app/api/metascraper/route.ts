import metascraper from "metascraper";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperTitle from "metascraper-title";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const scraper = metascraper([
  metascraperTitle(),
  metascraperDescription(),
  metascraperImage(),
]);

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid URL is required." },
        { status: 400 },
      );
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format." },
        { status: 400 },
      );
    }

    const response = await fetch(targetUrl.toString(), {
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; DevWiz-Metascraper/1.0; +https://example.dev)",
        accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 400 },
      );
    }

    const html = await response.text();
    const metadata = await scraper({ html, url: targetUrl.toString() });

    return NextResponse.json({
      input: targetUrl.toString(),
      metadata,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to scrape metadata.",
      },
      { status: 500 },
    );
  }
}
