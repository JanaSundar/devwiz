"use client";

import { Handle, type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const MIN_HEIGHT = 80;
const MAX_HEIGHT = 500;
const MIN_WIDTH = 200;
const MAX_WIDTH = 600;

function CompactJsonNodeComponent({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();
  const content = String(data.content ?? data.label ?? "{}");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    const measure = measureRef.current;
    if (!ta || !measure) return;
    measure.textContent = content || "{}";
    const contentW = measure.scrollWidth;
    const contentH = measure.scrollHeight;
    const w = Math.min(Math.max(contentW + 24, MIN_WIDTH), MAX_WIDTH);
    const h = Math.min(Math.max(contentH, MIN_HEIGHT), MAX_HEIGHT);
    ta.style.width = `${w}px`;
    ta.style.height = `${h}px`;
  }, [content]);

  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = evt.target.value;
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, content: value } }
            : node,
        ),
      );
    },
    [id, setNodes],
  );

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 bg-bg-secondary shadow-sm overflow-visible",
        selected ? "border-accent" : "border-border",
      )}
    >
      <pre
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre text-[11px] font-mono"
        style={{ padding: 0, margin: 0, border: 0 }}
      />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2" />
      <div className="px-3 py-2">
        <div className="text-[10px] font-medium text-txt-muted uppercase tracking-wider mb-1.5">
          JSON
        </div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={onChange}
          onClick={(e) => e.stopPropagation()}
          className="flow-node-input nodrag nopan block resize-none overflow-auto bg-transparent border-none p-0 text-[11px] font-mono text-txt outline-none ring-0 shadow-none appearance-none focus:outline-none focus:ring-0 focus:border-none focus:shadow-none placeholder:text-txt-muted [&::-webkit-input-placeholder]:opacity-60"
          placeholder="{}"
          spellCheck={false}
          rows={1}
          style={{
            minHeight: MIN_HEIGHT,
            maxHeight: MAX_HEIGHT,
            minWidth: MIN_WIDTH,
            maxWidth: MAX_WIDTH,
          }}
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2" />
    </div>
  );
}

export default memo(CompactJsonNodeComponent);
