"use client";

import { javascript } from "@codemirror/lang-javascript";
import { EditorState, type Extension } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { Code2, Download, LayoutDashboard, Sparkles } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";

const defaultCustomJSX = `
<div tw="flex h-full w-full flex-col items-center justify-center bg-slate-900 text-slate-50 text-6xl font-bold p-10">
  <div tw="flex mb-8 items-center gap-4">
    <div tw="w-24 h-24 rounded-full bg-sky-400 flex" />
  </div>
  <div tw="flex text-center mb-6 px-12">
    Welcome to DevForge Interactive OG
  </div>
  <div tw="flex text-3xl text-slate-400 font-normal">
    Generated via devwiz
  </div>
</div>
`.trim();

type Palette = {
  bg: string;
  text: string;
  muted: string;
  accent: string;
};

const FONT_OPTIONS = [
  { value: "inter", label: "Inter" },
  { value: "poppins", label: "Poppins" },
  { value: "montserrat", label: "Montserrat" },
  { value: "playfair-display", label: "Playfair Display" },
  { value: "roboto-mono", label: "Roboto Mono" },
  { value: "lora", label: "Lora" },
  { value: "merriweather", label: "Merriweather" },
  { value: "open-sans", label: "Open Sans" },
  { value: "source-sans-3", label: "Source Sans 3" },
  { value: "nunito", label: "Nunito" },
  { value: "dm-sans", label: "DM Sans" },
  { value: "manrope", label: "Manrope" },
  { value: "archivo", label: "Archivo" },
  { value: "space-grotesk", label: "Space Grotesk" },
  { value: "bebas-neue", label: "Bebas Neue" },
  { value: "raleway", label: "Raleway" },
  { value: "work-sans", label: "Work Sans" },
  { value: "fira-sans", label: "Fira Sans" },
] as const;

export default function OgImageClient() {
  const { resolvedTheme } = useTheme();
  const [mode, setMode] = useState<"gui" | "code">("gui");

  // GUI State
  const [title, setTitle] = useState("Build better tools faster");
  const [subtitle, setSubtitle] = useState(
    "Fully customizable social preview image generated on the fly.",
  );
  const [brand, setBrand] = useState("DevWiz");
  const [footer, setFooter] = useState("devwiz");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [align, setAlign] = useState<"left" | "center" | "right">("center");
  const [layout, setLayout] = useState("default");
  const [fontFamily, setFontFamily] = useState("inter");
  const [palette, setPalette] = useState<Palette>({
    bg: "#1a1a18",
    text: "#e4e4d8",
    muted: "#a8a898",
    accent: "#6db87a",
  });
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Code State
  const [code, setCode] = useState(defaultCustomJSX);
  const [debouncedCode, setDebouncedCode] = useState(defaultCustomJSX);
  const editorRef = useRef<HTMLDivElement>(null);

  // Debounce the code state so typing is smooth
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCode(code);
    }, 500);
    return () => clearTimeout(handler);
  }, [code]);

  // Theme preset handler
  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    if (newTheme === "light") {
      setPalette({
        bg: "#f5f2e0",
        text: "#1a1a18",
        muted: "#4a4a3e",
        accent: "#1e4d2b",
      });
    } else {
      setPalette({
        bg: "#1a1a18",
        text: "#e4e4d8",
        muted: "#a8a898",
        accent: "#6db87a",
      });
    }
  };

  // Derived Paths
  const ogPath = useMemo(() => {
    if (mode === "code") {
      const formData = new URLSearchParams();
      formData.set("type", "custom");

      // Modern, unicode-safe Base64 encoding for browser
      const bytes = new TextEncoder().encode(debouncedCode);
      const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte),
      ).join("");
      formData.set("jsx", btoa(binString));

      return `/api/og-custom?${formData.toString()}`;
    }

    const qp = new URLSearchParams({
      title,
      subtitle,
      brand,
      footer,
      theme,
      align,
      layout,
      fontFamily,
      titleFontSize: "82",
      bg: palette.bg,
      text: palette.text,
      muted: palette.muted,
      accent: palette.accent,
    });
    return `/api/og?${qp.toString()}`;
  }, [
    mode,
    title,
    subtitle,
    brand,
    footer,
    theme,
    align,
    layout,
    fontFamily,
    palette,
    debouncedCode,
  ]);

  // CodeMirror Setup (only mounts when in code mode)
  useEffect(() => {
    if (mode !== "code" || !editorRef.current) return;

    const extensions: Extension[] = [
      javascript({ jsx: true }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          setCode(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        "&": {
          height: "100%",
          fontSize: "14px",
          backgroundColor: resolvedTheme === "dark" ? "#282c34" : "#f8f9fa",
        },
        ".cm-scroller": { overflow: "auto" },
      }),
    ];

    if (resolvedTheme === "dark") {
      extensions.push(oneDark);
    }

    const state = EditorState.create({
      doc: code,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    return () => view.destroy();
  }, [mode, resolvedTheme]);

  const handleDownload = async () => {
    setDownloadError(null);
    try {
      const res = await fetch(ogPath);

      if (!res.ok) {
        throw new Error(`Failed to generate image (${res.status})`);
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("image/")) {
        throw new Error("API did not return an image.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "og-preview.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download image", err);
      setDownloadError(
        err instanceof Error ? err.message : "Failed to download image.",
      );
    }
  };

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader
        title="OG Image Playground"
        badge="Utilities"
        poweredBy={{
          label: "Powered by @vercel/og",
          href: "https://vercel.com/docs/og-image-generation",
          icon: <Sparkles size={10} />,
        }}
        rightSlot={
          <>
            <div className="flex items-center bg-bg-secondary border border-border rounded-lg p-1 mr-2">
              <button
                onClick={() => setMode("gui")}
                aria-label="Template mode"
                title="Template mode"
                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 text-xs rounded-md tr-smooth ${mode === "gui" ? "bg-bg-primary shadow-sm text-txt border border-border/50" : "text-txt-muted hover:text-txt"}`}
              >
                <LayoutDashboard size={12} />
                <span className="hidden md:inline">Template</span>
              </button>
              <button
                onClick={() => setMode("code")}
                aria-label="Code mode"
                title="Code mode"
                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 text-xs rounded-md tr-smooth ${mode === "code" ? "bg-bg-primary shadow-sm text-txt border border-border/50" : "text-txt-muted hover:text-txt"}`}
              >
                <Code2 size={12} />
                <span className="hidden md:inline">Code</span>
              </button>
            </div>
            <button
              onClick={handleDownload}
              aria-label="Download PNG"
              title="Download PNG"
              className="whitespace-nowrap flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-xs btn-accent"
            >
              <Download size={12} />
              <span className="hidden md:inline">Download PNG</span>
            </button>
          </>
        }
      />

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col xl:flex-row border-t border-border">
        {/* Editor / GUI Pane */}
        <div className="w-full basis-1/2 xl:basis-auto xl:w-[45%] min-h-0 flex flex-col border-b xl:border-b-0 xl:border-r border-border overflow-y-auto bg-bg-primary">
          {mode === "gui" ? (
            <div className="p-4 md:p-6 space-y-5">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                      Template Layout
                    </label>
                    <select
                      value={layout}
                      onChange={(e) => setLayout(e.target.value)}
                      className="mt-2 w-full px-3 py-2 text-sm rounded-lg bg-bg-secondary border border-border text-txt focus:outline-none focus:border-accent/30 tr-smooth"
                    >
                      <option value="default">Default</option>
                      <option value="centered">Centered Large</option>
                      <option value="spotlight">Spotlight</option>
                      <option value="editorial">Editorial</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                      Font Family
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="mt-2 w-full px-3 py-2 text-sm rounded-lg bg-bg-secondary border border-border text-txt focus:outline-none focus:border-accent/30 tr-smooth"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full px-3 py-2 text-sm rounded-lg bg-bg-secondary border border-border text-txt focus:outline-none focus:border-accent/30 tr-smooth"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                    Subtitle
                  </label>
                  <textarea
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    rows={3}
                    className="mt-2 w-full px-3 py-2 text-sm rounded-lg bg-bg-secondary border border-border text-txt focus:outline-none focus:border-accent/30 tr-smooth resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                      Brand Name
                    </label>
                    <input
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="mt-2 w-full px-3 py-2 text-sm rounded-lg bg-bg-secondary border border-border text-txt focus:outline-none focus:border-accent/30 tr-smooth"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                      Footer
                    </label>
                    <input
                      value={footer}
                      onChange={(e) => setFooter(e.target.value)}
                      className="mt-2 w-full px-3 py-2 text-sm rounded-lg bg-bg-secondary border border-border text-txt focus:outline-none focus:border-accent/30 tr-smooth"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                      Theme Profile
                    </label>
                    <div className="mt-2 inline-flex p-1 rounded-lg bg-bg-secondary border border-border w-full">
                      <button
                        onClick={() => handleThemeChange("dark")}
                        className={`flex-1 px-3 py-1.5 text-xs rounded-md tr-smooth ${theme === "dark" ? "bg-accent/10 border border-accent/20 text-accent" : "text-txt-muted hover:text-txt"}`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => handleThemeChange("light")}
                        className={`flex-1 px-3 py-1.5 text-xs rounded-md tr-smooth ${theme === "light" ? "bg-accent/10 border border-accent/20 text-accent" : "text-txt-muted hover:text-txt"}`}
                      >
                        Light
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                      Text Align
                    </label>
                    <div className="mt-2 inline-flex p-1 rounded-lg bg-bg-secondary border border-border w-full">
                      <button
                        onClick={() => setAlign("left")}
                        className={`flex-1 px-3 py-1.5 text-xs rounded-md tr-smooth ${align === "left" ? "bg-accent/10 border border-accent/20 text-accent" : "text-txt-muted hover:text-txt"}`}
                      >
                        Left
                      </button>
                      <button
                        onClick={() => setAlign("center")}
                        className={`flex-1 px-3 py-1.5 text-xs rounded-md tr-smooth ${align === "center" ? "bg-accent/10 border border-accent/20 text-accent" : "text-txt-muted hover:text-txt"}`}
                      >
                        Center
                      </button>
                      <button
                        onClick={() => setAlign("right")}
                        className={`flex-1 px-3 py-1.5 text-xs rounded-md tr-smooth ${align === "right" ? "bg-accent/10 border border-accent/20 text-accent" : "text-txt-muted hover:text-txt"}`}
                      >
                        Right
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-2 block">
                    Custom Colors
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(
                      [
                        ["BG", "bg"],
                        ["Text", "text"],
                        ["Muted", "muted"],
                        ["Accent", "accent"],
                      ] as const
                    ).map(([label, key]) => (
                      <div
                        key={key}
                        className="flex flex-col gap-1 items-center"
                      >
                        <input
                          type="color"
                          value={palette[key]}
                          onChange={(e) =>
                            setPalette((prev: Palette) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          className="w-full h-8 p-0 cursor-pointer rounded-lg bg-bg-secondary border border-border"
                        />
                        <span className="text-[10px] text-txt-muted">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full border-b xl:border-b-0 border-border">
              <div className="px-4 py-3 bg-bg-secondary border-b border-border flex items-center justify-between">
                <span className="text-xs font-mono text-txt-muted uppercase tracking-wider flex items-center gap-2">
                  <Code2 size={13} className="text-accent" /> Editor (HTML/JSX
                  with Tailwind &lsquo;tw&rsquo; prop)
                </span>
              </div>
              <div ref={editorRef} className="flex-1 overflow-hidden" />
            </div>
          )}
        </div>

        {/* Preview Pane */}
        <div className="w-full basis-1/2 xl:basis-auto xl:w-[55%] min-h-0 flex flex-col bg-bg-secondary relative overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-bg-primary/50 flex items-center justify-between">
            <span className="text-xs font-mono text-txt-muted uppercase tracking-wider">
              Live Preview (1200x630)
            </span>
            {downloadError ? (
              <span className="text-[11px] text-error">{downloadError}</span>
            ) : null}
          </div>

          <div className="flex-1 relative overflow-auto p-4 md:p-8 flex items-center justify-center pattern-wavy pattern-slate-500/10 pattern-bg-transparent">
            <div className="w-full max-w-200 aspect-1200/630 rounded-lg shadow-2xl overflow-hidden shrink-0 border border-border/50 ring-1 ring-black/5 dark:ring-white/10 bg-bg-primary">
              {/* Using next/image with unoptimized to prevent caching dynamic permutations */}
              <Image
                src={ogPath}
                alt="OG Image Preview"
                width={1200}
                height={630}
                className="w-full h-full object-cover"
                unoptimized
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  setPreviewError(
                    "Preview unavailable. Check the template inputs.",
                  );
                }}
                onLoad={(e) => {
                  (e.target as HTMLImageElement).style.display = "block";
                  setPreviewError(null);
                }}
              />
              {previewError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/70 text-xs text-error px-4 text-center">
                  {previewError}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
