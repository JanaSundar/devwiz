import metascraper from "metascraper";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperTitle from "metascraper-title";
import { NextResponse } from "next/server";
import { apiError, parseJsonBody, requirePost } from "@/lib/api";

export const runtime = "nodejs";

const scraper = metascraper([
  metascraperTitle(),
  metascraperDescription(),
  metascraperImage(),
]);

export async function POST(req: Request) {
  const methodErr = requirePost(req);
  if (methodErr) return methodErr;

  const parsed = await parseJsonBody<{ url?: string }>(req);
  if (parsed.error) return parsed.error;

  const { url } = parsed.data;

  try {
    if (!url || typeof url !== "string") {
      return apiError("A valid URL is required.", 400);
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return apiError("Invalid URL format.", 400);
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
      return apiError(`Failed to fetch URL: ${response.status}`, 400);
    }

    const html = await response.text();
    const metadata = await scraper({ html, url: targetUrl.toString() });

    return NextResponse.json({
      input: targetUrl.toString(),
      metadata,
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to scrape metadata.",
      500,
    );
  }
}
