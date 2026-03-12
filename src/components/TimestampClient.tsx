"use client";

import { format, formatDistanceToNow, isValid } from "date-fns";
import { Check, Clock, Copy, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";
import { cn } from "@/lib/utils";

function detectAndParse(val: string): Date | null {
  const trimmed = val.trim();
  if (!trimmed) return null;

  const num = Number(trimmed);
  if (!Number.isNaN(num) && Number.isFinite(num)) {
    if (num > 4_102_444_800) return new Date(num);
    return new Date(num * 1000);
  }

  const parsed = new Date(trimmed);
  if (isValid(parsed)) return parsed;

  return null;
}

const QUICK_PRESETS = [
  { label: "Now", get: () => Math.floor(Date.now() / 1000) },
  {
    label: "Today 00:00",
    get: () => Math.floor(new Date().setHours(0, 0, 0, 0) / 1000),
  },
  {
    label: "1h ago",
    get: () => Math.floor((Date.now() - 3600 * 1000) / 1000),
  },
  {
    label: "1d ago",
    get: () => Math.floor((Date.now() - 86400 * 1000) / 1000),
  },
];

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
        "Could not parse. Try Unix timestamp (1700000000) or ISO date (2024-01-15T10:30:00Z)",
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
      <ToolHeader
        title="Timestamp Converter"
        badge="Utilities"
        rightSlot={
          <button
            onClick={setNow}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-glass hover:border-accent/30 tr-smooth"
          >
            <RefreshCw size={12} /> Now
          </button>
        }
      />

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* Left: Live clock + Input */}
        <section className="lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-bg-secondary/30">
          {/* Live clock - prominent */}
          <div className="p-4 md:p-5 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-accent" />
              <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Current time
              </span>
            </div>
            {mounted && (
              <div className="space-y-1">
                <p className="text-lg font-mono font-semibold text-txt tabular-nums">
                  {format(liveNow, "HH:mm:ss")}
                </p>
                <p className="text-xs font-mono text-txt-muted tabular-nums">
                  {format(liveNow, "EEE, MMM d, yyyy")}
                </p>
                <p className="text-[11px] font-mono text-txt-muted/80">
                  {Math.floor(liveNow / 1000)} ·{" "}
                  {new Date(liveNow).toISOString()}
                </p>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 md:p-5 flex flex-col gap-4 flex-1 min-h-0">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Convert
              </label>
              <input
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="1700000000 or 2024-01-15T10:30:00Z"
                className="w-full px-3 py-2.5 text-sm font-mono rounded-xl border border-border bg-bg-primary text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/40 tr-smooth"
                spellCheck={false}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleInput(String(p.get()))}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] btn-glass hover:border-accent/30 tr-smooth"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="p-3 rounded-xl border border-error/20 bg-error/5 text-xs text-error">
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Right: Results */}
        <section className="flex-1 min-h-0 overflow-auto p-4 md:p-6">
          {parsed ? (
            <div className="space-y-5 max-w-4xl">
              {/* Primary result */}
              <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4 md:p-5">
                <p className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider mb-2">
                  Converted
                </p>
                <p className="text-xl md:text-2xl font-mono font-semibold text-txt mb-1">
                  {format(parsed, "PPpp")}
                </p>
                <p className="text-sm text-txt-muted">
                  {formatDistanceToNow(parsed, { addSuffix: true })}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <CopyableChip
                    label="Unix (s)"
                    value={String(Math.floor(parsed.getTime() / 1000))}
                    onCopy={() =>
                      copy(
                        "unix-s",
                        String(Math.floor(parsed.getTime() / 1000)),
                      )
                    }
                    copied={copied === "unix-s"}
                  />
                  <CopyableChip
                    label="Unix (ms)"
                    value={String(parsed.getTime())}
                    onCopy={() => copy("unix-ms", String(parsed.getTime()))}
                    copied={copied === "unix-ms"}
                  />
                  <CopyableChip
                    label="ISO"
                    value={parsed.toISOString()}
                    onCopy={() => copy("iso", parsed.toISOString())}
                    copied={copied === "iso"}
                  />
                </div>
              </div>

              {/* All formats grid */}
              <div>
                <p className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider mb-3">
                  All formats
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  <ResultCard
                    label="Unix (seconds)"
                    value={String(Math.floor(parsed.getTime() / 1000))}
                    onCopy={() =>
                      copy(
                        "unix-s",
                        String(Math.floor(parsed.getTime() / 1000)),
                      )
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
                    onCopy={() =>
                      copy(
                        "rel",
                        formatDistanceToNow(parsed, { addSuffix: true }),
                      )
                    }
                    copied={copied === "rel"}
                  />
                  <ResultCard
                    label="Day of Week"
                    value={format(parsed, "EEEE")}
                    onCopy={() => copy("day", format(parsed, "EEEE"))}
                    copied={copied === "day"}
                  />
                  <ResultCard
                    label="Timezone"
                    value={`UTC${format(parsed, "xxx")}`}
                    onCopy={() => copy("tz", `UTC${format(parsed, "xxx")}`)}
                    copied={copied === "tz"}
                  />
                  <ResultCard
                    label="RFC 2822"
                    value={format(parsed, "EEE, dd MMM yyyy HH:mm:ss xxx")}
                    onCopy={() =>
                      copy(
                        "rfc2822",
                        format(parsed, "EEE, dd MMM yyyy HH:mm:ss xxx"),
                      )
                    }
                    copied={copied === "rfc2822"}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center">
              <div className="text-center max-w-sm">
                <Clock size={40} className="mx-auto mb-4 text-txt-muted/40" />
                <p className="text-sm font-medium text-txt-muted mb-1">
                  Enter a timestamp to convert
                </p>
                <p className="text-xs text-txt-muted/80">
                  Unix seconds (1700000000), milliseconds, or ISO date string
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {QUICK_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleInput(String(p.get()))}
                      className="px-3 py-2 rounded-xl text-xs btn-glass"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function CopyableChip({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <button
      onClick={onCopy}
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono tr-smooth",
        copied
          ? "bg-success/15 text-success border border-success/20"
          : "bg-bg-primary border border-border hover:border-accent/30",
      )}
    >
      <span className="text-txt-muted">{label}:</span>
      <span className="text-txt truncate max-w-48">{value}</span>
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function ResultCard({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-3 flex flex-col gap-2 min-w-0 hover:border-accent/20 tr-smooth">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider shrink-0">
          {label}
        </span>
        {onCopy && (
          <button
            onClick={onCopy}
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-lg tr-smooth shrink-0",
              copied
                ? "bg-success/15 text-success"
                : "btn-glass hover:border-accent/30",
            )}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
      </div>
      <p className="text-sm font-mono text-txt wrap-break-word" title={value}>
        {value}
      </p>
    </div>
  );
}
