import {
  toAnsible,
  toC,
  toCFML,
  toClojure,
  toCSharp,
  toDart,
  toElixir,
  toGo,
  toHarString,
  toHTTP,
  toHttpie,
  toJava,
  toJavaHttpUrlConnection,
  toJavaJsoup,
  toJavaOkHttp,
  toJavaScript,
  toJavaScriptJquery,
  toJavaScriptXHR,
  toJsonString,
  toJulia,
  toKotlin,
  toLua,
  toMATLAB,
  toNode,
  toNodeAxios,
  toNodeGot,
  toNodeHttp,
  toNodeKy,
  toNodeRequest,
  toNodeSuperAgent,
  toObjectiveC,
  toOCaml,
  toPerl,
  toPhp,
  toPhpGuzzle,
  toPhpRequests,
  toPowershellRestMethod,
  toPowershellWebRequest,
  toPython,
  toPythonHttp,
  toR,
  toRHttr2,
  toRuby,
  toRubyHttparty,
  toRust,
  toSwift,
  toWget,
} from "curlconverter";
import { NextResponse } from "next/server";
import { apiError, parseJsonBody, requirePost } from "@/lib/api";

export const runtime = "nodejs";

const converters: Record<string, (curl: string) => string> = {
  ansible: toAnsible,
  c: toC,
  cfml: toCFML,
  clojure: toClojure,
  csharp: toCSharp,
  dart: toDart,
  elixir: toElixir,
  go: toGo,
  har: toHarString,
  http: toHTTP,
  httpie: toHttpie,
  java: toJava,
  "java-httpurlconnection": toJavaHttpUrlConnection,
  "java-jsoup": toJavaJsoup,
  "java-okhttp": toJavaOkHttp,
  javascript: toJavaScript,
  "javascript-jquery": toJavaScriptJquery,
  "javascript-xhr": toJavaScriptXHR,
  json: toJsonString,
  julia: toJulia,
  kotlin: toKotlin,
  lua: toLua,
  matlab: toMATLAB,
  node: toNode,
  "node-http": toNodeHttp,
  "node-axios": toNodeAxios,
  "node-got": toNodeGot,
  "node-ky": toNodeKy,
  "node-request": toNodeRequest,
  "node-superagent": toNodeSuperAgent,
  objc: toObjectiveC,
  ocaml: toOCaml,
  perl: toPerl,
  php: toPhp,
  "php-guzzle": toPhpGuzzle,
  "php-requests": toPhpRequests,
  powershell: toPowershellRestMethod,
  "powershell-webrequest": toPowershellWebRequest,
  python: toPython,
  "python-http": toPythonHttp,
  r: toR,
  "r-httr2": toRHttr2,
  ruby: toRuby,
  "ruby-httparty": toRubyHttparty,
  rust: toRust,
  swift: toSwift,
  wget: toWget,
};

export async function POST(req: Request) {
  const methodErr = requirePost(req);
  if (methodErr) return methodErr;

  const parsed = await parseJsonBody<{ curl?: string; target?: string }>(req);
  if (parsed.error) return parsed.error;

  const { curl = "", target = "" } = parsed.data;
  const curlStr = typeof curl === "string" ? curl : "";
  const targetStr = typeof target === "string" ? target : "";

  if (!curlStr.trim()) {
    return apiError("A curl command is required.", 400);
  }

  const converter = converters[targetStr];
  if (!converter) {
    return apiError("Invalid conversion target.", 400);
  }

  try {
    const output = converter(curlStr);
    return NextResponse.json({ output });
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : "Failed to convert curl command.",
      500,
    );
  }
}
