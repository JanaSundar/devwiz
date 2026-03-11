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
        <section className="mx-auto max-w-3xl space-y-4">
          <div className="rounded-2xl border border-border bg-bg-secondary p-4 shadow-sm md:p-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-muted">
                Generated Password
              </h3>
              {copied && (
                <span className="text-[11px] text-success">Copied</span>
              )}
            </div>

            <div className="relative">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Generated password appears here"
                className="h-12 w-full rounded-xl border-border bg-bg-primary px-3 pr-24 font-mono text-sm text-txt-primary"
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                <Button
                  onClick={generate}
                  variant="ghost"
                  size="icon-xs"
                  className="border border-border bg-bg-secondary"
                  aria-label="Generate password"
                  title="Generate"
                >
                  <RefreshCw size={13} />
                </Button>
                <Button
                  onClick={copyPassword}
                  variant="ghost"
                  size="icon-xs"
                  className="border border-border bg-bg-secondary"
                  aria-label="Copy password"
                  title="Copy"
                  disabled={!password}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </Button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-txt-muted sm:grid-cols-4">
              <div className="rounded-md border border-border bg-bg-primary px-2 py-1.5">
                Length: {length}
              </div>
              <div className="rounded-md border border-border bg-bg-primary px-2 py-1.5">
                Sets: {selectedGroups}
              </div>
              <div className="rounded-md border border-border bg-bg-primary px-2 py-1.5">
                Entropy: ~{entropyBits}
              </div>
              <div className="rounded-md border border-border bg-bg-primary px-2 py-1.5">
                Chars: {charset.length}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-border bg-bg-secondary p-4 shadow-sm md:p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-muted">
              Configuration
            </h3>

            <label className="block text-xs text-txt-muted space-y-2">
              <div className="flex items-center justify-between">
                <span>Password length</span>
                <span className="rounded px-2 py-0.5 text-[11px] border border-border bg-bg-primary text-txt-primary">
                  {length}
                </span>
              </div>
              <Input
                type="range"
                min={4}
                max={64}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="h-8 border-border bg-bg-primary px-0"
              />
              <div className="flex justify-between text-[10px] text-txt-muted">
                <span>4</span>
                <span>64</span>
              </div>
            </label>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-txt-primary">
              <label className="flex items-center gap-2 rounded-lg border border-border bg-bg-primary px-3 py-2">
                <input
                  type="checkbox"
                  checked={useUpper}
                  onChange={(e) => setUseUpper(e.target.checked)}
                />
                Uppercase (A-Z)
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-border bg-bg-primary px-3 py-2">
                <input
                  type="checkbox"
                  checked={useLower}
                  onChange={(e) => setUseLower(e.target.checked)}
                />
                Lowercase (a-z)
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-border bg-bg-primary px-3 py-2">
                <input
                  type="checkbox"
                  checked={useNumbers}
                  onChange={(e) => setUseNumbers(e.target.checked)}
                />
                Numbers (0-9)
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-border bg-bg-primary px-3 py-2">
                <input
                  type="checkbox"
                  checked={useSymbols}
                  onChange={(e) => setUseSymbols(e.target.checked)}
                />
                Symbols (!@#$...)
              </label>
              <label className="sm:col-span-2 flex items-center gap-2 rounded-lg border border-border bg-bg-primary px-3 py-2">
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={(e) => setExcludeSimilar(e.target.checked)}
                />
                Exclude similar chars (0/O, l/I)
              </label>
            </div>

            <div className="rounded-xl border border-border bg-bg-primary p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-txt-muted">Strength (zxcvbn)</p>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${scoreBadgeClass}`}
                >
                  {zxcvbnScore !== null
                    ? `Score ${zxcvbnScore}/4`
                    : "Not rated"}
                </span>
              </div>

              <p className="mt-1 text-sm font-medium text-txt-primary">
                {strengthLabel}
              </p>

              <div className="mt-2 space-y-1 text-xs text-txt-muted">
                {guessTime && <p>Guess time: {guessTime}</p>}
              </div>

              {strengthResult?.feedback?.warning && (
                <p className="mt-2 text-xs text-warning">
                  {strengthResult.feedback.warning}
                </p>
              )}
              {strengthResult?.feedback?.suggestions?.[0] && (
                <p className="text-xs text-txt-muted">
                  Tip: {strengthResult.feedback.suggestions[0]}
                </p>
              )}
            </div>

            {!charset.length && (
              <p className="text-xs text-error">
                Select at least one character set.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
