"use client";

import type { JSONCrackProps } from "jsoncrack-react";
import { AlertCircle, Check, Copy, ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ThemeToggle from "@/components/ThemeToggle";

const JSONCrack = dynamic<JSONCrackProps>(
  () => import("jsoncrack-react").then((mod) => mod.JSONCrack),
  { ssr: false },
);

const DEFAULT_JSON = `{
  "name": "DevWiz",
  "version": "1.0.0",
  "features": [
    "json-to-tree",
    "json-to-graph",
    "svg-viewer"
  ],
  "config": {
    "theme": "light",
    "autosave": true,
    "retry": 3
  }
}`;

export default function JsonToGraphClient() {
  const [input, setInput] = useState(DEFAULT_JSON);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    try {
      const value = JSON.parse(input) as unknown;
      return { value, error: null as string | null };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : "Invalid JSON",
      };
    }
  }, [input]);

  const copyInput = async () => {
    if (!input.trim()) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="flex flex-col h-full anim-in">
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border gap-3 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 pl-10 md:pl-0 min-w-0 flex-1">
          <h2 className="text-base md:text-lg font-semibold text-txt truncate">
            JSON to Graph
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/15">
            JSON
          </span>
        </div>
        <div className="flex items-center gap-2 w-auto shrink-0 overflow-x-auto">
          <a
            href="https://jsoncrack.com"
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap flex items-center gap-1 px-2 py-1 text-[9px] md:text-[10px] text-txt-muted hover:text-accent rounded-md btn-glass tr-smooth"
          >
            Powered by JSON Crack <ExternalLink size={10} />
          </a>
          <button
            onClick={copyInput}
            className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tr-smooth ${copied ? "bg-success/15 text-success border border-success/20" : "btn-accent"}`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy JSON"}
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-4 gap-4 overflow-y-auto lg:overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 min-h-75 lg:min-h-0">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-txt-muted border-b border-border shrink-0">
            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
            <span className="font-medium shrink-0">JSON INPUT</span>
          </div>
          <div className="flex-1 rounded-b-xl border border-border bg-bg-secondary overflow-hidden flex flex-col">
            <CodeEditor
              value={input}
              onChange={(v) => setInput(v)}
              language="json"
              placeholder={DEFAULT_JSON}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 min-h-75 lg:min-h-0">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-txt-muted border-b border-border shrink-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${parsed.error ? "bg-error" : "bg-success"}`}
            />
            <span className="font-medium shrink-0">GRAPH VIEW</span>
          </div>
          <div className="flex-1 rounded-b-xl border border-border bg-bg-secondary overflow-auto p-3">
            {parsed.error ? (
              <div className="text-xs text-error flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{parsed.error}</span>
              </div>
            ) : (
              <div className="h-full min-h-105 rounded-lg border border-border bg-bg-primary overflow-hidden">
                <JSONCrack
                  json={parsed.value as object}
                  theme="light"
                  showControls
                  showGrid
                  centerOnLayout
                  maxRenderableNodes={1200}
                  renderNodeLimitExceeded={(count: number, max: number) => (
                    <div className="p-4 text-xs text-txt-muted">
                      Graph too large to render ({count} nodes, limit {max}).
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
