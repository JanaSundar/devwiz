"use client";
import { Palette, Plus } from "lucide-react";
import { useState } from "react";

interface BadgePickerProps {
  onInsert: (badgeMarkdown: string) => void;
}

interface PresetBadge {
  label: string;
  message: string;
  color: string;
  category: string;
}

const PRESET_BADGES: PresetBadge[] = [
  // License
  { label: "license", message: "MIT", color: "blue", category: "License" },
  {
    label: "license",
    message: "Apache_2.0",
    color: "blue",
    category: "License",
  },
  { label: "license", message: "GPL_v3", color: "blue", category: "License" },
  {
    label: "license",
    message: "BSD_3--Clause",
    color: "blue",
    category: "License",
  },
  // Build & CI
  {
    label: "build",
    message: "passing",
    color: "brightgreen",
    category: "Build",
  },
  { label: "build", message: "failing", color: "red", category: "Build" },
  {
    label: "tests",
    message: "passing",
    color: "brightgreen",
    category: "Build",
  },
  { label: "CI", message: "passing", color: "brightgreen", category: "Build" },
  // Version & Release
  { label: "version", message: "1.0.0", color: "green", category: "Version" },
  { label: "npm", message: "v1.0.0", color: "cb3837", category: "Version" },
  { label: "release", message: "stable", color: "green", category: "Version" },
  // Quality
  {
    label: "coverage",
    message: "95%25",
    color: "brightgreen",
    category: "Quality",
  },
  {
    label: "code_quality",
    message: "A+",
    color: "brightgreen",
    category: "Quality",
  },
  {
    label: "maintainability",
    message: "A",
    color: "green",
    category: "Quality",
  },
  // Platform
  {
    label: "platform",
    message: "node.js",
    color: "339933",
    category: "Platform",
  },
  {
    label: "made_with",
    message: "TypeScript",
    color: "3178c6",
    category: "Platform",
  },
  {
    label: "made_with",
    message: "React",
    color: "61dafb",
    category: "Platform",
  },
  {
    label: "made_with",
    message: "Next.js",
    color: "000000",
    category: "Platform",
  },
  // Status
  {
    label: "status",
    message: "active",
    color: "brightgreen",
    category: "Status",
  },
  {
    label: "PRs",
    message: "welcome",
    color: "brightgreen",
    category: "Status",
  },
  {
    label: "contributions",
    message: "welcome",
    color: "brightgreen",
    category: "Status",
  },
];

const BADGE_COLORS = [
  { name: "Green", value: "brightgreen" },
  { name: "Green", value: "green" },
  { name: "Yellow", value: "yellow" },
  { name: "Orange", value: "orange" },
  { name: "Red", value: "red" },
  { name: "Blue", value: "blue" },
  { name: "Info", value: "informational" },
  { name: "Light", value: "lightgrey" },
  { name: "Critical", value: "critical" },
  { name: "Important", value: "important" },
  { name: "Success", value: "success" },
];

const COLOR_HEX: Record<string, string> = {
  brightgreen: "#4c1",
  green: "#97ca00",
  yellow: "#dfb317",
  orange: "#fe7d37",
  red: "#e05d44",
  blue: "#007ec6",
  informational: "#0070a8",
  lightgrey: "#9f9f9f",
  critical: "#e05d44",
  important: "#fe7d37",
  success: "#4c1",
};

function buildBadgeUrl(label: string, message: string, color: string) {
  return `https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(message)}-${color}`;
}

function buildBadgeMarkdown(label: string, message: string, color: string) {
  return `![${label}](${buildBadgeUrl(label, message, color)})`;
}

export default function BadgePicker({ onInsert }: BadgePickerProps) {
  const [tab, setTab] = useState<"presets" | "custom">("presets");
  const [customLabel, setCustomLabel] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [customColor, setCustomColor] = useState("blue");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const categories = [...new Set(PRESET_BADGES.map((b) => b.category))];

  const handlePresetClick = (badge: PresetBadge) => {
    onInsert(buildBadgeMarkdown(badge.label, badge.message, badge.color));
  };

  const handleCustomSubmit = () => {
    if (!customLabel.trim() || !customMessage.trim()) return;
    onInsert(
      buildBadgeMarkdown(customLabel.trim(), customMessage.trim(), customColor),
    );
    setCustomLabel("");
    setCustomMessage("");
  };

  return (
    <div className="border border-border rounded-lg bg-bg-primary overflow-hidden anim-in">
      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setTab("presets")}
          className={`flex-1 px-3 py-2 text-[11px] font-medium tr-smooth ${tab === "presets" ? "text-accent bg-accent/8 border-b-2 border-accent" : "text-txt-muted hover:text-txt-sec"}`}
        >
          Preset Badges
        </button>
        <button
          onClick={() => setTab("custom")}
          className={`flex-1 px-3 py-2 text-[11px] font-medium tr-smooth ${tab === "custom" ? "text-accent bg-accent/8 border-b-2 border-accent" : "text-txt-muted hover:text-txt-sec"}`}
        >
          Custom Badge
        </button>
      </div>

      {tab === "presets" ? (
        <div className="p-3 space-y-3 max-h-[260px] overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat}>
              <p className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider mb-1.5">
                {cat}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_BADGES.filter((b) => b.category === cat).map(
                  (badge, i) => (
                    <button
                      key={i}
                      onClick={() => handlePresetClick(badge)}
                      className="group/badge flex items-center gap-1 px-1.5 py-1 rounded-md border border-border hover:border-accent/30 bg-bg-secondary hover:bg-accent/5 tr-smooth"
                      title={`Add ${badge.label}: ${badge.message}`}
                    >
                      {/* Mini badge preview */}
                      <span className="flex items-center text-[9px] font-mono leading-none rounded overflow-hidden">
                        <span className="px-1.5 py-0.5 bg-txt-muted/20 text-txt-sec">
                          {badge.label.replace(/_/g, " ")}
                        </span>
                        <span
                          className="px-1.5 py-0.5 text-white"
                          style={{
                            backgroundColor:
                              COLOR_HEX[badge.color] || `#${badge.color}`,
                          }}
                        >
                          {badge.message
                            .replace(/_/g, " ")
                            .replace(/--/g, "-")
                            .replace(/%25/g, "%")}
                        </span>
                      </span>
                      <Plus
                        size={10}
                        className="text-txt-muted opacity-0 group-hover/badge:opacity-100 tr-smooth shrink-0"
                      />
                    </button>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 space-y-3">
          {/* Live preview */}
          {customLabel && customMessage && (
            <div className="flex items-center justify-center py-2">
              <span className="flex items-center text-xs font-mono leading-none rounded overflow-hidden shadow-sm">
                <span className="px-2 py-1 bg-txt-muted/20 text-txt-sec">
                  {customLabel}
                </span>
                <span
                  className="px-2 py-1 text-white"
                  style={{
                    backgroundColor:
                      COLOR_HEX[customColor] || `#${customColor}`,
                  }}
                >
                  {customMessage}
                </span>
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-txt-muted font-medium mb-1 block">
                Label
              </label>
              <input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g. build"
                className="w-full px-2 py-1.5 text-xs rounded-md bg-bg-secondary border border-border text-txt placeholder:text-txt-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-txt-muted font-medium mb-1 block">
                Message
              </label>
              <input
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="e.g. passing"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCustomSubmit();
                }}
                className="w-full px-2 py-1.5 text-xs rounded-md bg-bg-secondary border border-border text-txt placeholder:text-txt-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
            </div>
          </div>

          {/* Color picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] text-txt-muted font-medium">
                Color
              </label>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="text-[10px] text-accent hover:text-accent-light tr-smooth flex items-center gap-0.5"
              >
                <Palette size={10} />
                {showColorPicker ? "Hide" : "More"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(showColorPicker ? BADGE_COLORS : BADGE_COLORS.slice(0, 6)).map(
                (c) => (
                  <button
                    key={c.value}
                    onClick={() => setCustomColor(c.value)}
                    className={`w-6 h-6 rounded-md border-2 tr-smooth ${customColor === c.value ? "border-accent scale-110" : "border-transparent hover:scale-105"}`}
                    style={{ backgroundColor: COLOR_HEX[c.value] }}
                    title={c.name}
                  />
                ),
              )}
            </div>
          </div>

          <button
            onClick={handleCustomSubmit}
            disabled={!customLabel.trim() || !customMessage.trim()}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs btn-accent disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={12} />
            Add Badge
          </button>
        </div>
      )}
    </div>
  );
}
