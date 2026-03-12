"use client";
import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";
import cmykPlugin from "colord/plugins/cmyk";
import hwbPlugin from "colord/plugins/hwb";
import labPlugin from "colord/plugins/lab";
import lchPlugin from "colord/plugins/lch";
import namesPlugin from "colord/plugins/names";
import xyzPlugin from "colord/plugins/xyz";
import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

extend([
  a11yPlugin,
  cmykPlugin,
  hwbPlugin,
  namesPlugin,
  labPlugin,
  lchPlugin,
  xyzPlugin,
]);

function formatHsv(c: import("colord").Colord) {
  const { h, s, v, a } = c.toHsv();
  return a < 1 ? `hsva(${h}, ${s}%, ${v}%, ${a})` : `hsv(${h}, ${s}%, ${v}%)`;
}
function formatCmyk(c: import("colord").Colord) {
  const { c: cV, m, y, k, a } = c.toCmyk();
  return a < 1
    ? `cmyka(${cV}%, ${m}%, ${y}%, ${k}%, ${a})`
    : `cmyk(${cV}%, ${m}%, ${y}%, ${k}%)`;
}
function formatHwb(c: import("colord").Colord) {
  const { h, w, b, a } = c.toHwb();
  return a < 1 ? `hwb(${h} ${w}% ${b}% / ${a})` : `hwb(${h} ${w}% ${b}%)`;
}
function formatLab(c: import("colord").Colord) {
  const { l, a, b, alpha } = c.toLab();
  return alpha < 1 ? `lab(${l}% ${a} ${b} / ${alpha})` : `lab(${l}% ${a} ${b})`;
}
function formatLch(c: import("colord").Colord) {
  const { l, c: cV, h, a } = c.toLch();
  return a < 1 ? `lch(${l}% ${cV} ${h} / ${a})` : `lch(${l}% ${cV} ${h})`;
}
function formatXyz(c: import("colord").Colord) {
  const { x, y, z, a } = c.toXyz();
  return a < 1
    ? `color(xyz ${x} ${y} ${z} / ${a})`
    : `color(xyz ${x} ${y} ${z})`;
}

type ColorFormats = {
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
  cmyk: string;
  hwb: string;
  lab: string;
  lch: string;
  xyz: string;
  name: string;
};

const PRESETS = [
  "#64748b",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ffffff",
  "#000000",
];

const ColorResult = ({
  label,
  formatKey,
  value,
  copied,
  onUpdate,
  onBlur,
  onCopy,
}: {
  label: string;
  formatKey: keyof ColorFormats;
  value: string;
  copied: boolean;
  onUpdate: (val: string, key: keyof ColorFormats) => void;
  onBlur: () => void;
  onCopy: (key: keyof ColorFormats) => void;
}) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-medium tracking-wider text-txt-muted uppercase">
      {label}
    </label>
    <div className="flex items-center gap-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => onUpdate(e.target.value, formatKey)}
        onBlur={onBlur}
        className="font-mono text-sm h-9 rounded-lg border-border bg-bg-primary focus-visible:border-accent/50"
      />
      <button
        onClick={() => onCopy(formatKey)}
        className={cn(
          "shrink-0 flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
          copied
            ? "bg-success/15 border-success/30 text-success"
            : "bg-bg-primary border-border text-txt-muted hover:text-txt hover:border-txt/20",
        )}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  </div>
);

export default function ColorConverterClient() {
  const [color, setColor] = useState(() => colord("#64748b"));
  const [copied, setCopied] = useState<keyof ColorFormats | null>(null);
  const [activeInput, setActiveInput] = useState<{
    key: keyof ColorFormats;
    value: string;
  } | null>(null);

  const updateColor = (val: string, key: keyof ColorFormats) => {
    setActiveInput({ key, value: val });
    const parsed = colord(val);
    if (parsed.isValid()) {
      setColor(parsed);
    }
  };

  const copy = async (key: keyof ColorFormats, val: string) => {
    try {
      await navigator.clipboard.writeText(val);
    } catch {}
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const formats: ColorFormats = {
    hex: color.toHex(),
    rgb: color.toRgbString(),
    hsl: color.toHslString(),
    hsv: formatHsv(color),
    cmyk: formatCmyk(color),
    hwb: formatHwb(color),
    lab: formatLab(color),
    lch: formatLch(color),
    xyz: formatXyz(color),
    name: color.toName({ closest: true }) || "None",
  };

  const getValue = (k: keyof ColorFormats) => {
    if (activeInput?.key === k) return activeInput.value;
    return formats[k];
  };

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col h-full bg-bg-primary anim-in w-full">
      <ToolHeader title="Color Converter" />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-border overflow-hidden">
        {/* Left: Input + Formats */}
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto min-w-0">
          <div className="max-w-xl mx-auto w-full space-y-5">
            {/* Main color input + picker */}
            <div className="flex gap-2">
              <Input
                type="text"
                value={getValue("hex")}
                onChange={(e) => updateColor(e.target.value, "hex")}
                onBlur={() => setActiveInput(null)}
                className="flex-1 h-11 rounded-xl font-mono text-base font-medium tracking-wide border-border bg-bg-primary focus-visible:border-accent/60"
                placeholder="#000000 or rgb(0,0,0)..."
              />
              <div className="relative shrink-0 w-11 h-11 rounded-xl border border-border overflow-hidden bg-bg-primary flex items-center justify-center cursor-pointer hover:border-accent/40 transition-colors">
                <input
                  type="color"
                  value={formats.hex}
                  onChange={(e) => updateColor(e.target.value, "hex")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="w-7 h-7 rounded-md border border-black/10 dark:border-white/10 shadow-inner"
                  style={{ backgroundColor: formats.hex }}
                />
              </div>
            </div>

            {/* Preset swatches */}
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setColor(colord(preset))}
                  className={cn(
                    "w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent/50",
                    formats.hex.toLowerCase() === preset.toLowerCase()
                      ? "border-accent ring-2 ring-accent/30"
                      : "border-border/60 hover:border-txt/30",
                  )}
                  style={{ backgroundColor: preset }}
                  title={preset}
                />
              ))}
            </div>

            {/* Common formats - 2 column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorResult
                label="HEX"
                formatKey="hex"
                value={getValue("hex")}
                copied={copied === "hex"}
                onUpdate={updateColor}
                onBlur={() => setActiveInput(null)}
                onCopy={() => copy("hex", formats.hex)}
              />
              <ColorResult
                label="Name"
                formatKey="name"
                value={getValue("name")}
                copied={copied === "name"}
                onUpdate={updateColor}
                onBlur={() => setActiveInput(null)}
                onCopy={() => copy("name", formats.name)}
              />
              <ColorResult
                label="RGB"
                formatKey="rgb"
                value={getValue("rgb")}
                copied={copied === "rgb"}
                onUpdate={updateColor}
                onBlur={() => setActiveInput(null)}
                onCopy={() => copy("rgb", formats.rgb)}
              />
              <ColorResult
                label="HSL"
                formatKey="hsl"
                value={getValue("hsl")}
                copied={copied === "hsl"}
                onUpdate={updateColor}
                onBlur={() => setActiveInput(null)}
                onCopy={() => copy("hsl", formats.hsl)}
              />
            </div>

            {/* Advanced formats - collapsible */}
            <div className="border border-border/60 rounded-xl overflow-hidden bg-bg-secondary/50">
              <button
                onClick={() => setShowAdvanced((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-txt-muted hover:text-txt hover:bg-bg-primary/50 transition-colors"
              >
                <span>Advanced formats</span>
                {showAdvanced ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0 border-t border-border/60">
                  <ColorResult
                    label="HSV"
                    formatKey="hsv"
                    value={getValue("hsv")}
                    copied={copied === "hsv"}
                    onUpdate={updateColor}
                    onBlur={() => setActiveInput(null)}
                    onCopy={() => copy("hsv", formats.hsv)}
                  />
                  <ColorResult
                    label="CMYK"
                    formatKey="cmyk"
                    value={getValue("cmyk")}
                    copied={copied === "cmyk"}
                    onUpdate={updateColor}
                    onBlur={() => setActiveInput(null)}
                    onCopy={() => copy("cmyk", formats.cmyk)}
                  />
                  <ColorResult
                    label="HWB"
                    formatKey="hwb"
                    value={getValue("hwb")}
                    copied={copied === "hwb"}
                    onUpdate={updateColor}
                    onBlur={() => setActiveInput(null)}
                    onCopy={() => copy("hwb", formats.hwb)}
                  />
                  <ColorResult
                    label="LAB"
                    formatKey="lab"
                    value={getValue("lab")}
                    copied={copied === "lab"}
                    onUpdate={updateColor}
                    onBlur={() => setActiveInput(null)}
                    onCopy={() => copy("lab", formats.lab)}
                  />
                  <ColorResult
                    label="LCH"
                    formatKey="lch"
                    value={getValue("lch")}
                    copied={copied === "lch"}
                    onUpdate={updateColor}
                    onBlur={() => setActiveInput(null)}
                    onCopy={() => copy("lch", formats.lch)}
                  />
                  <ColorResult
                    label="XYZ"
                    formatKey="xyz"
                    value={getValue("xyz")}
                    copied={copied === "xyz"}
                    onUpdate={updateColor}
                    onBlur={() => setActiveInput(null)}
                    onCopy={() => copy("xyz", formats.xyz)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview + Contrast */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-6 lg:p-8 bg-bg-secondary/50 relative overflow-auto">
          <div className="absolute inset-0 dotted-bg opacity-[0.06]" />
          <div className="relative w-full max-w-sm space-y-5">
            {/* Large color preview - split white/black */}
            <div className="rounded-2xl overflow-hidden border border-border/60 shadow-xl">
              <div
                className="aspect-4/3 flex flex-col transition-colors duration-200"
                style={{ backgroundColor: formats.rgb }}
              >
                <div className="flex-1 flex items-center justify-center p-6">
                  <span
                    className="text-2xl font-semibold drop-shadow-sm"
                    style={{
                      color: color.isDark() ? "#ffffff" : "#000000",
                    }}
                  >
                    Aa
                  </span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-black/10">
                  <div className="flex items-center justify-center py-4 bg-white/90">
                    <span
                      className="text-sm font-medium"
                      style={{ color: formats.hex }}
                    >
                      Text on white
                    </span>
                  </div>
                  <div className="flex items-center justify-center py-4 bg-black/90">
                    <span
                      className="text-sm font-medium"
                      style={{ color: formats.hex }}
                    >
                      Text on black
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contrast checker */}
            <div className="rounded-xl border border-border/60 bg-bg-primary/90 p-4 space-y-3">
              <p className="text-[11px] font-medium tracking-wider text-txt-muted uppercase">
                WCAG Contrast
              </p>
                <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/60 p-3 flex items-center gap-3 bg-bg-primary">
                  <div
                    className="w-12 h-12 rounded-lg shrink-0 border border-black/10 dark:border-white/10 flex items-center justify-center"
                    style={{ backgroundColor: formats.hex }}
                  >
                    <span
                      className="text-xs font-bold drop-shadow"
                      style={{
                        color: color.isDark() ? "#fff" : "#000",
                      }}
                    >
                      A
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-txt-muted">vs White</p>
                    <p className="text-sm font-mono font-semibold text-txt">
                      {color.contrast("#ffffff").toFixed(1)}:1
                    </p>
                    <p className="text-[10px] text-txt-muted">
                      {color.isReadable("#ffffff", {
                        level: "AAA",
                        size: "normal",
                      })
                        ? "AAA ✓"
                        : color.isReadable("#ffffff", {
                              level: "AA",
                              size: "normal",
                            })
                          ? "AA ✓"
                          : "Fail"}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 p-3 flex items-center gap-3 bg-bg-primary">
                  <div
                    className="w-12 h-12 rounded-lg shrink-0 border border-black/10 dark:border-white/10 flex items-center justify-center"
                    style={{ backgroundColor: formats.hex }}
                  >
                    <span
                      className="text-xs font-bold drop-shadow"
                      style={{
                        color: color.isDark() ? "#fff" : "#000",
                      }}
                    >
                      A
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-txt-muted">vs Black</p>
                    <p className="text-sm font-mono font-semibold text-txt">
                      {color.contrast("#000000").toFixed(1)}:1
                    </p>
                    <p className="text-[10px] text-txt-muted">
                      {color.isReadable("#000000", {
                        level: "AAA",
                        size: "normal",
                      })
                        ? "AAA ✓"
                        : color.isReadable("#000000", {
                              level: "AA",
                              size: "normal",
                            })
                          ? "AA ✓"
                          : "Fail"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
