"use client";

import { Check, Copy, Ruler } from "lucide-react";
import { useMemo, useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";
import { cn } from "@/lib/utils";

type UnitCategory = "length" | "weight" | "temperature" | "time" | "data";

type UnitDef = {
  name: string;
  short: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
};

const UNITS: Record<UnitCategory, Record<string, UnitDef>> = {
  length: {
    m: { name: "Meter", short: "m", toBase: (v) => v, fromBase: (v) => v },
    km: {
      name: "Kilometer",
      short: "km",
      toBase: (v) => v * 1000,
      fromBase: (v) => v / 1000,
    },
    cm: {
      name: "Centimeter",
      short: "cm",
      toBase: (v) => v / 100,
      fromBase: (v) => v * 100,
    },
    mm: {
      name: "Millimeter",
      short: "mm",
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    },
    mi: {
      name: "Mile",
      short: "mi",
      toBase: (v) => v * 1609.344,
      fromBase: (v) => v / 1609.344,
    },
    yd: {
      name: "Yard",
      short: "yd",
      toBase: (v) => v * 0.9144,
      fromBase: (v) => v / 0.9144,
    },
    ft: {
      name: "Foot",
      short: "ft",
      toBase: (v) => v * 0.3048,
      fromBase: (v) => v / 0.3048,
    },
    in: {
      name: "Inch",
      short: "in",
      toBase: (v) => v * 0.0254,
      fromBase: (v) => v / 0.0254,
    },
  },
  weight: {
    kg: { name: "Kilogram", short: "kg", toBase: (v) => v, fromBase: (v) => v },
    g: {
      name: "Gram",
      short: "g",
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    },
    mg: {
      name: "Milligram",
      short: "mg",
      toBase: (v) => v / 1e6,
      fromBase: (v) => v * 1e6,
    },
    lb: {
      name: "Pound",
      short: "lb",
      toBase: (v) => v * 0.453592,
      fromBase: (v) => v / 0.453592,
    },
    oz: {
      name: "Ounce",
      short: "oz",
      toBase: (v) => v * 0.0283495,
      fromBase: (v) => v / 0.0283495,
    },
  },
  temperature: {
    c: {
      name: "Celsius",
      short: "°C",
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    f: {
      name: "Fahrenheit",
      short: "°F",
      toBase: (v) => (v - 32) * (5 / 9),
      fromBase: (v) => v * (9 / 5) + 32,
    },
    k: {
      name: "Kelvin",
      short: "K",
      toBase: (v) => v - 273.15,
      fromBase: (v) => v + 273.15,
    },
  },
  time: {
    s: { name: "Second", short: "s", toBase: (v) => v, fromBase: (v) => v },
    min: {
      name: "Minute",
      short: "min",
      toBase: (v) => v * 60,
      fromBase: (v) => v / 60,
    },
    h: {
      name: "Hour",
      short: "h",
      toBase: (v) => v * 3600,
      fromBase: (v) => v / 3600,
    },
    d: {
      name: "Day",
      short: "d",
      toBase: (v) => v * 86400,
      fromBase: (v) => v / 86400,
    },
    wk: {
      name: "Week",
      short: "wk",
      toBase: (v) => v * 604800,
      fromBase: (v) => v / 604800,
    },
  },
  data: {
    b: { name: "Byte", short: "B", toBase: (v) => v, fromBase: (v) => v },
    kb: {
      name: "Kilobyte",
      short: "KB",
      toBase: (v) => v * 1000,
      fromBase: (v) => v / 1000,
    },
    mb: {
      name: "Megabyte",
      short: "MB",
      toBase: (v) => v * 1000 ** 2,
      fromBase: (v) => v / 1000 ** 2,
    },
    gb: {
      name: "Gigabyte",
      short: "GB",
      toBase: (v) => v * 1000 ** 3,
      fromBase: (v) => v / 1000 ** 3,
    },
    tb: {
      name: "Terabyte",
      short: "TB",
      toBase: (v) => v * 1000 ** 4,
      fromBase: (v) => v / 1000 ** 4,
    },
    kib: {
      name: "Kibibyte",
      short: "KiB",
      toBase: (v) => v * 1024,
      fromBase: (v) => v / 1024,
    },
    mib: {
      name: "Mebibyte",
      short: "MiB",
      toBase: (v) => v * 1024 ** 2,
      fromBase: (v) => v / 1024 ** 2,
    },
    gib: {
      name: "Gibibyte",
      short: "GiB",
      toBase: (v) => v * 1024 ** 3,
      fromBase: (v) => v / 1024 ** 3,
    },
  },
};

const CATEGORY_LABELS: Record<UnitCategory, string> = {
  length: "Length",
  weight: "Weight",
  temperature: "Temperature",
  time: "Time",
  data: "Data Size",
};

const QUICK_VALUES = [1, 10, 100];

function formatResult(result: number, category: UnitCategory): string {
  if (category === "data" && result >= 1) {
    return result.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  if (Math.abs(result) >= 1000 || (Math.abs(result) < 0.01 && result !== 0)) {
    return result.toExponential(4);
  }
  return result.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

export default function UnitConverterClient() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [inputValue, setInputValue] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const units = UNITS[category];
  const unitKeys = Object.keys(units);

  const baseValue = useMemo(() => {
    const num = Number.parseFloat(inputValue);
    if (Number.isNaN(num) || !Number.isFinite(num)) return null;
    const from = units[fromUnit];
    if (!from) return null;
    return from.toBase(num);
  }, [inputValue, fromUnit, units]);

  const allResults = useMemo(() => {
    if (baseValue === null) return null;
    const results: Record<string, number> = {};
    for (const key of unitKeys) {
      const to = units[key];
      if (to) results[key] = to.fromBase(baseValue);
    }
    return results;
  }, [baseValue, unitKeys, units]);

  const primaryResult = useMemo(() => {
    if (allResults === null) return null;
    return allResults[toUnit] ?? null;
  }, [allResults, toUnit]);

  const primaryResultStr =
    primaryResult !== null ? formatResult(primaryResult, category) : "";

  const copyResult = async (text: string, key: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  };

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader title="Unit Converter" badge="Utilities" />

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* Left: Category + Input */}
        <section className="lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-bg-secondary/30">
          {/* Category header */}
          <div className="p-4 md:p-5 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Ruler size={16} className="text-accent" />
              <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Category
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_LABELS) as UnitCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    const keys = Object.keys(UNITS[cat]);
                    setFromUnit(keys[0] ?? "");
                    setToUnit(keys[1] ?? keys[0] ?? "");
                  }}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-[11px] font-medium tr-smooth",
                    category === cat
                      ? "bg-accent/15 text-accent border border-accent/30"
                      : "btn-glass hover:border-accent/30",
                  )}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 md:p-5 flex flex-col gap-4 flex-1 min-h-0">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                From
              </label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-txt outline-none tr-smooth focus:border-accent/40"
              >
                {unitKeys.map((k) => (
                  <option key={k} value={k}>
                    {units[k].name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Value
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter number"
                className="w-full px-3 py-2.5 text-sm font-mono rounded-xl border border-border bg-bg-primary text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/40 tr-smooth"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_VALUES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setInputValue(String(v))}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] btn-glass hover:border-accent/30 tr-smooth"
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                To
              </label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-txt outline-none tr-smooth focus:border-accent/40"
              >
                {unitKeys.map((k) => (
                  <option key={k} value={k}>
                    {units[k].name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Right: Results */}
        <section className="flex-1 min-h-0 overflow-auto p-4 md:p-6">
          {allResults ? (
            <div className="space-y-5 max-w-4xl">
              {/* Primary result */}
              <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4 md:p-5">
                <p className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider mb-2">
                  Result
                </p>
                <p className="text-xl md:text-2xl font-mono font-semibold text-txt mb-1">
                  {primaryResultStr} {units[toUnit].short}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <CopyableChip
                    label="Copy"
                    value={`${primaryResultStr} ${units[toUnit].short}`}
                    onCopy={() =>
                      copyResult(
                        `${primaryResultStr} ${units[toUnit].short}`,
                        "primary",
                      )
                    }
                    copied={copied === "primary"}
                  />
                </div>
              </div>

              {/* All units grid */}
              <div>
                <p className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider mb-3">
                  All units
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {unitKeys.map((k) => (
                    <ResultCard
                      key={k}
                      label={units[k].short}
                      value={formatResult(allResults[k], category)}
                      onCopy={() =>
                        copyResult(formatResult(allResults[k], category), k)
                      }
                      copied={copied === k}
                      highlight={k === toUnit}
                    />
                  ))}
                </div>
              </div>

              {category === "data" && (
                <p className="text-[11px] text-txt-muted">
                  KB/MB/GB use decimal (1000); KiB/MiB/GiB use binary (1024).
                </p>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center">
              <div className="text-center max-w-sm">
                <Ruler size={40} className="mx-auto mb-4 text-txt-muted/40" />
                <p className="text-sm font-medium text-txt-muted mb-1">
                  Enter a value to convert
                </p>
                <p className="text-xs text-txt-muted/80">
                  Select category, from/to units, and enter a number
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {QUICK_VALUES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setInputValue(String(v))}
                      className="px-3 py-2 rounded-xl text-xs btn-glass"
                    >
                      {v}
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
      className={cn(
        "rounded-xl border p-3 flex flex-col gap-2 min-w-0 tr-smooth",
        highlight
          ? "border-accent/30 bg-accent/5"
          : "border-border bg-bg-secondary hover:border-accent/20",
      )}
    >
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
