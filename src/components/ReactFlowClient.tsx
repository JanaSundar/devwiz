"use client";

import {
  addEdge,
  Background,
  type Connection,
  Controls,
  type Edge,
  type Node,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import { diagramNodeTypes } from "@/components/flow-board/diagramNodeTypes";
import FlowWorkflowClient from "@/components/flow-board/FlowWorkflowClient";
import type { ApiFlowPayload } from "@/lib/flow-workflow/apiFlowChannel";
import {
  getStoredApiPayload,
  subscribeToApiFlow,
} from "@/lib/flow-workflow/apiFlowChannel";
import "@xyflow/react/dist/style.css";
import {
  AlertCircle,
  Braces,
  Copy,
  GitBranch,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import CodeEditor from "@/components/CodeEditor";
import ToolHeader from "@/components/tooling/ToolHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type DiagramDisplayMode,
  getDiagramConfig,
  setDiagramConfig,
} from "@/lib/flow-board/diagramConfig";
import { cn } from "@/lib/utils";

const DEFAULT_JSON = `{
  "name": "App",
  "config": {
    "env": "prod",
    "debug": true
  },
  "features": ["auth", "api"]
}`;

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    position: { x: 250, y: 0 },
    data: { label: "Start" },
  },
  {
    id: "2",
    position: { x: 100, y: 100 },
    data: { label: "Process" },
  },
  {
    id: "3",
    position: { x: 400, y: 100 },
    data: { label: "Decision" },
  },
  {
    id: "4",
    position: { x: 100, y: 200 },
    data: { label: "Output" },
  },
  {
    id: "5",
    position: { x: 400, y: 200 },
    data: { label: "End" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e1-3", source: "1", target: "3" },
  { id: "e2-4", source: "2", target: "4" },
  { id: "e3-5", source: "3", target: "5" },
];

function generateId() {
  return `n${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getKeyLabel(path: string, isArray: boolean): string {
  if (!path) return isArray ? "[]" : "{}";
  const lastPart = path.split(".").pop() ?? "";
  const arrayIndexMatch = lastPart.match(/\[(\d+)\]$/);
  if (arrayIndexMatch) return `[${arrayIndexMatch[1]}]`;
  return lastPart || (isArray ? "[]" : "{}");
}

function jsonToFlowData(
  jsonStr: string,
  displayMode: DiagramDisplayMode,
): { nodes: Node[]; edges: Edge[] } {
  let data: unknown;
  try {
    data = JSON.parse(jsonStr);
  } catch {
    throw new Error("Invalid JSON");
  }

  if (displayMode === "compact") {
    const id = generateId();
    return {
      nodes: [
        {
          id,
          type: "compactJson",
          position: { x: 100, y: 100 },
          data: { content: JSON.stringify(data, null, 2) },
        },
      ],
      edges: [],
    };
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const idMap = new Map<string, string>();
  let nodeCounter = 0;

  function toId(path: string): string {
    if (!idMap.has(path)) {
      idMap.set(path, `n${nodeCounter++}`);
    }
    return idMap.get(path)!;
  }

  function processValue(
    value: unknown,
    parentPath: string,
    parentId: string | null,
    x: number,
    y: number,
  ): { maxY: number; maxX: number } {
    const path = parentPath ? `${parentPath}.` : "";
    let maxY = y;
    let maxX = x;

    if (value === null || value === undefined) {
      const keyPart = parentPath ? `${getKeyLabel(parentPath, false)}: ` : "";
      const id = toId(`${path}null`);
      nodes.push({
        id,
        position: { x, y },
        data: { label: `${keyPart}null` },
      });
      if (parentId)
        edges.push({ id: `e-${parentId}-${id}`, source: parentId, target: id });
      return { maxY: y + 80, maxX: x + 180 };
    }

    if (typeof value === "boolean" || typeof value === "number") {
      const keyPart = parentPath ? `${getKeyLabel(parentPath, false)}: ` : "";
      const id = toId(`${path}${String(value)}`);
      nodes.push({
        id,
        position: { x, y },
        data: { label: `${keyPart}${String(value)}` },
      });
      if (parentId)
        edges.push({ id: `e-${parentId}-${id}`, source: parentId, target: id });
      return { maxY: y + 80, maxX: x + 180 };
    }

    if (typeof value === "string") {
      const valLabel = value.length > 24 ? `${value.slice(0, 24)}…` : value;
      const keyPart = parentPath ? `${getKeyLabel(parentPath, false)}: ` : "";
      const id = toId(`${path}str`);
      nodes.push({
        id,
        position: { x, y },
        data: { label: `${keyPart}"${valLabel}"` },
      });
      if (parentId)
        edges.push({ id: `e-${parentId}-${id}`, source: parentId, target: id });
      return { maxY: y + 80, maxX: x + 180 };
    }

    if (Array.isArray(value)) {
      const id = toId(`${path}[]`);
      const keyName = getKeyLabel(parentPath, true);
      nodes.push({
        id,
        position: { x, y },
        data: { label: keyName },
      });
      if (parentId)
        edges.push({ id: `e-${parentId}-${id}`, source: parentId, target: id });

      let cx = x;
      for (let i = 0; i < Math.min(value.length, 5); i++) {
        const { maxY: ny, maxX: nx } = processValue(
          value[i],
          `${path}[${i}]`,
          id,
          cx,
          y + 90,
        );
        maxY = Math.max(maxY, ny);
        cx = nx + 40;
        maxX = cx;
      }
      if (value.length > 5) {
        nodes.push({
          id: toId(`${path}[...]`),
          position: { x: cx, y: y + 90 },
          data: { label: "… more" },
        });
        maxY = y + 170;
        maxX = cx + 180;
      }
      return { maxY, maxX };
    }

    if (typeof value === "object" && value !== null) {
      const keys = Object.keys(value as object);
      const id = toId(parentPath || "root");
      const keyName = getKeyLabel(parentPath, false);
      nodes.push({
        id,
        position: { x, y },
        data: { label: keyName },
      });
      if (parentId)
        edges.push({ id: `e-${parentId}-${id}`, source: parentId, target: id });

      let cx = x;
      for (const key of keys) {
        const val = (value as Record<string, unknown>)[key];
        const { maxY: ny, maxX: nx } = processValue(
          val,
          `${path}${key}`,
          id,
          cx,
          y + 90,
        );
        maxY = Math.max(maxY, ny);
        cx = nx + 40;
        maxX = cx;
      }
      return { maxY, maxX };
    }

    return { maxY: y, maxX: x };
  }

  processValue(data, "", null, 0, 0);
  return { nodes, edges };
}

function FlowInternals({ fitViewTrigger }: { fitViewTrigger: number | null }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (fitViewTrigger == null) return;
    const t = setTimeout(() => {
      fitView({
        duration: 500,
        padding: 0.25,
        maxZoom: 1,
        minZoom: 0.1,
        interpolate: "smooth",
      });
    }, 50);
    return () => clearTimeout(t);
  }, [fitViewTrigger, fitView]);

  return null;
}

function FlowToolbar({
  onAddNode,
  onJsonToFlow,
  onCopyJson,
  onClear,
  copied,
  displayMode,
  onDisplayModeChange,
  showDisplayModeToggle,
}: {
  onAddNode: () => void;
  onJsonToFlow: () => void;
  onCopyJson: () => void;
  onClear: () => void;
  copied?: boolean;
  displayMode: DiagramDisplayMode;
  onDisplayModeChange: (mode: DiagramDisplayMode) => void;
  showDisplayModeToggle?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="xs" onClick={onAddNode} className="gap-1.5">
        <Plus size={14} />
        Add node
      </Button>
      <Button
        variant="ghost"
        size="xs"
        onClick={onJsonToFlow}
        className="gap-1.5"
      >
        <Braces size={14} />
        JSON to flow
      </Button>
      {showDisplayModeToggle && (
        <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-bg-secondary/50 p-0.5">
          <button
            type="button"
            onClick={() => onDisplayModeChange("expanded")}
            className={cn(
              "px-2 py-1 rounded text-[11px] tr-smooth",
              displayMode === "expanded"
                ? "bg-accent/15 text-accent"
                : "text-txt-muted hover:text-txt",
            )}
            title="Each property as a separate node"
          >
            Expanded
          </button>
          <button
            type="button"
            onClick={() => onDisplayModeChange("compact")}
            className={cn(
              "px-2 py-1 rounded text-[11px] tr-smooth",
              displayMode === "compact"
                ? "bg-accent/15 text-accent"
                : "text-txt-muted hover:text-txt",
            )}
            title="Full JSON in one node"
          >
            Compact
          </button>
        </div>
      )}
      <Button
        variant="ghost"
        size="xs"
        onClick={onCopyJson}
        className="gap-1.5"
      >
        <Copy size={14} />
        {copied ? "Copied!" : "Copy"}
      </Button>
      <Button
        variant="ghost"
        size="xs"
        onClick={onClear}
        className="gap-1.5 text-txt-muted hover:text-destructive"
      >
        <Trash2 size={14} />
        Clear
      </Button>
    </div>
  );
}

export default function ReactFlowClient() {
  const { resolvedTheme } = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [fitViewTrigger, setFitViewTrigger] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [displayMode, setDisplayMode] =
    useState<DiagramDisplayMode>("expanded");
  const [lastConvertedJson, setLastConvertedJson] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setDisplayMode(getDiagramConfig().displayMode);
  }, []);

  const handleDisplayModeChange = useCallback(
    (mode: DiagramDisplayMode) => {
      setDisplayMode(mode);
      setDiagramConfig({ displayMode: mode });
      if (lastConvertedJson) {
        try {
          const { nodes: newNodes, edges: newEdges } = jsonToFlowData(
            lastConvertedJson,
            mode,
          );
          setNodes(newNodes);
          setEdges(newEdges);
          setFitViewTrigger(Date.now());
        } catch {
          // ignore parse errors
        }
      }
    },
    [lastConvertedJson, setNodes, setEdges, setFitViewTrigger],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const colorMode = resolvedTheme === "dark" ? "dark" : "light";

  const handleAddNode = useCallback(() => {
    const id = generateId();
    setNodes((nds) => [
      ...nds,
      {
        id,
        position: {
          x: 250 + Math.random() * 100,
          y: 200 + Math.random() * 100,
        },
        data: { label: "New node" },
      },
    ]);
  }, [setNodes]);

  const handleJsonToFlow = useCallback(() => setJsonDialogOpen(true), []);

  const handleApplyJson = useCallback(() => {
    setJsonError(null);
    try {
      const { nodes: newNodes, edges: newEdges } = jsonToFlowData(
        jsonInput,
        displayMode,
      );
      setLastConvertedJson(jsonInput);
      setNodes(newNodes);
      setEdges(newEdges);
      setJsonDialogOpen(false);
      setFitViewTrigger(Date.now());
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON");
    }
  }, [jsonInput, displayMode, setNodes, setEdges]);

  const handleCopyJson = useCallback(() => {
    const data = { nodes, edges };
    const str = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(str).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [nodes, edges]);

  const handleClear = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Clear all nodes and edges?")
    ) {
      setLastConvertedJson(null);
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  const loadExample = useCallback(() => {
    setJsonInput(DEFAULT_JSON);
    setJsonError(null);
  }, []);

  const handleLoadAsDiagram = useCallback(
    (json: string) => {
      setMode("diagram");
      try {
        setLastConvertedJson(json);
        const { nodes: n, edges: e } = jsonToFlowData(json, displayMode);
        setNodes(n);
        setEdges(e);
        setFitViewTrigger(Date.now());
      } catch {
        setJsonInput(json);
        setJsonError(null);
        setJsonDialogOpen(true);
      }
    },
    [displayMode, setNodes, setEdges],
  );

  const [pendingApiPayload, setPendingApiPayload] =
    useState<ApiFlowPayload | null>(() => getStoredApiPayload());
  const [mode, setMode] = useState<"diagram" | "workflow">("diagram");

  useEffect(() => {
    const payload = pendingApiPayload;
    if (!payload) return;
    if (payload.openAs === "diagram" && payload.response?.body) {
      const body = payload.response.body.trim();
      const jsonToLoad =
        body.startsWith("{") || body.startsWith("[") ? body : "{}";
      handleLoadAsDiagram(jsonToLoad);
      setPendingApiPayload(null);
    } else if (payload.openAs !== "diagram") {
      setMode("workflow");
    } else {
      setPendingApiPayload(null);
    }
  }, [pendingApiPayload, handleLoadAsDiagram]);

  useEffect(() => {
    return subscribeToApiFlow((payload) => {
      setPendingApiPayload(payload);
      if (payload.openAs !== "diagram") {
        setMode("workflow");
      }
    });
  }, []);

  if (mode === "workflow") {
    return (
      <div className="flex flex-1 flex-col min-h-0">
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border shrink-0">
          <button
            type="button"
            onClick={() => setMode("diagram")}
            className="px-2.5 py-1.5 rounded text-xs btn-glass hover:border-accent/30"
          >
            Diagram
          </button>
          <button
            type="button"
            onClick={() => setMode("workflow")}
            className="px-2.5 py-1.5 rounded text-xs bg-accent/15 text-accent border border-accent/30"
          >
            Workflow
          </button>
        </div>
        <FlowWorkflowClient
          onLoadAsDiagram={handleLoadAsDiagram}
          initialApiPayload={pendingApiPayload}
          onConsumedApiPayload={() => setPendingApiPayload(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-bg-primary overflow-hidden w-full">
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border shrink-0">
        <button
          type="button"
          onClick={() => setMode("diagram")}
          className="px-2.5 py-1.5 rounded text-xs bg-accent/15 text-accent border border-accent/30"
        >
          Diagram
        </button>
        <button
          type="button"
          onClick={() => setMode("workflow")}
          className="px-2.5 py-1.5 rounded text-xs btn-glass hover:border-accent/30"
        >
          Workflow
        </button>
      </div>
      <ToolHeader
        title="Flow Board"
        badge="Utilities"
        poweredBy={{
          label: "Powered by React Flow",
          href: "https://reactflow.dev",
          icon: <GitBranch size={10} />,
        }}
        rightSlot={
          <FlowToolbar
            onAddNode={handleAddNode}
            onJsonToFlow={handleJsonToFlow}
            onCopyJson={handleCopyJson}
            onClear={handleClear}
            copied={copied}
            displayMode={displayMode}
            onDisplayModeChange={handleDisplayModeChange}
            showDisplayModeToggle={lastConvertedJson !== null}
          />
        }
      />

      <motion.div
        className="w-full grow relative overflow-hidden"
        style={{ minHeight: 0 }}
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={diagramNodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
              colorMode={colorMode}
              className="bg-transparent"
              nodesDraggable
              nodesConnectable
              elementsSelectable
              deleteKeyCode={["Backspace", "Delete"]}
              multiSelectionKeyCode="Meta"
            >
              <Background />
              <Controls />
              <FlowInternals fitViewTrigger={fitViewTrigger} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </motion.div>

      <Dialog open={jsonDialogOpen} onOpenChange={setJsonDialogOpen}>
        <DialogContent
          className="sm:max-w-2xl p-0 gap-0 overflow-hidden bg-bg-primary border-border shadow-xl"
          overlayClassName="bg-black/90"
          showCloseButton={true}
        >
          <div className="flex flex-col">
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-xs text-txt-muted border-b border-border shrink-0",
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  jsonError ? "bg-error" : "bg-accent",
                )}
              />
              <DialogTitle className="text-sm font-semibold text-txt m-0">
                JSON to Flow Diagram
              </DialogTitle>
            </div>
            <p className="px-4 pt-2 text-xs text-txt-muted">
              Paste JSON to convert it into a visual flow. Choose how to display
              it below.
            </p>
            <div className="flex flex-col p-4 pt-2 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-txt">Display:</span>
                <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-bg-secondary/50 p-0.5">
                  <button
                    type="button"
                    onClick={() => handleDisplayModeChange("expanded")}
                    className={cn(
                      "px-2.5 py-1 rounded text-[11px] tr-smooth",
                      displayMode === "expanded"
                        ? "bg-accent/15 text-accent"
                        : "text-txt-muted hover:text-txt",
                    )}
                    title="Each property as a separate node"
                  >
                    Expanded
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDisplayModeChange("compact")}
                    className={cn(
                      "px-2.5 py-1 rounded text-[11px] tr-smooth",
                      displayMode === "compact"
                        ? "bg-accent/15 text-accent"
                        : "text-txt-muted hover:text-txt",
                    )}
                    title="Full JSON in one node"
                  >
                    Compact
                  </button>
                </div>
                <span className="text-[11px] text-txt-muted">
                  {displayMode === "expanded"
                    ? "Each property → node"
                    : "Full JSON in one node"}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-bg-secondary overflow-hidden">
                <div className="h-[280px] min-h-0">
                  <CodeEditor
                    value={jsonInput}
                    onChange={(v) => {
                      setJsonInput(v);
                      setJsonError(null);
                    }}
                    language="json"
                    placeholder={DEFAULT_JSON}
                  />
                </div>
              </div>
              {jsonError && (
                <div className="flex items-start gap-2 p-3 rounded-xl border border-error/20 bg-error/5 text-xs text-error">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}
            </div>
            <DialogFooter className="px-4 pb-4 pt-0 gap-2 flex-row justify-between sm:justify-between">
              <button
                type="button"
                onClick={loadExample}
                className="px-3 py-1.5 rounded-lg text-xs btn-glass hover:border-accent/30 tr-smooth"
              >
                Load example
              </button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setJsonDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleApplyJson} className="gap-1.5">
                  <Braces size={14} />
                  Convert to flow
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
