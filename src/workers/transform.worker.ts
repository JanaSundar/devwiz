// Web Worker for transform operations — runs off the main thread
import {
  cssToJsObjects,
  cssToTailwind,
  jsObjectToJson,
  tailwindToCss,
  jsonToJsonSchema,
  jsonToToml,
  jsonToTypescript,
  jsonToYaml,
  markdownToHtml,
  tomlToJson,
  tomlToYaml,
  urlEncode,
  xmlToJson,
  yamlToJson,
  yamlToToml,
} from "../lib/transforms";

const fns: Record<string, (input: string) => string | Promise<string>> = {
  "json-to-yaml": jsonToYaml,
  "yaml-to-json": yamlToJson,
  "json-to-typescript": jsonToTypescript,
  "js-to-json": jsObjectToJson,
  "json-to-toml": jsonToToml,
  "toml-to-json": tomlToJson,
  "markdown-to-html": markdownToHtml,
  "css-to-js": cssToJsObjects,
  "xml-to-json": xmlToJson,
  "json-to-schema": jsonToJsonSchema,
  "yaml-to-toml": yamlToToml,
  "toml-to-yaml": tomlToYaml,
  "css-to-tailwind": cssToTailwind,
  "tailwind-to-css": tailwindToCss,
  "url-codec": urlEncode,
};

self.onmessage = async (
  e: MessageEvent<{ id: string; toolId: string; input: string }>,
) => {
  const { id, toolId, input } = e.data;
  try {
    const fn = fns[toolId];
    if (!fn) throw new Error(`Unknown transform: ${toolId}`);
    const output = await fn(input);
    self.postMessage({ id, output, error: null });
  } catch (err) {
    self.postMessage({ id, output: "", error: (err as Error).message });
  }
};
