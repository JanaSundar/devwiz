"use client";
import { ArrowLeftRight, Columns, Rows, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import ThemeToggle from "@/components/ThemeToggle";

export default function DiffViewerClient() {
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [splitView, setSplitView] = useState(true);
  const { theme, systemTheme } = useTheme();

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  // Custom dark theme palette to match the app's bg-grad / premium UI
  const customStyles = {
    variables: {
      dark: {
        diffViewerBackground: "transparent",
        diffViewerColor: "#A3A3A3", // text-txt-muted fallback
        addedBackground: "rgba(34, 197, 94, 0.1)", // green-500/10
        addedColor: "#4ade80", // green-400
        removedBackground: "rgba(239, 68, 68, 0.1)", // red-500/10
        removedColor: "#f87171", // red-400
        wordAddedBackground: "rgba(34, 197, 94, 0.25)",
        wordRemovedBackground: "rgba(239, 68, 68, 0.25)",
        addedGutterBackground: "rgba(34, 197, 94, 0.05)",
        removedGutterBackground: "rgba(239, 68, 68, 0.05)",
        gutterBackground: "transparent",
        gutterBackgroundDark: "rgba(0,0,0,0.1)",
        highlightBackground: "rgba(255, 255, 255, 0.05)",
        highlightGutterBackground: "rgba(255, 255, 255, 0.05)",
        codeFoldGutterBackground: "rgba(255, 255, 255, 0.05)",
        codeFoldBackground: "rgba(255, 255, 255, 0.02)",
        emptyLineBackground: "transparent",
        gutterColor: "#737373", // neutral-500
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

  return (
    <div className="flex flex-col h-full bg-bg-secondary flex-1">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-6 py-4 border-b border-border bg-bg-primary/50 backdrop-blur-sm z-10 shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-accent">
            <ArrowLeftRight size={18} />
            <h1 className="text-sm font-semibold text-txt tracking-wide">
              Diff Viewer
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          <div className="flex items-center bg-bg-primary rounded-lg border border-border p-1">
            <button
              onClick={() => setSplitView(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${splitView ? "bg-accent/10 text-accent" : "text-txt-muted hover:text-txt"}`}
            >
              <Columns size={14} /> Split View
            </button>
            <button
              onClick={() => setSplitView(false)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!splitView ? "bg-accent/10 text-accent" : "text-txt-muted hover:text-txt"}`}
            >
              <Rows size={14} /> Inline
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-error/80 hover:text-error hover:bg-error/10 rounded-lg tr-smooth"
          >
            <Trash2 size={14} /> Clear
          </button>

          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 h-[calc(100vh-72px)] overflow-hidden min-h-0">
        {/* Input Area (Left/Top) */}
        <div className="flex flex-col bg-border gap-px w-full lg:w-[350px] xl:w-[450px] shrink-0 border-r border-border overflow-y-auto min-h-[30vh] lg:min-h-0">
          <div className="flex flex-col bg-bg-primary min-h-[200px] flex-1">
            <div className="px-4 py-2 border-b border-border bg-bg-secondary/50 text-[11px] font-semibold tracking-wider uppercase text-txt-muted shrink-0">
              Original Text
            </div>
            <textarea
              value={oldValue}
              onChange={(e) => setOldValue(e.target.value)}
              placeholder="Paste original text here..."
              className="flex-1 w-full p-4 bg-transparent border-none outline-none resize-none text-sm font-mono text-txt placeholder:text-txt-muted/50 overflow-y-auto"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-col bg-bg-primary min-h-[200px] flex-1">
            <div className="px-4 py-2 border-b border-border bg-bg-secondary/50 text-[11px] font-semibold tracking-wider uppercase text-txt-muted shrink-0">
              Modified Text
            </div>
            <textarea
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Paste modified text here..."
              className="flex-1 w-full p-4 bg-transparent border-none outline-none resize-none text-sm font-mono text-txt placeholder:text-txt-muted/50 overflow-y-auto"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Diff View (Right/Bottom) */}
        <div className="flex-1 bg-bg-primary min-h-[30vh] lg:min-h-0 relative">
          {!oldValue && !newValue ? (
            <div className="h-full flex items-center justify-center text-txt-muted text-sm">
              Paste text in the fields above to see the difference.
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-y-auto bg-bg-secondary/20 absolute inset-4">
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
          )}
        </div>
      </div>
    </div>
  );
}
