"use client";

import {
  addEdge,
  Background,
  type Connection,
  Controls,
  type Edge,
  getIncomers,
  type Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { JSONPath } from "jsonpath-plus";
import {
  Braces,
  ChevronDown,
  Copy,
  Download,
  FileJson,
  FileText,
  Minus,
  Plus,
  Send,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ToolHeader from "@/components/tooling/ToolHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTransformWorker } from "@/hooks/useTransformWorker";
import {
  type ApiFlowPayload,
  subscribeToApiFlow,
} from "@/lib/flow-workflow/apiFlowChannel";
import { PIPELINE_TRANSFORMS } from "@/lib/flow-workflow/transformRegistry";
import type {
  ApiRequestNodeData,
  KeyValueRow,
} from "@/lib/flow-workflow/types";
import { workflowNodeTypes } from "./nodeTypes";

function jsonStructureFromBody(body: string): string {
  try {
    const obj = JSON.parse(body);
    const parts: string[] = [];
    function walk(o: unknown, path: string[]): void {
      if (o === null || typeof o !== "object") {
        parts.push(path.join(" → ") || "value");
        return;
      }
      if (Array.isArray(o)) {
        parts.push([...path, `[${o.length}]`].join(" → "));
        if (o.length > 0) walk(o[0], [...path, "[0]"]);
        return;
      }
      const keys = Object.keys(o as Record<string, unknown>);
      if (keys.length === 0) {
        parts.push(path.join(" → ") || "{}");
        return;
      }
      for (const k of keys.slice(0, 5)) {
        walk((o as Record<string, unknown>)[k], [...path, k]);
      }
      if (keys.length > 5)
        parts.push([...path, `…+${keys.length - 5}`].join(" → "));
    }
    walk(obj, []);
    return parts.slice(0, 8).join(", ") || "{}";
  } catch {
    return "";
  }
}

function generateId() {
  return `n${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function rowsToRecord(
  val: KeyValueRow[] | Record<string, string> | undefined,
): Record<string, string> {
  if (!val) return {};
  if (Array.isArray(val))
    return val
      .filter((r) => r.key?.trim())
      .reduce(
        (acc, r) => ({ ...acc, [r.key.trim()]: r.value?.trim() ?? "" }),
        {},
      );
  if (typeof val === "object") return val as Record<string, string>;
  return {};
}

function toRows(
  val: KeyValueRow[] | Record<string, string> | undefined,
): KeyValueRow[] {
  if (Array.isArray(val) && val.length > 0) return val;
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const entries = Object.entries(val);
    return entries.length > 0
      ? entries.map(([key, value], i) => ({ id: `kv-${key}-${i}`, key, value }))
      : [{ id: "empty-0", key: "", value: "" }];
  }
  return [{ id: "empty-0", key: "", value: "" }];
}

function ApiRequestConfigPanel({
  nodeId,
  data,
  onUpdate,
}: {
  nodeId: string;
  data: ApiRequestNodeData;
  onUpdate: (id: string, d: Record<string, unknown>) => void;
}) {
  const hasBody = !["GET", "HEAD"].includes(data.method ?? "GET");
  const headers = toRows(data.headers);
  const params = toRows(data.params);

  const updateHeaders = (rows: KeyValueRow[]) =>
    onUpdate(nodeId, { headers: rows });
  const updateParams = (rows: KeyValueRow[]) =>
    onUpdate(nodeId, { params: rows });

  const addRow = (rows: KeyValueRow[], setter: (r: KeyValueRow[]) => void) => {
    setter([...rows, { id: generateId(), key: "", value: "" }]);
  };
  const removeRow = (
    rows: KeyValueRow[],
    id: string,
    setter: (r: KeyValueRow[]) => void,
  ) => {
    setter(rows.filter((r) => r.id !== id));
  };
  const updateRow = (
    rows: KeyValueRow[],
    id: string,
    field: "key" | "value",
    val: string,
    setter: (r: KeyValueRow[]) => void,
  ) => {
    setter(rows.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  return (
    <div className="space-y-3 flex flex-col min-h-0">
      <div>
        <label className="text-[10px] text-txt-muted block mb-1">Method</label>
        <select
          value={data.method ?? "GET"}
          onChange={(e) => onUpdate(nodeId, { method: e.target.value })}
          className="w-full h-8 rounded border border-border bg-bg-primary text-xs px-2"
        >
          {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[10px] text-txt-muted block mb-1">URL</label>
        <input
          type="url"
          value={data.url ?? ""}
          onChange={(e) => onUpdate(nodeId, { url: e.target.value })}
          className="w-full h-8 rounded border border-border bg-bg-primary text-xs px-2 font-mono"
          placeholder="https://api.example.com/..."
        />
      </div>
      <div>
        <label className="text-[10px] text-txt-muted block mb-1">
          Response path (JSONPath)
        </label>
        <input
          type="text"
          value={data.responsePath ?? ""}
          onChange={(e) => onUpdate(nodeId, { responsePath: e.target.value })}
          className="w-full h-8 rounded border border-border bg-bg-primary text-xs px-2 font-mono"
          placeholder="$.data or $.users[0] — leave empty for entire response"
        />
      </div>
      {hasBody && (
        <div className="flex flex-col min-h-0 flex-1">
          <label className="text-[10px] text-txt-muted block mb-1">
            Body (JSON)
          </label>
          <div className="min-h-[80px] rounded border border-border overflow-hidden">
            <CodeEditor
              value={data.body ?? "{}"}
              onChange={(v) => onUpdate(nodeId, { body: v })}
              language="json"
            />
          </div>
        </div>
      )}
      <div>
        <label className="text-[10px] text-txt-muted block mb-1">Headers</label>
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {headers.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[1fr_1fr_auto] gap-1 items-center"
            >
              <Input
                value={r.key}
                onChange={(e) =>
                  updateRow(headers, r.id, "key", e.target.value, updateHeaders)
                }
                placeholder="Key"
                className="h-7 text-[11px] font-mono"
              />
              <Input
                value={r.value}
                onChange={(e) =>
                  updateRow(
                    headers,
                    r.id,
                    "value",
                    e.target.value,
                    updateHeaders,
                  )
                }
                placeholder="Value"
                className="h-7 text-[11px] font-mono"
              />
              <button
                type="button"
                onClick={() => removeRow(headers, r.id, updateHeaders)}
                className="p-1.5 rounded hover:bg-error/10 text-txt-muted hover:text-error"
              >
                <Minus size={12} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addRow(headers, updateHeaders)}
            className="text-[11px] text-txt-muted hover:text-accent py-1 flex items-center gap-1"
          >
            <Plus size={12} />
            Add header
          </button>
        </div>
      </div>
      <div>
        <label className="text-[10px] text-txt-muted block mb-1">
          Query params
        </label>
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {params.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[1fr_1fr_auto] gap-1 items-center"
            >
              <Input
                value={r.key}
                onChange={(e) =>
                  updateRow(params, r.id, "key", e.target.value, updateParams)
                }
                placeholder="Key"
                className="h-7 text-[11px] font-mono"
              />
              <Input
                value={r.value}
                onChange={(e) =>
                  updateRow(params, r.id, "value", e.target.value, updateParams)
                }
                placeholder="Value"
                className="h-7 text-[11px] font-mono"
              />
              <button
                type="button"
                onClick={() => removeRow(params, r.id, updateParams)}
                className="p-1.5 rounded hover:bg-error/10 text-txt-muted hover:text-error"
              >
                <Minus size={12} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addRow(params, updateParams)}
            className="text-[11px] text-txt-muted hover:text-accent py-1 flex items-center gap-1"
          >
            <Plus size={12} />
            Add param
          </button>
        </div>
      </div>
    </div>
  );
}

const initialNodes: Node[] = [
  {
    id: "input-1",
    type: "workflowInput",
    position: { x: 200, y: 0 },
    data: {
      type: "input",
      subtype: "json",
      value: "{}",
      label: "JSON Input",
    },
  },
  {
    id: "transform-1",
    type: "workflowTransform",
    position: { x: 200, y: 120 },
    data: {
      type: "transform",
      transformId: "json-to-yaml",
      label: "JSON → YAML",
    },
  },
  {
    id: "output-1",
    type: "workflowOutput",
    position: { x: 200, y: 240 },
    data: {
      type: "output",
      subtype: "preview",
      label: "Preview",
    },
  },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "input-1", target: "transform-1" },
  { id: "e2", source: "transform-1", target: "output-1" },
];

const PIPELINE_TEMPLATES = [
  {
    name: "API Response → TypeScript",
    nodes: [
      {
        id: "api-1",
        type: "workflowApiRequest",
        position: { x: 200, y: 0 },
        data: {
          type: "apiRequest",
          method: "GET",
          url: "https://jsonplaceholder.typicode.com/posts/1",
          status: "idle",
        },
      },
      {
        id: "t1",
        type: "workflowTransform",
        position: { x: 200, y: 120 },
        data: {
          type: "transform",
          transformId: "json-to-typescript",
          label: "JSON → TypeScript",
        },
      },
      {
        id: "o1",
        type: "workflowOutput",
        position: { x: 200, y: 240 },
        data: { type: "output", subtype: "download", label: "Download" },
      },
    ],
    edges: [
      { id: "ea1", source: "api-1", target: "t1" },
      { id: "ea2", source: "t1", target: "o1" },
    ],
  },
  {
    name: "JSON → YAML → TOML",
    nodes: [
      {
        id: "i1",
        type: "workflowInput",
        position: { x: 200, y: 0 },
        data: {
          type: "input",
          subtype: "json",
          value: "{}",
          label: "JSON Input",
        },
      },
      {
        id: "t1",
        type: "workflowTransform",
        position: { x: 200, y: 120 },
        data: {
          type: "transform",
          transformId: "json-to-yaml",
          label: "JSON → YAML",
        },
      },
      {
        id: "t2",
        type: "workflowTransform",
        position: { x: 200, y: 240 },
        data: {
          type: "transform",
          transformId: "yaml-to-toml",
          label: "YAML → TOML",
        },
      },
      {
        id: "o1",
        type: "workflowOutput",
        position: { x: 200, y: 360 },
        data: { type: "output", subtype: "preview", label: "Preview" },
      },
    ],
    edges: [
      { id: "e1", source: "i1", target: "t1" },
      { id: "e2", source: "t1", target: "t2" },
      { id: "e3", source: "t2", target: "o1" },
    ],
  },
  {
    name: "JSON → Schema",
    nodes: [
      {
        id: "i1",
        type: "workflowInput",
        position: { x: 200, y: 0 },
        data: {
          type: "input",
          subtype: "json",
          value: "{}",
          label: "JSON Input",
        },
      },
      {
        id: "t1",
        type: "workflowTransform",
        position: { x: 200, y: 120 },
        data: {
          type: "transform",
          transformId: "json-to-schema",
          label: "JSON → Schema",
        },
      },
      {
        id: "o1",
        type: "workflowOutput",
        position: { x: 200, y: 240 },
        data: { type: "output", subtype: "preview", label: "Preview" },
      },
    ],
    edges: [
      { id: "e1", source: "i1", target: "t1" },
      { id: "e2", source: "t1", target: "o1" },
    ],
  },
];

function FlowWorkflowClient({
  onLoadAsDiagram,
  initialApiPayload,
  onConsumedApiPayload,
}: {
  onLoadAsDiagram?: (json: string) => void;
  initialApiPayload?: ApiFlowPayload | null;
  onConsumedApiPayload?: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const { transform } = useTransformWorker();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const colorMode = resolvedTheme === "dark" ? "dark" : "light";

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const runPipeline = useCallback(async () => {
    const outputs = new Map<string, string>();

    const getInputForNode = (nodeId: string): string => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return "";
      const incomers = getIncomers(node, nodes, edges);
      if (incomers.length === 0) return "";
      const first = incomers[0];
      if (outputs.has(first.id)) return outputs.get(first.id)!;
      const d = first.data as {
        value?: string;
        output?: string;
        body?: string;
      };
      return d.value ?? d.output ?? d.body ?? "";
    };

    const updateNode = (id: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
        ),
      );
    };

    for (const n of nodes) {
      if (n.type === "workflowInput") {
        const d = n.data as { value?: string };
        outputs.set(n.id, d.value ?? "");
      }
    }

    const apiRequestNodes = nodes.filter(
      (n) => n.type === "workflowApiRequest",
    );
    const transformNodes = nodes.filter((n) => n.type === "workflowTransform");
    const outputNodes = nodes.filter((n) => n.type === "workflowOutput");

    for (const node of apiRequestNodes) {
      const d = node.data as unknown as ApiRequestNodeData;
      if (!d.url?.trim()) continue;
      const headers = rowsToRecord(d.headers);
      const params = rowsToRecord(d.params);
      const hasBody = !["GET", "HEAD"].includes(d.method ?? "GET");
      updateNode(node.id, { status: "running", error: undefined });
      try {
        const res = await fetch("/api/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: d.method ?? "GET",
            url: d.url,
            headers,
            params,
            bodyType: "json",
            body: hasBody ? (d.body ?? null) : null,
          }),
        });
        const text = await res.text();
        let data: {
          status?: number;
          statusText?: string;
          body?: string;
          duration?: number;
          error?: string;
        };
        try {
          data = text ? (JSON.parse(text) as typeof data) : {};
        } catch {
          data = { error: "Invalid response from server" };
        }
        if (res.status !== 200 || data.error) {
          updateNode(node.id, {
            status: "error",
            error: data.error ?? "Request failed",
          });
        } else {
          let body = data.body ?? "";
          const path = d.responsePath?.trim();
          if (path) {
            try {
              const parsed = JSON.parse(body);
              const result = JSONPath({ path, json: parsed });
              body =
                result.length === 1
                  ? typeof result[0] === "string"
                    ? result[0]
                    : JSON.stringify(result[0], null, 2)
                  : JSON.stringify(result, null, 2);
            } catch {
              /* pass through original body */
            }
          }
          outputs.set(node.id, body);
          updateNode(node.id, {
            status: "success",
            body: data.body ?? "",
            output: body,
          });
        }
      } catch (err) {
        updateNode(node.id, {
          status: "error",
          error: err instanceof Error ? err.message : "Request failed",
        });
      }
    }

    for (const node of transformNodes) {
      const input = getInputForNode(node.id);
      const t = node.data as { transformId: string };
      const needsJson = [
        "json-to-yaml",
        "json-to-typescript",
        "json-to-toml",
        "json-to-schema",
        "js-to-json",
      ].includes(t.transformId);
      if (needsJson && !input?.trim()) {
        updateNode(node.id, {
          status: "error",
          error: "No input provided. Connect a JSON Input or API Request node.",
        });
        continue;
      }
      updateNode(node.id, { status: "running", error: undefined });
      try {
        const { output, error } = await transform(t.transformId, input);
        if (!error && output) outputs.set(node.id, output);
        updateNode(node.id, {
          output: output || undefined,
          error: error || undefined,
          status: error ? "error" : "success",
        });
      } catch (err) {
        updateNode(node.id, {
          error: err instanceof Error ? err.message : "Failed",
          status: "error",
        });
      }
    }

    let previewOutputId: string | null = null;
    for (const node of outputNodes) {
      const input = getInputForNode(node.id);
      const d = node.data as { subtype: string };
      updateNode(node.id, { input, status: "success" });
      if (d.subtype === "preview" && input) {
        previewOutputId = node.id;
      }
      if (d.subtype === "copy" && input) {
        await navigator.clipboard.writeText(input);
      }
      if (d.subtype === "download" && input) {
        const blob = new Blob([input], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `output-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
    if (previewOutputId) {
      setSelectedNodeId(previewOutputId);
    }
  }, [nodes, edges, transform, setNodes]);

  const addInputNode = useCallback(() => {
    const id = generateId();
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "workflowInput",
        position: { x: 200 + nds.length * 50, y: 0 },
        data: {
          type: "input",
          subtype: "json",
          value: "{}",
          label: "JSON Input",
        },
      },
    ]);
  }, [setNodes]);

  const addTransformNode = useCallback(
    (transformId: string) => {
      const t = PIPELINE_TRANSFORMS.find((x) => x.id === transformId);
      if (!t) return;
      const id = generateId();
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: "workflowTransform",
          position: { x: 200, y: 120 + nds.length * 100 },
          data: {
            type: "transform",
            transformId: t.id,
            label: t.name,
          },
        },
      ]);
    },
    [setNodes],
  );

  const addOutputNode = useCallback(() => {
    const id = generateId();
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "workflowOutput",
        position: { x: 200, y: 240 + nds.length * 80 },
        data: {
          type: "output",
          subtype: "preview",
          label: "Preview",
        },
      },
    ]);
  }, [setNodes]);

  const addApiRequestNode = useCallback(() => {
    const id = generateId();
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "workflowApiRequest",
        position: { x: 200, y: 0 },
        data: {
          type: "apiRequest",
          method: "GET",
          url: "https://jsonplaceholder.typicode.com/posts/1",
          headers: [
            {
              id: generateId(),
              key: "Content-Type",
              value: "application/json",
            },
          ],
          params: [],
          body: "{}",
          status: "idle",
        },
      },
    ]);
  }, [setNodes]);

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const applyApiPayload = useCallback(
    (payload: ApiFlowPayload) => {
      if (payload.type !== "api-request-response") {
        onConsumedApiPayload?.();
        return;
      }

      const baseX = 200;
      const baseY = 0;
      const reqId = generateId();
      const reqNode: Node = {
        id: reqId,
        type: "workflowApiRequest",
        position: { x: baseX, y: baseY },
        data: {
          type: "apiRequest",
          method: payload.request.method,
          url: payload.request.url,
          headers: payload.request.headers,
          body: payload.request.body,
          status: "success",
        },
      };

      if (payload.error) {
        const errId = generateId();
        const errNode: Node = {
          id: errId,
          type: "workflowApiError",
          position: { x: baseX, y: baseY + 100 },
          data: {
            type: "apiError",
            message: payload.error.message,
            statusCode: payload.error.statusCode,
          },
        };
        setNodes([reqNode, errNode]);
        setEdges([{ id: `e-${reqId}-${errId}`, source: reqId, target: errId }]);
      } else if (payload.response) {
        const resId = generateId();
        const resNode: Node = {
          id: resId,
          type: "workflowApiResponse",
          position: { x: baseX, y: baseY + 100 },
          data: {
            type: "apiResponse",
            status: payload.response.status,
            statusText: payload.response.statusText,
            duration: payload.response.duration,
            headers: payload.response.headers,
            body: payload.response.body,
          },
        };
        const newNodes: Node[] = [reqNode, resNode];
        const newEdges: Edge[] = [
          { id: `e-${reqId}-${resId}`, source: reqId, target: resId },
        ];

        const body = payload.response.body ?? "";
        const isJson =
          body.trim().startsWith("{") || body.trim().startsWith("[");
        if (isJson && body.trim()) {
          const jsonId = generateId();
          const structure = jsonStructureFromBody(body);
          const jsonNode: Node = {
            id: jsonId,
            type: "workflowJsonStructure",
            position: { x: baseX, y: baseY + 200 },
            data: {
              type: "jsonStructure",
              body,
              structure: structure || "{}",
            },
          };
          newNodes.push(jsonNode);
          newEdges.push({
            id: `e-${resId}-${jsonId}`,
            source: resId,
            target: jsonId,
          });
        }

        setNodes(newNodes);
        setEdges(newEdges);
      } else {
        setNodes([reqNode]);
        setEdges([]);
      }
      onConsumedApiPayload?.();
    },
    [setNodes, setEdges, onConsumedApiPayload],
  );

  useEffect(() => {
    if (initialApiPayload) {
      applyApiPayload(initialApiPayload);
      onConsumedApiPayload?.();
    }
  }, [initialApiPayload]);

  useEffect(() => {
    return subscribeToApiFlow((payload) => {
      applyApiPayload(payload);
    });
  }, [applyApiPayload]);

  useEffect(() => {
    if (initialApiPayload) {
      applyApiPayload(initialApiPayload);
    }
  }, [initialApiPayload, applyApiPayload]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const exportPipeline = useCallback(() => {
    const pipeline: string[] = [];
    const visited = new Set<string>();
    const process = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const type = node.type as string;
      if (type === "workflowInput") pipeline.push("json-input");
      else if (type === "workflowApiRequest") pipeline.push("api-request");
      else if (type === "workflowTransform") {
        const d = node.data as { transformId?: string };
        pipeline.push(d.transformId ?? "transform");
      } else if (type === "workflowOutput") {
        const d = node.data as { subtype?: string };
        pipeline.push(d.subtype ?? "preview");
      } else if (type === "workflowJsonStructure")
        pipeline.push("json-structure");
      const outEdges = edges.filter((e) => e.source === nodeId);
      for (const e of outEdges) process(e.target);
    };
    const roots = nodes.filter((n) => !edges.some((e) => e.target === n.id));
    for (const r of roots) process(r.id);
    const blob = new Blob([JSON.stringify({ pipeline }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pipeline-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const updateNodeData = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
        ),
      );
    },
    [setNodes],
  );

  const loadTemplate = useCallback(
    (template: (typeof PIPELINE_TEMPLATES)[number]) => {
      const idMap = new Map<string, string>();
      const newNodes: Node[] = template.nodes.map((n) => {
        const newId = generateId();
        idMap.set(n.id, newId);
        return { ...n, id: newId };
      });
      const newEdges: Edge[] = template.edges.map((e) => ({
        id: generateId(),
        source: idMap.get(e.source) ?? e.source,
        target: idMap.get(e.target) ?? e.target,
      }));
      setNodes(newNodes);
      setEdges(newEdges);
    },
    [setNodes, setEdges],
  );

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-bg-primary overflow-hidden w-full">
      <ToolHeader
        title="Flow Board — Workflow"
        badge="Utilities"
        rightSlot={
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="xs" className="gap-1.5">
                  Templates
                  <ChevronDown size={12} />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-56 p-2 bg-bg-primary border border-border"
              >
                <p className="text-[10px] font-semibold text-txt-muted uppercase px-2 py-1">
                  Pipeline templates
                </p>
                {PIPELINE_TEMPLATES.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => loadTemplate(t)}
                    className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-bg-tertiary text-left"
                  >
                    {t.name}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="xs" className="gap-1.5">
                  <Plus size={14} />
                  Add node
                  <ChevronDown size={12} />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-56 p-2 bg-bg-primary border border-border"
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-txt-muted uppercase px-2 py-1">
                    Input
                  </p>
                  <button
                    type="button"
                    onClick={addInputNode}
                    className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-bg-tertiary"
                  >
                    <FileJson size={14} />
                    JSON Input
                  </button>
                  <button
                    type="button"
                    onClick={addApiRequestNode}
                    className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-bg-tertiary"
                  >
                    <Send size={14} />
                    API Request
                  </button>
                  <p className="text-[10px] font-semibold text-txt-muted uppercase px-2 py-1 mt-2">
                    Transform
                  </p>
                  {PIPELINE_TRANSFORMS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => addTransformNode(t.id)}
                      className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-bg-tertiary text-left"
                    >
                      {t.name}
                    </button>
                  ))}
                  <p className="text-[10px] font-semibold text-txt-muted uppercase px-2 py-1 mt-2">
                    Output
                  </p>
                  <button
                    type="button"
                    onClick={addOutputNode}
                    className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-bg-tertiary"
                  >
                    <Copy size={14} />
                    Preview / Copy / Download
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="xs" onClick={runPipeline}>
              Run pipeline
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={exportPipeline}
              title="Export pipeline as JSON"
            >
              <Download size={14} />
              Export
            </Button>
          </div>
        }
      />
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-h-0 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            nodeTypes={workflowNodeTypes}
            fitView
            colorMode={colorMode}
            nodesDraggable
            nodesConnectable
            elementsSelectable
            deleteKeyCode={["Backspace", "Delete"]}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        {selectedNode && (
          <div className="w-80 border-l border-border bg-bg-secondary p-3 overflow-auto shrink-0 flex flex-col gap-3">
            <p className="text-xs font-semibold text-txt">
              {String(selectedNode.data?.label ?? selectedNode.type ?? "")}
            </p>
            {selectedNode.type === "workflowInput" && (
              <div className="flex-1 min-h-0 flex flex-col">
                <label className="text-[10px] text-txt-muted mb-1">
                  Input value
                </label>
                <div className="flex-1 min-h-[120px] rounded border border-border overflow-hidden">
                  <CodeEditor
                    value={
                      (selectedNode.data as { value?: string })?.value ?? ""
                    }
                    onChange={(v) =>
                      updateNodeData(selectedNode.id, { value: v })
                    }
                    language="json"
                  />
                </div>
              </div>
            )}
            {selectedNode.type === "workflowApiRequest" && (
              <ApiRequestConfigPanel
                nodeId={selectedNode.id}
                data={selectedNode.data as unknown as ApiRequestNodeData}
                onUpdate={updateNodeData}
              />
            )}
            {selectedNode.type === "workflowTransform" && (
              <div>
                <label className="text-[10px] text-txt-muted block mb-1">
                  Transform
                </label>
                <select
                  value={
                    (selectedNode.data as { transformId?: string })
                      ?.transformId ?? "json-to-yaml"
                  }
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, {
                      transformId: e.target.value,
                      label: PIPELINE_TRANSFORMS.find(
                        (t) => t.id === e.target.value,
                      )?.name,
                    })
                  }
                  className="w-full h-8 rounded border border-border bg-bg-primary text-xs px-2"
                >
                  {PIPELINE_TRANSFORMS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {selectedNode.type === "workflowOutput" && (
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-txt-muted block mb-1">
                    Output type
                  </label>
                  <select
                    value={
                      (selectedNode.data as { subtype?: string })?.subtype ??
                      "preview"
                    }
                    onChange={(e) =>
                      updateNodeData(selectedNode.id, {
                        subtype: e.target.value,
                        label:
                          e.target.value === "preview"
                            ? "Preview"
                            : e.target.value === "copy"
                              ? "Copy"
                              : "Download",
                      })
                    }
                    className="w-full h-8 rounded border border-border bg-bg-primary text-xs px-2"
                  >
                    <option value="preview">
                      Preview (show output in panel)
                    </option>
                    <option value="copy">Copy to Clipboard</option>
                    <option value="download">Download File</option>
                  </select>
                </div>
                {(selectedNode.data as { input?: string })?.input && (
                  <div className="space-y-2">
                    <label className="text-[10px] text-txt-muted block mb-1">
                      Output preview
                    </label>
                    <div className="rounded border border-border bg-bg-primary p-2 max-h-48 overflow-auto">
                      <pre className="text-[11px] font-mono text-txt whitespace-pre-wrap wrap-break-word">
                        {(selectedNode.data as { input?: string }).input}
                      </pre>
                    </div>
                    {onLoadAsDiagram && (
                      <button
                        type="button"
                        onClick={() =>
                          onLoadAsDiagram(
                            (selectedNode.data as { input?: string }).input ??
                              "",
                          )
                        }
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs btn-glass hover:border-accent/30 w-full justify-center"
                        title="Convert JSON output to flow diagram (switches to Diagram mode)"
                      >
                        <Braces size={12} />
                        Load as Flow Diagram
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {![
              "workflowInput",
              "workflowApiRequest",
              "workflowTransform",
              "workflowOutput",
            ].includes(selectedNode.type ?? "") && (
              <pre className="text-[10px] text-txt-muted overflow-auto max-h-48">
                {JSON.stringify(selectedNode.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FlowWorkflowClient;
