"use client";

import { Check, Copy, Hash, Shield, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";
import { cn, safeParseJson } from "@/lib/utils";

const FALLBACK_ALGOS = ["md5", "sha1", "sha224", "sha256", "sha384", "sha512"];

type Tab = "hash" | "verify" | "bcrypt";

export default function HashGeneratorClient() {
  const [activeTab, setActiveTab] = useState<Tab>("hash");

  const [algorithms, setAlgorithms] = useState<string[]>(FALLBACK_ALGOS);
  const [algorithm, setAlgorithm] = useState("sha256");
  const [encoding, setEncoding] = useState<"hex" | "base64">("hex");
  const [text, setText] = useState("");
  const [digest, setDigest] = useState("");
  const [digestError, setDigestError] = useState("");
  const [digestLoading, setDigestLoading] = useState(false);

  const [verifyText, setVerifyText] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const [bcryptText, setBcryptText] = useState("");
  const [rounds, setRounds] = useState(10);
  const [bcryptDigest, setBcryptDigest] = useState("");
  const [bcryptError, setBcryptError] = useState("");
  const [bcryptLoading, setBcryptLoading] = useState(false);

  const [bcryptVerifyText, setBcryptVerifyText] = useState("");
  const [bcryptVerifyHash, setBcryptVerifyHash] = useState("");
  const [bcryptVerifyResult, setBcryptVerifyResult] = useState<boolean | null>(
    null,
  );
  const [bcryptVerifyLoading, setBcryptVerifyLoading] = useState(false);
  const [bcryptVerifyError, setBcryptVerifyError] = useState("");

  const [copiedValue, setCopiedValue] = useState<"digest" | "bcrypt" | "">("");

  useEffect(() => {
    const loadAlgorithms = async () => {
      try {
        const res = await fetch("/api/hash", { method: "GET" });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data.algorithms)
          ? data.algorithms.filter(
              (v: unknown): v is string => typeof v === "string",
            )
          : [];
        if (!list.length) return;
        setAlgorithms(list);
        if (!list.includes(algorithm)) {
          setAlgorithm(list.includes("sha256") ? "sha256" : list[0]);
        }
      } catch {
        // Silent fallback to default algorithms.
      }
    };

    loadAlgorithms();
  }, [algorithm]);

  const canDigest = useMemo(
    () => !!algorithm && !digestLoading,
    [algorithm, digestLoading],
  );

  const generateDigest = async () => {
    setDigestLoading(true);
    setDigestError("");
    setDigest("");
    try {
      const res = await fetch("/api/hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "digest",
          text,
          algorithm,
          outputEncoding: encoding,
        }),
      });
      const data = await safeParseJson<{ digest?: string; error?: string }>(
        res,
      );
      if (!res.ok) throw new Error(data.error || "Failed to generate hash");
      setDigest(data.digest || "");
    } catch (err) {
      setDigestError(
        err instanceof Error ? err.message : "Failed to generate hash",
      );
    } finally {
      setDigestLoading(false);
    }
  };

  const verifyDigest = async () => {
    if (!verifyHash.trim()) return;
    setVerifyLoading(true);
    setVerifyError("");
    setVerifyResult(null);
    try {
      const res = await fetch("/api/hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "digest-verify",
          text: verifyText,
          targetDigest: verifyHash.trim(),
          algorithm,
          outputEncoding: encoding,
        }),
      });
      const data = await safeParseJson<{ valid?: boolean; error?: string }>(
        res,
      );
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setVerifyResult(data.valid ?? false);
    } catch (err) {
      setVerifyError(
        err instanceof Error ? err.message : "Verification failed",
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const generateBcrypt = async () => {
    setBcryptLoading(true);
    setBcryptError("");
    try {
      const res = await fetch("/api/hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bcrypt-hash",
          text: bcryptText,
          rounds,
        }),
      });
      const data = await safeParseJson<{ digest?: string; error?: string }>(
        res,
      );
      if (!res.ok) throw new Error(data.error || "Failed to generate bcrypt");
      setBcryptDigest(data.digest || "");
    } catch (err) {
      setBcryptError(
        err instanceof Error ? err.message : "Failed to generate bcrypt",
      );
    } finally {
      setBcryptLoading(false);
    }
  };

  const verifyBcrypt = async () => {
    if (!bcryptVerifyHash.trim()) return;
    setBcryptVerifyLoading(true);
    setBcryptVerifyError("");
    setBcryptVerifyResult(null);
    try {
      const res = await fetch("/api/hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bcrypt-verify",
          text: bcryptVerifyText,
          digest: bcryptVerifyHash.trim(),
        }),
      });
      const data = await safeParseJson<{ valid?: boolean; error?: string }>(
        res,
      );
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setBcryptVerifyResult(data.valid ?? false);
    } catch (err) {
      setBcryptVerifyError(
        err instanceof Error ? err.message : "Verification failed",
      );
    } finally {
      setBcryptVerifyLoading(false);
    }
  };

  const onCopy = async (value: string, type: "digest" | "bcrypt") => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(type);
      setTimeout(() => setCopiedValue(""), 1200);
    } catch {
      // noop
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof Hash }[] = [
    { key: "hash", label: "Hash", icon: Hash },
    { key: "verify", label: "Verify", icon: Shield },
    { key: "bcrypt", label: "BCrypt", icon: ShieldCheck },
  ];

  return (
    <div className="flex h-full flex-col anim-in">
      <ToolHeader title="Hash Generator" badge="Utilities" />

      <div className="flex shrink-0 gap-1 border-b border-border bg-bg-secondary/50 px-4 py-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium tr-smooth",
              activeTab === key
                ? "bg-accent/15 text-accent border border-accent/30"
                : "text-txt-muted hover:text-txt hover:bg-bg-primary border border-transparent",
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {activeTab === "hash" && (
            <section className="space-y-4 rounded-2xl border border-border bg-bg-secondary p-4 sm:p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-muted">
                MD5 / SHA / Node Crypto Hashes
              </h3>

              <label className="block space-y-2 text-xs text-txt-muted">
                Input Text
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type text to hash..."
                  className="min-h-24 w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-txt-primary outline-none ring-0 tr-smooth focus:border-accent/50"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-2 text-xs text-txt-muted">
                  Algorithm
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-txt-primary outline-none tr-smooth focus:border-accent/50"
                  >
                    {algorithms.map((algo) => (
                      <option key={algo} value={algo}>
                        {algo}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-xs text-txt-muted">
                  Output Encoding
                  <select
                    value={encoding}
                    onChange={(e) =>
                      setEncoding(e.target.value as "hex" | "base64")
                    }
                    className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-txt-primary outline-none tr-smooth focus:border-accent/50"
                  >
                    <option value="hex">hex</option>
                    <option value="base64">base64</option>
                  </select>
                </label>
              </div>

              <button
                onClick={generateDigest}
                disabled={!canDigest}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium btn-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Hash size={14} />
                {digestLoading ? "Generating..." : "Generate Hash"}
              </button>

              {digestError && (
                <p className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-xs text-error">
                  {digestError}
                </p>
              )}

              {digest && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-txt-muted">Result</p>
                  <div className="flex items-start gap-2">
                    <code className="flex-1 overflow-auto break-all rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-xs font-mono text-txt-primary">
                      {digest}
                    </code>
                    <button
                      onClick={() => onCopy(digest, "digest")}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-xs btn-glass"
                    >
                      {copiedValue === "digest" ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                      {copiedValue === "digest" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === "verify" && (
            <section className="space-y-4 rounded-2xl border border-border bg-bg-secondary p-4 sm:p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-muted">
                Verify Hash (MD5 / SHA)
              </h3>
              <p className="text-xs text-txt-muted">
                Compare input text against a known hash to verify integrity.
              </p>

              <label className="block space-y-2 text-xs text-txt-muted">
                Input Text
                <textarea
                  value={verifyText}
                  onChange={(e) => setVerifyText(e.target.value)}
                  placeholder="Text to verify..."
                  className="min-h-20 w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-txt-primary outline-none tr-smooth focus:border-accent/50"
                />
              </label>

              <label className="block space-y-2 text-xs text-txt-muted">
                Hash to Compare
                <input
                  value={verifyHash}
                  onChange={(e) => setVerifyHash(e.target.value)}
                  placeholder="Paste the hash here..."
                  className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm font-mono text-txt-primary outline-none tr-smooth focus:border-accent/50"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-2 text-xs text-txt-muted">
                  Algorithm
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-txt-primary outline-none tr-smooth focus:border-accent/50"
                  >
                    {algorithms.map((algo) => (
                      <option key={algo} value={algo}>
                        {algo}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-xs text-txt-muted">
                  Encoding
                  <select
                    value={encoding}
                    onChange={(e) =>
                      setEncoding(e.target.value as "hex" | "base64")
                    }
                    className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-txt-primary outline-none tr-smooth focus:border-accent/50"
                  >
                    <option value="hex">hex</option>
                    <option value="base64">base64</option>
                  </select>
                </label>
              </div>

              <button
                onClick={verifyDigest}
                disabled={!verifyHash.trim() || verifyLoading}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium btn-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Shield size={14} />
                {verifyLoading ? "Verifying..." : "Verify"}
              </button>

              {verifyError && (
                <p className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-xs text-error">
                  {verifyError}
                </p>
              )}

              {verifyResult !== null && (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-4 py-3",
                    verifyResult
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-error/30 bg-error/10 text-error",
                  )}
                >
                  <Check
                    size={16}
                    className={verifyResult ? "" : "opacity-0"}
                  />
                  <span className="text-sm font-medium">
                    {verifyResult ? "Hash matches" : "Hash does not match"}
                  </span>
                </div>
              )}
            </section>
          )}

          {activeTab === "bcrypt" && (
            <div className="space-y-6">
              <section className="space-y-4 rounded-2xl border border-border bg-bg-secondary p-4 sm:p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-muted">
                  BCrypt Hash
                </h3>

                <label className="block space-y-2 text-xs text-txt-muted">
                  Text / Password to Hash
                  <input
                    value={bcryptText}
                    onChange={(e) => setBcryptText(e.target.value)}
                    placeholder="Enter text for bcrypt hash"
                    type="password"
                    className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-txt-primary outline-none tr-smooth focus:border-accent/50"
                  />
                </label>

                <label className="block space-y-2 text-xs text-txt-muted">
                  Cost Rounds ({rounds})
                  <input
                    type="range"
                    min={4}
                    max={14}
                    value={rounds}
                    onChange={(e) => setRounds(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <span className="text-[10px] text-txt-muted">
                    4 = fast, 14 = slow (more secure)
                  </span>
                </label>

                <button
                  onClick={generateBcrypt}
                  disabled={bcryptLoading}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium btn-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShieldCheck size={14} />
                  {bcryptLoading ? "Working..." : "Generate BCrypt"}
                </button>

                {bcryptError && (
                  <p className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-xs text-error">
                    {bcryptError}
                  </p>
                )}

                {bcryptDigest && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-txt-muted">
                      BCrypt Hash
                    </p>
                    <div className="flex items-start gap-2">
                      <code className="flex-1 overflow-auto break-all rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-xs font-mono text-txt-primary">
                        {bcryptDigest}
                      </code>
                      <button
                        onClick={() => onCopy(bcryptDigest, "bcrypt")}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-xs btn-glass"
                      >
                        {copiedValue === "bcrypt" ? (
                          <Check size={12} />
                        ) : (
                          <Copy size={12} />
                        )}
                        {copiedValue === "bcrypt" ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-txt-muted">
                  BCrypt hashes are one-way. Decode is not possible.
                </p>
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-bg-secondary p-4 sm:p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-muted">
                  BCrypt Verify
                </h3>

                <label className="block space-y-2 text-xs text-txt-muted">
                  Text / Password
                  <input
                    value={bcryptVerifyText}
                    onChange={(e) => setBcryptVerifyText(e.target.value)}
                    placeholder="Password to verify"
                    type="password"
                    className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm text-txt-primary outline-none tr-smooth focus:border-accent/50"
                  />
                </label>

                <label className="block space-y-2 text-xs text-txt-muted">
                  BCrypt Hash
                  <input
                    value={bcryptVerifyHash}
                    onChange={(e) => setBcryptVerifyHash(e.target.value)}
                    placeholder="Paste bcrypt hash..."
                    className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2.5 text-sm font-mono text-txt-primary outline-none tr-smooth focus:border-accent/50"
                  />
                </label>

                <button
                  onClick={verifyBcrypt}
                  disabled={!bcryptVerifyHash.trim() || bcryptVerifyLoading}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium btn-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Shield size={14} />
                  {bcryptVerifyLoading ? "Verifying..." : "Verify"}
                </button>

                {bcryptVerifyError && (
                  <p className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-xs text-error">
                    {bcryptVerifyError}
                  </p>
                )}

                {bcryptVerifyResult !== null && (
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-4 py-3",
                      bcryptVerifyResult
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-error/30 bg-error/10 text-error",
                    )}
                  >
                    <Check
                      size={16}
                      className={bcryptVerifyResult ? "" : "opacity-0"}
                    />
                    <span className="text-sm font-medium">
                      {bcryptVerifyResult
                        ? "Password matches"
                        : "Password does not match"}
                    </span>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
