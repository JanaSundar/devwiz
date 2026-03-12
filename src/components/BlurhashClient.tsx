"use client";

import { decode } from "blurhash";
import { Check, Copy, Sparkles, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import ToolHeader from "@/components/tooling/ToolHeader";
import { Button } from "@/components/ui/button";
import { safeParseJson } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const PREVIEW_SIZE = 160;

export default function BlurhashClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [hash, setHash] = useState("");
  const [xComp, setXComp] = useState(4);
  const [yComp, setYComp] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const canGenerate = !!file && !loading;

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!hash || !canvasRef.current) return;

    const pixels = decode(hash, PREVIEW_SIZE, PREVIEW_SIZE);
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(PREVIEW_SIZE, PREVIEW_SIZE);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
  }, [hash]);

  const fileLabel = useMemo(() => {
    if (!file) return "No image selected";
    return `${file.name} (${Math.round(file.size / 1024)} KB)`;
  }, [file]);

  const onGenerate = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setHash("");

    try {
      const formData = new FormData();
      formData.set("image", file);
      formData.set("xComp", String(xComp));
      formData.set("yComp", String(yComp));

      const res = await fetch("/api/blurhash", {
        method: "POST",
        body: formData,
      });

      const data = await safeParseJson<{ hash?: string; error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Failed to generate BlurHash");
      setHash(data.hash || "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate BlurHash",
      );
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  const { getInputProps, getRootProps, isDragActive, open } = useDropzone({
    noClick: true,
    multiple: false,
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      const nextFile = acceptedFiles[0];
      if (!nextFile) return;
      setFile(nextFile);
    },
  });

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader
        title="BlurHash Generator"
        badge="Utilities"
        rightSlot={
          <Button
            onClick={onGenerate}
            disabled={!canGenerate}
            size="sm"
            className="whitespace-nowrap rounded-lg px-3 py-2 text-xs btn-accent tr-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={12} />
            {loading ? "Generating..." : "Generate"}
          </Button>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">
          {/* Left: Controls */}
          <section className="shrink-0 lg:w-72 space-y-4 rounded-xl border border-border bg-bg-secondary p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-muted">
              Controls
            </h3>

            <div
              {...getRootProps()}
              className={`rounded-xl border border-dashed p-4 tr-smooth cursor-pointer ${isDragActive ? "border-accent bg-accent/10" : "border-border/70 bg-bg-primary hover:border-accent/30"}`}
            >
              <input {...getInputProps()} />
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-txt">
                    {isDragActive
                      ? "Drop image to upload"
                      : "Drag and drop an image"}
                  </p>
                  <p
                    className="text-[11px] text-txt-muted truncate"
                    title={fileLabel}
                  >
                    {fileLabel}
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    open();
                  }}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  <Upload size={14} />
                  Browse
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs text-txt-muted space-y-1.5">
                Horizontal detail ({xComp})
                <Input
                  type="range"
                  min={1}
                  max={9}
                  value={xComp}
                  onChange={(e) => setXComp(Number(e.target.value))}
                  className="h-8 border-border bg-bg-primary px-0 accent-accent"
                />
              </label>

              <label className="block text-xs text-txt-muted space-y-1.5">
                Vertical detail ({yComp})
                <Input
                  type="range"
                  min={1}
                  max={9}
                  value={yComp}
                  onChange={(e) => setYComp(Number(e.target.value))}
                  className="h-8 border-border bg-bg-primary px-0 accent-accent"
                />
              </label>
            </div>

            {error && (
              <p className="text-xs text-error rounded-lg bg-error/5 p-2">
                {error}
              </p>
            )}

            {hash && (
              <div className="flex items-center gap-2 pt-2">
                <Input
                  value={hash}
                  readOnly
                  className="flex-1 h-10 font-mono text-xs"
                />
                <Button
                  onClick={onCopy}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            )}
          </section>

          {/* Right: Preview - fills space */}
          <section className="flex-1 min-h-0 flex flex-col rounded-xl border border-border bg-bg-secondary p-4 overflow-hidden">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-muted mb-4 shrink-0">
              Preview
            </h3>
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col min-h-0 rounded-xl border border-border bg-bg-primary overflow-hidden">
                <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-txt-muted border-b border-border shrink-0">
                  Source
                </p>
                <div className="flex-1 flex items-center justify-center overflow-hidden p-4 min-h-40">
                  {previewUrl ? (
                    // biome-ignore lint/performance/noImgElement: local object URL preview
                    <img
                      src={previewUrl}
                      alt="Uploaded preview"
                      className="max-h-full max-w-full w-auto object-contain rounded-lg"
                    />
                  ) : (
                    <p className="text-xs text-txt-muted">
                      Source image preview
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col min-h-0 rounded-xl border border-border bg-bg-primary overflow-hidden">
                <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-txt-muted border-b border-border shrink-0">
                  BlurHash
                </p>
                <div className="flex-1 flex items-center justify-center overflow-hidden p-4 min-h-40 bg-bg-secondary/50">
                  {hash ? (
                    <canvas
                      ref={canvasRef}
                      width={PREVIEW_SIZE}
                      height={PREVIEW_SIZE}
                      className="max-h-full max-w-full w-full h-full rounded-lg object-contain shadow-inner"
                    />
                  ) : (
                    <p className="text-xs text-txt-muted">
                      Upload and generate to see preview
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
