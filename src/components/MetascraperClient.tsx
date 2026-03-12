"use client";

import { Check, Copy, Globe, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ToolHeader from "@/components/tooling/ToolHeader";
import { safeParseJson } from "@/lib/utils";

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
      const data = await safeParseJson<{
        error?: string;
        input?: string;
        metadata?: { title?: string; description?: string; image?: string };
      }>(response);
      if (!response.ok) {
        throw new Error(data.error || "Failed to scrape metadata.");
      }

      const m = data?.metadata;
      setMeta((prev) => ({
        ...prev,
        title: typeof m?.title === "string" ? m.title : prev.title,
        description:
          typeof m?.description === "string" ? m.description : prev.description,
        image: typeof m?.image === "string" ? m.image : prev.image,
        url: typeof data?.input === "string" ? data.input : sourceUrl,
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
      <ToolHeader
        title="Meta Tags Studio"
        badge="Utilities"
        poweredBy={{
          label: "Metascraper",
          href: "https://metascraper.js.org/#/",
          icon: <Globe size={10} />,
        }}
        rightSlot={
          <button
            onClick={copyTags}
            className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs tr-smooth ${copied ? "bg-success/15 text-success border border-success/20" : "btn-glass"}`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy Tags"}
          </button>
        }
      />

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Form + Meta Fields */}
        <section className="lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col gap-4 p-4 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto bg-bg-secondary/30">
          <div className="rounded-xl border border-border bg-bg-secondary p-4">
            <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
              Import from URL
            </label>
            <div className="mt-2 flex gap-2">
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 min-w-0 px-3 py-2.5 text-sm rounded-xl bg-bg-primary border border-border text-txt focus:outline-none focus:border-accent/30 tr-smooth"
              />
              <button
                onClick={runScrape}
                disabled={loading}
                className="shrink-0 px-3 py-2.5 rounded-xl text-xs btn-accent disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {loading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Search size={12} />
                )}
                {loading ? "Importing..." : "Import"}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-xs text-error rounded-lg bg-error/5 p-2">
                {error}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-bg-secondary p-4 space-y-4">
            <h3 className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
              Meta Fields
            </h3>
            <div className="space-y-3">
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
                  className="mt-2 w-full px-3 py-2.5 text-sm rounded-xl bg-bg-primary border border-border text-txt focus:outline-none focus:border-accent/30 tr-smooth"
                >
                  <option value="summary_large_image">
                    summary_large_image
                  </option>
                  <option value="summary">summary</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Generated Metadata + Social Preview — 50/50 */}
        <section className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border text-xs font-semibold text-txt-muted uppercase tracking-wider shrink-0 bg-bg-secondary/50">
              Generated Meta Tags
            </div>
            <div className="flex-1 min-h-[200px] overflow-hidden">
              <CodeEditor value={tagsOutput} language="html" readOnly />
            </div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-border text-xs font-semibold text-txt-muted uppercase tracking-wider shrink-0 bg-bg-secondary/50">
              Social Preview
            </div>
            <div className="flex-1 min-h-[200px] overflow-auto p-4 flex items-center justify-center">
              <div className="rounded-xl border border-border bg-bg-primary overflow-hidden w-full max-w-md shadow-lg">
                <div className="w-full aspect-1200/630 bg-bg-tertiary overflow-hidden">
                  {/* biome-ignore lint/performance/noImgElement: Preview must render arbitrary remote URLs without next/image domain configuration. */}
                  <img
                    src={meta.image}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-[10px] text-txt-muted truncate">
                    {meta.url}
                  </p>
                  <p className="text-sm font-semibold text-txt line-clamp-1">
                    {meta.title || "Untitled page"}
                  </p>
                  <p className="text-xs text-txt-sec line-clamp-2">
                    {meta.description || "No description set."}
                  </p>
                  <p className="text-[10px] text-txt-muted">{meta.siteName}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
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
          className="mt-2 w-full px-3 py-2.5 text-sm rounded-xl bg-bg-primary border border-border text-txt focus:outline-none focus:border-accent/30 tr-smooth resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full px-3 py-2.5 text-sm rounded-xl bg-bg-primary border border-border text-txt focus:outline-none focus:border-accent/30 tr-smooth"
        />
      )}
    </div>
  );
}
