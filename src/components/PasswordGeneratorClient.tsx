"use client";

import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import {
  adjacencyGraphs,
  dictionary as commonDictionary,
} from "@zxcvbn-ts/language-common";
import { dictionary, translations } from "@zxcvbn-ts/language-en";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/|~";
const SIMILAR = /[ilLI|oO0]/g;

zxcvbnOptions.setOptions({
  translations: {
    ...translations,
  },
  graphs: adjacencyGraphs,
  dictionary: {
    ...commonDictionary,
    ...dictionary,
  },
});

function randomInt(max: number) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function buildPassword(charset: string, length: number) {
  if (!charset.length || length <= 0) return "";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += charset[randomInt(charset.length)];
  }
  return out;
}

export default function PasswordGeneratorClient() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const charset = useMemo(() => {
    let chars = "";
    if (useUpper) chars += UPPER;
    if (useLower) chars += LOWER;
    if (useNumbers) chars += NUMBERS;
    if (useSymbols) chars += SYMBOLS;
    if (excludeSimilar) chars = chars.replace(SIMILAR, "");
    return Array.from(new Set(chars.split(""))).join("");
  }, [useUpper, useLower, useNumbers, useSymbols, excludeSimilar]);

  const entropyBits = useMemo(() => {
    if (!charset.length) return 0;
    return Math.round(length * Math.log2(charset.length));
  }, [charset, length]);

  const strengthResult = useMemo(() => {
    if (!password) return null;
    return zxcvbn(password);
  }, [password]);

  const strengthLabel = useMemo(() => {
    const score = strengthResult?.score;
    if (score === undefined || score === null) return "Not Rated";
    if (score <= 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Strong";
    return "Very Strong";
  }, [strengthResult]);

  const zxcvbnScore = strengthResult?.score ?? null;
  const guessTime =
    strengthResult?.crackTimesDisplay?.offlineSlowHashing1e4PerSecond ||
    strengthResult?.crackTimesDisplay?.offlineFastHashing1e10PerSecond;

  const scoreBadgeClass =
    zxcvbnScore === null
      ? "text-txt-muted border-border bg-bg-secondary"
      : zxcvbnScore <= 1
        ? "text-error border-error/25 bg-error/10"
        : zxcvbnScore === 2
          ? "text-warning border-warning/25 bg-warning/10"
          : "text-success border-success/25 bg-success/10";

  const selectedGroups = [useUpper, useLower, useNumbers, useSymbols].filter(
    Boolean,
  ).length;

  const generate = () => {
    if (!charset.length) {
      setPassword("");
      return;
    }
    setPassword(buildPassword(charset, length));
  };

  useEffect(() => {
    generate();
    // Re-generate when rules change to keep output in sync with config.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charset, length]);

  const copyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // noop
    }
  };

  return (
    <div className="flex h-full flex-col anim-in">
      <ToolHeader title="Password Generator" badge="Utilities" />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <section className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-2xl border border-border bg-bg-secondary p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-muted">
                Generated Password
              </h3>
              {copied && (
                <span className="text-[11px] font-medium text-success">
                  Copied
                </span>
              )}
            </div>

            <div className="relative">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Generated password appears here"
                className="h-14 w-full rounded-xl border-border bg-bg-primary px-4 pr-28 font-mono text-base tracking-wider text-txt-primary"
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                <Button
                  onClick={generate}
                  variant="ghost"
                  size="icon-xs"
                  className="h-9 w-9 rounded-lg border border-border bg-bg-secondary hover:bg-bg-primary"
                  aria-label="Generate password"
                  title="Generate"
                >
                  <RefreshCw size={14} />
                </Button>
                <Button
                  onClick={copyPassword}
                  variant="ghost"
                  size="icon-xs"
                  className="h-9 w-9 rounded-lg border border-border bg-bg-secondary hover:bg-bg-primary disabled:opacity-50"
                  aria-label="Copy password"
                  title="Copy"
                  disabled={!password}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-bg-primary px-3 py-2.5">
                <p className="text-[10px] uppercase text-txt-muted">Length</p>
                <p className="text-sm font-semibold text-txt">{length}</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-primary px-3 py-2.5">
                <p className="text-[10px] uppercase text-txt-muted">Sets</p>
                <p className="text-sm font-semibold text-txt">
                  {selectedGroups}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-bg-primary px-3 py-2.5">
                <p className="text-[10px] uppercase text-txt-muted">Entropy</p>
                <p className="text-sm font-semibold text-txt">
                  ~{entropyBits} bits
                </p>
              </div>
              <div className="rounded-xl border border-border bg-bg-primary px-3 py-2.5">
                <p className="text-[10px] uppercase text-txt-muted">Chars</p>
                <p className="text-sm font-semibold text-txt">
                  {charset.length}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 rounded-2xl border border-border bg-bg-secondary p-5 md:p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-muted">
              Configuration
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-txt-muted">Password length</span>
                <span className="rounded-lg border border-border bg-bg-primary px-2.5 py-1 text-xs font-mono text-txt">
                  {length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[8, 12, 16, 24, 32].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setLength(n)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium tr-smooth ${
                      length === n
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border bg-bg-primary text-txt-muted hover:text-txt"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <Input
                type="range"
                min={4}
                max={64}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="h-2 w-full accent-accent"
              />
              <div className="flex justify-between text-[10px] text-txt-muted">
                <span>4</span>
                <span>64</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-txt-muted">
                Character sets
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-txt-primary">
                <label className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary px-4 py-3 cursor-pointer hover:border-accent/30 tr-smooth">
                  <input
                    type="checkbox"
                    checked={useUpper}
                    onChange={(e) => setUseUpper(e.target.checked)}
                    className="rounded border-border"
                  />
                  Uppercase (A-Z)
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary px-4 py-3 cursor-pointer hover:border-accent/30 tr-smooth">
                  <input
                    type="checkbox"
                    checked={useLower}
                    onChange={(e) => setUseLower(e.target.checked)}
                    className="rounded border-border"
                  />
                  Lowercase (a-z)
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary px-4 py-3 cursor-pointer hover:border-accent/30 tr-smooth">
                  <input
                    type="checkbox"
                    checked={useNumbers}
                    onChange={(e) => setUseNumbers(e.target.checked)}
                    className="rounded border-border"
                  />
                  Numbers (0-9)
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-border bg-bg-primary px-4 py-3 cursor-pointer hover:border-accent/30 tr-smooth">
                  <input
                    type="checkbox"
                    checked={useSymbols}
                    onChange={(e) => setUseSymbols(e.target.checked)}
                    className="rounded border-border"
                  />
                  Symbols (!@#$...)
                </label>
                <label className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-border bg-bg-primary px-4 py-3 cursor-pointer hover:border-accent/30 tr-smooth">
                  <input
                    type="checkbox"
                    checked={excludeSimilar}
                    onChange={(e) => setExcludeSimilar(e.target.checked)}
                    className="rounded border-border"
                  />
                  Exclude similar (0/O, l/I)
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-bg-primary p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs font-medium text-txt-muted">
                  Strength (zxcvbn)
                </p>
                <span
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium ${scoreBadgeClass}`}
                >
                  {zxcvbnScore !== null
                    ? `Score ${zxcvbnScore}/4`
                    : "Not rated"}
                </span>
              </div>

              <p className="text-sm font-semibold text-txt-primary">
                {strengthLabel}
              </p>

              {guessTime && (
                <p className="mt-1 text-xs text-txt-muted">
                  Guess time: {guessTime}
                </p>
              )}

              {strengthResult?.feedback?.warning && (
                <p className="mt-2 text-xs text-warning">
                  {strengthResult.feedback.warning}
                </p>
              )}
              {strengthResult?.feedback?.suggestions?.[0] && (
                <p className="mt-1 text-xs text-txt-muted">
                  Tip: {strengthResult.feedback.suggestions[0]}
                </p>
              )}
            </div>

            {!charset.length && (
              <p className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-xs text-error">
                Select at least one character set.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
