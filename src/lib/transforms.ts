import { TailwindConverter } from "css-to-tailwindcss";
import { twi } from "tw-to-css";
import { XMLParser } from "fast-xml-parser";
import * as yaml from "js-yaml";
import JsonToTS from "json-to-ts";
import { marked } from "marked";
import * as TOML from "smol-toml";

export function jsonToYaml(input: string): string {
  return yaml.dump(JSON.parse(input), { indent: 2, lineWidth: 120 });
}

export function yamlToJson(input: string): string {
  return JSON.stringify(yaml.load(input), null, 2);
}

export function jsonToTypescript(input: string): string {
  try {
    const resultObj = JSON.parse(input);

    const interfaces = JsonToTS(resultObj, {
      rootName: "Root",
    });

    return interfaces.join("\n\n");
  } catch (err) {
    throw new Error(
      `Failed to parse JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export function jsObjectToJson(input: string): string {
  const fn = new Function(`return (${input});`);
  return JSON.stringify(fn(), null, 2);
}

export function jsonToToml(input: string): string {
  return TOML.stringify(JSON.parse(input));
}

export function tomlToJson(input: string): string {
  return JSON.stringify(TOML.parse(input), null, 2);
}

export function markdownToHtml(input: string): string {
  return marked.parse(input, { async: false }) as string;
}

export function cssToJsObjects(input: string): string {
  const rules: Record<string, Record<string, string>> = {};
  const re = /([^{]+)\{([^}]+)\}/g;
  let m: RegExpExecArray | null = re.exec(input);
  while (m !== null) {
    const sel = m[1].trim();
    const props: Record<string, string> = {};
    m[2]
      .trim()
      .split(";")
      .forEach((d) => {
        const [p, ...v] = d.split(":");
        if (p && v.length) {
          props[p.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v
            .join(":")
            .trim();
        }
      });
    if (Object.keys(props).length) rules[sel] = props;
    m = re.exec(input);
  }
  const out = Object.keys(rules).length === 1 ? Object.values(rules)[0] : rules;
  return JSON.stringify(out, null, 2)
    .replace(/"([^"]+)":/g, "$1:")
    .replace(/: "([^"]+)"/g, ": '$1'");
}

export function tailwindToCss(input: string): string {
  const classes = input.trim().split(/\s+/).filter(Boolean).join(" ");
  if (!classes) return "";
  try {
    const css = twi(classes, { minify: false, merge: false });
    return typeof css === "string" ? css : "";
  } catch (err) {
    throw new Error(
      `Failed to convert Tailwind to CSS: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export async function cssToTailwind(input: string): Promise<string> {
  const converter = new TailwindConverter({
    remInPx: 16,
    postCSSPlugins: [],
    tailwindConfig: {
      content: [],
      theme: {
        extend: {},
      },
    },
  });

  try {
    const result = await converter.convertCSS(input);
    return result.convertedRoot.toString();
  } catch (err) {
    throw new Error(
      `Failed to convert CSS: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export function xmlToJson(input: string): string {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  return JSON.stringify(parser.parse(input), null, 2);
}

export function jsonToJsonSchema(input: string): string {
  return JSON.stringify(
    {
      $schema: "http://json-schema.org/draft-07/schema#",
      ...infer(JSON.parse(input)),
    },
    null,
    2,
  );
}

function infer(v: unknown): Record<string, unknown> {
  if (v === null) return { type: "null" };
  if (typeof v === "string") return { type: "string" };
  if (typeof v === "number")
    return { type: Number.isInteger(v) ? "integer" : "number" };
  if (typeof v === "boolean") return { type: "boolean" };
  if (Array.isArray(v))
    return { type: "array", items: v.length ? infer(v[0]) : {} };
  if (typeof v === "object") {
    const props: Record<string, unknown> = {};
    const req: string[] = [];
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      props[k] = infer(val);
      if (val !== null && val !== undefined) req.push(k);
    }
    return { type: "object", properties: props, required: req };
  }
  return {};
}

export function yamlToToml(input: string): string {
  return TOML.stringify(yaml.load(input) as Record<string, unknown>);
}

export function tomlToYaml(input: string): string {
  return yaml.dump(TOML.parse(input), { indent: 2 });
}

export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}

export function urlDecode(input: string): string {
  return decodeURIComponent(input);
}
