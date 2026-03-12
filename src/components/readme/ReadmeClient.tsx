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
import ToolHeader from "@/components/tooling/ToolHeader";
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
      <ToolHeader
        title="README Generator"
        badge={`${sections.filter((s) => s.enabled).length} sections`}
        rightSlot={
          <>
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
          </>
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="w-full lg:w-105 flex flex-col border-b lg:border-b-0 lg:border-r border-border min-h-100 lg:min-h-0 shrink-0 bg-bg-secondary/30">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-secondary/50">
            <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
              Sections
            </span>
            <button
              onClick={addSection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs btn-glass hover:border-accent/30"
            >
              <Plus size={12} />
              Add Section
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-border bg-bg-secondary/50">
            <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider mr-auto">
              Preview
            </span>
            <div className="flex items-center rounded-xl border border-border overflow-hidden w-full sm:w-auto">
              <button
                onClick={() => setPreviewMode("preview")}
                className={`flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-2 text-xs tr-smooth ${previewMode === "preview" ? "bg-accent/10 text-accent border border-accent/20" : "text-txt-muted hover:text-txt-sec"}`}
              >
                <Eye size={12} />
                Preview
              </button>
              <button
                onClick={() => setPreviewMode("raw")}
                className={`flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-2 text-xs tr-smooth ${previewMode === "raw" ? "bg-accent/10 text-accent border border-accent/20" : "text-txt-muted hover:text-txt-sec"}`}
              >
                <Code size={12} />
                Raw
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-bg-primary">
            {previewMode === "preview" ? (
              sections.filter((s) => s.enabled).length ? (
                <div
                  className="md-preview p-6 sm:p-8 max-w-3xl mx-auto"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-txt-muted text-sm py-12 gap-2">
                  <span>Enable sections to see preview</span>
                  <span className="text-xs">
                    Toggle sections with the eye icon
                  </span>
                </div>
              )
            ) : (
              <pre className="h-full p-6 sm:p-8 text-xs font-mono text-txt-sec leading-relaxed whitespace-pre-wrap max-w-3xl mx-auto">
                {md}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
