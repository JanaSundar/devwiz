"use client";

import { AlertCircle, Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ToolHeader from "@/components/tooling/ToolHeader";
import { ToolPanel, ToolPanels } from "@/components/tooling/ToolPanels";

const DEFAULT_JSON = `{
  "name": "DevWiz",
  "version": "1.0.0",
  "features": [
    "json-to-tree",
    "svg-viewer"
  ],
  "config": {
    "theme": "light",
    "autosave": true,
    "retry": 3
  }
}`;

function renderTreeNode(value: unknown, keyName?: string): React.ReactNode {
  const label = keyName !== undefined ? `${keyName}: ` : "";

  if (value === null) {
    return (
      <span>
        {label}
        <span className="text-txt-muted">null</span>
      </span>
    );
  }

  if (Array.isArray(value)) {
    return (
      <details open className="pl-3">
        <summary className="cursor-pointer text-xs text-txt">
          {label}[{value.length}]
        </summary>
        <div className="mt-1 space-y-1">
          {value.map((item, index) => (
            <div
              key={`${keyName ?? "arr"}-${index}`}
              className="text-xs text-txt-sec"
            >
              {renderTreeNode(item, String(index))}
            </div>
          ))}
        </div>
      </details>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <details open className="pl-3">
        <summary className="cursor-pointer text-xs text-txt">
          {label}
          {"{"}
          {entries.length}
          {"}"}
        </summary>
        <div className="mt-1 space-y-1">
          {entries.map(([k, v]) => (
            <div
              key={`${keyName ?? "obj"}-${k}`}
              className="text-xs text-txt-sec"
            >
              {renderTreeNode(v, k)}
            </div>
          ))}
        </div>
      </details>
    );
  }

  if (typeof value === "string") {
    return (
      <span>
        {label}
        <span className="text-accent">&quot;{value}&quot;</span>
      </span>
    );
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return (
      <span>
        {label}
        <span className="text-success">{String(value)}</span>
      </span>
    );
  }

  if (typeof value === "boolean") {
    return (
      <span>
        {label}
        <span className="text-error">{String(value)}</span>
      </span>
    );
  }

  return (
    <span>
      {label}
      <span className="text-txt-muted">{String(value)}</span>
    </span>
  );
}

export default function JsonToTreeClient() {
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
      <ToolHeader
        title="JSON to Tree View"
        badge="JSON"
        rightSlot={
          <button
            onClick={copyInput}
            className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tr-smooth ${copied ? "bg-success/15 text-success border border-success/20" : "btn-accent"}`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy JSON"}
          </button>
        }
      />

      <ToolPanels
        left={
          <ToolPanel title="JSON INPUT" statusClassName="bg-accent">
            <CodeEditor
              value={input}
              onChange={(v) => setInput(v)}
              language="json"
              placeholder={DEFAULT_JSON}
            />
          </ToolPanel>
        }
        right={
          <ToolPanel
            title="TREE VIEW"
            statusClassName={parsed.error ? "bg-error" : "bg-success"}
            frameClassName="overflow-auto p-3"
          >
            {parsed.error ? (
              <div className="text-xs text-error flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{parsed.error}</span>
              </div>
            ) : (
              <div className="h-full min-h-105 rounded-lg border border-border bg-bg-primary overflow-auto p-2">
                <div className="font-mono leading-6">
                  {renderTreeNode(parsed.value)}
                </div>
              </div>
            )}
          </ToolPanel>
        }
      />
    </div>
  );
}
