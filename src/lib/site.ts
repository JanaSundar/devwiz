const FALLBACK_SITE_URL = "https://devwiz.vercel.app";

function normalizeSiteUrl(input?: string) {
  if (!input) {
    return FALLBACK_SITE_URL;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return FALLBACK_SITE_URL;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const siteConfig = {
  name: "DevWiz",
  title: "DevWiz - Developer Tools",
  description:
    "Transform data formats, debug payloads, and generate assets with fast, focused developer tools.",
  keywords: [
    "developer tools",
    "curl converter",
    "json tools",
    "jwt debugger",
    "url encoder",
    "sql formatter",
    "svg viewer",
    "readme generator",
  ],
};

export const siteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL,
);
