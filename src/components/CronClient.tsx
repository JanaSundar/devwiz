"use client";

import { CronExpressionParser } from "cron-parser";
import cronstrue from "cronstrue";
import { format } from "date-fns";
import { Check, Clock3, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const EXAMPLES = [
  { expr: "*/5 * * * *", label: "Every 5 min" },
  { expr: "*/15 * * * *", label: "Every 15 min" },
  { expr: "0 * * * *", label: "Every hour" },
  { expr: "0 9 * * 1-5", label: "Weekdays 9am" },
  { expr: "0 0 * * *", label: "Daily midnight" },
  { expr: "0 0 * * 0", label: "Weekly (Sun)" },
  { expr: "0 0 1 * *", label: "Monthly (1st)" },
  { expr: "30 2 1 * *", label: "1st at 2:30am" },
  { expr: "0 0 1 1 *", label: "Yearly (Jan 1)" },
  { expr: "0 12 * * 1-5", label: "Weekdays noon" },
];

const FIELD_LABELS = ["minute", "hour", "day (month)", "month", "day (week)"];

export default function CronClient() {
  const [expression, setExpression] = useState("*/5 * * * *");
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    if (!expression.trim())
      return {
        summary: "",
        nextRun: "",
        nextRuns: [] as string[],
        error: null as string | null,
      };
    try {
      const summary = cronstrue.toString(expression, {
        throwExceptionOnParseError: true,
        verbose: true,
      });
      const interval = CronExpressionParser.parse(expression, {
        currentDate: new Date(),
      });
      const first = interval.next();
      const nextRun = format(first.toDate(), "yyyy-MM-dd HH:mm:ss");
      const nextRuns: string[] = [nextRun];
      for (let i = 0; i < 4; i++) {
        nextRuns.push(format(interval.next().toDate(), "yyyy-MM-dd HH:mm:ss"));
      }
      return { summary, nextRun, nextRuns, error: null as string | null };
    } catch (error) {
      return {
        summary: "",
        nextRun: "",
        nextRuns: [] as string[],
        error:
          error instanceof Error ? error.message : "Invalid cron expression",
      };
    }
  }, [expression]);

  const fields = useMemo(() => {
    const parts = expression.trim().split(/\s+/).filter(Boolean);
    if (parts.length !== 5) return null;
    return parts;
  }, [expression]);

  const copy = async () => {
    if (!expression.trim()) return;
    try {
      await navigator.clipboard.writeText(expression.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="flex flex-col h-full anim-in">
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border gap-3 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 pl-10 md:pl-0 min-w-0 flex-1">
          <h2 className="text-base md:text-lg font-semibold text-txt truncate">
            Cron Expression Helper
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/15">
            Utilities
          </span>
        </div>
        <div className="flex items-center gap-2 w-auto shrink-0 overflow-x-auto">
          <button
            onClick={copy}
            className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tr-smooth ${copied ? "bg-success/15 text-success border border-success/20" : "btn-accent"}`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy Cron"}
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="rounded-2xl border border-border bg-bg-secondary p-4 md:p-6">
            <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider block mb-2">
              Cron Expression
            </label>
            <input
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="* * * * *"
              spellCheck={false}
              className="w-full px-4 py-3 text-xl md:text-2xl font-mono rounded-xl border border-border bg-bg-primary text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/30 tr-smooth"
            />
            <p className="text-[11px] text-txt-muted mt-2">
              minute hour day-of-month month day-of-week
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-bg-secondary p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock3 size={14} className="text-accent" />
              <p className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Meaning
              </p>
            </div>
            {parsed.error ? (
              <p className="text-sm text-error font-medium">{parsed.error}</p>
            ) : parsed.summary ? (
              <div className="space-y-2">
                <p className="text-lg md:text-xl font-semibold text-txt">
                  &quot;{parsed.summary}.&quot;
                </p>
                <p className="text-sm text-txt-sec font-mono">
                  Next: {parsed.nextRun}
                </p>
                {parsed.nextRuns.length > 1 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] uppercase text-txt-muted">
                      Next 5 runs
                    </p>
                    <ul className="text-xs font-mono text-txt-sec space-y-0.5">
                      {parsed.nextRuns.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-txt-muted">
                Enter a cron expression to see explanation.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-bg-secondary p-4 md:p-6">
            <p className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-3">
              Field Breakdown
            </p>
            {fields ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {fields.map((value, idx) => (
                  <div
                    key={`${FIELD_LABELS[idx]}-${value}`}
                    className="rounded-lg border border-border bg-bg-primary p-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-txt-muted mb-1">
                      {FIELD_LABELS[idx]}
                    </p>
                    <p className="text-sm font-mono text-txt">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-txt-muted">
                Provide exactly 5 fields to see the breakdown.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-bg-secondary p-4 md:p-6">
            <p className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-2">
              Examples
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map(({ expr, label }) => (
                <button
                  key={expr}
                  onClick={() => setExpression(expr)}
                  title={expr}
                  className="px-2 py-1 rounded border border-border bg-bg-primary text-[11px] font-mono text-txt-sec hover:border-accent/30 tr-smooth"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
