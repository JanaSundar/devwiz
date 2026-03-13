"use client";

import { Download, GitBranch, LayoutGrid, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ToolHeader from "@/components/tooling/ToolHeader";
import { ToolPanel, ToolPanels } from "@/components/tooling/ToolPanels";
import { Input } from "@/components/ui/input";
import { storeApiPayloadForFlowBoard } from "@/lib/flow-workflow/apiFlowChannel";
import { cn } from "@/lib/utils";

type BuilderNode = {
  id: string;
  label: string;
  kind: "rect" | "round" | "decision";
};

type BuilderEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
};

const EXAMPLES: { id: string; label: string; code: string }[] = [
  {
    id: "flowchart",
    label: "Flowchart",
    code: `flowchart TD
  Start[Start] --> Decision{Ready?}
  Decision -->|Yes| Build[Build]
  Decision -->|No| End[End]
  Build --> End`,
  },
  {
    id: "sequence",
    label: "Sequence",
    code: `sequenceDiagram
Alice->>Bob: Hello Bob, how are you?
Bob-->>Alice: I am good thanks!`,
  },
  {
    id: "gantt",
    label: "Gantt",
    code: `gantt
  title Project timeline
  dateFormat  YYYY-MM-DD
  section Design
  Research      :done,    des1, 2024-01-06, 4d
  Wireframes    :active,  des2, 2024-01-10, 4d
  section Build
  Frontend      :         dev1, after des2, 6d
  Backend       :         dev2, after des2, 6d`,
  },
  {
    id: "class",
    label: "Class diagram",
    code: `classDiagram
  class User {
    +String id
    +String name
    +login()
  }
  class Session {
    +String token
    +expiresAt
  }
  User --> Session`,
  },
];

const DEFAULT_MERMAID = EXAMPLES[0]!.code;
const INITIAL_NODES: BuilderNode[] = [
  { id: "Start", label: "Start", kind: "round" },
  { id: "Decision", label: "Ready?", kind: "decision" },
  { id: "Build", label: "Build", kind: "rect" },
  { id: "End", label: "End", kind: "round" },
];
const INITIAL_EDGES: BuilderEdge[] = [
  { id: "e1", from: "Start", to: "Decision" },
  { id: "e2", from: "Decision", to: "Build", label: "Yes" },
  { id: "e3", from: "Decision", to: "End", label: "No" },
  { id: "e4", from: "Build", to: "End" },
];

function sanitizeId(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Node";
  return trimmed.replace(/[^a-zA-Z0-9_]/g, "_");
}

function escapeLabel(value: string): string {
  return value.replace(/"/g, '\\"');
}

function nodeToMermaid(node: BuilderNode): string {
  const id = sanitizeId(node.id);
  const label = escapeLabel(node.label || node.id);
  if (node.kind === "round") return `  ${id}(${label})`;
  if (node.kind === "decision") return `  ${id}{${label}}`;
  return `  ${id}[${label}]`;
}

function edgeToMermaid(edge: BuilderEdge): string {
  const from = sanitizeId(edge.from);
  const to = sanitizeId(edge.to);
  const label = edge.label?.trim();
  if (label) return `  ${from} -->|${escapeLabel(label)}| ${to}`;
  return `  ${from} --> ${to}`;
}

function builderToMermaid(nodes: BuilderNode[], edges: BuilderEdge[]): string {
  const lines = ["flowchart TD"];
  for (const node of nodes) lines.push(nodeToMermaid(node));
  for (const edge of edges) lines.push(edgeToMermaid(edge));
  return lines.join("\n");
}

export default function MermaidLabClient() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mode, setMode] = useState<"builder" | "code">("builder");
  const [code, setCode] = useState(DEFAULT_MERMAID);
  const [nodes, setNodes] = useState<BuilderNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<BuilderEdge[]>(INITIAL_EDGES);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mode !== "builder") return;
    setCode(builderToMermaid(nodes, edges));
  }, [mode, nodes, edges]);

  useEffect(() => {
    const handle = setTimeout(async () => {
      const src = code;
      if (!src.trim()) {
        setSvg(null);
        setError(null);
        return;
      }
      setError(null);
      try {
        const mermaid = await import("mermaid");
        mermaid.default.initialize({
          startOnLoad: false,
          theme: resolvedTheme === "dark" ? "dark" : "default",
          securityLevel: "loose",
        });
        const id = `mermaid-${Date.now()}`;
        const { svg: rendered } = await mermaid.default.render(id, src);
        setSvg(rendered);
      } catch (err) {
        setSvg(null);
        setError(
          err instanceof Error ? err.message : "Failed to render diagram",
        );
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [code, resolvedTheme]);

  const openInFlowBoard = useCallback(() => {
    storeApiPayloadForFlowBoard({
      type: "mermaid-flow",
      openAs: "diagram",
      mermaid: code,
    });
    router.push("/flow-board");
  }, [code, router]);

  const downloadSvg = useCallback(() => {
    if (!svg) return;
    const blob = new Blob([svg], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagram-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [svg]);

  const addNode = () => {
    const next = nodes.length + 1;
    setNodes((prev) => [
      ...prev,
      { id: `Node${next}`, label: `Node ${next}`, kind: "rect" },
    ]);
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
  };

  const addEdge = () => {
    const first = nodes[0]?.id ?? "Start";
    const second = nodes[1]?.id ?? first;
    setEdges((prev) => [
      ...prev,
      { id: `e${Date.now()}`, from: first, to: second, label: "" },
    ]);
  };

  const removeEdge = (id: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== id));
  };

  const loadFlowExample = () => {
    setMode("builder");
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
  };

  const loadCodeExample = (value: string) => {
    setMode("code");
    setCode(value);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-bg-primary anim-in">
      <ToolHeader
        title="Mermaid Studio"
        badge="Utilities"
        poweredBy={{
          label: "Mermaid",
          href: "https://mermaid.js.org",
          icon: <LayoutGrid size={10} />,
        }}
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadSvg}
              disabled={!svg}
              className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-glass disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download size={12} />
              SVG
            </button>
            <button
              type="button"
              onClick={openInFlowBoard}
              className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-accent"
              title="Open Flow Board with this Mermaid flow"
            >
              <GitBranch size={12} />
              Flow
            </button>
          </div>
        }
      />

      <ToolPanels
        left={
          <ToolPanel
            title={mode === "builder" ? "FLOW BUILDER (GUI)" : "MERMAID CODE"}
            statusClassName="bg-accent"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 text-[11px]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMode("builder")}
                  className={cn(
                    "rounded-full px-2.5 py-1 border tr-smooth",
                    mode === "builder"
                      ? "border-accent/50 bg-accent/15 text-accent"
                      : "border-border bg-bg-secondary hover:border-accent/40",
                  )}
                >
                  GUI Builder
                </button>
                <button
                  type="button"
                  onClick={() => setMode("code")}
                  className={cn(
                    "rounded-full px-2.5 py-1 border tr-smooth",
                    mode === "code"
                      ? "border-accent/50 bg-accent/15 text-accent"
                      : "border-border bg-bg-secondary hover:border-accent/40",
                  )}
                >
                  Code
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex flex-wrap gap-1">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() =>
                        ex.id === "flowchart"
                          ? loadFlowExample()
                          : loadCodeExample(ex.code)
                      }
                      className="rounded-full border border-border bg-bg-secondary px-2 py-0.5 hover:border-accent/40 hover:text-accent tr-smooth"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {mode === "builder" ? (
              <div className="min-h-0 overflow-auto p-3 space-y-3">
                <div className="rounded-xl border border-border bg-bg-secondary/60 p-2.5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-medium text-txt-muted uppercase tracking-wide">
                      Nodes
                    </p>
                    <button
                      type="button"
                      onClick={addNode}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-bg-primary px-2 py-1 text-[11px] hover:border-accent/40"
                    >
                      <Plus size={11} />
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {nodes.map((node) => (
                      <div
                        key={node.id}
                        className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-1.5"
                      >
                        <Input
                          value={node.id}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === node.id ? { ...n, id: val } : n,
                              ),
                            );
                            setEdges((prev) =>
                              prev.map((ed) => ({
                                ...ed,
                                from: ed.from === node.id ? val : ed.from,
                                to: ed.to === node.id ? val : ed.to,
                              })),
                            );
                          }}
                          className="h-8 text-xs"
                          placeholder="Id"
                        />
                        <Input
                          value={node.label}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === node.id
                                  ? { ...n, label: e.target.value }
                                  : n,
                              ),
                            )
                          }
                          className="h-8 text-xs"
                          placeholder="Label"
                        />
                        <select
                          value={node.kind}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === node.id
                                  ? {
                                      ...n,
                                      kind: e.target
                                        .value as BuilderNode["kind"],
                                    }
                                  : n,
                              ),
                            )
                          }
                          className="h-8 rounded-md border border-border bg-bg-primary px-2 text-xs"
                        >
                          <option value="rect">Rect</option>
                          <option value="round">Round</option>
                          <option value="decision">Decision</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeNode(node.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-bg-primary text-txt-muted hover:text-destructive"
                          title="Remove node"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-bg-secondary/60 p-2.5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-medium text-txt-muted uppercase tracking-wide">
                      Connections
                    </p>
                    <button
                      type="button"
                      onClick={addEdge}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-bg-primary px-2 py-1 text-[11px] hover:border-accent/40"
                    >
                      <Plus size={11} />
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {edges.map((edge) => (
                      <div
                        key={edge.id}
                        className="grid grid-cols-[1fr_auto_1fr_1fr_auto] items-center gap-1.5"
                      >
                        <select
                          value={edge.from}
                          onChange={(e) =>
                            setEdges((prev) =>
                              prev.map((ed) =>
                                ed.id === edge.id
                                  ? { ...ed, from: e.target.value }
                                  : ed,
                              ),
                            )
                          }
                          className="h-8 rounded-md border border-border bg-bg-primary px-2 text-xs"
                        >
                          {nodes.map((n) => (
                            <option
                              key={`${edge.id}-from-${n.id}`}
                              value={n.id}
                            >
                              {n.id}
                            </option>
                          ))}
                        </select>
                        <span className="text-xs text-txt-muted text-center">
                          to
                        </span>
                        <select
                          value={edge.to}
                          onChange={(e) =>
                            setEdges((prev) =>
                              prev.map((ed) =>
                                ed.id === edge.id
                                  ? { ...ed, to: e.target.value }
                                  : ed,
                              ),
                            )
                          }
                          className="h-8 rounded-md border border-border bg-bg-primary px-2 text-xs"
                        >
                          {nodes.map((n) => (
                            <option key={`${edge.id}-to-${n.id}`} value={n.id}>
                              {n.id}
                            </option>
                          ))}
                        </select>
                        <Input
                          value={edge.label ?? ""}
                          onChange={(e) =>
                            setEdges((prev) =>
                              prev.map((ed) =>
                                ed.id === edge.id
                                  ? { ...ed, label: e.target.value }
                                  : ed,
                              ),
                            )
                          }
                          className="h-8 text-xs"
                          placeholder="Edge label"
                        />
                        <button
                          type="button"
                          onClick={() => removeEdge(edge.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-bg-primary text-txt-muted hover:text-destructive"
                          title="Remove connection"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-0">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language="markdown"
                  placeholder={DEFAULT_MERMAID}
                />
              </div>
            )}
          </ToolPanel>
        }
        right={
          <ToolPanel
            title="PREVIEW"
            statusClassName={error ? "bg-error" : "bg-success"}
            frameClassName="overflow-hidden p-0 flex flex-col min-h-0"
          >
            {error ? (
              <div className="m-3 rounded-xl border border-error/20 bg-error/5 p-3 text-xs text-error">
                {error}
              </div>
            ) : svg ? (
              <div
                ref={previewRef}
                className="flex min-h-[260px] flex-1 items-center justify-center overflow-auto p-4"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center text-sm text-txt-muted">
                <span>Start building to see the preview.</span>
              </div>
            )}
          </ToolPanel>
        }
      />
    </div>
  );
}
