"use client";

import { Check, Copy } from "lucide-react";
import { customAlphabet } from "nanoid";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ulid } from "ulid";
import { v4 as uuidv4 } from "uuid";
import ToolHeader from "@/components/tooling/ToolHeader";

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export default function IdStudioClient() {
  const [count, setCount] = useState(5);
  const [nanoidLen, setNanoidLen] = useState(21);
  const [copied, setCopied] = useState(false);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [copiedId, setCopiedId] = useState<{
    idx: number;
    type: "uuid" | "nanoid" | "ulid";
  } | null>(null);

  const ids = useMemo(() => {
    if (!isClient) {
      return [];
    }
    const nanoid = customAlphabet(ALPHABET, nanoidLen);

    return Array.from({ length: count }).map(() => ({
      uuid: uuidv4(),
      nanoid: nanoid(),
      ulid: ulid(),
    }));
  }, [count, nanoidLen, isClient]);

  const copyAll = async () => {
    const out = ids
      .map(
        (id, idx) =>
          `${idx + 1}. UUID: ${id.uuid}\n   NanoID: ${id.nanoid}\n   ULID: ${id.ulid}`,
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(out);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const copyOne = async (
    value: string,
    idx: number,
    type: "uuid" | "nanoid" | "ulid",
  ) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId({ idx, type });
      setTimeout(() => setCopiedId(null), 1200);
    } catch {}
  };

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader
        title="UUID / NanoID / ULID Studio"
        badge="Utilities"
        rightSlot={
          <button
            onClick={copyAll}
            className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tr-smooth ${copied ? "bg-success/15 text-success border border-success/20" : "btn-accent"}`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy All"}
          </button>
        }
      />

      <div className="p-4 border-b border-border bg-bg-secondary/40 flex flex-col md:flex-row gap-3">
        <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
          Count
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) =>
              setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
            }
            className="mt-2 w-full md:w-36 px-3 py-2 text-sm rounded-lg bg-bg-primary border border-border text-txt"
          />
        </label>
        <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
          NanoID Length
          <input
            type="number"
            min={8}
            max={64}
            value={nanoidLen}
            onChange={(e) =>
              setNanoidLen(
                Math.max(8, Math.min(64, Number(e.target.value) || 21)),
              )
            }
            className="mt-2 w-full md:w-48 px-3 py-2 text-sm rounded-lg bg-bg-primary border border-border text-txt"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3 max-w-5xl mx-auto">
          {ids.map((id, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-bg-secondary p-3 font-mono text-xs space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-txt-muted">UUID:</span>
                <span className="min-w-0 flex-1 break-all text-txt">
                  {id.uuid}
                </span>
                <button
                  type="button"
                  onClick={() => copyOne(id.uuid, idx, "uuid")}
                  className="shrink-0 rounded p-0.5 hover:bg-bg-primary"
                  title="Copy UUID"
                >
                  {copiedId?.idx === idx && copiedId?.type === "uuid" ? (
                    <Check size={12} className="text-success" />
                  ) : (
                    <Copy size={12} className="text-txt-muted" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-txt-muted">NanoID:</span>
                <span className="min-w-0 flex-1 break-all text-txt">
                  {id.nanoid}
                </span>
                <button
                  type="button"
                  onClick={() => copyOne(id.nanoid, idx, "nanoid")}
                  className="shrink-0 rounded p-0.5 hover:bg-bg-primary"
                  title="Copy NanoID"
                >
                  {copiedId?.idx === idx && copiedId?.type === "nanoid" ? (
                    <Check size={12} className="text-success" />
                  ) : (
                    <Copy size={12} className="text-txt-muted" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-txt-muted">ULID:</span>
                <span className="min-w-0 flex-1 break-all text-txt">
                  {id.ulid}
                </span>
                <button
                  type="button"
                  onClick={() => copyOne(id.ulid, idx, "ulid")}
                  className="shrink-0 rounded p-0.5 hover:bg-bg-primary"
                  title="Copy ULID"
                >
                  {copiedId?.idx === idx && copiedId?.type === "ulid" ? (
                    <Check size={12} className="text-success" />
                  ) : (
                    <Copy size={12} className="text-txt-muted" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
