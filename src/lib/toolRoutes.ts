export const DEDICATED_TOOL_ROUTES: Record<string, string> = {
  "url-codec": "/url-codec",
  "jwt-debugger": "/jwt-debugger",
  tldraw: "/whiteboard",
  timestamp: "/timestamp",
  "string-case": "/string-case",
  "color-converter": "/color-converter",
  "svg-viewer": "/svg-viewer",
  "city-roads": "/city-roads",
  cron: "/cron",
  "json-to-tree": "/json-to-tree",
  "json-to-graph": "/json-to-graph",
  "diff-viewer": "/diff-viewer",
  "icon-search": "/icons",
  "og-image": "/og-image",
  metascraper: "/metascraper",
  "id-studio": "/id-studio",
  "faker-js": "/faker-js",
  "curl-converter": "/curl-converter",
};

export function getToolHref(toolId: string) {
  return DEDICATED_TOOL_ROUTES[toolId] || `/transform/${toolId}`;
}
