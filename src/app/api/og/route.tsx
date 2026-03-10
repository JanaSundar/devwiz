import { ImageResponse } from "@vercel/og";
import {
  FONT_OPTIONS,
  getLogoDataUrl,
  getTemplateConfig,
  type OgAlign,
  type OgLayout,
  resolveTemplate,
  resolveTitle,
  safeColor,
  sanitizeBackgroundImageUrl,
} from "@/lib/ogHelpers";
import { getOgBackgroundImage } from "@/lib/ogImageStore";

export const runtime = "nodejs";

const fontCache = new Map<string, Promise<ArrayBuffer | null>>();

async function loadGoogleFont(
  googleQuery: string,
): Promise<ArrayBuffer | null> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${googleQuery}&display=swap`;
  const cssRes = await fetch(cssUrl, {
    cache: "force-cache",
  });

  if (!cssRes.ok) {
    return null;
  }

  const css = await cssRes.text();
  const match = css.match(/url\(([^)]+)\)/);
  if (!match?.[1]) {
    return null;
  }

  const fontUrl = match[1].replace(/['"]/g, "");
  const fontRes = await fetch(fontUrl, { cache: "force-cache" });
  if (!fontRes.ok) {
    return null;
  }

  return fontRes.arrayBuffer();
}

function getFontData(
  key: string,
  googleQuery: string,
): Promise<ArrayBuffer | null> {
  const cached = fontCache.get(key);
  if (cached) {
    return cached;
  }

  const request = loadGoogleFont(googleQuery).catch(() => null);
  fontCache.set(key, request);
  return request;
}

export async function GET(req: Request) {
  try {
    const requestUrl = new URL(req.url);
    const { searchParams } = requestUrl;

    const requestedTitle = searchParams.get("title")?.slice(0, 120);
    const toolName = searchParams.get("tool")?.slice(0, 80);
    const template = resolveTemplate(searchParams.get("template"), toolName);
    const title = resolveTitle(template, toolName, requestedTitle);

    const logoColor = safeColor(searchParams.get("logoColor"), "#6db87a");
    const logoUrl =
      (await getLogoDataUrl(logoColor)) || `${requestUrl.origin}/logo.svg`;
    const subtitle = searchParams.get("subtitle")?.slice(0, 200) || "";
    const brand = searchParams.get("brand")?.slice(0, 36) || "DevWiz";
    const footer = searchParams.get("footer")?.slice(0, 50) || "";

    const theme = searchParams.get("theme") === "light" ? "light" : "dark";
    const alignParam = searchParams.get("align");
    const align: OgAlign =
      alignParam === "left" || alignParam === "right" ? alignParam : "center";
    const showBrandDot = searchParams.get("showBrandDot") === "1";

    const bgImageId = searchParams.get("bgImageId") || "";
    const bgImage = bgImageId
      ? getOgBackgroundImage(bgImageId)
      : sanitizeBackgroundImageUrl(searchParams.get("bgImage") || "");
    const rawPosX = Number(searchParams.get("bgPosX") ?? "50");
    const rawPosY = Number(searchParams.get("bgPosY") ?? "50");
    const bgPosX = Number.isFinite(rawPosX) ? rawPosX : 50;
    const bgPosY = Number.isFinite(rawPosY) ? rawPosY : 50;

    const layoutParam = searchParams.get("layout");
    const layout: OgLayout =
      layoutParam === "centered" ||
      layoutParam === "spotlight" ||
      layoutParam === "editorial"
        ? layoutParam
        : "default";
    const fontKey = searchParams.get("fontFamily") || "inter";
    const selectedFont = FONT_OPTIONS[fontKey];
    const fontFamily = selectedFont?.family || "sans-serif";
    const parsedTitleFontSize = Number.parseInt(
      searchParams.get("titleFontSize") ?? "",
      10,
    );
    const titleFontSize = Number.isFinite(parsedTitleFontSize)
      ? Math.max(36, Math.min(120, parsedTitleFontSize))
      : 82;

    const bg = safeColor(
      searchParams.get("bg"),
      theme === "light" ? "#f5f2e0" : "#000000",
    );
    const text = safeColor(
      searchParams.get("text"),
      theme === "light" ? "#1a1a18" : "#e4e4d8",
    );
    const muted = safeColor(
      searchParams.get("muted"),
      theme === "light" ? "#4a4a3e" : "#a8a898",
    );
    const accent = safeColor(
      searchParams.get("accent"),
      theme === "light" ? "#1e4d2b" : "#6db87a",
    );
    const textAlign = align;
    const justify =
      align === "left"
        ? "flex-start"
        : align === "right"
          ? "flex-end"
          : "center";
    const templateConfig = getTemplateConfig(template);
    const hasBgImage = Boolean(bgImage) && templateConfig.allowBackgroundImage;

    const contentObj = templateConfig.render({
      logoUrl,
      brand,
      title,
      subtitle,
      titleFontSize,
      layout,
      justify,
      textAlign,
      showBrandDot,
      accent,
      muted,
      footer,
    });

    const fontData = selectedFont
      ? await getFontData(fontKey, selectedFont.googleQuery)
      : null;

    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor:
            templateConfig.backgroundColor === "black" ? "#000000" : bg,
          ...(hasBgImage
            ? {
                backgroundImage: `linear-gradient(140deg, rgba(0,0,0,0.42), rgba(0,0,0,0.18)), url(${bgImage})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: `${Math.max(0, Math.min(100, bgPosX))}% ${Math.max(0, Math.min(100, bgPosY))}%`,
              }
            : {}),
          color: text,
          fontFamily,
        }}
      >
        {contentObj}
      </div>,
      {
        width: 1200,
        height: 630,
        ...(fontData
          ? {
              fonts: [
                {
                  name: fontFamily,
                  data: fontData,
                  style: "normal" as const,
                  weight: 400,
                },
              ],
            }
          : {}),
      },
    );
  } catch {
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
