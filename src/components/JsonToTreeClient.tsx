"use client";

import {
  AlertCircle,
  Braces,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  FileJson,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ToolHeader from "@/components/tooling/ToolHeader";
import { ToolPanel, ToolPanels } from "@/components/tooling/ToolPanels";
import { cn } from "@/lib/utils";

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

function TreeNode({
  value,
  keyName,
  depth,
  expandAll,
  onCopyValue,
  copiedPath,
}: {
  value: unknown;
  keyName?: string;
  depth: number;
  expandAll: boolean;
  onCopyValue: (path: string, text: string) => void;
  copiedPath: string | null;
}) {
  const path = keyName ?? "root";
  const indent = depth * 16;

  if (value === null) {
    return (
      <div
        className="flex items-center gap-1.5 py-0.5 text-[13px] font-mono"
        style={{ paddingLeft: indent }}
      >
        {keyName !== undefined && (
          <span className="text-txt-muted shrink-0">{keyName}:</span>
        )}
        <span className="text-txt-muted/90">null</span>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <details open={expandAll} className="group">
        <summary
          className={cn(
            "flex items-center gap-1.5 py-1 cursor-pointer select-none list-none",
            "text-[13px] font-mono text-txt hover:bg-bg-tertiary/50 rounded pr-2 tr-smooth",
          )}
          style={{ paddingLeft: indent }}
        >
          <ChevronRight
            size={14}
            className="shrink-0 text-txt-muted group-open:rotate-90"
          />
          {keyName !== undefined && (
            <span className="text-txt-muted shrink-0">{keyName}:</span>
          )}
          <span className="text-txt-muted">[</span>
          <span className="text-txt-muted/80">{value.length}</span>
          <span className="text-txt-muted">]</span>
        </summary>
        <div
          className="border-l border-border/60 mt-0.5 pl-2"
          style={{ marginLeft: indent + 8 }}
        >
          {value.map((item, index) => (
            <TreeNode
              key={`${path}-${index}`}
              value={item}
              keyName={String(index)}
              depth={depth + 1}
              expandAll={expandAll}
              onCopyValue={onCopyValue}
              copiedPath={copiedPath}
            />
          ))}
        </div>
      </details>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <details open={expandAll} className="group">
        <summary
          className={cn(
            "flex items-center gap-1.5 py-1 cursor-pointer select-none list-none",
            "text-[13px] font-mono text-txt hover:bg-bg-tertiary/50 rounded pr-2 tr-smooth",
          )}
          style={{ paddingLeft: indent }}
        >
          <ChevronRight
            size={14}
            className="shrink-0 text-txt-muted group-open:rotate-90"
          />
          {keyName !== undefined && (
            <span className="text-txt-muted shrink-0">{keyName}:</span>
          )}
          <span className="text-txt-muted">{"{"}</span>
          <span className="text-txt-muted/80">{entries.length}</span>
          <span className="text-txt-muted">{"}"}</span>
        </summary>
        <div
          className="border-l border-border/60 mt-0.5 pl-2"
          style={{ marginLeft: indent + 8 }}
        >
          {entries.map(([k, v]) => (
            <TreeNode
              key={`${path}-${k}`}
              value={v}
              keyName={k}
              depth={depth + 1}
              expandAll={expandAll}
              onCopyValue={onCopyValue}
              copiedPath={copiedPath}
            />
          ))}
        </div>
      </details>
    );
  }

  if (typeof value === "string") {
    const display = value.length > 80 ? `${value.slice(0, 80)}…` : value;
    return (
      <div
        className="flex items-center gap-1.5 py-0.5 text-[13px] font-mono group"
        style={{ paddingLeft: indent }}
      >
        {keyName !== undefined && (
          <span className="text-txt-muted shrink-0">{keyName}:</span>
        )}
        <span
          className={cn(
            "text-accent rounded px-0.5 -mx-0.5",
            copiedPath === path && "bg-success/15",
          )}
        >
          &quot;{display}&quot;
        </span>
        <button
          type="button"
          onClick={() => onCopyValue(path, value)}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-bg-tertiary tr-smooth"
          title="Copy value"
        >
          <Copy size={10} className="text-txt-muted" />
        </button>
      </div>
    );
  }

  if (typeof value === "number" || typeof value === "bigint") {
    const str = String(value);
    return (
      <div
        className="flex items-center gap-1.5 py-0.5 text-[13px] font-mono"
        style={{ paddingLeft: indent }}
      >
        {keyName !== undefined && (
          <span className="text-txt-muted shrink-0">{keyName}:</span>
        )}
        <span className="text-emerald-600 dark:text-emerald-400">{str}</span>
        <button
          type="button"
          onClick={() => onCopyValue(path, str)}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-bg-tertiary tr-smooth"
          title="Copy"
        >
          <Copy size={10} className="text-txt-muted" />
        </button>
      </div>
    );
  }

  if (typeof value === "boolean") {
    const str = String(value);
    return (
      <div
        className="flex items-center gap-1.5 py-0.5 text-[13px] font-mono group"
        style={{ paddingLeft: indent }}
      >
        {keyName !== undefined && (
          <span className="text-txt-muted shrink-0">{keyName}:</span>
        )}
        <span className="text-amber-600 dark:text-amber-400">{str}</span>
        <button
          type="button"
          onClick={() => onCopyValue(path, str)}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-bg-tertiary tr-smooth"
          title="Copy"
        >
          <Copy size={10} className="text-txt-muted" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 py-0.5 text-[13px] font-mono"
      style={{ paddingLeft: indent }}
    >
      {keyName !== undefined && (
        <span className="text-txt-muted shrink-0">{keyName}:</span>
      )}
      <span className="text-txt-muted">{String(value)}</span>
    </div>
  );
}

export default function JsonToTreeClient() {
  const [input, setInput] = useState(DEFAULT_JSON);
  const [copied, setCopied] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(true);

  const parsed = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return { value: null, error: null as string | null };
    try {
      const value = JSON.parse(trimmed) as unknown;
      return { value, error: null as string | null };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : "Invalid JSON",
      };
    }
  }, [input]);

  const copyInput = useCallback(async () => {
    if (!input.trim()) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [input]);

  const copyValue = useCallback((path: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 1200);
  }, []);

  const formatJson = useCallback(() => {
    if (!input.trim()) return;
    try {
      const formatted = JSON.stringify(JSON.parse(input), null, 2);
      setInput(formatted);
    } catch {
      // Invalid JSON, ignore
    }
  }, [input]);

  const loadExample = useCallback(() => {
    setInput(DEFAULT_JSON);
  }, []);

  const isEmpty = !input.trim();
  const hasError = !!parsed.error;

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader
        title="JSON to Tree View"
        badge="JSON"
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              onClick={loadExample}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-glass hover:border-accent/30 tr-smooth"
            >
              <FileJson size={12} /> Example
            </button>
            <button
              onClick={formatJson}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-glass hover:border-accent/30 tr-smooth"
            >
              <Braces size={12} /> Format
            </button>
            <button
              onClick={copyInput}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tr-smooth",
                copied
                  ? "bg-success/15 text-success border border-success/20"
                  : "btn-accent",
              )}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy JSON"}
            </button>
          </div>
        }
      />

      <ToolPanels
        left={
          <ToolPanel title="JSON INPUT" statusClassName="bg-accent">
            <CodeEditor
              value={input}
              onChange={setInput}
              language="json"
              placeholder={DEFAULT_JSON}
            />
          </ToolPanel>
        }
        right={
          <ToolPanel
            title="TREE VIEW"
            statusClassName={hasError ? "bg-error" : "bg-success"}
            frameClassName="overflow-hidden p-3 flex flex-col min-h-0"
          >
            {hasError ? (
              <div className="flex items-start gap-2 p-3 rounded-xl border border-error/20 bg-error/5 text-xs text-error">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{parsed.error}</span>
              </div>
            ) : isEmpty ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-bg-tertiary flex items-center justify-center">
                  <FileJson size={24} className="text-txt-muted" />
                </div>
                <p className="text-sm text-txt-muted">
                  Paste or type JSON to view as a tree
                </p>
                <button
                  onClick={loadExample}
                  className="px-3 py-1.5 rounded-lg text-xs btn-glass hover:border-accent/30 tr-smooth"
                >
                  Load example
                </button>
              </div>
            ) : (
              <div className="flex flex-1 flex-col min-h-0">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60 shrink-0">
                  <button
                    onClick={() => setExpandAll(true)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded text-[11px] tr-smooth",
                      expandAll
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "btn-glass hover:border-accent/30",
                    )}
                  >
                    <ChevronDown size={12} /> Expand all
                  </button>
                  <button
                    onClick={() => setExpandAll(false)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded text-[11px] tr-smooth",
                      !expandAll
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "btn-glass hover:border-accent/30",
                    )}
                  >
                    <ChevronRight size={12} /> Collapse all
                  </button>
                </div>
                <div className="flex-1 min-h-0 rounded-lg border border-border/60 bg-bg-primary overflow-auto p-3 mt-2">
                  <TreeNode
                    key={expandAll ? "expanded" : "collapsed"}
                    value={parsed.value}
                    depth={0}
                    expandAll={expandAll}
                    onCopyValue={copyValue}
                    copiedPath={copiedPath}
                  />
                </div>
              </div>
            )}
          </ToolPanel>
        }
      />
    </div>
  );
}
