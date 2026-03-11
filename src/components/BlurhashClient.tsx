"use client";

import { decode } from "blurhash";
import { Check, Copy, Sparkles, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import ToolHeader from "@/components/tooling/ToolHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

    const width = 48;
    const height = 48;
    const pixels = decode(hash, width, height);
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(width, height);
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

      const data = await res.json();
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

      <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto p-4">
        <section className="space-y-3 rounded-xl border border-border bg-bg-secondary p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-muted">
            Controls
          </h3>

          <div
            {...getRootProps()}
            className={`rounded-lg border border-dashed p-3 tr-smooth ${isDragActive ? "border-accent bg-accent/10" : "border-border/70 bg-bg-primary"}`}
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
                onClick={open}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                <Upload size={14} />
                Browse
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-1">
            <label className="text-xs text-txt-muted space-y-1 min-w-52">
              Horizontal detail ({xComp})
              <Input
                type="range"
                min={1}
                max={9}
                value={xComp}
                onChange={(e) => setXComp(Number(e.target.value))}
                className="h-8 border-border bg-bg-primary px-0"
              />
            </label>

            <label className="text-xs text-txt-muted space-y-1 min-w-52">
              Vertical detail ({yComp})
              <Input
                type="range"
                min={1}
                max={9}
                value={yComp}
                onChange={(e) => setYComp(Number(e.target.value))}
                className="h-8 border-border bg-bg-primary px-0"
              />
            </label>
          </div>

          {error && <p className="text-xs text-error">{error}</p>}
        </section>

        <section className="flex flex-1 min-h-0 flex-col space-y-4 rounded-xl border border-border bg-bg-secondary p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-muted">
            Preview & Hash
          </h3>

          <div className="grid flex-1 min-h-0 grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex h-full min-h-56 flex-col overflow-hidden rounded-lg border border-border bg-bg-primary p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-txt-muted">
                Source
              </p>
              <div className="flex flex-1 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-bg-secondary py-1">
                {previewUrl ? (
                  // biome-ignore lint/performance/noImgElement: local object URL preview
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="max-h-full w-auto rounded"
                  />
                ) : (
                  <p className="text-xs text-txt-muted">Source image preview</p>
                )}
              </div>
            </div>

            <div className="flex h-full min-h-56 flex-col overflow-hidden rounded-lg border border-border bg-bg-primary p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-txt-muted">
                Blur Preview
              </p>
              <div className="flex flex-1 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-bg-secondary">
                {hash ? (
                  <canvas
                    ref={canvasRef}
                    width={48}
                    height={48}
                    className="h-full w-full max-h-full max-w-full rounded object-cover p-1"
                  />
                ) : (
                  <p className="text-xs text-txt-muted">BlurHash preview</p>
                )}
              </div>
            </div>
          </div>

          {hash ? (
            <div className="flex items-center gap-2">
              <Input
                value={hash}
                readOnly
                className="flex-1 h-10 font-mono text-sm"
              />
              <Button onClick={onCopy} variant="outline" size="sm">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-txt-muted">
              Upload an image and click Generate.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
