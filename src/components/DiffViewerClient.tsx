"use client";

import { ArrowLeftRight, Columns, Rows, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import ToolHeader from "@/components/tooling/ToolHeader";
import { cn } from "@/lib/utils";

export default function DiffViewerClient() {
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [splitView, setSplitView] = useState(true);
  const { theme, systemTheme } = useTheme();

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const customStyles = {
    variables: {
      dark: {
        diffViewerBackground: "transparent",
        diffViewerColor: "#A3A3A3",
        addedBackground: "rgba(34, 197, 94, 0.12)",
        addedColor: "#4ade80",
        removedBackground: "rgba(239, 68, 68, 0.12)",
        removedColor: "#f87171",
        wordAddedBackground: "rgba(34, 197, 94, 0.28)",
        wordRemovedBackground: "rgba(239, 68, 68, 0.28)",
        addedGutterBackground: "rgba(34, 197, 94, 0.08)",
        removedGutterBackground: "rgba(239, 68, 68, 0.08)",
        gutterBackground: "transparent",
        gutterBackgroundDark: "rgba(0,0,0,0.08)",
        highlightBackground: "rgba(255, 255, 255, 0.04)",
        highlightGutterBackground: "rgba(255, 255, 255, 0.04)",
        codeFoldGutterBackground: "rgba(255, 255, 255, 0.04)",
        codeFoldBackground: "rgba(255, 255, 255, 0.02)",
        emptyLineBackground: "transparent",
        gutterColor: "#737373",
        addedGutterColor: "#4ade80",
        removedGutterColor: "#f87171",
        infoGutterBackground: "transparent",
        infoGutterColor: "#A3A3A3",
      },
      light: {
        diffViewerBackground: "transparent",
        diffViewerColor: "#525252",
      },
    },
    line: {
      fontFamily: "var(--font-mono)",
      fontSize: "13px",
      lineHeight: "1.6",
    },
    contentText: {
      fontFamily: "var(--font-mono)",
      wordBreak: "break-all" as const,
      whiteSpace: "pre-wrap" as const,
    },
    gutter: {
      fontFamily: "var(--font-mono)",
      minWidth: "40px",
      padding: "0 10px",
    },
  };

  const handleClear = () => {
    setOldValue("");
    setNewValue("");
  };

  const hasContent = oldValue.trim() || newValue.trim();

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader
        title="Diff Viewer"
        badge="Utilities"
        rightSlot={
          <div className="flex items-center gap-2">
            <div className="flex bg-bg-secondary rounded-lg border border-border p-0.5">
              <button
                onClick={() => setSplitView(true)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium tr-smooth",
                  splitView
                    ? "bg-accent/15 text-accent border border-accent/25"
                    : "text-txt-muted hover:text-txt",
                )}
              >
                <Columns size={12} /> Split
              </button>
              <button
                onClick={() => setSplitView(false)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium tr-smooth",
                  !splitView
                    ? "bg-accent/15 text-accent border border-accent/25"
                    : "text-txt-muted hover:text-txt",
                )}
              >
                <Rows size={12} /> Inline
              </button>
            </div>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-error/80 hover:text-error hover:bg-error/10 rounded-lg tr-smooth"
            >
              <Trash2 size={12} /> Clear
            </button>
          </div>
        }
      />

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* Left: Input panels */}
        <section className="lg:w-[320px] xl:w-[380px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-bg-secondary/30">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 flex flex-col border-b border-border">
              <div className="px-4 py-2.5 border-b border-border/50 shrink-0">
                <span className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">
                  Original
                </span>
              </div>
              <textarea
                value={oldValue}
                onChange={(e) => setOldValue(e.target.value)}
                placeholder="Paste original text or code..."
                className="flex-1 w-full p-4 bg-transparent border-none outline-none resize-none text-sm font-mono text-txt placeholder:text-txt-muted/50 overflow-y-auto min-h-[120px]"
                spellCheck={false}
              />
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="px-4 py-2.5 border-b border-border/50 shrink-0">
                <span className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">
                  Modified
                </span>
              </div>
              <textarea
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Paste modified text or code..."
                className="flex-1 w-full p-4 bg-transparent border-none outline-none resize-none text-sm font-mono text-txt placeholder:text-txt-muted/50 overflow-y-auto min-h-[120px]"
                spellCheck={false}
              />
            </div>
          </div>
        </section>

        {/* Right: Diff output */}
        <section className="flex-1 min-h-0 overflow-hidden flex flex-col bg-bg-primary">
          {!hasContent ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-sm">
                <ArrowLeftRight
                  size={48}
                  className="mx-auto mb-4 text-txt-muted/30"
                />
                <p className="text-sm font-medium text-txt-muted mb-1">
                  Compare two versions
                </p>
                <p className="text-xs text-txt-muted/80">
                  Paste original and modified text in the panels to see the diff
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-auto p-4">
              <div className="rounded-xl border border-border overflow-hidden bg-bg-secondary/30">
                <ReactDiffViewer
                  oldValue={oldValue}
                  newValue={newValue}
                  splitView={splitView}
                  useDarkTheme={isDark}
                  compareMethod={DiffMethod.WORDS}
                  styles={customStyles}
                  leftTitle="Original"
                  rightTitle="Modified"
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
