import type { Metadata } from "next";
import { siteConfig, siteUrl } from "./site";

export function constructMetadata({
  title,
  description,
  image,
  toolId,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  toolId?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;
  const fullDescription = description || siteConfig.description;

  // Dedicated OG image logic
  let ogImage = image || "/api/og?template=home";
  if (toolId) {
    ogImage = `/api/og?tool=${toolId}`;
  }

  return {
    title: fullTitle,
    description: fullDescription,
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: [ogImage],
      creator: "@janasundar",
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    metadataBase: new URL(siteUrl),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
