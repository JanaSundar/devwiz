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
  try {
    const body = await req.json();
    const curl = typeof body?.curl === "string" ? body.curl : "";
    const target = typeof body?.target === "string" ? body.target : "";

    if (!curl.trim()) {
      return NextResponse.json(
        { error: "A curl command is required." },
        { status: 400 },
      );
    }

    const converter = converters[target];
    if (!converter) {
      return NextResponse.json(
        { error: "Invalid conversion target." },
        { status: 400 },
      );
    }

    const output = converter(curl);
    return NextResponse.json({ output });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to convert curl command.",
      },
      { status: 500 },
    );
  }
}
