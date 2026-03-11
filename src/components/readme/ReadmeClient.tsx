"use client";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Check,
  Code,
  Copy,
  Download,
  Eye,
  Plus,
  RotateCcw,
} from "lucide-react";
import { marked } from "marked";
import { useCallback, useEffect, useMemo, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import SectionBlock from "./SectionBlock";
import {
  createCustomSection,
  defaultSections,
  type ReadmeSection,
} from "./sections";

export default function ReadmeClient() {
  const [sections, setSections] = useState<ReadmeSection[]>(() =>
    defaultSections.map((s) => ({ ...s })),
  );
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<"preview" | "raw">("preview");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setSections((prev) => {
        const oi = prev.findIndex((s) => s.id === active.id);
        const ni = prev.findIndex((s) => s.id === over.id);
        return arrayMove(prev, oi, ni);
      });
    }
  };

  const onUpdate = useCallback(
    (id: string, content: string) =>
      setSections((p) => p.map((s) => (s.id === id ? { ...s, content } : s))),
    [],
  );
  const onDelete = useCallback(
    (id: string) => setSections((p) => p.filter((s) => s.id !== id)),
    [],
  );
  const onToggle = useCallback(
    (id: string) =>
      setSections((p) =>
        p.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
      ),
    [],
  );
  const onRename = useCallback(
    (id: string, title: string) =>
      setSections((p) => p.map((s) => (s.id === id ? { ...s, title } : s))),
    [],
  );
  const addSection = () => setSections((p) => [...p, createCustomSection()]);
  const reset = () => setSections(defaultSections.map((s) => ({ ...s })));

  const md = useMemo(
    () =>
      sections
        .filter((s) => s.enabled)
        .map((s) => s.content)
        .join("\n\n"),
    [sections],
  );
  const html = useMemo(
    () => marked.parse(md, { async: false }) as string,
    [md],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(md);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const active = activeId ? sections.find((s) => s.id === activeId) : null;

  return (
    <div className="flex flex-col h-full anim-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-6 py-4 border-b border-border gap-3 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 pl-10 md:pl-0 min-w-0 flex-1">
          <h2 className="text-base md:text-lg font-semibold text-txt truncate shrink-0">
            README Generator
          </h2>
          <span className="px-2 py-0.5 text-[10px] rounded bg-accent/10 text-accent border border-accent/15 shrink-0">
            {sections.filter((s) => s.enabled).length} sections active
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 overflow-x-auto md:justify-end">
          <button
            onClick={reset}
            className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs btn-glass"
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={download}
            className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs btn-glass"
          >
            <Download size={12} />
            Download
          </button>
          <button
            onClick={copy}
            className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tr-smooth ${copied ? "bg-success/15 text-success border border-success/20" : "btn-accent"}`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy MD"}
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="w-full lg:w-105 flex flex-col border-b lg:border-b-0 lg:border-r border-border min-h-100 lg:min-h-0 shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
              Sections
            </span>
            <button
              onClick={addSection}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs btn-glass hover:border-accent/30"
            >
              <Plus size={12} />
              Add
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {mounted ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={sections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((s) => (
                    <SectionBlock
                      key={s.id}
                      section={s}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onToggle={onToggle}
                      onRename={onRename}
                    />
                  ))}
                </SortableContext>
                <DragOverlay>
                  {active ? (
                    <div className="rounded-xl p-3 bg-bg-secondary border border-accent/20 shadow-lg opacity-90">
                      <span className="text-xs font-medium text-txt">
                        {active.title}
                      </span>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            ) : (
              sections.map((s) => (
                <SectionBlock
                  key={s.id}
                  section={s}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onToggle={onToggle}
                  onRename={onRename}
                />
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 min-h-100 lg:min-h-0 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 border-b border-border/50">
            <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider mr-auto">
              Preview
            </span>
            <div className="flex items-center rounded-lg border border-border overflow-hidden w-full sm:w-auto">
              <button
                onClick={() => setPreviewMode("preview")}
                className={`flex-1 sm:flex-none justify-center items-center gap-1.5 px-3 py-1.5 text-xs tr-smooth ${previewMode === "preview" ? "bg-accent/10 text-accent" : "text-txt-muted hover:text-txt-sec"}`}
              >
                <Eye size={12} />
                Preview
              </button>
              <button
                onClick={() => setPreviewMode("raw")}
                className={`flex-1 sm:flex-none justify-center items-center gap-1.5 px-3 py-1.5 text-xs tr-smooth ${previewMode === "raw" ? "bg-accent/10 text-accent" : "text-txt-muted hover:text-txt-sec"}`}
              >
                <Code size={12} />
                Raw
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {previewMode === "preview" ? (
              sections.filter((s) => s.enabled).length ? (
                <div
                  className="md-preview p-4 sm:p-6"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-txt-muted text-sm py-8 sm:py-0">
                  Enable sections to see preview
                </div>
              )
            ) : (
              <pre className="h-full p-4 sm:p-6 text-xs font-mono text-txt-sec leading-relaxed whitespace-pre-wrap">
                {md}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
