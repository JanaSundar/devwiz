"use client";

import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Regex,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MatchInfo = {
  index: number;
  match: string;
  start: number;
  end: number;
  groups: string[];
};

const DEFAULT_PATTERN = String.raw`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`;

const DEFAULT_TEXT = [
  "Invite these emails to the beta:",
  "  - devwiz@example.com",
  "  - hello+regex@sub.domain.io",
  "  - invalid@no-tld",
  "",
  "Tip: Toggle flags like /g and /i to see how matches change.",
].join("\n");

const PRESET_PATTERNS = [
  {
    id: "email",
    label: "Email",
    pattern: String.raw`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`,
    text: DEFAULT_TEXT,
  },
  {
    id: "url",
    label: "URL",
    pattern: String.raw`https?:\/\/[^\s/$.?#].[^\s]*`,
    text: [
      "Docs:",
      "  - https://devwiz.app/docs/regex",
      "  - http://localhost:3000/regex-playground",
      "  - not-a-url",
    ].join("\n"),
  },
  {
    id: "digits",
    label: "Digits",
    pattern: String.raw`\d+`,
    text: "Order #12345 total: 99.50 USD, discount code: 2024-DEV.",
  },
] as const;

type ExplanationItem = {
  token: string;
  description: string;
};

function buildExplanation(pattern: string): ExplanationItem[] {
  const items: ExplanationItem[] = [];
  if (!pattern) return items;

  const add = (token: string, description: string) => {
    if (
      !items.some((i) => i.token === token && i.description === description)
    ) {
      items.push({ token, description });
    }
  };

  // Anchors
  if (pattern.startsWith("^")) add("^", "Start of string");
  if (pattern.endsWith("$")) add("$", "End of string");

  // Common escapes
  const escapeMap: Record<string, string> = {
    "\\d": "Digit (0–9)",
    "\\D": "Non-digit",
    "\\w": "Word character (letter, digit, underscore)",
    "\\W": "Non-word character",
    "\\s": "Whitespace (space, tab, newline)",
    "\\S": "Non-whitespace",
    "\\b": "Word boundary",
    "\\B": "Non-word boundary",
  };
  for (const [token, description] of Object.entries(escapeMap)) {
    if (pattern.includes(token)) add(token, description);
  }

  // Character classes
  const classRegex = /\[(?:\\.|[^\]])*]/g;
  let match: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: classic regex exec loop
  while ((match = classRegex.exec(pattern))) {
    const raw = match[0];
    const inner = raw.slice(1, -1);
    if (inner.startsWith("^")) {
      add(
        raw,
        `Negative character class (any character except: ${inner.slice(1) || "…"})`,
      );
    } else {
      add(raw, `Character class (one of: ${inner || "…"})`);
    }
  }

  // Groups (simple detection)
  const groupRegex = /\((\?:)?/g;
  let groupIndex = 1;
  // biome-ignore lint/suspicious/noAssignInExpressions: classic regex exec loop
  while ((match = groupRegex.exec(pattern))) {
    if (match[1] === "?:") {
      add("(?:…)", "Non-capturing group");
    } else {
      add(`(${groupIndex})`, `Capturing group #${groupIndex}`);
      groupIndex += 1;
    }
  }

  // Quantifiers
  const quantifierRegex = /(\+|\*|\?|\{\d+(,\d*)?\})/g;
  // biome-ignore lint/suspicious/noAssignInExpressions: classic regex exec loop
  while ((match = quantifierRegex.exec(pattern))) {
    const q = match[1];
    switch (q) {
      case "+":
        add("+", "One or more of the previous token");
        break;
      case "*":
        add("*", "Zero or more of the previous token");
        break;
      case "?":
        add("?", "Zero or one of the previous token (optional)");
        break;
      default:
        add(
          q,
          "Quantifier (repeat the previous token a specific number of times)",
        );
        break;
    }
  }

  // Alternation
  if (pattern.includes("|")) {
    add("|", "Alternation: match the pattern on the left or the right side");
  }

  // Dot
  if (pattern.includes(".")) {
    add(".", "Any character (except newline by default)");
  }

  return items;
}

const FLAG_OPTIONS: { id: string; label: string; description: string }[] = [
  { id: "g", label: "g", description: "global" },
  { id: "i", label: "i", description: "ignore case" },
  {
    id: "m",
    label: "m",
    description: "multiline (^ and $ match line boundaries)",
  },
  { id: "s", label: "s", description: "dotAll (dot matches newlines)" },
  { id: "u", label: "u", description: "unicode" },
];

export default function RegexPlaygroundClient() {
  const [pattern, setPattern] = useState(DEFAULT_PATTERN);
  const [flags, setFlags] = useState<Set<string>>(new Set(["g", "m"]));
  const [testText, setTestText] = useState(DEFAULT_TEXT);
  const [explanationOpen, setExplanationOpen] = useState(true);
  const [matchesOpen, setMatchesOpen] = useState(true);

  const flagsString = useMemo(() => Array.from(flags).sort().join(""), [flags]);

  const { regex, error } = useMemo(() => {
    if (!pattern.length) return { regex: null as RegExp | null, error: "" };
    try {
      // If user does not include `g`, create a separate regex with `g` for listing matches.
      return {
        regex: new RegExp(pattern, flagsString || undefined),
        error: "",
      };
    } catch (err) {
      return {
        regex: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }, [pattern, flagsString]);

  const matches: MatchInfo[] = useMemo(() => {
    if (!regex || !testText.length) return [];

    // For listing matches we always want global iteration,
    // but we respect other flags (i, m, s, u).
    const globalRegex = regex.flags.includes("g")
      ? regex
      : new RegExp(regex.source, regex.flags + "g");

    const list: MatchInfo[] = [];
    for (const m of testText.matchAll(globalRegex)) {
      if (m.index == null) continue;
      const groups = m.slice(1).map((g) => g ?? "");
      list.push({
        index: list.length,
        match: m[0],
        start: m.index,
        end: m.index + m[0].length,
        groups,
      });
    }
    return list;
  }, [regex, testText]);

  const highlightedSegments = useMemo(() => {
    if (!matches.length) return [{ type: "text" as const, text: testText }];

    const segments: { type: "text" | "match"; text: string }[] = [];
    let cursor = 0;

    for (const m of matches) {
      if (m.start > cursor) {
        segments.push({
          type: "text",
          text: testText.slice(cursor, m.start),
        });
      }
      segments.push({
        type: "match",
        text: testText.slice(m.start, m.end),
      });
      cursor = m.end;
    }

    if (cursor < testText.length) {
      segments.push({
        type: "text",
        text: testText.slice(cursor),
      });
    }

    return segments;
  }, [matches, testText]);

  const toggleFlag = (id: string) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader title="Regex Playground" badge="Utilities" />

      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="flex-1 min-h-0 flex flex-col gap-3 p-4 overflow-hidden"
      >
        {/* Main: Pattern + Test String - grows when below sections are closed */}
        <motion.section
          layout
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex-1 min-h-0 flex flex-col rounded-xl border border-border bg-bg-secondary/40 px-4 py-3 overflow-hidden"
          aria-labelledby="regex-pattern-label"
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex flex-col gap-1 min-w-0">
              <label
                id="regex-pattern-label"
                htmlFor="regex-pattern"
                className="text-xs font-semibold text-txt-muted uppercase tracking-wider"
              >
                Regular Expression
              </label>
              <p className="text-[11px] text-txt-muted truncate">
                <code className="font-mono">
                  /{pattern || ""}/{flagsString || ""}
                </code>
              </p>
            </div>
            <fieldset
              className="flex items-center gap-1 border-0 p-0 m-0"
              aria-label="Regex flags"
            >
              {FLAG_OPTIONS.map((f) => {
                const active = flags.has(f.id);
                return (
                  <Button
                    key={f.id}
                    type="button"
                    size="xs"
                    variant={active ? "default" : "outline"}
                    onClick={() => toggleFlag(f.id)}
                    className={cn(
                      "h-6 w-7 px-0 font-mono text-[11px]",
                      !active && "bg-bg-secondary text-txt-muted border-border",
                    )}
                    title={f.description}
                    aria-pressed={active}
                  >
                    {f.label}
                  </Button>
                );
              })}
            </fieldset>
          </div>

          <Input
            id="regex-pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="^[a-z]+$"
            aria-invalid={!!error}
            aria-describedby={error ? "regex-error" : undefined}
            className="font-mono text-sm"
          />
          {error && (
            <output
              id="regex-error"
              className="mt-2 flex items-start gap-2 rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-xs text-error"
              aria-live="polite"
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <p className="text-left">
                <span className="font-semibold">Invalid regex:</span> {error}
              </p>
            </output>
          )}
          {!error && (
            <fieldset
              className="mt-3 flex flex-wrap gap-2 border-0 p-0 m-0"
              aria-label="Regex presets"
            >
              {PRESET_PATTERNS.map((preset) => (
                <Button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setPattern(preset.pattern);
                    setTestText(preset.text);
                    setFlags(new Set(["g", "m"]));
                  }}
                  size="xs"
                  variant="outline"
                  className="rounded-full text-[11px] px-3 py-1 h-7"
                >
                  {preset.label}
                </Button>
              ))}
            </fieldset>
          )}

          {/* Test string + mini cheatsheet (regexr-style) */}
          <div className="mt-3 flex-1 min-h-0 flex flex-col space-y-3 overflow-hidden">
            <div className="flex items-center gap-2">
              <ListChecks size={14} className="text-accent" />
              <h3 className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Test String
              </h3>
            </div>
            <div className="flex-1 min-h-0 rounded-xl border border-border bg-bg-primary/80 overflow-auto">
              <div className="relative min-h-full">
                {/* Highlighted content (below) */}
                <pre
                  aria-hidden="true"
                  className="pointer-events-none whitespace-pre-wrap wrap-break-word text-sm font-mono px-3 py-3 text-txt"
                >
                  {highlightedSegments.map((seg, idx) =>
                    seg.type === "text" ? (
                      <span key={idx}>{seg.text}</span>
                    ) : (
                      <span
                        key={idx}
                        className="rounded px-0.5 py-0.5"
                        style={{
                          backgroundColor: "#166534",
                          color: "#ffffff",
                        }}
                      >
                        {seg.text}
                      </span>
                    ),
                  )}
                </pre>

                {/* Actual textarea (on top, transparent text) */}
                <textarea
                  aria-label="Test string"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="absolute inset-0 w-full min-h-full resize-none border-none bg-transparent px-3 py-3 text-sm font-mono text-transparent caret-txt outline-none"
                  spellCheck={false}
                />
              </div>
            </div>
            <p className="text-[11px] text-txt-muted flex items-center gap-1.5">
              <Sparkles size={12} />
              Regex is evaluated using JavaScript&apos;s{" "}
              <code className="px-1 py-0.5 rounded bg-bg-tertiary/60 text-[10px] font-mono">
                RegExp
              </code>{" "}
              engine.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-txt-muted">
              <span>
                <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-bg-tertiary/40">
                  \d
                </code>{" "}
                digit
              </span>
              <span>
                <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-bg-tertiary/40">
                  \w
                </code>{" "}
                word
              </span>
              <span>
                <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-bg-tertiary/40">
                  .
                </code>{" "}
                any char
              </span>
              <span>
                <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-bg-tertiary/40">
                  ^
                </code>{" "}
                start
              </span>
              <span>
                <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-bg-tertiary/40">
                  $
                </code>{" "}
                end
              </span>
              <span>
                <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-bg-tertiary/40">
                  ( )
                </code>{" "}
                group
              </span>
            </div>
          </div>
        </motion.section>

        {/* Matches - collapsible, comes first */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="rounded-xl border border-border bg-bg-secondary/30 overflow-hidden shrink-0"
        >
          <button
            type="button"
            onClick={() => setMatchesOpen((o) => !o)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-bg-primary/30 transition-colors shrink-0"
          >
            <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider flex items-center gap-2">
              <ListChecks size={13} />
              Matches
            </span>
            <motion.span
              animate={{ rotate: matchesOpen ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} className="text-txt-muted" />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {matchesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 border-t border-border max-h-[200px] min-h-0 overflow-auto">
                  {matches.length === 0 ? (
                    <div className="flex items-center justify-center text-xs text-txt-muted py-6">
                      {regex && testText
                        ? "No matches for this regex and text."
                        : "Start by typing a regex and some test text."}
                    </div>
                  ) : (
                    <table className="w-full text-[11px] text-left">
                      <thead>
                        <tr className="border-b border-border/80 bg-bg-secondary/60">
                          <th className="px-3 py-2 font-medium text-txt-muted">
                            #
                          </th>
                          <th className="px-3 py-2 font-medium text-txt-muted">
                            Match
                          </th>
                          <th className="px-3 py-2 font-medium text-txt-muted">
                            Start
                          </th>
                          <th className="px-3 py-2 font-medium text-txt-muted">
                            End
                          </th>
                          <th className="px-3 py-2 font-medium text-txt-muted">
                            Groups
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence initial={false}>
                          {matches.map((m) => (
                            <motion.tr
                              key={m.index}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-b border-border/40 hover:bg-glass-hover/40 tr-smooth"
                            >
                              <td className="px-3 py-1.5 text-txt-muted">
                                {m.index + 1}
                              </td>
                              <td className="px-3 py-1.5 text-txt font-mono">
                                {m.match}
                              </td>
                              <td className="px-3 py-1.5 text-txt-muted">
                                {m.start}
                              </td>
                              <td className="px-3 py-1.5 text-txt-muted">
                                {m.end}
                              </td>
                              <td className="px-3 py-1.5 text-txt-muted max-w-[220px]">
                                {m.groups.length === 0
                                  ? "-"
                                  : m.groups.map((g, idx) => (
                                      <span
                                        key={idx}
                                        className={cn(
                                          "inline-flex items-center rounded border border-border/80 bg-bg-primary/60 px-1.5 py-0.5 mr-1 mb-1",
                                          "font-mono text-[10px]",
                                        )}
                                      >
                                        <span className="text-txt-muted mr-1">
                                          ${idx + 1}
                                        </span>
                                        <span className="text-txt">
                                          {g === "" ? "␀" : g}
                                        </span>
                                      </span>
                                    ))}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Explanation - collapsible, comes after Matches */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="rounded-xl border border-border bg-bg-secondary/40 overflow-hidden shrink-0"
        >
          <button
            type="button"
            onClick={() => setExplanationOpen((o) => !o)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-bg-primary/30 transition-colors shrink-0"
          >
            <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider flex items-center gap-2">
              <Regex size={13} />
              Explanation
            </span>
            <motion.span
              animate={{ rotate: explanationOpen ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} className="text-txt-muted" />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {explanationOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 text-[11px] text-txt-muted space-y-1 border-t border-border max-h-[200px] min-h-0 overflow-auto">
                  {buildExplanation(pattern).length === 0 ? (
                    <p>No explanation available for this pattern yet.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {buildExplanation(pattern).map((item, idx) => (
                        <motion.li
                          key={`${item.token}-${idx}`}
                          layout
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          className="flex gap-2"
                        >
                          <code className="px-1.5 py-0.5 rounded bg-bg-tertiary/60 text-[10px] font-mono text-txt">
                            {item.token}
                          </code>
                          <span className="flex-1">{item.description}</span>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
