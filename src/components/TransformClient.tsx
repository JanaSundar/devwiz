"use client";
import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ThemeToggle from "@/components/ThemeToggle";
import { useTransformWorker } from "@/hooks/useTransformWorker";
import { AI_TOOL_IDS, getTransformById, transforms } from "@/lib/registry";
import { cn } from "@/lib/utils";

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

  const handleInputChange = useCallback(
    (val: string) => {
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

  if (!tool) return null;

  return (
    <div className="flex flex-col h-full anim-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-6 py-4 border-b border-border gap-3 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 pl-10 md:pl-0 min-w-0 flex-1">
          <h2 className="text-base md:text-lg font-semibold text-txt truncate">
            {tool.name}
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/15">
            {tool.category}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 overflow-x-auto md:justify-end">
          <button
            onClick={handleExample}
            className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs btn-glass"
          >
            <Sparkles size={12} />
            Example
          </button>
          {isAiTool && (
            <button
              onClick={handleRun}
              disabled={!input.trim() || isGenerating}
              className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Wand2 size={12} />
              )}
              Run
            </button>
          )}
          <button
            onClick={handleClear}
            className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs btn-glass"
          >
            <Trash2 size={12} />
            Clear
          </button>
          <button
            onClick={handleCopy}
            disabled={!output}
            className={cn(
              "whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tr-smooth",
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
          <ThemeToggle />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-xs anim-in">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <pre className="whitespace-pre-wrap font-mono">{error}</pre>
        </div>
      )}

      {/* SVGR Options (Only visible for SVG to JSX tool) */}
      {toolId === "svg-to-jsx" && (
        <div className="mx-6 mt-4 p-1 rounded-2xl border border-border bg-bg-secondary/40 backdrop-blur-sm overflow-hidden anim-in">
          <div className="flex flex-wrap items-center gap-px bg-border/20">
            {/* Switches */}
            {[
              { key: "typescript", label: "TypeScript" },
              { key: "memo", label: "React.memo" },
              { key: "svgo", label: "Optimize" },
              { key: "icon", label: "Icon (1em)" },
            ].map((opt) => (
              <div
                key={opt.key}
                className="flex-1 min-w-[120px] p-3 bg-bg-secondary/40 flex items-center justify-between group hover:bg-glass-hover tr-smooth"
              >
                <span className="text-[11px] font-medium text-txt-muted group-hover:text-txt tr-smooth select-none">
                  {opt.label}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={
                      svgrOptions[
                        opt.key as keyof typeof svgrOptions
                      ] as boolean
                    }
                    onChange={(e) => {
                      const newOpts = {
                        ...svgrOptions,
                        [opt.key]: e.target.checked,
                      };
                      setSvgrOptions(newOpts);
                      void executeTransform(input, newOpts);
                    }}
                  />
                  <div className="w-8 h-4.5 bg-bg border border-border rounded-full peer peer-checked:bg-accent/20 peer-checked:border-accent/40 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-txt-muted peer-checked:after:bg-accent after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-3.5 tr-smooth"></div>
                </label>
              </div>
            ))}

            {/* Expand Props Select */}
            <div className="flex-[1.5] min-w-[180px] p-3 bg-bg-secondary/40 flex items-center justify-between group hover:bg-glass-hover tr-smooth">
              <span className="text-[11px] font-medium text-txt-muted group-hover:text-txt tr-smooth select-none">
                Expand Props
              </span>
              <select
                className="bg-bg border border-border rounded-lg px-2 py-1 text-[11px] text-txt focus:outline-none focus:ring-1 focus:ring-accent/40 tr-smooth cursor-pointer"
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
            </div>
          </div>
        </div>
      )}

      {/* Editors */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-4 gap-4 overflow-y-auto lg:overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 min-h-[300px] lg:min-h-0">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-txt-muted border-b border-border shrink-0">
            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
            <span className="font-medium shrink-0">INPUT</span>
            <span className="text-txt-muted/50 truncate">
              — {tool.inputLabel}
            </span>
            {tool?.inputLang === "json" && (
              <button
                onClick={handleFormat}
                className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded bg-accent/10 text-accent hover:bg-accent/20 tr-smooth text-[11px] font-medium"
              >
                <Wand2 size={12} /> Format
              </button>
            )}
          </div>
          <div className="flex-1 rounded-b-xl border border-border bg-bg-secondary overflow-hidden flex flex-col">
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

        <div className="flex-1 flex flex-col min-w-0 min-h-[300px] lg:min-h-0">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-txt-muted border-b border-border shrink-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${isGenerating ? "bg-amber-400 animate-pulse" : "bg-success"}`}
            />
            <span className="font-medium shrink-0">OUTPUT</span>
            <span className="text-txt-muted/50 truncate">
              — {tool.outputLabel}
            </span>
            {isGenerating && (
              <span className="ml-auto flex items-center gap-1.5 text-amber-400 animate-pulse">
                <Loader2 size={12} className="animate-spin" />
                <span className="text-[11px] font-medium">Generating...</span>
              </span>
            )}
          </div>
          <div className="flex-1 rounded-b-xl border border-border bg-bg-secondary overflow-hidden flex flex-col">
            <CodeEditor
              value={output}
              language={tool.outputLang}
              readOnly
              placeholder="Output will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
