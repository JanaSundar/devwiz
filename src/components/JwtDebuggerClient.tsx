"use client";

import { jwtDecode } from "jwt-decode";
import {
  AlertTriangle,
  Check,
  Clock,
  Copy,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";
import { cn } from "@/lib/utils";

interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  expiresAt: Date | null;
  issuedAt: Date | null;
  isExpired: boolean | null;
}

function decodeToken(token: string): DecodedJwt {
  const parts = token.trim().split(".");
  if (parts.length !== 3)
    throw new Error("Invalid JWT: expected 3 parts separated by dots");

  const header = jwtDecode<Record<string, unknown>>(token, { header: true });
  const payload = jwtDecode<Record<string, unknown>>(token);
  const signature = parts[2];

  const exp =
    typeof payload.exp === "number" ? new Date(payload.exp * 1000) : null;
  const iat =
    typeof payload.iat === "number" ? new Date(payload.iat * 1000) : null;
  const isExpired = exp ? exp.getTime() < Date.now() : null;

  return {
    header,
    payload,
    signature,
    expiresAt: exp,
    issuedAt: iat,
    isExpired,
  };
}

function relativeTime(date: Date): string {
  const diff = date.getTime() - Date.now();
  const absDiff = Math.abs(diff);
  const isPast = diff < 0;

  if (absDiff < 60_000) return isPast ? "just now" : "in a few seconds";
  if (absDiff < 3_600_000) {
    const mins = Math.floor(absDiff / 60_000);
    return isPast ? `${mins}m ago` : `in ${mins}m`;
  }
  if (absDiff < 86_400_000) {
    const hrs = Math.floor(absDiff / 3_600_000);
    return isPast ? `${hrs}h ago` : `in ${hrs}h`;
  }
  const days = Math.floor(absDiff / 86_400_000);
  return isPast ? `${days}d ago` : `in ${days}d`;
}

const EXAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MDAwMDAwMDAsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSJ9.example-signature-here";

export default function JwtDebuggerClient() {
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleInput = useCallback((val: string) => {
    setInput(val);
    setError(null);
    setDecoded(null);
    if (!val.trim()) return;
    try {
      setDecoded(decodeToken(val));
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const copySection = async (label: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {}
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const pasteExample = () => handleInput(EXAMPLE_JWT);

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader
        title="JWT Debugger"
        badge="Utilities"
        rightSlot={
          <button
            onClick={pasteExample}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-glass hover:border-accent/30 tr-smooth"
          >
            Example
          </button>
        }
      />

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* Left: Input */}
        <section className="flex-1 lg:flex-initial lg:w-[min(400px,40vw)] xl:w-[min(420px,35vw)] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-bg-secondary/30 min-h-[min(320px,45vh)] lg:min-h-0">
          <div className="p-4 md:p-5 border-b border-border shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-accent" />
              <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                JWT Token
              </span>
            </div>
            <p className="text-[11px] text-txt-muted">
              Paste a JWT (header.payload.signature) to decode
            </p>
          </div>

          <div className="p-4 md:p-5 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
            <div className="flex flex-col gap-2 flex-1 min-h-0">
              <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider shrink-0">
                Token
              </label>
              <textarea
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIs..."
                className="w-full flex-1 min-h-[min(180px,35vh)] lg:min-h-[200px] px-3 py-2.5 text-sm font-mono rounded-xl border border-border bg-bg-primary text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/40 tr-smooth resize-y"
                spellCheck={false}
              />
            </div>

            <button
              onClick={pasteExample}
              type="button"
              className="px-2.5 py-1.5 rounded-lg text-[11px] btn-glass hover:border-accent/30 tr-smooth w-fit"
            >
              Load example
            </button>

            {error && (
              <div className="p-3 rounded-xl border border-error/20 bg-error/5 text-xs text-error flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </section>

        {/* Right: Results */}
        <section className="flex-1 min-h-0 overflow-auto p-4 md:p-6">
          {decoded ? (
            <div className="space-y-5 max-w-4xl">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                {decoded.isExpired === true && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-error/10 text-error border border-error/15">
                    <ShieldAlert size={13} /> Expired{" "}
                    {decoded.expiresAt && relativeTime(decoded.expiresAt)}
                  </span>
                )}
                {decoded.isExpired === false && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-success/10 text-success border border-success/15">
                    <ShieldCheck size={13} /> Valid — expires{" "}
                    {decoded.expiresAt && relativeTime(decoded.expiresAt)}
                  </span>
                )}
                {decoded.issuedAt && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-txt-muted border border-border">
                    <Clock size={12} /> Issued {relativeTime(decoded.issuedAt)}
                  </span>
                )}
                <span className="px-2.5 py-1.5 rounded-lg text-xs text-txt-muted border border-border font-mono">
                  alg: {String(decoded.header.alg || "?")}
                </span>
              </div>

              {/* Primary result card */}
              <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4 md:p-5">
                <p className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider mb-2">
                  Decoded
                </p>
                <p className="text-sm text-txt-muted mb-3">
                  Header, payload, and signature below. Verification requires
                  the secret and is not performed client-side.
                </p>
                <div className="flex flex-wrap gap-2">
                  <CopyableChip
                    label="Header"
                    value={JSON.stringify(decoded.header)}
                    onCopy={() =>
                      copySection(
                        "header",
                        JSON.stringify(decoded.header, null, 2),
                      )
                    }
                    copied={copied === "header"}
                  />
                  <CopyableChip
                    label="Payload"
                    value={JSON.stringify(decoded.payload)}
                    onCopy={() =>
                      copySection(
                        "payload",
                        JSON.stringify(decoded.payload, null, 2),
                      )
                    }
                    copied={copied === "payload"}
                  />
                </div>
              </div>

              {/* Header */}
              <JsonPanel
                label="Header"
                data={decoded.header}
                onCopy={() =>
                  copySection("header", JSON.stringify(decoded.header, null, 2))
                }
                copied={copied === "header"}
              />

              {/* Payload */}
              <JsonPanel
                label="Payload"
                data={decoded.payload}
                onCopy={() =>
                  copySection(
                    "payload",
                    JSON.stringify(decoded.payload, null, 2),
                  )
                }
                copied={copied === "payload"}
              />

              {/* Signature */}
              <div className="rounded-xl border border-border bg-bg-secondary p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">
                    Signature
                  </span>
                  <button
                    onClick={() => copySection("sig", decoded.signature)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] tr-smooth",
                      copied === "sig"
                        ? "bg-success/15 text-success"
                        : "btn-glass",
                    )}
                  >
                    {copied === "sig" ? (
                      <Check size={10} />
                    ) : (
                      <Copy size={10} />
                    )}
                    {copied === "sig" ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-xs font-mono text-txt-sec break-all leading-relaxed">
                  {decoded.signature}
                </p>
                <p className="text-[10px] text-txt-muted mt-2">
                  Signature verification requires the secret/public key and is
                  not performed client-side.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center">
              <div className="text-center max-w-sm">
                <Shield size={40} className="mx-auto mb-4 text-txt-muted/40" />
                <p className="text-sm font-medium text-txt-muted mb-1">
                  Paste a JWT to decode
                </p>
                <p className="text-xs text-txt-muted/80">
                  Enter a JWT (header.payload.signature) to inspect header,
                  payload, and expiry
                </p>
                <button
                  type="button"
                  onClick={pasteExample}
                  className="mt-4 px-3 py-2 rounded-xl text-xs btn-glass"
                >
                  Load example
                </button>
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
  const display = value.length > 40 ? `${value.slice(0, 40)}…` : value;
  return (
    <button
      onClick={onCopy}
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono tr-smooth",
        copied
          ? "bg-success/15 text-success border border-success/20"
          : "bg-bg-primary border border-border hover:border-accent/30",
      )}
      title={value}
    >
      <span className="text-txt-muted">{label}:</span>
      <span className="text-txt truncate max-w-48">{display}</span>
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function JsonPanel({
  label,
  data,
  onCopy,
  copied,
}: {
  label: string;
  data: Record<string, unknown>;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">
          {label}
        </span>
        <button
          onClick={onCopy}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] tr-smooth",
            copied ? "bg-success/15 text-success" : "btn-glass",
          )}
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="space-y-1">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-start gap-2 text-xs font-mono">
            <span className="text-accent shrink-0">{key}:</span>
            <span className="text-txt-sec break-all">
              {key === "exp" || key === "iat" || key === "nbf"
                ? `${JSON.stringify(value)} (${new Date(Number(value) * 1000).toISOString()})`
                : JSON.stringify(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
