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
  blurhash: "/blurhash",
  "hash-generator": "/hash-generator",
  "password-generator": "/password-generator",
  metascraper: "/metascraper",
  "id-studio": "/id-studio",
  "faker-js": "/faker-js",
  "curl-converter": "/curl-converter",
  "gltf-viewer": "/gltf-viewer",
  "gltf-to-jsx": "/gltf-to-jsx",
  "cubic-bezier": "/cubic-bezier",
};

export function getToolHref(toolId: string) {
  return DEDICATED_TOOL_ROUTES[toolId] || `/transform/${toolId}`;
}
