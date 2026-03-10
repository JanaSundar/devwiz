import { ImageResponse } from "next/og";
import { html } from "satori-html";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const encodedJsx = searchParams.get("jsx");

    if (!encodedJsx) {
      return new Response("No jsx payload provided", { status: 400 });
    }

    // Decode the JSX/HTML payload from base64 safely supporting Unicode
    const binary = atob(encodedJsx);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const rawHtml = new TextDecoder().decode(bytes);

    // Use satori-html to parse it into an AST suitable for ImageResponse
    const element = html(rawHtml) as unknown as React.ReactElement;

    return new ImageResponse(element, {
      width: 1200,
      height: 630,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(`Failed to generate custom OG image: ${message}`, {
      status: 500,
    });
  }
}
