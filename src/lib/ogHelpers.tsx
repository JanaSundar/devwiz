import { readFile } from "node:fs/promises";
import path from "node:path";
import type { JSX } from "react";

export const FONT_OPTIONS: Record<
  string,
  { family: string; googleQuery: string }
> = {
  inter: { family: "Inter", googleQuery: "Inter:wght@400;700" },
  poppins: { family: "Poppins", googleQuery: "Poppins:wght@400;700" },
  montserrat: { family: "Montserrat", googleQuery: "Montserrat:wght@400;700" },
  "playfair-display": {
    family: "Playfair Display",
    googleQuery: "Playfair+Display:wght@400;700",
  },
  "roboto-mono": {
    family: "Roboto Mono",
    googleQuery: "Roboto+Mono:wght@400;700",
  },
  lora: { family: "Lora", googleQuery: "Lora:wght@400;700" },
  merriweather: {
    family: "Merriweather",
    googleQuery: "Merriweather:wght@400;700",
  },
  "open-sans": { family: "Open Sans", googleQuery: "Open+Sans:wght@400;700" },
  "source-sans-3": {
    family: "Source Sans 3",
    googleQuery: "Source+Sans+3:wght@400;700",
  },
  nunito: { family: "Nunito", googleQuery: "Nunito:wght@400;700" },
  "dm-sans": { family: "DM Sans", googleQuery: "DM+Sans:wght@400;700" },
  manrope: { family: "Manrope", googleQuery: "Manrope:wght@400;700" },
  archivo: { family: "Archivo", googleQuery: "Archivo:wght@400;700" },
  "space-grotesk": {
    family: "Space Grotesk",
    googleQuery: "Space+Grotesk:wght@400;700",
  },
  "bebas-neue": { family: "Bebas Neue", googleQuery: "Bebas+Neue" },
  raleway: { family: "Raleway", googleQuery: "Raleway:wght@400;700" },
  "work-sans": { family: "Work Sans", googleQuery: "Work+Sans:wght@400;700" },
  "fira-sans": { family: "Fira Sans", googleQuery: "Fira+Sans:wght@400;700" },
};

export type OgTemplate = "home" | "tool" | "docs" | "classic";
export type OgLayout = "default" | "centered" | "spotlight" | "editorial";
export type OgAlign = "left" | "center" | "right";
export type OgJustify = "flex-start" | "center" | "flex-end";

export type OgTemplateRenderInput = {
  logoUrl: string;
  brand: string;
  title: string;
  subtitle: string;
  titleFontSize: number;
  layout: OgLayout;
  justify: OgJustify;
  textAlign: OgAlign;
  showBrandDot: boolean;
  accent: string;
  muted: string;
  footer: string;
};

export type OgTemplateConfig = {
  key: OgTemplate;
  backgroundColor: "black" | "custom";
  allowBackgroundImage: boolean;
  render: (input: OgTemplateRenderInput) => JSX.Element;
};

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
const BLOCKED_BG_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);
const PRIVATE_IPV4_RE =
  /^(10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.)/;
const logoDataUrlCache = new Map<string, Promise<string | null>>();

export function sanitizeBackgroundImageUrl(input: string): string {
  if (!input || input.length > 2048) {
    return "";
  }

  try {
    const parsed = new URL(input);
    if (parsed.protocol !== "https:") {
      return "";
    }

    const host = parsed.hostname.toLowerCase();
    if (BLOCKED_BG_HOSTS.has(host) || PRIVATE_IPV4_RE.test(host)) {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

export function safeColor(input: string | null, fallback: string): string {
  return input && HEX_COLOR_RE.test(input) ? input : fallback;
}

export function resolveTemplate(
  templateParam: string | null,
  toolName: string | undefined,
): OgTemplate {
  if (
    templateParam === "home" ||
    templateParam === "tool" ||
    templateParam === "docs" ||
    templateParam === "classic"
  ) {
    return templateParam;
  }

  return toolName ? "tool" : "classic";
}

export function resolveTitle(
  template: OgTemplate,
  toolName: string | undefined,
  requestedTitle: string | undefined,
): string {
  if (template === "tool" || template === "docs") {
    return toolName || requestedTitle || "Developer Tool";
  }
  return requestedTitle || "DevWiz";
}

const OG_TEMPLATE_CONFIGS: Record<OgTemplate, OgTemplateConfig> = {
  home: {
    key: "home",
    backgroundColor: "black",
    allowBackgroundImage: false,
    render: ({ logoUrl }) => renderHomeContent(logoUrl),
  },
  tool: {
    key: "tool",
    backgroundColor: "black",
    allowBackgroundImage: true,
    render: ({ logoUrl, brand, title, subtitle, titleFontSize }) =>
      renderToolOrDocsContent({
        logoUrl,
        brand,
        title,
        subtitle,
        titleFontSize,
        variant: "tool",
      }),
  },
  docs: {
    key: "docs",
    backgroundColor: "black",
    allowBackgroundImage: true,
    render: ({ logoUrl, brand, title, subtitle, titleFontSize }) =>
      renderToolOrDocsContent({
        logoUrl,
        brand,
        title,
        subtitle,
        titleFontSize,
        variant: "docs",
      }),
  },
  classic: {
    key: "classic",
    backgroundColor: "custom",
    allowBackgroundImage: true,
    render: ({
      layout,
      justify,
      textAlign,
      showBrandDot,
      accent,
      muted,
      footer,
      title,
      subtitle,
      brand,
      titleFontSize,
    }) =>
      renderClassicContent({
        layout,
        justify,
        textAlign,
        showBrandDot,
        accent,
        muted,
        footer,
        title,
        subtitle,
        brand,
        titleFontSize,
      }),
  },
};

export function getTemplateConfig(template: OgTemplate): OgTemplateConfig {
  return OG_TEMPLATE_CONFIGS[template];
}

export function getLogoDataUrl(colorHex = "#6db87a"): Promise<string | null> {
  const color = /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(colorHex)
    ? colorHex
    : "#6db87a";
  const cached = logoDataUrlCache.get(color);
  if (cached) {
    return cached;
  }

  const request = readFile(path.join(process.cwd(), "public/logo.svg"), "utf8")
    .then((svg) => {
      const coloredSvg = svg.replace(/currentColor/g, color);
      return `data:image/svg+xml;utf8,${encodeURIComponent(coloredSvg)}`;
    })
    .catch(() => null);

  logoDataUrlCache.set(color, request);
  return request;
}

export function renderHomeContent(logoUrl: string): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: 64,
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: @vercel/og ImageResponse requires standard img elements in template JSX. */}
      <img
        src={logoUrl}
        alt="DevWiz logo"
        width={180}
        height={180}
        style={{ width: 180, height: 180, objectFit: "contain" }}
      />
    </div>
  );
}

export function renderToolOrDocsContent(params: {
  logoUrl: string;
  brand: string;
  title: string;
  subtitle: string;
  titleFontSize: number;
  variant: "tool" | "docs";
}): JSX.Element {
  const { logoUrl, brand, title, subtitle, titleFontSize, variant } = params;

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "54px 62px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {/* biome-ignore lint/performance/noImgElement: @vercel/og ImageResponse requires standard img elements in template JSX. */}
            <img
              src={logoUrl}
              alt="DevWiz logo"
              width={28}
              height={28}
              style={{ width: 28, height: 28, objectFit: "contain" }}
            />
          </div>
          <div style={{ fontSize: 30, color: "#e5e9f7", fontWeight: 700 }}>
            {brand}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "9px 14px",
            borderRadius: 999,
            fontSize: 16,
            letterSpacing: 1.2,
            fontWeight: 600,
            textTransform: "uppercase",
            color: "#d7ddf2",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          {variant}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          maxWidth: "92%",
        }}
      >
        <div
          style={{
            fontSize: Math.min(92, Math.max(56, titleFontSize)),
            fontWeight: 700,
            lineHeight: 1.03,
            color: "#f3f6ff",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 27, color: "#aeb8d3", lineHeight: 1.25 }}>
          {subtitle || "Developer Tool"}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "linear-gradient(145deg, #64e2ab, #5ca6ff)",
              boxShadow: "0 0 20px rgba(100, 226, 171, 0.55)",
            }}
          />
          <div style={{ fontSize: 22, color: "#92a0c2" }}>
            devwiz.vercel.app
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 230,
            height: 10,
            borderRadius: 999,
            background: "linear-gradient(90deg, #6db87a, rgba(109,184,122,0))",
          }}
        ></div>
      </div>
    </div>
  );
}

export function renderClassicContent(params: {
  layout: OgLayout;
  justify: OgJustify;
  textAlign: OgAlign;
  showBrandDot: boolean;
  accent: string;
  muted: string;
  footer: string;
  title: string;
  subtitle: string;
  brand: string;
  titleFontSize: number;
}): JSX.Element {
  const {
    layout,
    justify,
    textAlign,
    showBrandDot,
    accent,
    muted,
    footer,
    title,
    subtitle,
    brand,
    titleFontSize,
  } = params;

  if (layout === "centered") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: justify,
          justifyContent: "center",
          width: "100%",
          height: "100%",
          gap: 40,
          padding: 64,
          textAlign,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            justifyContent: justify,
          }}
        >
          {showBrandDot && (
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: accent,
              }}
            />
          )}
          <div style={{ fontSize: 34, color: muted }}>{brand}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: justify,
            gap: 24,
            textAlign,
          }}
        >
          <div
            style={{
              fontSize: titleFontSize,
              lineHeight: 1.05,
              fontWeight: 700,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 34, color: muted }}>{subtitle}</div>
        </div>
      </div>
    );
  }

  if (layout === "spotlight") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 70,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {showBrandDot && (
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: accent,
                }}
              />
            )}
            <div style={{ fontSize: 30, color: muted }}>{brand}</div>
          </div>
          <div style={{ fontSize: 24, color: accent }}>{footer}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: "78%",
            alignItems: justify,
            textAlign,
            alignSelf: justify,
          }}
        >
          <div
            style={{
              fontSize: Math.round(titleFontSize * 0.95),
              lineHeight: 1.04,
              fontWeight: 700,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 30, color: muted }}>{subtitle}</div>
        </div>
        <div
          style={{
            width: "55%",
            height: 12,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${accent}, transparent)`,
          }}
        />
      </div>
    );
  }

  if (layout === "editorial") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 72,
          justifyContent: "center",
          gap: 24,
          alignItems: justify,
          textAlign,
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: accent,
          }}
        >
          {brand}
        </div>
        <div
          style={{
            width: 120,
            height: 4,
            background: accent,
            borderRadius: 999,
            alignSelf: justify,
          }}
        />
        <div
          style={{
            fontSize: Math.round(titleFontSize * 0.9),
            lineHeight: 1.05,
            fontWeight: 700,
            maxWidth: "90%",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 30, color: muted, maxWidth: "88%" }}>
          {subtitle}
        </div>
        <div style={{ marginTop: 12, fontSize: 22, color: muted }}>
          {footer}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 64,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          justifyContent: justify,
        }}
      >
        {showBrandDot ? (
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: accent,
            }}
          />
        ) : null}
        <div style={{ fontSize: 30, color: muted }}>{brand}</div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          maxWidth: "92%",
          alignItems: justify,
          alignSelf: justify,
          textAlign,
        }}
      >
        <div
          style={{ fontSize: titleFontSize, lineHeight: 1.02, fontWeight: 700 }}
        >
          {title}
        </div>
        <div style={{ fontSize: 34, lineHeight: 1.25, color: muted }}>
          {subtitle}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          fontSize: 24,
          color: muted,
        }}
      >
        <div style={{ color: accent }}>{footer}</div>
      </div>
    </div>
  );
}
