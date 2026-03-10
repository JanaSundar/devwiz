"use client";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { Check, Clock, Copy, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

function detectAndParse(val: string): Date | null {
  const trimmed = val.trim();
  if (!trimmed) return null;

  // Pure number → Unix timestamp
  const num = Number(trimmed);
  if (!Number.isNaN(num) && Number.isFinite(num)) {
    // If it looks like milliseconds (> year 2100 in seconds)
    if (num > 4_102_444_800) return new Date(num);
    return new Date(num * 1000);
  }

  // Try parsing as ISO/standard date string via date-fns
  const parsed = new Date(trimmed);
  if (isValid(parsed)) return parsed;

  return null;
}

export default function TimestampClient() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [liveNow, setLiveNow] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      setLiveNow(Date.now());
    }, 0);
    const iv = setInterval(() => setLiveNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const handleInput = useCallback((val: string) => {
    setInput(val);
    setError(null);
    setParsed(null);
    if (!val.trim()) return;
    const d = detectAndParse(val);
    if (d) setParsed(d);
    else
      setError(
        'Could not parse input. Try a Unix timestamp or a date string like "2024-01-15T10:30:00Z"',
      );
  }, []);

  const setNow = () => handleInput(String(Math.floor(Date.now() / 1000)));

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col h-full anim-in">
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border gap-3 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 pl-10 md:pl-0 min-w-0 flex-1">
          <h2 className="text-base md:text-lg font-semibold text-txt truncate">
            Timestamp Converter
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/15">
            Utilities
          </span>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Live clock */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg-secondary h-13.5">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-accent animate-pulse" />
              <span className="text-xs text-txt-muted font-medium">
                CURRENT TIME
              </span>
            </div>
            {mounted && (
              <div className="flex items-center gap-4 text-xs font-mono text-txt-sec">
                <span>{Math.floor(liveNow / 1000)}</span>
                <span className="text-txt-muted">|</span>
                <span>{new Date(liveNow).toISOString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Input
              </label>
              <button
                onClick={setNow}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] btn-glass hover:border-accent/30 tr-smooth"
              >
                <RefreshCw size={10} /> Now
              </button>
            </div>
            <input
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Unix timestamp (1700000000) or date string (2024-01-15T10:30:00Z)"
              className="w-full px-4 py-3 text-sm font-mono rounded-xl border border-border bg-bg-secondary text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/30 tr-smooth"
              spellCheck={false}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-error/20 bg-error/5 text-xs text-error font-mono">
              {error}
            </div>
          )}

          {parsed && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ResultCard
                label="Unix (seconds)"
                value={String(Math.floor(parsed.getTime() / 1000))}
                onCopy={() =>
                  copy("unix-s", String(Math.floor(parsed.getTime() / 1000)))
                }
                copied={copied === "unix-s"}
              />
              <ResultCard
                label="Unix (milliseconds)"
                value={String(parsed.getTime())}
                onCopy={() => copy("unix-ms", String(parsed.getTime()))}
                copied={copied === "unix-ms"}
              />
              <ResultCard
                label="ISO 8601"
                value={parsed.toISOString()}
                onCopy={() => copy("iso", parsed.toISOString())}
                copied={copied === "iso"}
              />
              <ResultCard
                label="UTC"
                value={parsed.toUTCString()}
                onCopy={() => copy("utc", parsed.toUTCString())}
                copied={copied === "utc"}
              />
              <ResultCard
                label="Local"
                value={format(parsed, "PPpp")}
                onCopy={() => copy("local", format(parsed, "PPpp"))}
                copied={copied === "local"}
              />
              <ResultCard
                label="Relative"
                value={formatDistanceToNow(parsed, { addSuffix: true })}
                highlight
              />
              <ResultCard
                label="Day of Week"
                value={format(parsed, "EEEE")}
                onCopy={() => copy("day", format(parsed, "EEEE"))}
                copied={copied === "day"}
              />
              <ResultCard
                label="Timezone Offset"
                value={`UTC${format(parsed, "xxx")}`}
                onCopy={() => copy("oz", `UTC${format(parsed, "xxx")}`)}
                copied={copied === "oz"}
              />
            </div>
          )}

          {!parsed && !error && !input && (
            <div className="text-center py-12 text-xs text-txt-muted">
              Enter a Unix timestamp or date string to convert
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  onCopy,
  copied,
  highlight,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${highlight ? "border-accent/20 bg-accent/5" : "border-border bg-bg-secondary"}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">
          {label}
        </span>
        {onCopy && (
          <button
            onClick={onCopy}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] btn-glass tr-smooth"
          >
            {copied ? <Check size={9} /> : <Copy size={9} />}
          </button>
        )}
      </div>
      <p
        className={`text-sm font-mono break-all ${highlight ? "text-accent font-medium" : "text-txt-sec"}`}
      >
        {value}
      </p>
    </div>
  );
}
