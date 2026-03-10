"use client";
import { colord, extend } from "colord";
import cmykPlugin from "colord/plugins/cmyk";
import hwbPlugin from "colord/plugins/hwb";
import labPlugin from "colord/plugins/lab";
import lchPlugin from "colord/plugins/lch";
import namesPlugin from "colord/plugins/names";
import xyzPlugin from "colord/plugins/xyz";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";

extend([cmykPlugin, hwbPlugin, namesPlugin, labPlugin, lchPlugin, xyzPlugin]);

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
  <div className="py-2 space-y-2">
    <label className="text-xs font-bold tracking-wider text-txt-muted uppercase">
      {label}
    </label>
    <div className="flex items-center gap-3">
      <Input
        type="text"
        value={value}
        onChange={(e) => onUpdate(e.target.value, formatKey)}
        onBlur={onBlur}
        className="font-mono text-sm font-semibold tracking-wider h-10 w-full"
      />
      <button
        onClick={() => onCopy(formatKey)}
        className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-md border shadow-sm transition-colors ${copied ? "bg-success/20 border-success/30 text-success" : "bg-bg-secondary hover:bg-bg border-border text-txt-muted hover:text-txt"}`}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  </div>
);

export default function ColorConverterClient() {
  const [color, setColor] = useState(() => colord("#ff5c5c"));
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

  return (
    <div className="flex flex-col h-full bg-bg anim-in w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 py-4 border-b border-border bg-bg-secondary shrink-0 gap-4 md:gap-0">
        <div className="flex items-center gap-2 md:gap-3 pl-10 md:pl-0 min-w-0 flex-1">
          <h2 className="text-base md:text-lg font-semibold text-txt truncate uppercase tracking-wide">
            Color Converter
          </h2>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Left Side: Inputs */}
        <div className="flex-1 flex flex-col p-6 lg:p-10 overflow-y-auto w-full items-center">
          <div className="flex flex-col max-w-85 w-full">
            <div className="flex h-12 mb-8 items-center w-full">
              <Input
                type="text"
                value={getValue("hex")}
                onChange={(e) => updateColor(e.target.value, "hex")}
                onBlur={() => setActiveInput(null)}
                className="h-full rounded-r-none font-mono text-base font-bold tracking-wider focus-visible:ring-0 focus-visible:border-accent"
                placeholder="Enter hex code..."
              />
              <div className="relative group w-12 h-12 shrink-0 border border-l-0 border-border rounded-r-md overflow-hidden bg-bg-secondary flex items-center justify-center cursor-pointer hover:bg-bg transition-colors">
                <input
                  type="color"
                  value={formats.hex}
                  onChange={(e) => updateColor(e.target.value, "hex")}
                  className="absolute inset-0 w-24 h-24 -top-4 -left-4 opacity-0 cursor-pointer z-10"
                />
                <div
                  className="w-8 h-8 rounded-md shadow-sm border border-black/10"
                  style={{ backgroundColor: formats.hex }}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
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
                label="HSL"
                formatKey="hsl"
                value={getValue("hsl")}
                copied={copied === "hsl"}
                onUpdate={updateColor}
                onBlur={() => setActiveInput(null)}
                onCopy={() => copy("hsl", formats.hsl)}
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
          </div>
        </div>

        {/* Right Side: Visualizer */}
        <div className="flex-[1.5] flex justify-center items-center bg-bg-secondary p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 dotted-bg opacity-30"></div>
          <div className="relative p-3 bg-bg/50 backdrop-blur-sm border border-border rounded-2xl shadow-2xl transition-transform hover:scale-[1.02] duration-500">
            <div
              className="w-70 h-95 lg:w-100 lg:h-125 rounded-xl transition-colors duration-200"
              style={{
                backgroundColor: formats.rgb,
                boxShadow: `inset 0 0 20px rgba(0,0,0,0.1), 0 0 100px -20px ${formats.rgb}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
