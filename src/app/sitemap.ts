import type { MetadataRoute } from "next";
import { transforms } from "@/lib/registry";
import { siteUrl } from "@/lib/site";
import { getToolHref } from "@/lib/toolRoutes";

const staticRoutes = ["/", "/readme"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const toolRoutes = Array.from(
    new Set(transforms.map((tool) => getToolHref(tool.id))),
  );
  const routes = Array.from(new Set([...staticRoutes, ...toolRoutes]));

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
