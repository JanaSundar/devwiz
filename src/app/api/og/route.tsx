import { ImageResponse } from "next/og";
import {
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
import { siteConfig, siteUrl } from "@/lib/site";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const requestUrl = new URL(req.url);
    const { searchParams } = requestUrl;

    const requestedTitle = searchParams.get("title")?.slice(0, 120);
    const toolName = searchParams.get("tool")?.slice(0, 80);
    const template = resolveTemplate(searchParams.get("template"), toolName);
    const title = resolveTitle(template, toolName, requestedTitle);

    const rawLogoUrl = `${requestUrl.origin}/logo.svg`;
    const theme = searchParams.get("theme") === "light" ? "light" : "dark";
    const logoColor =
      template === "home" || template === "tool" || theme === "dark"
        ? "#ffffff"
        : "#000000";
    // The source logo uses currentColor; convert to a data URL with explicit fill for predictable OG rendering.
    const logoUrl =
      (await getLogoDataUrl(logoColor, rawLogoUrl)) ||
      `${requestUrl.origin}/logo.png`;
    const subtitle = searchParams.get("subtitle")?.slice(0, 200) || "";
    const brand = searchParams.get("brand")?.slice(0, 36) || siteConfig.name;
    const siteHost = new URL(siteUrl).host;
    const footer = searchParams.get("footer")?.slice(0, 50) || "";
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
    const parsedTitleFontSize = Number.parseInt(
      searchParams.get("titleFontSize") ?? "",
      10,
    );
    const titleFontSize = Number.isFinite(parsedTitleFontSize)
      ? Math.max(36, Math.min(120, parsedTitleFontSize))
      : 82;

    const bg = safeColor(
      searchParams.get("bg"),
      template === "home" || template === "tool"
        ? "#000000"
        : theme === "light"
          ? "#efece0"
          : "#000000",
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
      theme === "light" ? "#1a1a18" : "#ffffff",
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
      siteHost,
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
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {contentObj}
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error("/api/og generation failed", error);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
