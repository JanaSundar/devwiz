"use client";
import { ArrowUpRight, FileText, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { categories, transforms } from "@/lib/registry";
import { getCategoryIcon } from "@/lib/toolCategoryIcon";
import { getToolHref } from "@/lib/toolRoutes";

export default function HomePage() {
  const [filter, setFilter] = useState("");

  const filteredTransforms = useMemo(() => {
    if (!filter.trim()) return transforms;
    const q = filter.toLowerCase();
    return transforms.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q),
    );
  }, [filter]);

  const filteredCategories = useMemo(() => {
    if (!filter.trim()) return categories;
    return categories.filter((cat) =>
      filteredTransforms.some((t) => t.category === cat),
    );
  }, [filter, filteredTransforms]);

  const showReadme =
    !filter.trim() || "readme generator".includes(filter.toLowerCase());

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-txt mb-3">DevWiz</h1>
            <p className="text-sm text-txt-sec leading-relaxed max-w-lg">
              A collection of small, focused developer tools.
              <br />
              No logins, no registration, no data collection.
              <br />
              Everything runs locally in your browser.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="relative mb-10">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted"
          />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search tools..."
            className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-bg-secondary border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/40 tr-smooth"
          />
        </div>

        {/* Generators Section */}
        {showReadme && (
          <section className="mb-10">
            <h2 className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText size={12} />
              Generators
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link
                href="/readme"
                className="group flex flex-col gap-2 p-4 rounded-xl border border-border bg-bg-secondary hover:border-accent/30 tr-smooth"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-txt group-hover:text-accent tr-smooth">
                    README Generator
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="text-txt-muted opacity-0 group-hover:opacity-100 tr-smooth"
                  />
                </div>
                <span className="text-[11px] text-txt-muted leading-relaxed">
                  Build README files with drag-and-drop sections
                </span>
              </Link>
            </div>
          </section>
        )}

        {/* Transform Categories */}
        {filteredCategories.map((cat) => {
          const catTools = filteredTransforms.filter((t) => t.category === cat);
          if (catTools.length === 0) return null;
          return (
            <section key={cat} className="mb-10">
              <h2 className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                {getCategoryIcon(cat, { size: 14, className: "text-accent" })}
                {cat}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={getToolHref(tool.id)}
                    className="group flex flex-col gap-2 p-4 rounded-xl border border-border bg-bg-secondary hover:border-accent/30 tr-smooth"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-txt group-hover:text-accent tr-smooth">
                        {tool.name}
                      </span>
                      <ArrowUpRight
                        size={14}
                        className="text-txt-muted opacity-0 group-hover:opacity-100 tr-smooth"
                      />
                    </div>
                    <span className="text-[11px] text-txt-muted leading-relaxed">
                      {tool.inputLabel} → {tool.outputLabel}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* No results */}
        {!showReadme && filteredCategories.length === 0 && (
          <div className="text-center py-12 text-txt-muted text-sm">
            No tools found for &ldquo;{filter}&rdquo;
          </div>
        )}

        <footer className="pt-8 pb-12 border-t border-border">
          <p className="text-[11px] text-txt-muted/60 text-center">
            Built with Next.js. All processing happens locally in your browser.
          </p>
        </footer>
      </div>
    </div>
  );
}
