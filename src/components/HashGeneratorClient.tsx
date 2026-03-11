"use client";

import { Check, Copy, Hash, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";

const FALLBACK_ALGOS = ["md5", "sha1", "sha224", "sha256", "sha384", "sha512"];

export default function HashGeneratorClient() {
  const [algorithms, setAlgorithms] = useState<string[]>(FALLBACK_ALGOS);
  const [algorithm, setAlgorithm] = useState("sha256");
  const [encoding, setEncoding] = useState<"hex" | "base64">("hex");
  const [text, setText] = useState("");
  const [digest, setDigest] = useState("");
  const [digestError, setDigestError] = useState("");
  const [digestLoading, setDigestLoading] = useState(false);

  const [bcryptText, setBcryptText] = useState("");
  const [rounds, setRounds] = useState(10);
  const [bcryptDigest, setBcryptDigest] = useState("");
  const [bcryptError, setBcryptError] = useState("");
  const [bcryptLoading, setBcryptLoading] = useState(false);

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
      const data = await res.json();
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
      const data = await res.json();
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

  return (
    <div className="flex h-full flex-col anim-in">
      <ToolHeader title="Hash Generator" badge="Utilities" />

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 xl:grid-cols-2">
        <section className="space-y-4 rounded-xl border border-border bg-bg-secondary p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-muted">
            MD5 / SHA / Node Crypto Hashes
          </h3>

          <label className="block space-y-1 text-xs text-txt-muted">
            Input Text
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type text to hash..."
              className="min-h-28 w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-txt-primary outline-none ring-0 tr-smooth focus:border-primary"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-txt-muted">
              Algorithm
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-txt-primary outline-none tr-smooth focus:border-primary"
              >
                {algorithms.map((algo) => (
                  <option key={algo} value={algo}>
                    {algo}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs text-txt-muted">
              Encoding
              <select
                value={encoding}
                onChange={(e) =>
                  setEncoding(e.target.value as "hex" | "base64")
                }
                className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-txt-primary outline-none tr-smooth focus:border-primary"
              >
                <option value="hex">hex</option>
                <option value="base64">base64</option>
              </select>
            </label>
          </div>

          <button
            onClick={generateDigest}
            disabled={!canDigest}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs btn-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Hash size={13} />
            {digestLoading ? "Generating..." : "Generate Hash"}
          </button>

          {digestError && <p className="text-xs text-error">{digestError}</p>}

          <div className="space-y-2">
            <p className="text-xs text-txt-muted">Result</p>
            <div className="flex items-start gap-2">
              <code className="max-h-36 flex-1 overflow-auto break-all rounded-lg border border-border bg-bg-primary px-3 py-2 text-xs text-txt-primary">
                {digest || "Hash output will appear here."}
              </code>
              <button
                onClick={() => onCopy(digest, "digest")}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs btn-glass"
                disabled={!digest}
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
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-bg-secondary p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-muted">
            BCrypt Hash + Verify
          </h3>

          <label className="block space-y-1 text-xs text-txt-muted">
            Text / Password to Hash
            <input
              value={bcryptText}
              onChange={(e) => setBcryptText(e.target.value)}
              placeholder="Enter text for bcrypt hash"
              className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-txt-primary outline-none tr-smooth focus:border-primary"
            />
          </label>

          <label className="block space-y-1 text-xs text-txt-muted">
            Cost Rounds ({rounds})
            <input
              type="range"
              min={4}
              max={14}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full"
            />
          </label>

          <button
            onClick={generateBcrypt}
            disabled={bcryptLoading}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs btn-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShieldCheck size={13} />
            {bcryptLoading ? "Working..." : "Generate BCrypt"}
          </button>

          <div className="space-y-2">
            <p className="text-xs text-txt-muted">BCrypt Hash</p>
            <div className="flex items-start gap-2">
              <code className="max-h-36 flex-1 overflow-auto break-all rounded-lg border border-border bg-bg-primary px-3 py-2 text-xs text-txt-primary">
                {bcryptDigest || "BCrypt output will appear here."}
              </code>
              <button
                onClick={() => onCopy(bcryptDigest, "bcrypt")}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs btn-glass"
                disabled={!bcryptDigest}
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

          <p className="text-xs text-txt-muted">
            BCrypt hashes are one-way. Decode is not possible.
          </p>

          {bcryptError && <p className="text-xs text-error">{bcryptError}</p>}
        </section>
      </div>
    </div>
  );
}
