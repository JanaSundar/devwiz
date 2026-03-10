"use client";

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
import Image from "next/image";
import htmlParser from "prettier/parser-html.js";
import { format } from "prettier/standalone.js";
import { useEffect, useMemo, useRef, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ThemeToggle from "@/components/ThemeToggle";

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

  const dataUrl = useMemo(() => {
    if (!mounted) return "";
    const sourceSvg = parseError ? lastValidSvg : svgText;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sourceSvg)}`;
  }, [mounted, parseError, lastValidSvg, svgText]);

  const onUploadClick = () => fileInputRef.current?.click();

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
      const prettySvg = await format(svgText, {
        parser: "html",
        plugins: [htmlParser],
        htmlWhitespaceSensitivity: "ignore",
        tabWidth: 2,
      });

      setSvgText(prettySvg);
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
      const data = await res.json();

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
    if (!dataUrl) return;
    try {
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
      const data = await res.json();
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
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border gap-3 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 pl-10 md:pl-0 min-w-0 flex-1">
          <h2 className="text-base md:text-lg font-semibold text-txt truncate">
            SVG Viewer
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/15">
            Converters
          </span>
        </div>
        <div className="flex items-center gap-2 w-auto shrink-0 overflow-x-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={(e) => onUploadFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={onUploadClick}
            className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs btn-glass"
          >
            <Upload size={12} />
            Upload
          </button>
          <button
            onClick={onDownload}
            className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs btn-glass"
          >
            <Download size={12} />
            Download
          </button>
          <button
            onClick={onPrettify}
            className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs btn-glass"
          >
            <Wand2 size={12} />
            Prettify
          </button>
          <button
            onClick={() => void onOptimize()}
            disabled={!!parseError || isOptimizing}
            className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs btn-glass disabled:opacity-50 disabled:cursor-not-allowed"
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
            className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tr-smooth ${copied ? "bg-success/15 text-success border border-success/20" : "btn-accent"}`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy SVG"}
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="px-4 md:px-6 py-2 border-b border-border bg-bg-secondary/50">
        <div className="flex flex-wrap items-center gap-2 text-xs">
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
          <button
            onClick={onCopyDataUri}
            disabled={!dataUrl}
            className="px-2 py-1 rounded btn-glass disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copyDataUriOk ? "Copied Data URI" : "Copy Data URI"}
          </button>
          <button
            onClick={onGenerateJsx}
            disabled={!!parseError || isGeneratingJsx}
            className="px-2 py-1 rounded btn-glass disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingJsx ? "Generating JSX..." : "Generate JSX"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-4 gap-4 overflow-y-auto lg:overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 min-h-75 lg:min-h-0">
          <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-txt-muted border-b border-border shrink-0 min-h-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
              <span className="font-medium shrink-0">SVG INPUT</span>
            </div>
          </div>
          <div className="flex-1 rounded-b-xl border border-border bg-bg-secondary overflow-hidden flex flex-col">
            <CodeEditor
              value={svgText}
              onChange={(v) => setSvgText(v)}
              language="xml"
              placeholder={DEFAULT_SVG}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 min-h-75 lg:min-h-0">
          <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-txt-muted border-b border-border shrink-0 min-h-10">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${parseError ? "bg-error" : "bg-success"}`}
              />
              <span className="font-medium shrink-0">LIVE PREVIEW</span>
            </div>
            <div className="ml-auto flex items-center gap-2 shrink-0 whitespace-nowrap">
              <button
                onClick={onFit}
                className="px-2 py-1 rounded text-[11px] btn-glass"
              >
                Fit
              </button>
              {optimizeInfo && !optimizeError && (
                <span className="text-[11px] text-success max-w-56 truncate">
                  {optimizeInfo}
                </span>
              )}
              <span className="text-[11px] text-txt-muted">{zoom}%</span>
              <input
                type="range"
                min={25}
                max={400}
                step={5}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-28"
                aria-label="Zoom"
              />
              <Search size={12} />
            </div>
          </div>

          {parseError ? (
            <div className="flex-1 rounded-b-xl border border-error/20 bg-error/5 p-4 text-xs text-error font-mono flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{parseError}</span>
            </div>
          ) : (
            <div className="flex-1 rounded-b-xl border border-border bg-bg-secondary overflow-hidden">
              <div className="w-full h-full p-4">
                <div className="w-full h-full rounded-xl border border-border bg-[linear-gradient(45deg,rgba(0,0,0,0.04)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.04)_75%,rgba(0,0,0,0.04)),linear-gradient(45deg,rgba(0,0,0,0.04)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.04)_75%,rgba(0,0,0,0.04))] bg-size-[20px_20px] bg-position-[0_0,10px_10px] flex items-center justify-center overflow-auto">
                  <div
                    style={{
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "center center",
                    }}
                    className="transition-transform duration-150"
                  >
                    {/* Data URI preview uses a plain img to render raw SVG safely without server roundtrips. */}
                    {dataUrl ? (
                      <Image
                        src={dataUrl}
                        alt="SVG preview"
                        width={1200}
                        height={1200}
                        unoptimized
                        className="max-w-none w-auto h-auto"
                        draggable={false}
                      />
                    ) : (
                      <div className="text-xs text-txt-muted">
                        Preparing preview...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {optimizeError && (
            <div className="mt-2 text-xs text-error flex items-center gap-1.5">
              <AlertCircle size={12} />
              <span>{optimizeError}</span>
            </div>
          )}
          {jsxOutput && (
            <div className="mt-2 rounded-lg border border-border bg-bg-secondary p-2">
              <div className="mb-1 flex items-center justify-between">
                <div className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">
                  React JSX Output
                </div>
                <button
                  onClick={onCopyJsx}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] btn-glass tr-smooth"
                  aria-label="Copy generated JSX"
                >
                  {copyJsxOk ? <Check size={10} /> : <Copy size={10} />}
                  {copyJsxOk ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-txt-sec whitespace-pre-wrap max-h-40 overflow-auto">
                {jsxOutput}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-4 text-[11px] text-txt-muted flex items-center gap-2">
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
      className={`px-2 py-1 rounded border tr-smooth ${checked ? "bg-accent/10 border-accent/30 text-accent" : "bg-bg-primary border-border text-txt-muted"}`}
      aria-pressed={checked}
      type="button"
    >
      {label}
    </button>
  );
}
