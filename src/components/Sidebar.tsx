"use client";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Menu,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { categories, transforms } from "@/lib/registry";
import { getCategoryIcon } from "@/lib/toolCategoryIcon";
import { getToolHref } from "@/lib/toolRoutes";
import { cn } from "@/lib/utils";
import SettingsModal from "./SettingsModal";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const pathname = usePathname();

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const filtered = useMemo(() => {
    if (!search) return transforms;
    const q = search.toLowerCase();
    return transforms.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [search]);

  const filteredCats = useMemo(() => {
    const s = new Set(filtered.map((t) => t.category));
    return categories.filter((c) => s.has(c));
  }, [filtered]);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const handler = () => setShowSettings(true);
    window.addEventListener("open-settings", handler);
    return () => window.removeEventListener("open-settings", handler);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [mobileOpen]);

  const showLabels = !collapsed;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
          role="presentation"
        />
      )}

      <button
        onClick={openMobile}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg btn-glass border border-border"
        aria-label="Open menu"
      >
        <Menu size={16} />
      </button>

      <aside
        className={cn(
          "hidden md:flex flex-col h-full border-r border-border overflow-hidden bg-bg-secondary",
          "transition-all duration-200 ease-out",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent
          showLabels={showLabels}
          pathname={pathname}
          search={search}
          setSearch={setSearch}
          filtered={filtered}
          filteredCats={filteredCats}
          getCatIcon={(cat) => getCategoryIcon(cat, { size: 10 })}
          setShowSettings={setShowSettings}
          onNavClick={() => {}}
          headerButton={
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="ml-auto p-1.5 rounded-md btn-glass shrink-0"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronLeft size={14} />
              )}
            </button>
          }
        />
      </aside>

      <aside
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-bg-secondary border-r border-border overflow-hidden",
          "transition-transform duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent
          showLabels={true}
          pathname={pathname}
          search={search}
          setSearch={setSearch}
          filtered={filtered}
          filteredCats={filteredCats}
          getCatIcon={(cat) => getCategoryIcon(cat, { size: 10 })}
          setShowSettings={setShowSettings}
          onNavClick={closeMobile}
          headerButton={
            <button
              onClick={closeMobile}
              className="ml-auto p-1.5 rounded-md btn-glass shrink-0"
              aria-label="Close menu"
            >
              <ChevronLeft size={14} />
            </button>
          }
        />
      </aside>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}

// Extracted shared sidebar content to avoid duplication
type Transform = (typeof transforms)[number];

function SidebarContent({
  showLabels,
  pathname,
  search,
  setSearch,
  filtered,
  filteredCats,
  getCatIcon,
  setShowSettings,
  onNavClick,
  headerButton,
}: {
  showLabels: boolean;
  pathname: string;
  search: string;
  setSearch: (s: string) => void;
  filtered: Transform[];
  filteredCats: string[];
  getCatIcon: (cat: string) => React.ReactNode;
  setShowSettings: (v: boolean) => void;
  onNavClick: () => void;
  headerButton: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
        {showLabels ? (
          <div className="flex items-center justify-between w-full min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-bg-primary border border-border flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 512 512"
                  className="text-txt"
                >
                  <path
                    d="M464 6.1c9.5-8.5 24-8.1 33 .9l8 8c9 9 9.4 23.5.9 33l-85.8 95.9c-2.6 2.9-4.1 6.7-4.1 10.7V176c0 8.8-7.2 16-16 16h-15.8c-4.6 0-8.9 1.9-11.9 5.3L100.7 500.9C94.3 508 85.3 512 75.8 512c-8.8 0-17.3-3.5-23.5-9.8L9.7 459.7C3.5 453.4 0 445 0 436.2c0-9.5 4-18.5 11.1-24.8l111.6-99.8c3.4-3 5.3-7.4 5.3-11.9V272c0-8.8 7.2-16 16-16h34.6c3.9 0 7.7-1.5 10.7-4.1L464 6.1zM432 288c3.6 0 6.7 2.4 7.7 5.8l14.8 51.7 51.7 14.8c3.4 1 5.8 4.1 5.8 7.7s-2.4 6.7-5.8 7.7l-51.7 14.8-14.8 51.7c-1 3.4-4.1 5.8-7.7 5.8s-6.7-2.4-7.7-5.8l-14.8-51.7-51.7-14.8c-3.4-1-5.8-4.1-5.8-7.7s2.4-6.7 5.8-7.7l51.7-14.8 14.8-51.7c1-3.4 4.1-5.8 7.7-5.8zM87.7 69.8l14.8 51.7 51.7 14.8c3.4 1 5.8 4.1 5.8 7.7s-2.4 6.7-5.8 7.7l-51.7 14.8-14.8 51.7c-1 3.4-4.1 5.8-7.7 5.8s-6.7-2.4-7.7-5.8l-14.8-51.7-51.7-14.8c-3.4-1-5.8-4.1-5.8-7.7s2.4-6.7 5.8-7.7l51.7-14.8 14.8-51.7c1-3.4 4.1-5.8 7.7-5.8s6.7 2.4 7.7 5.8zM208 0c3.7 0 6.9 2.5 7.8 6.1l6.8 27.3 27.3 6.8c3.6.9 6.1 4.1 6.1 7.8s-2.5 6.9-6.1 7.8l-27.3 6.8-6.8 27.3c-.9 3.6-4.1 6.1-7.8 6.1s-6.9-2.5-7.8-6.1l-6.8-27.3-27.3-6.8c-3.6-.9-6.1-4.1-6.1-7.8s2.5-6.9 6.1-7.8l27.3-6.8 6.8-27.3c.9-3.6 4.1-6.1 7.8-6.1z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-txt tracking-tight">
                  DevWiz
                </h1>
                <p className="text-[10px] text-txt-muted">developer tools</p>
              </div>
            </div>

            <button
              onClick={() =>
                document.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", metaKey: true }),
                )
              }
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-primary border border-border hover:border-txt/20 transition-all group scale-95"
              title="Open command menu (⌘K)"
              aria-label="Open command menu (⌘K)"
            >
              <span className="text-[10px] font-black text-txt-muted group-hover:text-txt tracking-tighter">
                ⌘K
              </span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() =>
                document.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", metaKey: true }),
                )
              }
              className="p-1.5 rounded-md btn-glass shrink-0"
              aria-label="Open command menu"
              title="Command menu (⌘K)"
            >
              <span className="text-[10px] font-mono">⌘K</span>
            </button>
            {headerButton}
          </div>
        )}
      </div>

      {showLabels ? (
        <div className="p-3 shrink-0">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-muted"
            />
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search tools"
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-bg-primary border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:border-accent/40 tr-smooth"
            />
          </div>
        </div>
      ) : (
        <div className="px-3 pb-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true }),
              )
            }
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-bg-primary border border-border text-[11px] text-txt-muted hover:text-txt hover:border-txt/20 tr-smooth"
            title="Search tools (⌘K)"
            aria-label="Search tools (⌘K)"
          >
            <Search size={12} />
            <span>Search</span>
          </button>
        </div>
      )}

      <nav
        className="flex-1 overflow-y-auto px-2 pb-2 space-y-1"
        aria-label="Main navigation"
      >
        {/* Home */}
        <div className="mb-1">
          <Link
            href="/"
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs tr-smooth",
              pathname === "/"
                ? "bg-accent/10 text-accent font-medium border border-accent/15"
                : "text-txt-sec hover:bg-glass-hover hover:text-txt border border-transparent",
              !showLabels && "justify-center",
            )}
          >
            <Home size={15} className="shrink-0" />
            {showLabels && <span>Home</span>}
          </Link>
        </div>

        {/* README Generator */}
        <div className="mb-3">
          {showLabels && (
            <p className="px-2 py-1 text-[10px] font-semibold text-txt-muted uppercase tracking-wider">
              Generators
            </p>
          )}
          <Link
            href="/readme"
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs tr-smooth",
              pathname === "/readme"
                ? "bg-accent/10 text-accent font-medium border border-accent/15"
                : "text-txt-sec hover:bg-glass-hover hover:text-txt border border-transparent",
              !showLabels && "justify-center",
            )}
          >
            <FileText size={15} className="shrink-0" />
            {showLabels && <span>README Generator</span>}
          </Link>
        </div>

        <div className="h-px bg-border mx-2 mb-2" />

        {showLabels && (
          <p className="px-2 py-1 text-[10px] font-semibold text-txt-muted uppercase tracking-wider">
            Transforms
          </p>
        )}

        {filteredCats.map((cat) => (
          <div key={cat} className="mb-2">
            {showLabels && (
              <p className="px-2 py-1.5 text-[10px] font-medium text-txt-muted/70 uppercase tracking-wider flex items-center gap-1.5">
                {getCatIcon(cat)}
                {cat}
              </p>
            )}
            {filtered
              .filter((t) => t.category === cat)
              .map((tool) => {
                const href = getToolHref(tool.id);
                const active = pathname === href;
                return (
                  <Link
                    key={tool.id}
                    href={href}
                    onClick={onNavClick}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs tr-smooth",
                      active
                        ? "bg-accent/10 text-accent font-medium border border-accent/15"
                        : "text-txt-sec hover:bg-glass-hover hover:text-txt border border-transparent",
                      !showLabels && "justify-center",
                    )}
                    title={tool.name}
                  >
                    {showLabels ? (
                      <span>{tool.name}</span>
                    ) : (
                      <span className="w-6 h-6 rounded-md border border-border flex items-center justify-center">
                        {getCatIcon(tool.category)}
                      </span>
                    )}
                  </Link>
                );
              })}
          </div>
        ))}
        {!filtered.length && showLabels && (
          <p className="text-center text-xs text-txt-muted py-6">
            No tools match
          </p>
        )}
      </nav>

      <div className="p-3 border-t border-border mt-auto shrink-0 space-y-2">
        <button
          onClick={() => setShowSettings(true)}
          aria-label="API Settings"
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs tr-smooth text-txt-muted hover:bg-glass-hover hover:text-txt w-full",
            !showLabels && "justify-center",
          )}
        >
          <Settings size={15} className="shrink-0" />
          {showLabels && <span>API Settings</span>}
        </button>
        {showLabels && (
          <div className="flex items-center justify-center gap-3 text-[12px] text-txt-muted leading-relaxed">
            <p>Made by Jana</p>
            <a
              href="https://github.com/JanaSundar/devwiz"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center text-txt-muted hover:text-txt tr-smooth"
              aria-label="DevWiz GitHub repository"
            >
              <span className="sr-only">DevWiz GitHub repository</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .297a12 12 0 0 0-3.793 23.389c.6.111.82-.261.82-.58 0-.286-.01-1.04-.015-2.04-3.338.726-4.042-1.611-4.042-1.611-.546-1.387-1.333-1.757-1.333-1.757-1.09-.744.083-.729.083-.729 1.205.085 1.839 1.238 1.839 1.238 1.07 1.833 2.809 1.304 3.495.997.108-.776.418-1.305.761-1.604-2.665-.304-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.49 11.49 0 0 1 6.003 0c2.291-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.874.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.371.814 1.102.814 2.222 0 1.606-.015 2.899-.015 3.293 0 .321.216.694.825.576A12 12 0 0 0 12 .297" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </>
  );
}
