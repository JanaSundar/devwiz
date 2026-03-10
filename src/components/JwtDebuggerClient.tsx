"use client";
import { jwtDecode } from "jwt-decode";
import {
  AlertTriangle,
  Check,
  Clock,
  Copy,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

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

  const pasteExample = () => {
    // A sample JWT (expired, safe to use as example)
    handleInput(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MDAwMDAwMDAsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSJ9.example-signature-here",
    );
  };

  return (
    <div className="flex flex-col h-full anim-in">
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border gap-3 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 pl-10 md:pl-0 min-w-0 flex-1">
          <h2 className="text-base md:text-lg font-semibold text-txt truncate">
            JWT Debugger
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/15">
            Utilities
          </span>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={pasteExample}
            className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs btn-glass hover:border-accent/30"
          >
            Example
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="w-full lg:w-105 flex flex-col border-b lg:border-b-0 lg:border-r border-border shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 text-xs border-b border-border/50 shrink-0">
            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
            <span className="font-medium text-txt-muted">PASTE JWT</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIs..."
            className="flex-1 w-full p-4 text-sm font-mono leading-relaxed bg-bg-secondary text-txt placeholder:text-txt-muted focus:outline-none resize-none tr-smooth min-h-30"
            spellCheck={false}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 gap-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg border border-error/20 bg-error/5 text-xs text-error">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span className="font-mono">{error}</span>
            </div>
          )}

          {decoded && (
            <>
              <div className="flex items-center gap-3 flex-wrap">
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

              <JsonPanel
                label="HEADER"
                data={decoded.header}
                onCopy={() =>
                  copySection("header", JSON.stringify(decoded.header, null, 2))
                }
                copied={copied === "header"}
              />

              {/* Payload */}
              <JsonPanel
                label="PAYLOAD"
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
                    SIGNATURE
                  </span>
                </div>
                <p className="text-xs font-mono text-txt-sec break-all leading-relaxed">
                  {decoded.signature}
                </p>
                <p className="text-[10px] text-txt-muted mt-2">
                  Signature verification requires the secret/public key and is
                  not performed client-side.
                </p>
              </div>
            </>
          )}

          {!decoded && !error && (
            <div className="flex-1 flex items-center justify-center text-xs text-txt-muted">
              Paste a JWT to decode it
            </div>
          )}
        </div>
      </div>
    </div>
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
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] btn-glass tr-smooth"
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
