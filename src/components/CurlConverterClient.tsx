"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ToolHeader from "@/components/tooling/ToolHeader";
import { ToolPanel, ToolPanels } from "@/components/tooling/ToolPanels";
import { safeParseJson } from "@/lib/utils";

const TARGETS = [
  { key: "python", label: "Python (default)", language: "python" },
  { key: "ansible", label: "Ansible", language: "yaml" },
  { key: "c", label: "C", language: "c" },
  { key: "cfml", label: "CFML", language: "xml" },
  { key: "clojure", label: "Clojure", language: "clojure" },
  { key: "csharp", label: "C#", language: "csharp" },
  { key: "dart", label: "Dart", language: "dart" },
  { key: "elixir", label: "Elixir", language: "elixir" },
  { key: "go", label: "Go", language: "go" },
  { key: "har", label: "HAR", language: "json" },
  { key: "http", label: "HTTP", language: "http" },
  { key: "httpie", label: "HTTPie", language: "shell" },
  { key: "java", label: "Java", language: "java" },
  {
    key: "java-httpurlconnection",
    label: "Java HttpURLConnection",
    language: "java",
  },
  { key: "java-jsoup", label: "Java Jsoup", language: "java" },
  { key: "java-okhttp", label: "Java OkHttp", language: "java" },
  { key: "javascript", label: "JavaScript", language: "javascript" },
  {
    key: "javascript-jquery",
    label: "JavaScript jQuery",
    language: "javascript",
  },
  { key: "javascript-xhr", label: "JavaScript XHR", language: "javascript" },
  { key: "json", label: "JSON", language: "json" },
  { key: "julia", label: "Julia", language: "julia" },
  { key: "kotlin", label: "Kotlin", language: "kotlin" },
  { key: "lua", label: "Lua", language: "lua" },
  { key: "matlab", label: "MATLAB", language: "matlab" },
  { key: "node", label: "Node", language: "javascript" },
  { key: "node-http", label: "Node HTTP", language: "javascript" },
  { key: "node-axios", label: "Node Axios", language: "javascript" },
  { key: "node-got", label: "Node Got", language: "javascript" },
  { key: "node-ky", label: "Node Ky", language: "javascript" },
  { key: "node-request", label: "Node Request", language: "javascript" },
  { key: "node-superagent", label: "Node SuperAgent", language: "javascript" },
  { key: "objc", label: "Objective-C", language: "objective-c" },
  { key: "ocaml", label: "OCaml", language: "ocaml" },
  { key: "perl", label: "Perl", language: "perl" },
  { key: "php", label: "PHP", language: "php" },
  { key: "php-guzzle", label: "PHP Guzzle", language: "php" },
  { key: "php-requests", label: "PHP Requests", language: "php" },
  { key: "powershell", label: "PowerShell", language: "powershell" },
  {
    key: "powershell-webrequest",
    label: "PowerShell WebRequest",
    language: "powershell",
  },
  { key: "python-http", label: "Python HTTP", language: "python" },
  { key: "r", label: "R", language: "r" },
  { key: "r-httr2", label: "R httr2", language: "r" },
  { key: "ruby", label: "Ruby", language: "ruby" },
  { key: "ruby-httparty", label: "Ruby httparty", language: "ruby" },
  { key: "rust", label: "Rust", language: "rust" },
  { key: "swift", label: "Swift", language: "swift" },
  { key: "wget", label: "Wget", language: "shell" },
] as const;

type TargetKey = (typeof TARGETS)[number]["key"];

const SAMPLE_CURL = `curl 'https://jsonplaceholder.typicode.com/posts' \\
  -X POST \\
  -H 'Content-Type: application/json' \\
  -d '{"title":"foo","body":"bar","userId":1}'`;

export default function CurlConverterClient() {
  const [curlInput, setCurlInput] = useState(SAMPLE_CURL);
  const [target, setTarget] = useState<TargetKey>("python");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!curlInput.trim()) {
      setOutput("// Paste a curl command to convert.");
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/curl-convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ curl: curlInput, target }),
          signal: controller.signal,
        });

        const data = await safeParseJson<{ output?: string; error?: string }>(
          res,
        );
        if (!res.ok) {
          setOutput(
            `// Conversion failed\n${data.error ?? "Invalid curl command"}`,
          );
          return;
        }

        setOutput(data.output ?? "");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        setOutput(
          `// Conversion failed\n${err instanceof Error ? err.message : "Invalid curl command"}`,
        );
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [curlInput, target]);

  const copyOutput = async () => {
    if (!output.trim()) {
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const selectedTarget =
    TARGETS.find((item) => item.key === target) ?? TARGETS[0];

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader
        title="cURL Converter"
        badge="Utilities"
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              onClick={copyOutput}
              disabled={!output.trim() || loading}
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tr-smooth ${copied ? "bg-success/15 text-success border border-success/20" : "btn-accent"} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        }
      />

      <div className="px-4 py-3 border-b border-border bg-bg-secondary/40 flex flex-col md:flex-row gap-2">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value as TargetKey)}
          className="px-3 py-2 text-sm rounded-lg bg-bg-primary border border-border text-txt w-full md:w-56"
        >
          {TARGETS.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <ToolPanels
        left={
          <ToolPanel title="cURL INPUT" statusClassName="bg-accent">
            <CodeEditor
              value={curlInput}
              onChange={(v) => setCurlInput(v)}
              language="shell"
              placeholder="Paste your curl command here"
            />
          </ToolPanel>
        }
        right={
          <ToolPanel
            title={`CONVERTED: ${selectedTarget.label.toUpperCase()}`}
            statusClassName="bg-success"
          >
            <CodeEditor
              value={output}
              readOnly
              language={selectedTarget.language}
              placeholder="Converted code will appear here"
            />
          </ToolPanel>
        }
      />
    </div>
  );
}
