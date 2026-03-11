"use client";

import {
  CheckCircle2,
  ChevronDown,
  LayoutGrid,
  Lightbulb,
  Minus,
  Plus,
  Rows,
} from "lucide-react";
import { useCallback, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ToolHeader from "@/components/tooling/ToolHeader";
import { cn } from "@/lib/utils";

type Mode = "flex" | "grid";

type Preset = { label: string; css: string; hint: string };
type Goal = { text: string; props: string[]; required: string[] };

const FLEX_PRESETS: Preset[] = [
  {
    label: "Center",
    css: "display: flex;\njustify-content: center;\nalign-items: center;",
    hint: "Centers items on both axes",
  },
  {
    label: "Space between",
    css: "display: flex;\njustify-content: space-between;\nalign-items: center;",
    hint: "First at start, last at end, equal space between",
  },
  {
    label: "Wrap",
    css: "display: flex;\nflex-wrap: wrap;\ngap: 8px;",
    hint: "Items wrap to next line when they don't fit",
  },
  {
    label: "Column",
    css: "display: flex;\nflex-direction: column;\nalign-items: center;\ngap: 8px;",
    hint: "Stack items vertically, centered",
  },
];

const GRID_PRESETS: Preset[] = [
  {
    label: "3 columns",
    css: "display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 8px;",
    hint: "Three equal columns",
  },
  {
    label: "2×2",
    css: "display: grid;\ngrid-template-columns: repeat(2, 1fr);\ngrid-template-rows: repeat(2, 1fr);\ngap: 8px;",
    hint: "Four cells in 2 rows and 2 columns",
  },
  {
    label: "Auto fit",
    css: "display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(80px, 1fr));\ngap: 8px;",
    hint: "As many columns as fit (min 80px each)",
  },
  {
    label: "Areas",
    css: "display: grid;\ngrid-template-areas: 'a a b' 'c d d';\ngap: 8px;",
    hint: "Named areas: place items with grid-area",
  },
];

const FLEX_GOALS: Goal[] = [
  {
    text: "Center all items in the container.",
    props: ["justify-content", "align-items"],
    required: ["justify-content: center", "align-items: center"],
  },
  {
    text: "Push items to the end of the row.",
    props: ["justify-content"],
    required: ["justify-content: flex-end"],
  },
  {
    text: "Stack items in a column and align them to the start.",
    props: ["flex-direction", "align-items"],
    required: ["flex-direction: column"],
  },
  {
    text: "Spread items with equal space between.",
    props: ["justify-content"],
    required: ["justify-content: space-between"],
  },
  {
    text: "Let items wrap to the next line when they don't fit.",
    props: ["flex-wrap"],
    required: ["flex-wrap: wrap"],
  },
  {
    text: "Add generous space between items.",
    props: ["gap"],
    required: ["gap: 16px", "gap: 1rem"],
  },
];

const GRID_GOALS: Goal[] = [
  {
    text: "Create 3 equal columns.",
    props: ["grid-template-columns"],
    required: ["grid-template-columns: repeat(3, 1fr)"],
  },
  {
    text: "Make a 2×2 grid.",
    props: ["grid-template-columns", "grid-template-rows"],
    required: [
      "grid-template-columns: repeat(2, 1fr)",
      "grid-template-rows: repeat(2, 1fr)",
    ],
  },
  {
    text: "Place an item in row 2, column 2.",
    props: ["grid-row", "grid-column"],
    required: ["grid-row: 2", "grid-column: 2"],
  },
  {
    text: "Use auto-fit so columns respond to space.",
    props: ["grid-template-columns"],
    required: [
      "grid-template-columns: repeat(auto-fit, minmax(80px, 1fr))",
      "grid-template-columns: repeat(auto-fit,minmax(80px,1fr))",
    ],
  },
  {
    text: "Add gaps between cells.",
    props: ["gap"],
    required: ["gap: 12px", "gap: 0.75rem"],
  },
];

const FLEX_PROPS = [
  "justify-content",
  "align-items",
  "flex-direction",
  "flex-wrap",
  "gap",
  "align-content",
];

const GRID_PROPS = [
  "grid-template-columns",
  "grid-template-rows",
  "gap",
  "grid-column / grid-row",
  "grid-area",
  "align-items / justify-items",
];

const BOX_COLORS = [
  "bg-rose-500/90",
  "bg-amber-500/90",
  "bg-emerald-500/90",
  "bg-sky-500/90",
  "bg-violet-500/90",
  "bg-pink-500/90",
];

const MIN_ITEMS = 2;
const MAX_ITEMS = 24;

export default function FlexGridPlaygroundClient() {
  const [mode, setMode] = useState<Mode>("flex");
  const [itemCount, setItemCount] = useState(6);
  const [goalIndex, setGoalIndex] = useState(0);
  const [showProps, setShowProps] = useState(true);
  const [css, setCss] = useState(
    mode === "flex"
      ? "display: flex;\njustify-content: center;\nalign-items: center;\ngap: 12px;"
      : "display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 12px;",
  );

  const goals = mode === "flex" ? FLEX_GOALS : GRID_GOALS;
  const currentGoal = goals[goalIndex % goals.length];
  const cssLower = css.toLowerCase();
  const goalSolved = currentGoal.required.every((snippet) =>
    cssLower.includes(snippet.toLowerCase()),
  );
  const goalTouchesProp = currentGoal.props.some((p) =>
    cssLower.includes(p.toLowerCase()),
  );

  const cycleGoal = useCallback(() => {
    setGoalIndex(
      (i) =>
        (i + 1) % (mode === "flex" ? FLEX_GOALS.length : GRID_GOALS.length),
    );
  }, [mode]);

  const applyPreset = useCallback((presetCss: string) => {
    setCss(presetCss);
  }, []);

  const switchMode = useCallback((next: Mode) => {
    setMode(next);
    setGoalIndex(0);
    setCss(
      next === "flex"
        ? "display: flex;\njustify-content: center;\nalign-items: center;\ngap: 12px;"
        : "display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 12px;",
    );
  }, []);

  const containerClass = "flex-grid-playground-scope";
  const fullCss = `
    .${containerClass} .playground-wrapper {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
    .${containerClass} .playground-container {
      ${css.replace(/\n/g, " ")}
      width: 100%;
      height: 100%;
      min-height: 0;
      flex: 1;
      padding: 16px;
      background-color: var(--color-bg-tertiary);
      background-image: radial-gradient(
        circle at 1px 1px,
        rgba(255, 255, 255, 0.04) 1px,
        transparent 0
      );
      background-size: 12px 12px;
      border-radius: 12px;
      border: 1px solid var(--color-border);
    }
    .${containerClass} .playground-container .box {
      min-width: 44px;
      min-height: 44px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
  `;

  return (
    <div className="flex flex-col h-full bg-bg-primary overflow-auto lg:overflow-hidden w-full">
      <ToolHeader
        title="Flex & Grid Playground"
        badge="Playground"
        rightSlot={
          <span className="text-xs text-txt-muted">
            Edit CSS, see layout live
          </span>
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-4 gap-4 overflow-hidden">
        {/* Left: controls + editor */}
        <div className="flex flex-col flex-1 min-h-0 min-w-0 lg:max-w-[420px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-txt-muted">
              Layout mode
            </span>
            <div className="flex rounded-lg border border-border overflow-hidden bg-bg-secondary/50 p-0.5">
              <button
                type="button"
                onClick={() => switchMode("flex")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  mode === "flex"
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "text-txt-muted hover:text-txt",
                )}
              >
                <Rows size={14} />
                Flex
              </button>
              <button
                type="button"
                onClick={() => switchMode("grid")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  mode === "grid"
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "text-txt-muted hover:text-txt",
                )}
              >
                <LayoutGrid size={14} />
                Grid
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-txt-muted">Items</span>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-bg-secondary/50 p-0.5">
              <button
                type="button"
                onClick={() =>
                  setItemCount((n) => (n > MIN_ITEMS ? n - 1 : MIN_ITEMS))
                }
                disabled={itemCount <= MIN_ITEMS}
                className="flex items-center justify-center w-7 h-7 rounded-md text-txt-muted hover:text-txt hover:bg-bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="min-w-[2ch] text-center text-xs font-medium text-txt">
                {itemCount}
              </span>
              <button
                type="button"
                onClick={() =>
                  setItemCount((n) => (n < MAX_ITEMS ? n + 1 : MAX_ITEMS))
                }
                disabled={itemCount >= MAX_ITEMS}
                className="flex items-center justify-center w-7 h-7 rounded-md text-txt-muted hover:text-txt hover:bg-bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {(mode === "flex" ? FLEX_PRESETS : GRID_PRESETS).map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.css)}
                title={preset.hint}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-bg-secondary border border-border text-txt-muted hover:text-txt hover:border-txt/20 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Challenge picker – clickable list, shows solved state */}
          <div className="mb-2 rounded-lg border border-border bg-bg-secondary/60">
            <div className="flex items-center justify-between px-3 py-1.5">
              <p className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">
                {mode === "flex" ? "Flex challenges" : "Grid challenges"}
              </p>
              <span className="text-[10px] text-txt-muted">
                {
                  goals.filter((g) =>
                    g.required.every((snippet) =>
                      cssLower.includes(snippet.toLowerCase()),
                    ),
                  ).length
                }
                /{goals.length}
              </span>
            </div>
            <div className="max-h-28 overflow-y-auto divide-y divide-border/40">
              {goals.map((goal, index) => {
                const solved = goal.required.every((snippet) =>
                  cssLower.includes(snippet.toLowerCase()),
                );
                const active = index === goalIndex % goals.length;
                return (
                  <button
                    key={goal.text}
                    type="button"
                    onClick={() => setGoalIndex(index)}
                    className={cn(
                      "w-full px-3 py-1.5 text-left flex items-center gap-2 text-[11px] tr-smooth",
                      active
                        ? "bg-bg-tertiary text-txt"
                        : "text-txt-muted hover:bg-bg-tertiary/70",
                    )}
                  >
                    <span className="w-4 text-[10px] text-txt-muted">
                      {index + 1}.
                    </span>
                    <span className="flex-1 truncate">{goal.text}</span>
                    {solved && (
                      <CheckCircle2
                        size={12}
                        className="shrink-0 text-success"
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {showProps && (
            <div className="mb-2 px-1">
              <p className="text-[10px] text-txt-muted font-mono truncate">
                {(mode === "flex" ? FLEX_PROPS : GRID_PROPS).join(" · ")}
              </p>
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-0 rounded-xl border border-border bg-bg-secondary overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-txt-muted border-b border-border shrink-0">
              <span className="font-medium">.container</span>
            </div>
            <div className="flex-1 min-h-[120px]">
              <CodeEditor
                value={css}
                onChange={setCss}
                language="css"
                placeholder="display: flex; ..."
              />
            </div>
          </div>
        </div>

        {/* Right: preview — fills available space */}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs text-txt-muted border-b border-border shrink-0 mb-2">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="font-medium">Live preview</span>
            </span>
            <button
              type="button"
              onClick={() => setShowProps((s) => !s)}
              className="flex items-center gap-1 text-txt-muted hover:text-txt"
              title={
                showProps
                  ? "Hide property reference"
                  : "Show property reference"
              }
            >
              <Lightbulb size={12} />
              <span className="text-[10px]">
                {showProps ? "Hide" : "Show"} ref
              </span>
            </button>
          </div>
          <div
            className={cn(
              "flex-1 min-h-[260px] flex flex-col rounded-xl border bg-bg-secondary/50 overflow-hidden p-4",
              goalSolved ? "border-success/60" : "border-border",
            )}
          >
            {/* Goal — interactive hint */}
            <button
              type="button"
              onClick={cycleGoal}
              className="flex items-start gap-2 w-full mb-3 px-2 py-1.5 rounded-md bg-bg-secondary border border-border text-left group hover:bg-bg-tertiary/80 transition-colors"
            >
              <span
                className="text-accent shrink-0 mt-0.5 text-[11px] font-medium"
                aria-hidden
              >
                Try
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-txt-sec truncate">
                  {currentGoal.text}
                </p>
                <p className="mt-0.5 text-[10px] text-txt-muted font-mono">
                  Goal touches:{" "}
                  {currentGoal.props.map((p, i) => (
                    <span key={p}>
                      <code>{p}</code>
                      {i < currentGoal.props.length - 1 ? " · " : ""}
                    </span>
                  ))}
                </p>
                <p className="mt-0.5 text-[10px] text-txt-muted font-mono">
                  Target CSS:{" "}
                  {currentGoal.required
                    .map((snippet) => snippet.replace(/;?$/, ";"))
                    .join(" ")}
                </p>
                {!goalSolved && goalTouchesProp && (
                  <p className="mt-0.5 text-[10px] text-amber-400/90">
                    You are using the right property — tweak its value to match
                    the target CSS.
                  </p>
                )}
                {goalSolved && (
                  <p className="mt-0.5 text-[10px] text-success flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    Looks correct for this goal. Try the next one →
                  </p>
                )}
              </div>
              {goalSolved ? (
                <CheckCircle2
                  size={14}
                  className="shrink-0 text-success"
                  aria-label="Goal looks solved"
                />
              ) : (
                <ChevronDown
                  size={14}
                  className="shrink-0 text-txt-muted group-hover:text-accent transition-colors"
                />
              )}
            </button>

            {/* Preview container — takes all remaining space */}
            <div className="flex-1 min-h-0 flex flex-col">
              <style dangerouslySetInnerHTML={{ __html: fullCss }} />
              <div
                className={cn(containerClass, "flex-1 min-h-0 flex flex-col")}
              >
                <div className="playground-wrapper">
                  <div className="playground-container">
                    {Array.from({ length: itemCount }).map((_, i) => (
                      <div
                        key={i}
                        className={cn("box", BOX_COLORS[i % BOX_COLORS.length])}
                      >
                        {i + 1}
                      </div>
                    ))}
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
