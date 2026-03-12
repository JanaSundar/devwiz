"use client";

import { ArrowDownUp, Check, Copy, Link2 } from "lucide-react";
import { useCallback, useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";
import { cn } from "@/lib/utils";

const QUICK_EXAMPLES = [
  { label: "Hello World", value: "Hello World! How are you?" },
  { label: "URL", value: "https://example.com/path?query=value&foo=bar" },
  { label: "Special chars", value: "a+b=c & x=y" },
];

export default function UrlCodecClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const process = useCallback((text: string, m: "encode" | "decode") => {
    setInput(text);
    setError(null);
    if (!text.trim()) {
      setOutput("");
      return;
    }
    try {
      setOutput(
        m === "encode" ? encodeURIComponent(text) : decodeURIComponent(text),
      );
    } catch (err) {
      setError((err as Error).message);
      setOutput("");
    }
  }, []);

  const handleInput = (val: string) => process(val, mode);

  const swap = () => {
    const prev = output;
    const next = mode === "encode" ? "decode" : "encode";
    setMode(next);
    setInput(prev);
    process(prev, next);
  };

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader
        title="URL Encode / Decode"
        badge="Encoding"
        rightSlot={
          <button
            onClick={copy}
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
            {copied ? "Copied" : "Copy"}
          </button>
        }
      />

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* Left: Mode + Quick examples */}
        <section className="lg:w-[280px] xl:w-[320px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-bg-secondary/30">
          <div className="p-4 md:p-5 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={16} className="text-accent" />
              <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Mode
              </span>
            </div>
            <div className="flex rounded-xl border border-border overflow-hidden bg-bg-primary">
              <button
                onClick={() => {
                  setMode("encode");
                  if (input) process(input, "encode");
                }}
                className={cn(
                  "flex-1 px-3 py-2.5 text-sm font-medium tr-smooth",
                  mode === "encode"
                    ? "bg-accent/15 text-accent border border-accent/25"
                    : "text-txt-muted hover:text-txt",
                )}
              >
                Encode
              </button>
              <button
                onClick={() => {
                  setMode("decode");
                  if (input) process(input, "decode");
                }}
                className={cn(
                  "flex-1 px-3 py-2.5 text-sm font-medium tr-smooth",
                  mode === "decode"
                    ? "bg-accent/15 text-accent border border-accent/25"
                    : "text-txt-muted hover:text-txt",
                )}
              >
                Decode
              </button>
            </div>
          </div>

          <div className="p-4 md:p-5 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Quick examples
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => process(ex.value, mode)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] btn-glass hover:border-accent/30 tr-smooth"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={swap}
              disabled={!output}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium btn-glass hover:border-accent/30 disabled:opacity-40 disabled:cursor-not-allowed tr-smooth"
              title="Swap input ↔ output"
            >
              <ArrowDownUp size={14} />
              Swap
            </button>
          </div>
        </section>

        {/* Right: Input + Output */}
        <section className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border">
            <div className="px-4 py-2.5 border-b border-border shrink-0 bg-bg-secondary/50">
              <span className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">
                Input
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Paste text or URL here..."
              className="flex-1 w-full p-4 text-sm font-mono leading-relaxed bg-transparent border-none outline-none resize-none text-txt placeholder:text-txt-muted/50 focus:ring-0"
              spellCheck={false}
            />
          </div>

          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div
              className={cn(
                "px-4 py-2.5 border-b border-border shrink-0 bg-bg-secondary/50",
                error && "bg-error/5 border-error/20",
              )}
            >
              <span className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">
                Output
              </span>
              <span className="ml-2 text-[10px] text-txt-muted">
                — {mode === "encode" ? "Encoded" : "Decoded"}
              </span>
            </div>
            {error ? (
              <div className="flex-1 p-4 text-sm text-error font-mono overflow-auto">
                {error}
              </div>
            ) : (
              <textarea
                value={output}
                readOnly
                placeholder="Output will appear here..."
                className="flex-1 w-full p-4 text-sm font-mono leading-relaxed bg-transparent border-none outline-none resize-none text-txt placeholder:text-txt-muted/50 cursor-default"
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
