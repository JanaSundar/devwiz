"use client";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";
import { safeParseJson } from "@/lib/utils";

const API_BASE = "https://api.iconify.design";
const PAGE_SIZE = 100;

interface SearchResult {
  icons: string[];
  total: number;
  limit: number;
  start: number;
  collections: Record<
    string,
    {
      name: string;
      author?: { name: string; url?: string };
      license?: { title: string };
      total: number;
      category?: string;
    }
  >;
}

interface IconDetail {
  name: string;
  prefix: string;
  setName: string;
  author?: string;
  license?: string;
}

type CopyFormat = "svg" | "jsx" | "css-mask" | "css-bg" | "iconify" | "url";

// --- API functions ---
async function searchIcons(
  query: string,
  limit: number,
): Promise<SearchResult> {
  const res = await fetch(
    `${API_BASE}/search?query=${encodeURIComponent(query)}&limit=${limit}`,
  );
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

async function fetchSvg(prefix: string, name: string): Promise<string> {
  const res = await fetch(`${API_BASE}/${prefix}/${name}.svg`);
  if (!res.ok) throw new Error("SVG fetch failed");
  return res.text();
}

async function fetchInitialIcons(): Promise<SearchResult> {
  // Iconify treats spaces as AND — fetch individual keywords in parallel
  const keywords = ["home", "arrow", "star", "user", "settings"];
  const perKeyword = Math.ceil(PAGE_SIZE / keywords.length);
  const results = await Promise.all(
    keywords.map((kw) =>
      fetch(
        `${API_BASE}/search?query=${encodeURIComponent(kw)}&limit=${perKeyword}`,
      ).then((r) => (r.ok ? (r.json() as Promise<SearchResult>) : null)),
    ),
  );
  // Merge & deduplicate
  const seen = new Set<string>();
  const icons: string[] = [];
  const collections: SearchResult["collections"] = {};
  for (const r of results) {
    if (!r) continue;
    Object.assign(collections, r.collections);
    for (const icon of r.icons) {
      if (!seen.has(icon) && icons.length < PAGE_SIZE) {
        seen.add(icon);
        icons.push(icon);
      }
    }
  }
  return {
    icons,
    total: icons.length,
    limit: PAGE_SIZE,
    start: 0,
    collections,
  };
}

async function fetchSvgBatch(icons: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  await Promise.all(
    icons.map(async (icon) => {
      const [prefix, name] = icon.split(":");
      try {
        results[icon] = await fetchSvg(prefix, name);
      } catch {
        /* skip */
      }
    }),
  );
  return results;
}

export default function IconSearchClient() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selected, setSelected] = useState<IconDetail | null>(null);
  const [previewSize, setPreviewSize] = useState(48);
  const [previewColor, setPreviewColor] = useState("currentColor");
  const [copied, setCopied] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search input
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setLimit(PAGE_SIZE);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Initial popular icons
  const initialQuery = useQuery({
    queryKey: ["icons", "initial"],
    queryFn: fetchInitialIcons,
    enabled: !debouncedQuery,
  });

  // Search query — fetch everything up to `limit` in one call
  const searchQuery = useQuery({
    queryKey: ["icons", "search", debouncedQuery, limit],
    queryFn: () => searchIcons(debouncedQuery, limit),
    enabled: !!debouncedQuery,
    placeholderData: (prev) => prev,
  });

  // Derive display data without setState
  const isSearching = !!debouncedQuery;
  const activeData = isSearching ? searchQuery.data : initialQuery.data;

  const displayIcons = useMemo(() => activeData?.icons || [], [activeData]);
  const displayCollections = useMemo(
    () => activeData?.collections || {},
    [activeData],
  );
  const totalResults = activeData?.total || 0;
  const isLoading = isSearching
    ? searchQuery.isLoading
    : initialQuery.isLoading;
  const isFetching = isSearching ? searchQuery.isFetching : false;
  const hasMore = displayIcons.length < totalResults;

  // SVG query for selected icon
  const selectedIconId = selected ? `${selected.prefix}:${selected.name}` : "";
  const svgQuery = useQuery({
    queryKey: ["svg", selectedIconId],
    queryFn: () => {
      if (!selected) {
        throw new Error("No icon selected");
      }
      return fetchSvg(selected.prefix, selected.name);
    },
    enabled: !!selected,
  });

  // Batch SVG prefetch for grid
  const iconListKey = displayIcons.join(",");
  const svgBatchQuery = useQuery({
    queryKey: ["svg-batch", iconListKey],
    queryFn: () => fetchSvgBatch(displayIcons),
    enabled: displayIcons.length > 0,
    placeholderData: (prev) => prev,
  });

  const svgCache = svgBatchQuery.data || {};

  const selectIcon = useCallback(
    (iconId: string) => {
      const [prefix, name] = iconId.split(":");
      const collection = displayCollections[prefix];
      setSelected({
        name,
        prefix,
        setName: collection?.name || prefix,
        author: collection?.author?.name,
        license: collection?.license?.title,
      });
    },
    [displayCollections],
  );

  // SVGR conversion for selected icon (uses project's SVGR API route)
  const svgrQuery = useQuery({
    queryKey: ["svgr", selectedIconId],
    queryFn: async () => {
      const res = await fetch("/api/transform/svgr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: svgQuery.data,
          options: {
            typescript: false,
            icon: true,
            expandProps: "end",
            svgo: true,
          },
        }),
      });
      const data = await safeParseJson<{ output?: string; error?: string }>(
        res,
      );
      if (!res.ok) throw new Error(data.error || "SVGR transform failed");
      return data.output as string;
    },
    enabled: !!selected && !!svgQuery.data,
  });

  const getFormattedCode = (format: CopyFormat): string => {
    if (!selected || !svgQuery.data) return "";
    const iconId = `${selected.prefix}:${selected.name}`;
    const url = `${API_BASE}/${selected.prefix}/${selected.name}.svg`;
    const svg = svgQuery.data;
    switch (format) {
      case "svg":
        return svg;
      case "jsx":
        return svgrQuery.data || "Loading JSX...";

      case "css-mask":
        return `.icon-${selected.name} {\n  display: inline-block;\n  width: 1em;\n  height: 1em;\n  background-color: currentColor;\n  -webkit-mask-image: url('${url}');\n  mask-image: url('${url}');\n  -webkit-mask-repeat: no-repeat;\n  mask-repeat: no-repeat;\n  -webkit-mask-size: 100% 100%;\n  mask-size: 100% 100%;\n}`;
      case "css-bg":
        return `.icon-${selected.name} {\n  display: inline-block;\n  width: 1em;\n  height: 1em;\n  background-image: url('${url}');\n  background-repeat: no-repeat;\n  background-size: 100% 100%;\n}`;
      case "iconify":
        return `<Icon icon="${iconId}" />`;
      case "url":
        return url;
      default:
        return svg;
    }
  };

  const copyCode = async (format: CopyFormat) => {
    const code = getFormattedCode(format);
    try {
      await navigator.clipboard.writeText(code);
    } catch {}
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadSvg = () => {
    if (!selected || !svgQuery.data) return;
    const blob = new Blob([svgQuery.data], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${selected.name}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const loadMore = () => setLimit((prev) => prev + PAGE_SIZE);

  return (
    <div className="flex flex-col flex-1 w-full h-full min-w-0 anim-in">
      <ToolHeader
        title="Icon Search"
        badge="200k+ icons"
        poweredBy={{
          label: "Powered by Iconify",
          href: "https://iconify.design",
          icon: <ExternalLink size={10} />,
        }}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Search & Grid */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${selected ? "hidden lg:flex" : ""}`}
        >
          {/* Search Bar */}
          <div className="p-4 pb-3 border-b border-border/50">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search icons... (e.g. home, arrow, settings)"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-bg-secondary border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/40 tr-smooth"
                autoFocus
              />
              {(isLoading || isFetching) && (
                <Loader2
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-accent animate-spin"
                />
              )}
            </div>
            <p className="text-[11px] text-txt-muted mt-2">
              {isSearching
                ? `Showing ${displayIcons.length} of ${totalResults} results`
                : displayIcons.length > 0
                  ? `Popular icons · ${displayIcons.length} shown`
                  : "Type to search icons"}
              {Object.keys(displayCollections).length > 0 && (
                <> across {Object.keys(displayCollections).length} icon sets</>
              )}
            </p>
          </div>

          {/* Icon Grid */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {(isLoading || (!isSearching && initialQuery.isLoading)) &&
            displayIcons.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 size={28} className="animate-spin text-accent/50" />
                <p className="text-xs text-txt-muted">
                  Loading popular icons...
                </p>
              </div>
            ) : displayIcons.length === 0 && debouncedQuery ? (
              <div className="flex items-center justify-center h-full text-txt-muted text-sm">
                No icons found for &ldquo;{debouncedQuery}&rdquo;
              </div>
            ) : displayIcons.length === 0 && !initialQuery.isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Search size={28} className="text-accent/60" />
                </div>
                <p className="text-sm text-txt-sec font-medium">
                  Search 200,000+ icons
                </p>
                <p className="text-xs text-txt-muted">
                  From Material Design, Lucide, Font Awesome, and 100+ more
                </p>
              </div>
            ) : (
              <>
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(75px, 1fr))",
                  }}
                >
                  {displayIcons.map((icon) => {
                    const isActive =
                      selected &&
                      `${selected.prefix}:${selected.name}` === icon;
                    return (
                      <button
                        key={icon}
                        onClick={() => selectIcon(icon)}
                        className={`group aspect-square rounded-xl border flex items-center justify-center tr-smooth hover:scale-105 ${
                          isActive
                            ? "border-accent bg-accent/10 ring-2 ring-accent/20"
                            : "border-border bg-bg-secondary hover:border-accent/30 hover:bg-glass-hover"
                        }`}
                        title={icon}
                      >
                        {svgCache[icon] ? (
                          <div
                            className="w-8 h-8 text-txt group-hover:text-accent tr-smooth [&>svg]:w-full [&>svg]:h-full"
                            dangerouslySetInnerHTML={{ __html: svgCache[icon] }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-border/30 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={isFetching}
                    className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2.5 rounded-xl text-xs btn-glass hover:border-accent/30 disabled:opacity-50"
                  >
                    {isFetching ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                    Load more ({totalResults - displayIcons.length} remaining)
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: Detail Panel — full remaining space */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full lg:flex-1 border-t lg:border-t-0 lg:border-l border-border flex flex-col bg-bg-secondary/30"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-txt truncate">
                    {selected.name}
                  </p>
                  <p className="text-xs text-txt-muted truncate">
                    {selected.setName} · {selected.prefix}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelected(null)}
                    className="lg:hidden px-3 py-1.5 text-xs rounded-lg btn-glass"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1.5 rounded-lg btn-glass"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-8 flex items-center justify-center border-b border-border/50">
                  <div
                    className="flex items-center justify-center rounded-2xl bg-bg-primary border border-border"
                    style={{
                      width: Math.max(previewSize * 2 + 48, 140),
                      height: Math.max(previewSize * 2 + 48, 140),
                    }}
                  >
                    {svgQuery.data ? (
                      (() => {
                        let svg = svgQuery.data;
                        if (previewColor !== "currentColor") {
                          // Replace fill/stroke values so the color picker actually works
                          svg = svg
                            .replace(
                              /fill="currentColor"/g,
                              `fill="${previewColor}"`,
                            )
                            .replace(
                              /fill="#[0-9a-fA-F]{3,8}"/g,
                              `fill="${previewColor}"`,
                            )
                            .replace(/fill="black"/g, `fill="${previewColor}"`)
                            .replace(/fill="white"/g, `fill="${previewColor}"`);
                          // If no fill attribute exists, add one to the root SVG element
                          if (!svg.includes("fill=")) {
                            svg = svg.replace(
                              "<svg",
                              `<svg fill="${previewColor}"`,
                            );
                          }
                        }
                        return (
                          <div
                            style={{
                              width: previewSize,
                              height: previewSize,
                              color:
                                previewColor === "currentColor"
                                  ? undefined
                                  : previewColor,
                            }}
                            className="[&>svg]:w-full [&>svg]:h-full text-txt transition-colors duration-200"
                            dangerouslySetInnerHTML={{ __html: svg }}
                          />
                        );
                      })()
                    ) : svgQuery.isLoading ? (
                      <Loader2
                        size={24}
                        className="animate-spin text-txt-muted"
                      />
                    ) : null}
                  </div>
                </div>

                {/* Controls */}
                <div className="px-5 py-4 border-b border-border/50 space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] text-txt-muted font-semibold uppercase tracking-wider w-10 shrink-0">
                      Size
                    </label>
                    <input
                      type="range"
                      min={16}
                      max={128}
                      value={previewSize}
                      onChange={(e) => setPreviewSize(Number(e.target.value))}
                      className="flex-1 accent-accent h-1"
                    />
                    <span className="text-[11px] text-txt-sec font-mono w-8 text-right">
                      {previewSize}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] text-txt-muted font-semibold uppercase tracking-wider w-10 shrink-0">
                      Color
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap flex-1">
                      {[
                        "currentColor",
                        "#000000",
                        "#ffffff",
                        "#e05d44",
                        "#007ec6",
                        "#4c1",
                        "#fe7d37",
                      ].map((c) => (
                        <button
                          key={c}
                          onClick={() => setPreviewColor(c)}
                          className={`w-7 h-7 rounded-lg border-2 tr-smooth ${previewColor === c ? "border-accent scale-110" : "border-border/50 hover:scale-105"}`}
                          style={{
                            backgroundColor:
                              c === "currentColor" ? "var(--app-txt)" : c,
                          }}
                          title={c}
                        />
                      ))}
                      <input
                        type="color"
                        value={
                          previewColor === "currentColor"
                            ? "#000000"
                            : previewColor
                        }
                        onChange={(e) => setPreviewColor(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                        title="Custom color"
                      />
                    </div>
                  </div>
                </div>

                {/* Copy Options */}
                <div className="px-5 py-4 space-y-2">
                  <p className="text-[10px] text-txt-muted font-semibold uppercase tracking-wider mb-3">
                    Copy as
                  </p>
                  {[
                    {
                      format: "svg" as CopyFormat,
                      label: "SVG",
                      desc: "Raw SVG markup",
                    },
                    {
                      format: "jsx" as CopyFormat,
                      label: "JSX",
                      desc: "React component",
                    },
                    {
                      format: "css-mask" as CopyFormat,
                      label: "CSS (mask)",
                      desc: "currentColor via mask-image",
                    },
                    {
                      format: "css-bg" as CopyFormat,
                      label: "CSS (bg)",
                      desc: "Background image",
                    },
                    {
                      format: "iconify" as CopyFormat,
                      label: "Iconify",
                      desc: '<Icon icon="..." />',
                    },
                    {
                      format: "url" as CopyFormat,
                      label: "URL",
                      desc: "Direct SVG URL",
                    },
                  ].map(({ format, label, desc }) => (
                    <button
                      key={format}
                      onClick={() => copyCode(format)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs tr-smooth ${
                        copied === format
                          ? "bg-success/10 text-success border border-success/20"
                          : "btn-glass"
                      }`}
                    >
                      <div className="text-left">
                        <span className="font-medium">{label}</span>
                        <span className="text-txt-muted ml-2">{desc}</span>
                      </div>
                      {copied === format ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} className="shrink-0" />
                      )}
                    </button>
                  ))}
                  <button
                    onClick={downloadSvg}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 mt-3 rounded-lg text-xs btn-accent"
                  >
                    <Download size={12} /> Download SVG
                  </button>
                </div>

                {/* Meta Info */}
                {(selected.author || selected.license) && (
                  <div className="px-5 py-4 border-t border-border/50">
                    <div className="text-[11px] text-txt-muted space-y-1">
                      {selected.author && (
                        <p>
                          Author:{" "}
                          <span className="text-txt-sec">
                            {selected.author}
                          </span>
                        </p>
                      )}
                      {selected.license && (
                        <p>
                          License:{" "}
                          <span className="text-txt-sec">
                            {selected.license}
                          </span>
                        </p>
                      )}
                      <p>
                        Set:{" "}
                        <span className="text-txt-sec">{selected.setName}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
