"use client";

import DOMPurify from "dompurify";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  Loader2,
  ScanLine,
  Search,
  Upload,
  Wand2,
} from "lucide-react";
import { motion, useSpring } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ToolHeader from "@/components/tooling/ToolHeader";
import { cn, safeParseJson } from "@/lib/utils";

type OptimizeOptions = {
  multipass: boolean;
  pretty: boolean;
  removeDimensions: boolean;
  convertColors: boolean;
  cleanupIds: boolean;
};

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220" fill="none">
  <rect width="220" height="220" rx="36" fill="#1e4d2b"/>
  <path d="M51 119L90 157L170 78" stroke="#f5f2e0" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="170" cy="78" r="18" fill="#6db87a"/>
</svg>`;

export default function SvgViewerClient() {
  const [svgText, setSvgText] = useState(DEFAULT_SVG);
  const [zoom, setZoom] = useState(100);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [lastValidSvg, setLastValidSvg] = useState(DEFAULT_SVG);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeInfo, setOptimizeInfo] = useState<string | null>(null);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);
  const [isGeneratingJsx, setIsGeneratingJsx] = useState(false);
  const [jsxOutput, setJsxOutput] = useState("");
  const [copyDataUriOk, setCopyDataUriOk] = useState(false);
  const [copyJsxOk, setCopyJsxOk] = useState(false);
  const [options, setOptions] = useState<OptimizeOptions>({
    multipass: true,
    pretty: true,
    removeDimensions: false,
    convertColors: true,
    cleanupIds: true,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const zoomScale = useSpring(1, {
    stiffness: 260,
    damping: 30,
    mass: 0.5,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, "image/svg+xml");
      const err = doc.querySelector("parsererror");
      if (err) {
        setParseError("Invalid SVG markup. Please fix the XML structure.");
      } else {
        setParseError(null);
        setLastValidSvg(svgText);
      }
    } catch {
      setParseError("Unable to parse SVG input.");
    }
  }, [mounted, svgText]);

  const previewSvg = useMemo(() => {
    if (!mounted) return "";
    return parseError ? lastValidSvg : svgText;
  }, [mounted, parseError, lastValidSvg, svgText]);

  const sanitizedPreviewSvg = useMemo(() => {
    if (!previewSvg) return "";
    return DOMPurify.sanitize(previewSvg, {
      USE_PROFILES: { svg: true, svgFilters: true },
      FORBID_TAGS: ["script", "foreignObject"],
      FORBID_ATTR: ["onload", "onclick", "onerror"],
    });
  }, [previewSvg]);

  const onUploadClick = () => fileInputRef.current?.click();

  useEffect(() => {
    zoomScale.set(zoom / 100);
  }, [zoom, zoomScale]);

  const onUploadFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    setSvgText(text);
  };

  const onDownload = () => {
    const blob = new Blob([svgText], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "image.svg";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(svgText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const onFit = () => setZoom(100);
  const onPrettify = async () => {
    setOptimizeError(null);
    setOptimizeInfo(null);
    if (parseError || !svgText.trim()) return;

    try {
      const res = await fetch("/api/transform/svgo", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: svgText,
          options: {
            formatOnly: true,
            pretty: options.pretty,
          },
        }),
      });
      const data = await safeParseJson<{ output?: string; error?: string }>(
        res,
      );
      if (!res.ok) {
        throw new Error(data.error || "Failed to format SVG");
      }

      setSvgText(data.output || svgText);
      setOptimizeInfo("SVG formatted.");
    } catch (error) {
      setOptimizeError(
        error instanceof Error ? error.message : "Failed to format SVG",
      );
    }
  };

  const onOptimize = async (opts?: OptimizeOptions) => {
    setOptimizeError(null);
    setOptimizeInfo(null);
    if (parseError || !svgText.trim()) return;

    setIsOptimizing(true);
    try {
      const res = await fetch("/api/transform/svgo", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: svgText, options: opts ?? options }),
      });
      const data = await safeParseJson<{
        output?: string;
        error?: string;
        stats?: { savedBytes: number; savedPercent: number };
      }>(res);

      if (!res.ok) {
        throw new Error(data.error || "Failed to optimize SVG");
      }

      if (data.output) {
        setSvgText(data.output);
      }

      if (data.stats) {
        setOptimizeInfo(
          `Optimized: -${data.stats.savedBytes} bytes (${data.stats.savedPercent}%)`,
        );
      } else {
        setOptimizeInfo("SVG optimized successfully.");
      }
    } catch (error) {
      setOptimizeError(
        error instanceof Error ? error.message : "Failed to optimize SVG",
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  const applyOption = (patch: Partial<OptimizeOptions>) => {
    const next = { ...options, ...patch };
    setOptions(next);
    void onOptimize(next);
  };

  const onCopyDataUri = async () => {
    if (!previewSvg) return;
    try {
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(previewSvg)}`;
      await navigator.clipboard.writeText(dataUrl);
      setCopyDataUriOk(true);
      setTimeout(() => setCopyDataUriOk(false), 1500);
    } catch {}
  };

  const onGenerateJsx = async () => {
    if (parseError || !svgText.trim()) return;

    setIsGeneratingJsx(true);
    try {
      const res = await fetch("/api/transform/svgr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: svgText,
          options: {
            typescript: true,
            memo: false,
            svgo: true,
            icon: false,
            expandProps: "end",
            svgoConfig: {
              multipass: options.multipass,
              js2svg: {
                pretty: options.pretty,
                indent: 2,
              },
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: {
                      removeViewBox: false,
                      ...(options.convertColors
                        ? {}
                        : { convertColors: false }),
                      ...(options.cleanupIds ? {} : { cleanupIds: false }),
                    },
                  },
                },
                ...(options.removeDimensions
                  ? [{ name: "removeDimensions" }]
                  : []),
              ],
            },
          },
        }),
      });
      const data = await safeParseJson<{ output?: string; error?: string }>(
        res,
      );
      if (!res.ok) throw new Error(data.error || "Failed to generate JSX");
      setJsxOutput(data.output || "");
    } catch (error) {
      setOptimizeError(
        error instanceof Error ? error.message : "Failed to generate JSX",
      );
    } finally {
      setIsGeneratingJsx(false);
    }
  };

  const onCopyJsx = async () => {
    if (!jsxOutput) return;
    try {
      await navigator.clipboard.writeText(jsxOutput);
      setCopyJsxOk(true);
      setTimeout(() => setCopyJsxOk(false), 1500);
    } catch {}
  };

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader
        title="SVG Viewer"
        badge="Converters"
        rightSlot={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              className="hidden"
              onChange={(e) => onUploadFile(e.target.files?.[0] || null)}
            />
            <button
              onClick={onUploadClick}
              className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-glass"
            >
              <Upload size={12} />
              Upload
            </button>
            <button
              onClick={onDownload}
              className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-glass"
            >
              <Download size={12} />
              Download
            </button>
            <button
              onClick={onPrettify}
              className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-glass"
            >
              <Wand2 size={12} />
              Prettify
            </button>
            <button
              onClick={() => void onOptimize()}
              disabled={!!parseError || isOptimizing}
              className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-glass disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOptimizing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Wand2 size={12} />
              )}
              Optimize
            </button>
            <button
              onClick={onCopy}
              className={cn(
                "whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs tr-smooth",
                copied
                  ? "bg-success/15 text-success border border-success/20"
                  : "btn-accent",
              )}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy SVG"}
            </button>
          </>
        }
      />

      {/* Options bar */}
      <div className="px-4 md:px-6 py-2.5 border-b border-border bg-bg-secondary/50 flex flex-wrap items-center gap-2 text-xs shrink-0">
        <span className="text-txt-muted font-medium mr-1">Options:</span>
        <OptionToggle
          label="Multipass"
          checked={options.multipass}
          onChange={(v) => applyOption({ multipass: v })}
        />
        <OptionToggle
          label="Pretty"
          checked={options.pretty}
          onChange={(v) => applyOption({ pretty: v })}
        />
        <OptionToggle
          label="Remove Size"
          checked={options.removeDimensions}
          onChange={(v) => applyOption({ removeDimensions: v })}
        />
        <OptionToggle
          label="Convert Colors"
          checked={options.convertColors}
          onChange={(v) => applyOption({ convertColors: v })}
        />
        <OptionToggle
          label="Cleanup IDs"
          checked={options.cleanupIds}
          onChange={(v) => applyOption({ cleanupIds: v })}
        />
        <span className="text-border mx-1">|</span>
        <button
          onClick={onCopyDataUri}
          disabled={!previewSvg}
          className="px-2.5 py-1 rounded-lg btn-glass disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copyDataUriOk ? "Copied Data URI" : "Copy Data URI"}
        </button>
        <button
          onClick={onGenerateJsx}
          disabled={!!parseError || isGeneratingJsx}
          className="px-2.5 py-1 rounded-lg btn-glass disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingJsx ? "Generating…" : "Generate JSX"}
        </button>
      </div>

      {/* Main: Editor + Preview - Preview gets more space */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-4 p-4 overflow-hidden">
        <div className="lg:w-[45%] flex flex-col min-h-64 lg:min-h-0">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-txt-muted shrink-0 rounded-t-xl border border-b-0 border-border bg-bg-secondary">
            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
            <span className="font-medium">SVG Input</span>
          </div>
          <div className="flex-1 rounded-b-xl border border-border bg-bg-secondary overflow-hidden flex flex-col min-h-0">
            <CodeEditor
              value={svgText}
              onChange={(v) => setSvgText(v)}
              language="xml"
              placeholder={DEFAULT_SVG}
            />
          </div>
        </div>

        <div className="lg:w-[55%] flex flex-col min-h-64 lg:min-h-0">
          <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-txt-muted shrink-0 rounded-t-xl border border-b-0 border-border bg-bg-secondary">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  parseError ? "bg-error" : "bg-success",
                )}
              />
              <span className="font-medium">Live Preview</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onFit}
                className="px-2 py-1 rounded-lg text-[11px] btn-glass"
              >
                Fit
              </button>
              {optimizeInfo && !optimizeError && (
                <span className="text-[11px] text-success max-w-40 truncate">
                  {optimizeInfo}
                </span>
              )}
              <span className="text-[11px] text-txt-muted tabular-nums">
                {zoom}%
              </span>
              <input
                type="range"
                min={25}
                max={400}
                step={5}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-24 accent-accent"
                aria-label="Zoom"
              />
              <Search size={12} className="text-txt-muted" />
            </div>
          </div>

          {parseError ? (
            <div className="flex-1 rounded-b-xl border border-t-0 border-error/20 flex items-start gap-2 p-4 bg-error/5 text-error text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{parseError}</span>
            </div>
          ) : (
            <div className="flex-1 rounded-b-xl border border-border border-t-0 overflow-hidden bg-bg-secondary min-h-0">
              <div className="w-full h-full p-6 flex items-center justify-center overflow-auto bg-[linear-gradient(45deg,rgba(0,0,0,0.04)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.04)_75%,rgba(0,0,0,0.04)),linear-gradient(45deg,rgba(0,0,0,0.04)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.04)_75%,rgba(0,0,0,0.04))] bg-size-[20px_20px] bg-position-[0_0,10px_10px]">
                <motion.div
                  style={{
                    scale: zoomScale,
                    transformOrigin: "center center",
                  }}
                  className="will-change-transform"
                >
                  {sanitizedPreviewSvg ? (
                    <div
                      className="[&_svg]:block [&_svg]:w-80 md:[&_svg]:w-[28rem] lg:[&_svg]:w-88 xl:[&_svg]:w-96 [&_svg]:h-auto [&_svg]:max-w-none"
                      role="img"
                      aria-label="SVG preview"
                      dangerouslySetInnerHTML={{
                        __html: sanitizedPreviewSvg,
                      }}
                    />
                  ) : (
                    <div className="text-xs text-txt-muted">
                      Preparing preview…
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          )}

          {optimizeError && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-error">
              <AlertCircle size={12} />
              <span>{optimizeError}</span>
            </div>
          )}

          {jsxOutput && (
            <div className="mt-3 rounded-xl border border-border bg-bg-secondary p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">
                  React JSX Output
                </span>
                <button
                  onClick={onCopyJsx}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] btn-glass tr-smooth"
                  aria-label="Copy generated JSX"
                >
                  {copyJsxOk ? <Check size={10} /> : <Copy size={10} />}
                  {copyJsxOk ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-txt-sec whitespace-pre-wrap max-h-32 overflow-auto rounded-lg bg-bg-primary p-2">
                {jsxOutput}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 md:px-6 py-3 text-[11px] text-txt-muted flex items-center gap-2 border-t border-border/50 bg-bg-secondary/30">
        <ScanLine size={12} />
        Client-side SVG inspection and preview. No file upload to servers.
      </div>
    </div>
  );
}

function OptionToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      type="button"
      className={cn(
        "px-2.5 py-1 rounded-lg border tr-smooth",
        checked
          ? "bg-accent/10 border-accent/30 text-accent"
          : "bg-bg-primary border-border text-txt-muted hover:text-txt",
      )}
      aria-pressed={checked}
    >
      {label}
    </button>
  );
}
