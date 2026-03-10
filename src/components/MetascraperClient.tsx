"use client";

import { Check, Copy, Globe, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ThemeToggle from "@/components/ThemeToggle";

type MetaModel = {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
  twitterCard: "summary_large_image" | "summary";
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default function MetascraperClient() {
  const [sourceUrl, setSourceUrl] = useState("https://vercel.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [meta, setMeta] = useState<MetaModel>({
    title: "Build better tools faster",
    description:
      "A polished toolkit for developers with focused workflows and instant utilities.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    url: "https://devwiz.app",
    siteName: "DevWiz",
    twitterCard: "summary_large_image",
  });

  const runScrape = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/metascraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to scrape metadata.");
      }

      setMeta((prev) => ({
        ...prev,
        title: data?.metadata?.title || prev.title,
        description: data?.metadata?.description || prev.description,
        image: data?.metadata?.image || prev.image,
        url: data?.input || sourceUrl,
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to scrape metadata.",
      );
    } finally {
      setLoading(false);
    }
  };

  const tagsOutput = useMemo(() => {
    const t = escapeHtml(meta.title);
    const d = escapeHtml(meta.description);
    const u = escapeHtml(meta.url);
    const i = escapeHtml(meta.image);
    const s = escapeHtml(meta.siteName);

    return [
      `<title>${t}</title>`,
      `<meta name="description" content="${d}" />`,
      "",
      `<meta property="og:type" content="website" />`,
      `<meta property="og:title" content="${t}" />`,
      `<meta property="og:description" content="${d}" />`,
      `<meta property="og:url" content="${u}" />`,
      `<meta property="og:site_name" content="${s}" />`,
      `<meta property="og:image" content="${i}" />`,
      "",
      `<meta name="twitter:card" content="${meta.twitterCard}" />`,
      `<meta name="twitter:title" content="${t}" />`,
      `<meta name="twitter:description" content="${d}" />`,
      `<meta name="twitter:image" content="${i}" />`,
    ].join("\n");
  }, [meta]);

  const copyTags = async () => {
    try {
      await navigator.clipboard.writeText(tagsOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="flex flex-col h-full anim-in">
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border gap-3 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 pl-10 md:pl-0 min-w-0 flex-1">
          <h2 className="text-base md:text-lg font-semibold text-txt truncate">
            Meta Tags Studio
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/15">
            Utilities
          </span>
        </div>
        <div className="flex items-center gap-2 w-auto shrink-0 overflow-x-auto">
          <a
            href="https://metascraper.js.org/#/"
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap flex items-center gap-1 px-2 py-1 text-[9px] md:text-[10px] text-txt-muted hover:text-accent rounded-md btn-glass tr-smooth"
          >
            Powered by Metascraper <Globe size={10} />
          </a>
          <button
            onClick={copyTags}
            className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tr-smooth ${copied ? "bg-success/15 text-success border border-success/20" : "btn-glass"}`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy Tags"}
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-bg-secondary p-4 space-y-4 h-fit">
            <div>
              <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Import from URL
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-bg-primary border border-border text-txt focus:outline-none focus:border-accent/30 tr-smooth"
                />
                <button
                  onClick={runScrape}
                  disabled={loading}
                  className="shrink-0 px-3 py-2 rounded-lg text-xs btn-accent disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {loading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Search size={12} />
                  )}
                  {loading ? "Importing..." : "Import"}
                </button>
              </div>
              {error && <p className="mt-2 text-xs text-error">{error}</p>}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Field
                label="Title"
                value={meta.title}
                onChange={(value) =>
                  setMeta((prev) => ({ ...prev, title: value }))
                }
              />
              <Field
                label="Description"
                value={meta.description}
                onChange={(value) =>
                  setMeta((prev) => ({ ...prev, description: value }))
                }
                multiline
              />
              <Field
                label="Image URL"
                value={meta.image}
                onChange={(value) =>
                  setMeta((prev) => ({ ...prev, image: value }))
                }
              />
              <Field
                label="Canonical URL"
                value={meta.url}
                onChange={(value) =>
                  setMeta((prev) => ({ ...prev, url: value }))
                }
              />
              <Field
                label="Site Name"
                value={meta.siteName}
                onChange={(value) =>
                  setMeta((prev) => ({ ...prev, siteName: value }))
                }
              />
              <div>
                <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                  Twitter Card
                </label>
                <select
                  value={meta.twitterCard}
                  onChange={(e) =>
                    setMeta((prev) => ({
                      ...prev,
                      twitterCard: e.target.value as MetaModel["twitterCard"],
                    }))
                  }
                  className="mt-2 w-full px-3 py-2 text-sm rounded-lg bg-bg-primary border border-border text-txt focus:outline-none focus:border-accent/30 tr-smooth"
                >
                  <option value="summary_large_image">
                    summary_large_image
                  </option>
                  <option value="summary">summary</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-bg-secondary p-4">
              <div className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-3">
                Social Preview
              </div>
              <div className="rounded-lg border border-border bg-bg-primary overflow-hidden">
                <div className="w-full aspect-1200/630 bg-bg-tertiary overflow-hidden">
                  {/* biome-ignore lint/performance/noImgElement: Preview must render arbitrary remote URLs without next/image domain configuration. */}
                  <img
                    src={meta.image}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-[11px] text-txt-muted truncate">
                    {meta.url}
                  </p>
                  <p className="text-sm font-semibold text-txt line-clamp-1">
                    {meta.title || "Untitled page"}
                  </p>
                  <p className="text-xs text-txt-sec line-clamp-2">
                    {meta.description || "No description set."}
                  </p>
                  <p className="text-[11px] text-txt-muted">{meta.siteName}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-bg-secondary overflow-hidden">
              <div className="px-4 py-3 border-b border-border text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Generated Meta Tags
              </div>
              <div className="h-85">
                <CodeEditor value={tagsOutput} language="html" readOnly />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-2 w-full px-3 py-2 text-sm rounded-lg bg-bg-primary border border-border text-txt focus:outline-none focus:border-accent/30 tr-smooth resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full px-3 py-2 text-sm rounded-lg bg-bg-primary border border-border text-txt focus:outline-none focus:border-accent/30 tr-smooth"
        />
      )}
    </div>
  );
}
