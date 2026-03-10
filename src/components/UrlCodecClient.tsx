"use client";
import { ArrowDownUp, Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

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
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border gap-3 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 pl-10 md:pl-0 min-w-0 flex-1">
          <h2 className="text-base md:text-lg font-semibold text-txt truncate">
            URL Encode / Decode
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/15">
            Encoding
          </span>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={copy}
            disabled={!output}
            className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tr-smooth ${copied ? "bg-success/15 text-success border border-success/20" : output ? "btn-accent" : "btn-glass opacity-50 cursor-not-allowed"}`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-4 gap-4 overflow-y-auto lg:overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 min-h-[250px] lg:min-h-0">
          <div className="flex items-center gap-2 px-3 py-2 text-xs border-b border-border shrink-0">
            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
            <span className="font-medium text-txt-muted">INPUT</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Paste text or URL here..."
            className="flex-1 w-full p-4 text-sm font-mono leading-relaxed rounded-b-xl border border-border bg-bg-secondary text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/30 resize-none tr-smooth"
          />
        </div>

        <div className="flex lg:flex-col items-center justify-center gap-3 py-2 lg:py-0 shrink-0">
          {/* Mode toggle */}
          <div className="flex lg:flex-col items-center rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => {
                setMode("encode");
                if (input) process(input, "encode");
              }}
              className={`px-3 py-1.5 text-xs font-medium tr-smooth ${mode === "encode" ? "bg-accent/15 text-accent" : "text-txt-muted hover:text-txt-sec"}`}
            >
              Encode
            </button>
            <button
              onClick={() => {
                setMode("decode");
                if (input) process(input, "decode");
              }}
              className={`px-3 py-1.5 text-xs font-medium tr-smooth ${mode === "decode" ? "bg-accent/15 text-accent" : "text-txt-muted hover:text-txt-sec"}`}
            >
              Decode
            </button>
          </div>
          {/* Swap button */}
          <button
            onClick={swap}
            disabled={!output}
            className="p-2 rounded-lg btn-glass hover:border-accent/30 disabled:opacity-30 disabled:cursor-not-allowed tr-smooth"
            title="Swap input ↔ output"
          >
            <ArrowDownUp size={16} className="lg:rotate-0 rotate-90" />
          </button>
        </div>

        <div className="flex-1 flex flex-col min-w-0 min-h-[250px] lg:min-h-0">
          <div className="flex items-center gap-2 px-3 py-2 text-xs border-b border-border shrink-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${error ? "bg-error" : "bg-success"}`}
            />
            <span className="font-medium text-txt-muted">OUTPUT</span>
            <span className="text-txt-muted/50">
              — {mode === "encode" ? "Encoded" : "Decoded"}
            </span>
          </div>
          {error ? (
            <div className="flex-1 rounded-b-xl border border-error/20 bg-error/5 p-4 text-xs text-error font-mono">
              {error}
            </div>
          ) : (
            <textarea
              value={output}
              readOnly
              placeholder="Output will appear here..."
              className="flex-1 w-full p-4 text-sm font-mono leading-relaxed rounded-b-xl border border-border bg-bg-secondary text-txt placeholder:text-txt-muted resize-none cursor-default"
            />
          )}
        </div>
      </div>
    </div>
  );
}
