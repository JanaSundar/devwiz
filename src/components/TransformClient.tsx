"use client";

import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ToolHeader from "@/components/tooling/ToolHeader";
import { useTransformWorker } from "@/hooks/useTransformWorker";
import { safeParseJson } from "@/lib/utils";
import { AI_TOOL_IDS, getTransformById, transforms } from "@/lib/registry";
import { cn } from "@/lib/utils";

const MAX_TRANSFORM_INPUT = 1.5 * 1024 * 1024; // 1.5MB
const MAX_SVG_FILE_SIZE = 1024 * 1024; // 1MB for upload

export default function TransformClient() {
  const params = useParams<{ toolId: string }>();
  const router = useRouter();
  const toolId = params.toolId;
  const tool = getTransformById(toolId);
  const { transform, isGenerating } = useTransformWorker();
  const isAiTool = !!toolId && AI_TOOL_IDS.has(toolId);

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFormattingSvg, setIsFormattingSvg] = useState(false);

  // SVGR Specific Options
  const [svgrOptions, setSvgrOptions] = useState({
    typescript: false,
    memo: false,
    svgo: true,
    icon: false,
    expandProps: "end" as "none" | "start" | "end",
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestCntRef = useRef(0);
  const [prevToolId, setPrevToolId] = useState(toolId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (toolId !== prevToolId) {
    setPrevToolId(toolId);
    setInput("");
    setOutput("");
    setError(null);
    setCopied(false);
  }

  useEffect(() => {
    if (!tool && transforms.length)
      router.replace(`/transform/${transforms[0].id}`);
  }, [tool, router]);

  const executeTransform = useCallback(
    async (val: string, opts = svgrOptions) => {
      const currentReq = ++requestCntRef.current;

      if (!val.trim()) {
        setOutput("");
        setError(null);
        return;
      }
      if (!toolId) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      const delay = AI_TOOL_IDS.has(toolId) ? 0 : 150;
      debounceRef.current = setTimeout(async () => {
        const onStream = AI_TOOL_IDS.has(toolId)
          ? (chunk: string) => {
              if (currentReq === requestCntRef.current) {
                setOutput((prev) => (prev !== chunk ? chunk : prev));
              }
            }
          : undefined;

        const r = await transform(toolId, val, onStream, opts);
        if (currentReq === requestCntRef.current) {
          let finalOutput = r.output;

          if (!r.error && finalOutput && tool?.outputLang === "json") {
            try {
              finalOutput = JSON.stringify(JSON.parse(finalOutput), null, 2);
            } catch {
              /* ignore if invalid */
            }
          }

          setOutput((prev) => (prev !== finalOutput ? finalOutput : prev));
          setError(r.error);
        }
      }, delay);
    },
    [toolId, transform, tool, svgrOptions],
  );

  const openSettings = useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-settings"));
  }, []);

  useEffect(() => {
    if (!isAiTool) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (input.trim() && !isGenerating) void executeTransform(input);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAiTool, input, isGenerating, executeTransform]);

  const handleInputChange = useCallback(
    (val: string) => {
      if (!isAiTool && val.length > MAX_TRANSFORM_INPUT) {
        setError(
          `Input too large (${(val.length / 1024).toFixed(0)}KB). Max 1.5MB.`,
        );
        return;
      }
      setInput(val);
      setError(null);
      if (isAiTool) return;
      void executeTransform(val);
    },
    [executeTransform, isAiTool],
  );

  const handleRun = useCallback(() => {
    void executeTransform(input);
  }, [executeTransform, input]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const handleExample = () => {
    if (!tool?.placeholder) return;
    setInput(tool.placeholder);
    if (!isAiTool) {
      void executeTransform(tool.placeholder);
    }
  };

  const handleFormat = () => {
    if (!input) return;
    try {
      if (tool?.inputLang === "json") {
        const formatted = JSON.stringify(JSON.parse(input), null, 2);
        if (formatted !== input) {
          setInput(formatted);
          if (!isAiTool) {
            void executeTransform(formatted);
          }
        }
      }
    } catch {
      setError("Invalid JSON format in Input");
    }
  };

  const handleSvgUpload = async (file: File | null) => {
    if (!file || toolId !== "svg-to-jsx") return;
    if (file.size > MAX_SVG_FILE_SIZE) {
      setError(`File too large (${(file.size / 1024).toFixed(0)}KB). Max 1MB.`);
      return;
    }
    try {
      const text = await file.text();
      if (text.length > MAX_TRANSFORM_INPUT) {
        setError(
          `SVG too large (${(text.length / 1024).toFixed(0)}KB). Max 1.5MB.`,
        );
        return;
      }
      setInput(text);
      setError(null);
      void executeTransform(text);
    } catch {
      setError("Failed to read file");
    }
  };

  const handleSvgPrettify = async () => {
    if (toolId !== "svg-to-jsx" || !input.trim()) return;
    setIsFormattingSvg(true);
    setError(null);
    try {
      const res = await fetch("/api/transform/svgo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          options: { formatOnly: true, pretty: true },
        }),
      });
      const data = await safeParseJson<{ output?: string; error?: string }>(
        res,
      );
      if (res.ok && data.output) {
        setInput(data.output);
        void executeTransform(data.output);
      } else {
        setError(data.error || "Failed to format SVG");
      }
    } catch {
      setError("Failed to format SVG");
    } finally {
      setIsFormattingSvg(false);
    }
  };

  if (!tool) return null;

  return (
    <div
      className={cn(
        "flex flex-col h-full anim-in",
        isAiTool && "bg-linear-to-b from-accent/5 via-accent/2 to-transparent",
      )}
    >
      <ToolHeader
        title={tool.name}
        badge={tool.category}
        rightSlot={
          <>
            {toolId === "svg-to-jsx" && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".svg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    handleSvgUpload(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-glass"
                >
                  <Upload size={12} />
                  Upload SVG
                </button>
              </>
            )}
            {!isAiTool && (
              <button
                onClick={handleExample}
                className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-glass hover:border-accent/30 tr-smooth"
              >
                <Sparkles size={12} />
                Example
              </button>
            )}
            {isAiTool && (
              <button
                onClick={handleRun}
                disabled={!input.trim() || isGenerating}
                className={cn(
                  "whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tr-smooth",
                  input.trim() && !isGenerating
                    ? "btn-accent shadow-[0_0_12px_var(--color-accent-glow)] hover:shadow-[0_0_16px_var(--color-accent-glow)]"
                    : "btn-accent opacity-50 cursor-not-allowed",
                )}
              >
                {isGenerating ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Wand2 size={12} />
                )}
                Run
              </button>
            )}
            {!isAiTool && (
              <button
                onClick={handleClear}
                className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-glass hover:border-accent/30 tr-smooth"
              >
                <Trash2 size={12} />
                Clear
              </button>
            )}
            <button
              onClick={handleCopy}
              disabled={!output}
              className={cn(
                "whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs tr-smooth",
                copied
                  ? "bg-success/15 text-success border border-success/20"
                  : output
                    ? "btn-accent"
                    : "btn-glass opacity-50 cursor-not-allowed",
              )}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </>
        }
      />

      {/* AI Tool hint bar */}
      {isAiTool && (
        <div className="px-4 md:px-6 py-3 border-b border-border/50 bg-bg-secondary/40 flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-txt-muted">
            <kbd className="px-2 py-0.5 rounded-lg bg-bg-primary border border-border font-mono text-[10px] shadow-sm">
              ⌘
            </kbd>
            <span>+</span>
            <kbd className="px-2 py-0.5 rounded-lg bg-bg-primary border border-border font-mono text-[10px] shadow-sm">
              Enter
            </kbd>
            <span>to run</span>
          </span>
          <span className="w-px h-4 bg-border/60" />
          <button
            type="button"
            onClick={openSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-accent hover:bg-accent/10 border border-transparent hover:border-accent/20 tr-smooth"
          >
            <Settings size={12} />
            <span>API Settings</span>
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-6 mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-xs anim-in">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <pre className="whitespace-pre-wrap font-mono">{error}</pre>
        </div>
      )}

      {/* SVG to JSX options bar */}
      {toolId === "svg-to-jsx" && (
        <div className="px-4 md:px-6 py-2.5 border-b border-border bg-bg-secondary/50 flex flex-wrap items-center gap-2 text-xs shrink-0">
          <span className="text-txt-muted font-medium mr-1">Options:</span>
          {[
            { key: "typescript", label: "TypeScript" },
            { key: "memo", label: "React.memo" },
            { key: "svgo", label: "Optimize" },
            { key: "icon", label: "Icon (1em)" },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                const newOpts = {
                  ...svgrOptions,
                  [opt.key]: !(svgrOptions[
                    opt.key as keyof typeof svgrOptions
                  ] as boolean),
                };
                setSvgrOptions(newOpts);
                void executeTransform(input, newOpts);
              }}
              className={cn(
                "px-2.5 py-1 rounded-lg border tr-smooth",
                (svgrOptions[opt.key as keyof typeof svgrOptions] as boolean)
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "bg-bg-primary border-border text-txt-muted hover:text-txt",
              )}
              aria-pressed={
                svgrOptions[opt.key as keyof typeof svgrOptions] as boolean
              }
            >
              {opt.label}
            </button>
          ))}
          <span className="text-border mx-1">|</span>
          <span className="text-txt-muted">Expand Props</span>
          <select
            className="bg-bg-primary border border-border rounded-lg px-2 py-1 text-[11px] text-txt focus:outline-none focus:border-accent/40 tr-smooth cursor-pointer"
            value={svgrOptions.expandProps}
            onChange={(e) => {
              const newOpts = {
                ...svgrOptions,
                expandProps: e.target.value as "none" | "start" | "end",
              };
              setSvgrOptions(newOpts);
              void executeTransform(input, newOpts);
            }}
          >
            <option value="none">None</option>
            <option value="start">Start</option>
            <option value="end">End</option>
          </select>
          <span className="text-border mx-1">|</span>
          <button
            onClick={handleSvgPrettify}
            disabled={!input.trim() || isFormattingSvg}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tr-smooth",
              !input.trim() || isFormattingSvg
                ? "opacity-50 cursor-not-allowed bg-bg-primary border border-border"
                : "bg-accent/10 border border-accent/25 text-accent hover:bg-accent/15 hover:border-accent/35",
            )}
          >
            {isFormattingSvg ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Wand2 size={12} />
            )}
            {isFormattingSvg ? "Formatting…" : "Format SVG"}
          </button>
        </div>
      )}

      {/* Editors */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-4 gap-4 lg:gap-5 overflow-hidden">
          <div className="flex flex-col min-w-0 min-h-[300px] lg:min-h-0 flex-1 basis-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-txt-muted border-b border-border shrink-0 rounded-t-xl border-x border-t bg-bg-secondary">
              <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
              <span className="font-medium shrink-0">
                {toolId === "svg-to-jsx"
                  ? "SVG"
                  : toolId === "tailwind-to-css"
                    ? "Tailwind"
                    : "INPUT"}
              </span>
              <span className="text-txt-muted/50 truncate">
                — {tool.inputLabel}
              </span>
              {!isAiTool && tool?.inputLang === "json" && (
                <button
                  onClick={handleFormat}
                  className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded bg-accent/10 text-accent hover:bg-accent/20 tr-smooth text-[11px] font-medium"
                >
                  <Wand2 size={12} /> Format
                </button>
              )}
            </div>
            <div className="flex-1 min-h-0 rounded-b-xl border border-t-0 border-border bg-bg-secondary overflow-hidden flex flex-col">
              <CodeEditor
                value={input}
                onChange={handleInputChange}
                language={tool.inputLang}
                placeholder={tool.placeholder}
              />
            </div>
          </div>

          <div className="flex lg:flex-col items-center justify-center py-2 lg:py-0 shrink-0">
            <div className="w-full lg:w-px h-px lg:h-full bg-linear-to-r lg:bg-linear-to-b from-transparent via-accent/20 to-transparent" />
          </div>

          <div className="flex flex-col min-w-0 min-h-[300px] lg:min-h-0 flex-1 basis-0 overflow-hidden">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-xs text-txt-muted border-b border-border shrink-0 rounded-t-xl border-x border-t bg-bg-secondary",
                isAiTool &&
                  isGenerating &&
                  "bg-amber-500/5 border-amber-500/20",
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  isGenerating ? "bg-amber-400 animate-pulse" : "bg-success",
                )}
              />
              <span className="font-medium shrink-0">
                {toolId === "svg-to-jsx"
                  ? "React JSX"
                  : toolId === "tailwind-to-css"
                    ? "CSS"
                    : "OUTPUT"}
              </span>
              <span className="text-txt-muted/50 truncate">
                — {tool.outputLabel}
              </span>
              {isGenerating && (
                <motion.span
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  className="ml-auto flex items-center gap-1.5 text-amber-500"
                >
                  <Loader2 size={12} className="animate-spin" />
                  <span className="text-[11px] font-medium">Generating…</span>
                </motion.span>
              )}
            </div>
            <div className="flex-1 min-h-0 rounded-b-xl border border-t-0 border-border bg-bg-secondary overflow-hidden flex flex-col">
              <CodeEditor
                value={output}
                language={tool.outputLang}
                readOnly
                placeholder={
                  toolId === "svg-to-jsx"
                    ? "Paste SVG or upload a file to generate React JSX…"
                    : toolId === "tailwind-to-css"
                      ? "Paste Tailwind classes to generate CSS…"
                      : isAiTool
                        ? "Paste your input and press Run or ⌘ Enter to generate…"
                        : `Paste ${tool.inputLabel.toLowerCase()} to convert…`
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
