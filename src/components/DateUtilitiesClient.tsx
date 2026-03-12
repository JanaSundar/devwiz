"use client";

import {
  add,
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addWeeks,
  addYears,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isBefore,
  isEqual,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  sub,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { Calendar, Check, Copy, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";
import { cn } from "@/lib/utils";

type Tab = "format" | "add-sub" | "diff" | "boundaries";

const FORMAT_PRESETS = [
  { label: "ISO 8601", value: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx" },
  { label: "Date only", value: "yyyy-MM-dd" },
  { label: "Time only", value: "HH:mm:ss" },
  { label: "Full", value: "PPpp" },
  { label: "Short", value: "P" },
  { label: "RFC 2822", value: "EEE, dd MMM yyyy HH:mm:ss xxx" },
];

const ADD_SUB_UNITS = [
  {
    key: "seconds",
    label: "Seconds",
    add: (d: Date, n: number) => add(d, { seconds: n }),
    sub: (d: Date, n: number) => sub(d, { seconds: n }),
  },
  {
    key: "minutes",
    label: "Minutes",
    add: (d: Date, n: number) => addMinutes(d, n),
    sub: (d: Date, n: number) => subMinutes(d, n),
  },
  {
    key: "hours",
    label: "Hours",
    add: (d: Date, n: number) => addHours(d, n),
    sub: (d: Date, n: number) => subHours(d, n),
  },
  {
    key: "days",
    label: "Days",
    add: (d: Date, n: number) => addDays(d, n),
    sub: (d: Date, n: number) => subDays(d, n),
  },
  {
    key: "weeks",
    label: "Weeks",
    add: (d: Date, n: number) => addWeeks(d, n),
    sub: (d: Date, n: number) => subWeeks(d, n),
  },
  {
    key: "months",
    label: "Months",
    add: (d: Date, n: number) => addMonths(d, n),
    sub: (d: Date, n: number) => subMonths(d, n),
  },
  {
    key: "years",
    label: "Years",
    add: (d: Date, n: number) => addYears(d, n),
    sub: (d: Date, n: number) => subYears(d, n),
  },
];

const BOUNDARY_OPS = [
  { key: "startOfDay", label: "Start of Day", fn: startOfDay },
  { key: "endOfDay", label: "End of Day", fn: endOfDay },
  {
    key: "startOfWeek",
    label: "Start of Week",
    fn: (d: Date) => startOfWeek(d, { weekStartsOn: 0 }),
  },
  {
    key: "endOfWeek",
    label: "End of Week",
    fn: (d: Date) => endOfWeek(d, { weekStartsOn: 0 }),
  },
  { key: "startOfMonth", label: "Start of Month", fn: startOfMonth },
  { key: "endOfMonth", label: "End of Month", fn: endOfMonth },
  { key: "startOfYear", label: "Start of Year", fn: startOfYear },
  { key: "endOfYear", label: "End of Year", fn: endOfYear },
];

const QUICK_PRESETS = [
  { label: "Now", get: () => Math.floor(Date.now() / 1000) },
  {
    label: "Today 00:00",
    get: () => Math.floor(new Date().setHours(0, 0, 0, 0) / 1000),
  },
  {
    label: "1d ago",
    get: () => Math.floor((Date.now() - 86400 * 1000) / 1000),
  },
];

function parseInput(val: string): Date | null {
  const trimmed = val.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (!Number.isNaN(num) && Number.isFinite(num)) {
    if (num > 4_102_444_800) return new Date(num);
    return new Date(num * 1000);
  }
  try {
    const parsed = parseISO(trimmed);
    if (isValid(parsed)) return parsed;
  } catch {}
  const d = new Date(trimmed);
  return isValid(d) ? d : null;
}

export default function DateUtilitiesClient() {
  const [activeTab, setActiveTab] = useState<Tab>("format");
  const [liveNow, setLiveNow] = useState(Date.now());
  const [mounted, setMounted] = useState(false);

  const [formatInput, setFormatInput] = useState("");
  const [formatPattern, setFormatPattern] = useState("yyyy-MM-dd'T'HH:mm:ss");
  const [formatOutput, setFormatOutput] = useState("");
  const [formatError, setFormatError] = useState("");

  const [addSubInput, setAddSubInput] = useState("");
  const [addSubAmount, setAddSubAmount] = useState(1);
  const [addSubUnit, setAddSubUnit] = useState(3);
  const [addSubOp, setAddSubOp] = useState<"add" | "sub">("add");
  const [addSubOutput, setAddSubOutput] = useState<Date | null>(null);
  const [addSubError, setAddSubError] = useState("");

  const [diffDateA, setDiffDateA] = useState("");
  const [diffDateB, setDiffDateB] = useState("");
  const [diffOutput, setDiffOutput] = useState<Record<string, number> | null>(
    null,
  );
  const [diffCompare, setDiffCompare] = useState<
    "before" | "after" | "equal" | null
  >(null);
  const [diffError, setDiffError] = useState("");

  const [boundInput, setBoundInput] = useState("");
  const [boundOutputs, setBoundOutputs] = useState<Record<string, string>>({});
  const [boundError, setBoundError] = useState("");

  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const iv = setInterval(() => setLiveNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const copyToClipboard = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  }, []);

  useEffect(() => {
    if (activeTab !== "format") return;
    setFormatError("");
    setFormatOutput("");
    const base = formatInput.trim()
      ? parseInput(formatInput)
      : new Date(liveNow);
    if (!base) {
      setFormatError("Could not parse date");
      return;
    }
    try {
      setFormatOutput(format(base, formatPattern));
    } catch (e) {
      setFormatError(e instanceof Error ? e.message : "Invalid format");
    }
  }, [activeTab, formatInput, formatPattern, liveNow]);

  useEffect(() => {
    if (activeTab !== "add-sub") return;
    setAddSubError("");
    setAddSubOutput(null);
    const base = addSubInput.trim()
      ? parseInput(addSubInput)
      : new Date(liveNow);
    if (!base) {
      setAddSubError("Could not parse date");
      return;
    }
    const unit = ADD_SUB_UNITS[addSubUnit];
    try {
      const result =
        addSubOp === "add"
          ? unit.add(base, addSubAmount)
          : unit.sub(base, addSubAmount);
      setAddSubOutput(result);
    } catch {
      setAddSubError("Invalid operation");
    }
  }, [activeTab, addSubInput, addSubAmount, addSubUnit, addSubOp, liveNow]);

  useEffect(() => {
    if (activeTab !== "diff") return;
    setDiffError("");
    setDiffOutput(null);
    setDiffCompare(null);
    const a = parseInput(diffDateA);
    const b = parseInput(diffDateB);
    if (!a || !b) return;
    try {
      setDiffOutput({
        seconds: differenceInSeconds(b, a),
        minutes: differenceInMinutes(b, a),
        hours: differenceInHours(b, a),
        days: differenceInDays(b, a),
      });
      if (isEqual(a, b)) setDiffCompare("equal");
      else if (isBefore(a, b)) setDiffCompare("before");
      else setDiffCompare("after");
    } catch {
      setDiffError("Could not compute difference");
    }
  }, [activeTab, diffDateA, diffDateB]);

  useEffect(() => {
    if (activeTab !== "boundaries") return;
    setBoundError("");
    setBoundOutputs({});
    const base = boundInput.trim() ? parseInput(boundInput) : new Date(liveNow);
    if (!base) {
      setBoundError("Could not parse date");
      return;
    }
    const out: Record<string, string> = {};
    for (const op of BOUNDARY_OPS) {
      try {
        out[op.key] = format(op.fn(base), "yyyy-MM-dd HH:mm:ss");
      } catch {
        out[op.key] = "—";
      }
    }
    setBoundOutputs(out);
  }, [activeTab, boundInput, liveNow]);

  const setNow = (setter: (v: string) => void) => {
    setter(String(Math.floor(Date.now() / 1000)));
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "format", label: "Format" },
    { key: "add-sub", label: "Add / Subtract" },
    { key: "diff", label: "Difference" },
    { key: "boundaries", label: "Boundaries" },
  ];

  const hasResult =
    (activeTab === "format" && formatOutput) ||
    (activeTab === "add-sub" && addSubOutput) ||
    (activeTab === "diff" && diffOutput) ||
    (activeTab === "boundaries" && Object.keys(boundOutputs).length > 0);

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader
        title="Date Utilities"
        badge="Utilities"
        rightSlot={
          <button
            onClick={() => {
              const v = String(Math.floor(Date.now() / 1000));
              if (activeTab === "format") setFormatInput(v);
              else if (activeTab === "add-sub") setAddSubInput(v);
              else if (activeTab === "diff") {
                setDiffDateA(v);
                setDiffDateB(v);
              } else setBoundInput(v);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-glass hover:border-accent/30 tr-smooth"
          >
            <RefreshCw size={12} /> Now
          </button>
        }
      />

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* Left: Live clock + Tabs + Inputs */}
        <section className="lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-bg-secondary/30">
          {/* Live clock */}
          <div className="p-4 md:p-5 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-accent" />
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
                  {format(liveNow, "yyyy-MM-dd HH:mm:ss")}
                </p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex shrink-0 gap-1 px-4 py-2 border-b border-border">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium tr-smooth",
                  activeTab === key
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "text-txt-muted hover:text-txt hover:bg-bg-primary border border-transparent",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab-specific inputs */}
          <div className="p-4 md:p-5 flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto">
            {activeTab === "format" && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                    Base Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={formatInput}
                      onChange={(e) => setFormatInput(e.target.value)}
                      placeholder="Empty = now"
                      className="flex-1 px-3 py-2.5 text-sm font-mono rounded-xl border border-border bg-bg-primary text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/40 tr-smooth"
                    />
                    <button
                      type="button"
                      onClick={() => setNow(setFormatInput)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] btn-glass"
                    >
                      Now
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                    Format Pattern
                  </label>
                  <input
                    value={formatPattern}
                    onChange={(e) => setFormatPattern(e.target.value)}
                    placeholder="yyyy-MM-dd HH:mm:ss"
                    className="w-full px-3 py-2.5 text-sm font-mono rounded-xl border border-border bg-bg-primary text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/40 tr-smooth"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {FORMAT_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setFormatPattern(p.value)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] btn-glass hover:border-accent/30 tr-smooth"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setFormatInput(String(p.get()))}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] btn-glass hover:border-accent/30 tr-smooth"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {formatError && (
                  <div className="p-3 rounded-xl border border-error/20 bg-error/5 text-xs text-error">
                    {formatError}
                  </div>
                )}
              </>
            )}

            {activeTab === "add-sub" && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                    Base Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={addSubInput}
                      onChange={(e) => setAddSubInput(e.target.value)}
                      placeholder="Empty = now"
                      className="flex-1 px-3 py-2.5 text-sm font-mono rounded-xl border border-border bg-bg-primary text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/40 tr-smooth"
                    />
                    <button
                      type="button"
                      onClick={() => setNow(setAddSubInput)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] btn-glass"
                    >
                      Now
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex gap-1 p-1 rounded-lg bg-bg-primary border border-border">
                    <button
                      type="button"
                      onClick={() => setAddSubOp("add")}
                      className={cn(
                        "px-2 py-1 rounded text-[11px] tr-smooth",
                        addSubOp === "add"
                          ? "bg-accent/15 text-accent"
                          : "text-txt-muted hover:text-txt",
                      )}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddSubOp("sub")}
                      className={cn(
                        "px-2 py-1 rounded text-[11px] tr-smooth",
                        addSubOp === "sub"
                          ? "bg-accent/15 text-accent"
                          : "text-txt-muted hover:text-txt",
                      )}
                    >
                      Sub
                    </button>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={999999}
                    value={addSubAmount}
                    onChange={(e) =>
                      setAddSubAmount(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="w-16 px-2 py-1.5 rounded-lg border border-border bg-bg-primary text-sm text-txt"
                  />
                  <select
                    value={addSubUnit}
                    onChange={(e) => setAddSubUnit(Number(e.target.value))}
                    className="rounded-lg border border-border bg-bg-primary px-2 py-1.5 text-sm text-txt"
                  >
                    {ADD_SUB_UNITS.map((u, i) => (
                      <option key={u.key} value={i}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
                {addSubError && (
                  <div className="p-3 rounded-xl border border-error/20 bg-error/5 text-xs text-error">
                    {addSubError}
                  </div>
                )}
              </>
            )}

            {activeTab === "diff" && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                    Date A
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={diffDateA}
                      onChange={(e) => setDiffDateA(e.target.value)}
                      placeholder="Timestamp or ISO"
                      className="flex-1 px-3 py-2.5 text-sm font-mono rounded-xl border border-border bg-bg-primary text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/40 tr-smooth"
                    />
                    <button
                      type="button"
                      onClick={() => setNow(setDiffDateA)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] btn-glass"
                    >
                      Now
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                    Date B
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={diffDateB}
                      onChange={(e) => setDiffDateB(e.target.value)}
                      placeholder="Timestamp or ISO"
                      className="flex-1 px-3 py-2.5 text-sm font-mono rounded-xl border border-border bg-bg-primary text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/40 tr-smooth"
                    />
                    <button
                      type="button"
                      onClick={() => setNow(setDiffDateB)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] btn-glass"
                    >
                      Now
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-txt-muted">
                  A → B. Positive = B is after A.
                </p>
                {diffError && (
                  <div className="p-3 rounded-xl border border-error/20 bg-error/5 text-xs text-error">
                    {diffError}
                  </div>
                )}
              </>
            )}

            {activeTab === "boundaries" && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                    Base Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={boundInput}
                      onChange={(e) => setBoundInput(e.target.value)}
                      placeholder="Empty = now"
                      className="flex-1 px-3 py-2.5 text-sm font-mono rounded-xl border border-border bg-bg-primary text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/40 tr-smooth"
                    />
                    <button
                      type="button"
                      onClick={() => setNow(setBoundInput)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] btn-glass"
                    >
                      Now
                    </button>
                  </div>
                </div>
                {boundError && (
                  <div className="p-3 rounded-xl border border-error/20 bg-error/5 text-xs text-error">
                    {boundError}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Right: Results */}
        <section className="flex-1 min-h-0 overflow-auto p-4 md:p-6">
          {hasResult ? (
            <div className="space-y-5 max-w-4xl">
              {activeTab === "format" && formatOutput && (
                <>
                  <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4 md:p-5">
                    <p className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider mb-2">
                      Formatted
                    </p>
                    <p className="text-xl md:text-2xl font-mono font-semibold text-txt mb-3">
                      {formatOutput}
                    </p>
                    <CopyableChip
                      label="Copy"
                      value={formatOutput}
                      onCopy={() => copyToClipboard(formatOutput, "format")}
                      copied={copied === "format"}
                    />
                  </div>
                </>
              )}

              {activeTab === "add-sub" && addSubOutput && (
                <>
                  <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4 md:p-5">
                    <p className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider mb-2">
                      Result
                    </p>
                    <p className="text-xl md:text-2xl font-mono font-semibold text-txt mb-3">
                      {format(addSubOutput, "yyyy-MM-dd HH:mm:ss")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <CopyableChip
                        label="ISO"
                        value={addSubOutput.toISOString()}
                        onCopy={() =>
                          copyToClipboard(
                            addSubOutput.toISOString(),
                            "addsub-iso",
                          )
                        }
                        copied={copied === "addsub-iso"}
                      />
                      <CopyableChip
                        label="Unix (ms)"
                        value={String(addSubOutput.getTime())}
                        onCopy={() =>
                          copyToClipboard(
                            String(addSubOutput.getTime()),
                            "addsub-ms",
                          )
                        }
                        copied={copied === "addsub-ms"}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "diff" && diffOutput && (
                <>
                  <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4 md:p-5">
                    <p className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider mb-2">
                      Difference (A → B)
                    </p>
                    {diffCompare && (
                      <p className="text-sm text-txt-muted mb-3">
                        A is {diffCompare} B
                      </p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(diffOutput).map(([k, v]) => (
                        <ResultCard
                          key={k}
                          label={k}
                          value={String(v)}
                          onCopy={() => copyToClipboard(String(v), `diff-${k}`)}
                          copied={copied === `diff-${k}`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "boundaries" &&
                Object.keys(boundOutputs).length > 0 && (
                  <>
                    <div>
                      <p className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider mb-3">
                        Start / End of Period
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {BOUNDARY_OPS.map((op) => (
                          <ResultCard
                            key={op.key}
                            label={op.label}
                            value={boundOutputs[op.key] ?? "—"}
                            onCopy={() =>
                              copyToClipboard(
                                boundOutputs[op.key] ?? "",
                                `bound-${op.key}`,
                              )
                            }
                            copied={copied === `bound-${op.key}`}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center">
              <div className="text-center max-w-sm">
                <Calendar
                  size={40}
                  className="mx-auto mb-4 text-txt-muted/40"
                />
                <p className="text-sm font-medium text-txt-muted mb-1">
                  {activeTab === "format" && "Enter a date and format pattern"}
                  {activeTab === "add-sub" && "Enter a date and add/subtract"}
                  {activeTab === "diff" && "Enter two dates to compare"}
                  {activeTab === "boundaries" && "Enter a date for boundaries"}
                </p>
                <p className="text-xs text-txt-muted/80">
                  Use quick presets or leave empty for current time
                </p>
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
