"use client";

import { colord } from "colord";
import {
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  Palette,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ToolHeader from "@/components/tooling/ToolHeader";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ThemeType = "dark" | "light";

type WorkbenchColors = {
  "editor.background": string;
  "editor.foreground": string;
  "activityBar.background": string;
  "activityBar.foreground": string;
  "sideBar.background": string;
  "sideBar.foreground": string;
  "statusBar.background": string;
  "statusBar.foreground": string;
  "titleBar.activeBackground": string;
  "titleBar.activeForeground": string;
};

type TokenColors = {
  comment: string;
  string: string;
  keyword: string;
  number: string;
  variable: string;
  function: string;
  type: string;
};

const DEFAULT_DARK: WorkbenchColors & TokenColors = {
  "editor.background": "#1e1e1e",
  "editor.foreground": "#d4d4d4",
  "activityBar.background": "#333333",
  "activityBar.foreground": "#ffffff",
  "sideBar.background": "#252526",
  "sideBar.foreground": "#cccccc",
  "statusBar.background": "#007acc",
  "statusBar.foreground": "#ffffff",
  "titleBar.activeBackground": "#3c3c3c",
  "titleBar.activeForeground": "#cccccc",
  comment: "#6a9955",
  string: "#ce9178",
  keyword: "#569cd6",
  number: "#b5cea8",
  variable: "#9cdcfe",
  function: "#dcdcaa",
  type: "#4ec9b0",
};

const PRESETS = [
  {
    name: "One Dark",
    type: "dark" as ThemeType,
    colors: {
      ...DEFAULT_DARK,
      "editor.background": "#282c34",
      "editor.foreground": "#abb2bf",
      "activityBar.background": "#21252b",
      "sideBar.background": "#21252b",
      "statusBar.background": "#21252b",
      "titleBar.activeBackground": "#282c34",
      comment: "#5c6370",
      string: "#98c379",
      keyword: "#c678dd",
      number: "#d19a66",
      variable: "#e06c75",
      function: "#61afef",
      type: "#56b6c2",
    },
  },
  {
    name: "Dracula",
    type: "dark" as ThemeType,
    colors: {
      ...DEFAULT_DARK,
      "editor.background": "#282a36",
      "editor.foreground": "#f8f8f2",
      "activityBar.background": "#21222c",
      "sideBar.background": "#21222c",
      "statusBar.background": "#21222c",
      "titleBar.activeBackground": "#282a36",
      comment: "#6272a4",
      string: "#f1fa8c",
      keyword: "#ff79c6",
      number: "#bd93f9",
      variable: "#8be9fd",
      function: "#50fa7b",
      type: "#ffb86c",
    },
  },
  {
    name: "GitHub Dark",
    type: "dark" as ThemeType,
    colors: {
      ...DEFAULT_DARK,
      "editor.background": "#0d1117",
      "editor.foreground": "#c9d1d9",
      "activityBar.background": "#010409",
      "sideBar.background": "#010409",
      "statusBar.background": "#161b22",
      "titleBar.activeBackground": "#161b22",
      comment: "#8b949e",
      string: "#a5d6ff",
      keyword: "#ff7b72",
      number: "#79c0ff",
      variable: "#ffa657",
      function: "#d2a8ff",
      type: "#7ee787",
    },
  },
  {
    name: "Nord",
    type: "dark" as ThemeType,
    colors: {
      ...DEFAULT_DARK,
      "editor.background": "#2e3440",
      "editor.foreground": "#d8dee9",
      "activityBar.background": "#2e3440",
      "sideBar.background": "#2e3440",
      "statusBar.background": "#2e3440",
      "titleBar.activeBackground": "#3b4252",
      comment: "#616e88",
      string: "#a3be8c",
      keyword: "#81a1c1",
      number: "#b48ead",
      variable: "#88c0d0",
      function: "#8fbcbb",
      type: "#ebcb8b",
    },
  },
  {
    name: "Light+",
    type: "light" as ThemeType,
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#000000",
      "activityBar.background": "#f3f3f3",
      "activityBar.foreground": "#333333",
      "sideBar.background": "#f3f3f3",
      "sideBar.foreground": "#333333",
      "statusBar.background": "#007acc",
      "statusBar.foreground": "#ffffff",
      "titleBar.activeBackground": "#ffffff",
      "titleBar.activeForeground": "#333333",
      comment: "#008000",
      string: "#a31515",
      keyword: "#0000ff",
      number: "#098658",
      variable: "#001080",
      function: "#795e26",
      type: "#267f99",
    },
  },
];

const WORKBENCH_KEYS: (keyof WorkbenchColors)[] = [
  "editor.background",
  "editor.foreground",
  "activityBar.background",
  "activityBar.foreground",
  "sideBar.background",
  "sideBar.foreground",
  "statusBar.background",
  "statusBar.foreground",
  "titleBar.activeBackground",
  "titleBar.activeForeground",
];

const TOKEN_KEYS: (keyof TokenColors)[] = [
  "comment",
  "string",
  "keyword",
  "number",
  "variable",
  "function",
  "type",
];

const TOKEN_LABELS: Record<keyof TokenColors, string> = {
  comment: "Comment",
  string: "String",
  keyword: "Keyword",
  number: "Number",
  variable: "Variable",
  function: "Function",
  type: "Type",
};

function buildThemeJson(
  name: string,
  type: ThemeType,
  workbench: WorkbenchColors,
  tokens: TokenColors,
): string {
  const colors: Record<string, string> = { ...workbench };
  const tokenColors = [
    ...TOKEN_KEYS.map((scope) => ({
      scope: [scope],
      settings: { foreground: tokens[scope] },
    })),
  ];

  const theme = {
    name,
    type,
    colors,
    tokenColors,
  };

  return JSON.stringify(theme, null, 2);
}

function ColorPicker({
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const valid = colord(value).isValid();
  return (
    <div className="flex items-center gap-2 group">
      <div className="relative shrink-0 w-9 h-9 rounded-xl border-2 border-border/80 overflow-hidden bg-bg-primary flex items-center justify-center cursor-pointer hover:border-accent/50 hover:scale-105 transition-all duration-200 shadow-sm">
        <input
          type="color"
          value={valid ? colord(value).toHex() : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="w-full h-full rounded-xl ring-1 ring-inset ring-black/5 dark:ring-white/5"
          style={{ backgroundColor: valid ? value : "#333" }}
        />
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "font-mono text-[12px] h-9 flex-1 min-w-0 rounded-xl border-border/80 bg-bg-primary/80 focus-visible:ring-2 focus-visible:ring-accent/20",
          !valid && "border-error/50 focus-visible:ring-error/20",
        )}
        placeholder="#000000"
      />
    </div>
  );
}

const PREVIEW_CODE = `// Sample code preview
function greet(name: string): string {
  const message = "Hello, " + name;
  return message; // comment
}

const count = 42;
const result = greet("World");`;

export default function VscodeThemeGeneratorClient() {
  const [themeName, setThemeName] = useState("My Custom Theme");
  const [themeType, setThemeType] = useState<ThemeType>("dark");
  const [workbench, setWorkbench] = useState<WorkbenchColors>(() => ({
    ...DEFAULT_DARK,
  }));
  const [tokens, setTokens] = useState<TokenColors>(() => ({
    comment: DEFAULT_DARK.comment,
    string: DEFAULT_DARK.string,
    keyword: DEFAULT_DARK.keyword,
    number: DEFAULT_DARK.number,
    variable: DEFAULT_DARK.variable,
    function: DEFAULT_DARK.function,
    type: DEFAULT_DARK.type,
  }));
  const [copied, setCopied] = useState(false);
  const [workbenchOpen, setWorkbenchOpen] = useState(true);
  const [tokensOpen, setTokensOpen] = useState(true);

  const applyPreset = useCallback((preset: (typeof PRESETS)[number]) => {
    setThemeType(preset.type);
    const wb: Partial<WorkbenchColors> = {};
    const tok: Partial<TokenColors> = {};
    for (const k of WORKBENCH_KEYS) {
      wb[k] = preset.colors[k];
    }
    for (const k of TOKEN_KEYS) {
      tok[k] = preset.colors[k];
    }
    setWorkbench((prev) => ({ ...prev, ...wb }));
    setTokens((prev) => ({ ...prev, ...tok }));
  }, []);

  const updateWorkbench = useCallback(
    (key: keyof WorkbenchColors, value: string) => {
      setWorkbench((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateToken = useCallback((key: keyof TokenColors, value: string) => {
    setTokens((prev) => ({ ...prev, [key]: value }));
  }, []);

  const themeJson = useMemo(
    () => buildThemeJson(themeName, themeType, workbench, tokens),
    [themeName, themeType, workbench, tokens],
  );

  const copyTheme = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(themeJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [themeJson]);

  const downloadTheme = useCallback(() => {
    const blob = new Blob([themeJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${themeName.toLowerCase().replace(/\s+/g, "-")}-color-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [themeJson, themeName]);

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader
        title="VSCode Theme Generator"
        badge="Utilities"
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              onClick={copyTheme}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                copied
                  ? "bg-success/15 text-success border border-success/30"
                  : "btn-glass hover:border-accent/40 hover:bg-accent/5",
              )}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={downloadTheme}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium btn-glass hover:border-accent/40 hover:bg-accent/5 transition-all duration-200"
            >
              <Download size={14} />
              Download
            </button>
          </div>
        }
      />

      <div className="flex-1 min-h-0 flex flex-col xl:flex-row overflow-hidden">
        {/* Left: Controls */}
        <div className="shrink-0 xl:w-80 2xl:w-96 flex flex-col border-b xl:border-b-0 xl:border-r border-border overflow-hidden bg-bg-secondary/50">
          <div className="p-4 space-y-4 shrink-0">
            <div className="flex gap-3">
              <Input
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="Theme name"
                className="font-mono text-sm flex-1 min-w-0 rounded-xl h-10 border-border/80 bg-bg-primary/80 focus-visible:ring-2 focus-visible:ring-accent/20"
              />
              <div className="flex rounded-xl overflow-hidden border border-border/80 bg-bg-primary/50 p-0.5">
                {(["dark", "light"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setThemeType(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200",
                      themeType === t
                        ? "bg-accent/20 text-accent shadow-sm"
                        : "text-txt-muted hover:text-txt",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-2">
                Presets
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="group flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border/60 bg-bg-primary/60 hover:border-accent/30 hover:bg-accent/5 transition-all duration-200"
                    title={p.name}
                  >
                    <span
                      className="w-6 h-6 rounded-lg shrink-0 shadow-inner ring-1 ring-black/5 dark:ring-white/5 transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: p.colors["editor.background"],
                      }}
                    />
                    <span className="text-xs font-medium text-txt-sec group-hover:text-txt">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="border-t border-border/60 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setWorkbenchOpen((o) => !o)}
                className="w-full flex items-center gap-2 px-4 py-3.5 text-sm font-semibold text-txt-muted hover:text-txt hover:bg-bg-primary/20 transition-colors"
              >
                <Palette size={16} className="opacity-70" />
                <span>Workbench</span>
                <motion.span
                  animate={{ rotate: workbenchOpen ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                  className="ml-auto"
                >
                  <ChevronDown size={16} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {workbenchOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 space-y-3">
                      {WORKBENCH_KEYS.map((key) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-[11px] text-txt-muted w-36 shrink-0 truncate">
                            {key.replace(/^([^.]+)\./, "$1 ")}
                          </span>
                          <ColorPicker
                            label={key}
                            value={workbench[key]}
                            onChange={(v) => updateWorkbench(key, v)}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="border-t border-border/60 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setTokensOpen((o) => !o)}
                className="w-full flex items-center gap-2 px-4 py-3.5 text-sm font-semibold text-txt-muted hover:text-txt hover:bg-bg-primary/20 transition-colors"
              >
                <Code2 size={16} className="opacity-70" />
                <span>Syntax</span>
                <motion.span
                  animate={{ rotate: tokensOpen ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                  className="ml-auto"
                >
                  <ChevronDown size={16} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {tokensOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 space-y-3">
                      {TOKEN_KEYS.map((key) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-[11px] text-txt-muted w-20 shrink-0 truncate">
                            {TOKEN_LABELS[key]}
                          </span>
                          <ColorPicker
                            label={key}
                            value={tokens[key]}
                            onChange={(v) => updateToken(key, v)}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Right: Preview + Output */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row min-w-0">
          <div className="flex-1 min-h-0 flex flex-col min-w-0 p-4 lg:pr-2">
            <p className="text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-3">
              Preview
            </p>
            <div
              className="flex-1 min-h-48 rounded-2xl overflow-hidden flex flex-col shadow-xl ring-1 ring-black/5 dark:ring-white/5"
              style={{
                backgroundColor: workbench["editor.background"],
                color: workbench["editor.foreground"],
              }}
            >
              <div
                className="h-10 flex items-center gap-3 px-4 shrink-0"
                style={{
                  backgroundColor: workbench["titleBar.activeBackground"],
                  color: workbench["titleBar.activeForeground"],
                }}
              >
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full opacity-70"
                      style={{
                        backgroundColor:
                          i === 1 ? "#ff5f56" : i === 2 ? "#ffbd2e" : "#27c93f",
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium opacity-90 truncate flex-1 text-center">
                  {themeName}
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-auto p-5 font-mono text-[13px] leading-relaxed">
                <PreviewCode code={PREVIEW_CODE} tokens={tokens} />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col min-w-0 lg:min-w-[320px] p-4 lg:pl-2">
            <p className="text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-3">
              Theme JSON
            </p>
            <div className="flex-1 min-h-48 rounded-2xl border border-border/80 overflow-hidden bg-bg-primary ring-1 ring-black/5 dark:ring-white/5">
              <CodeEditor
                value={themeJson}
                language="json"
                readOnly
                placeholder=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewCode({ code, tokens }: { code: string; tokens: TokenColors }) {
  const tokenize = (
    line: string,
  ): { text: string; type?: keyof TokenColors }[] => {
    const parts: { text: string; type?: keyof TokenColors }[] = [];
    let remaining = line;

    const patterns: { regex: RegExp; type?: keyof TokenColors }[] = [
      { regex: /^(\/\/.*)/, type: "comment" },
      { regex: /^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, type: "string" },
      {
        regex:
          /^(function|const|let|var|return|if|else|for|while|class|interface|type)\b/,
        type: "keyword",
      },
      { regex: /^(\d+)/, type: "number" },
      { regex: /^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/, type: "function" },
      { regex: /^([a-zA-Z_][a-zA-Z0-9_]*)\s*:/, type: "variable" },
      { regex: /^(string|number|boolean)\b/, type: "type" },
      { regex: /^(\s+)/ },
    ];

    while (remaining.length > 0) {
      let matched = false;
      for (const { regex, type } of patterns) {
        const m = remaining.match(regex);
        if (m) {
          parts.push({ text: m[1], type });
          remaining = remaining.slice(m[1].length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        parts.push({ text: remaining[0] ?? "" });
        remaining = remaining.slice(1);
      }
    }
    return parts;
  };

  const lines = code.split("\n");
  const allParts: { text: string; type?: keyof TokenColors }[] = [];
  for (let i = 0; i < lines.length; i++) {
    allParts.push(...tokenize(lines[i]));
    if (i < lines.length - 1) allParts.push({ text: "\n" });
  }

  return (
    <pre className="m-0">
      {allParts.map((p, i) =>
        p.type ? (
          <span key={i} style={{ color: tokens[p.type] }}>
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </pre>
  );
}
