"use client";

import { Handle, type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

function EditableDiagramNodeComponent({ id, type, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();
  const label = String(data.label ?? "");
  const isInput = type === "input";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (document.activeElement === ref.current) return;
    if (ref.current.textContent !== label) {
      ref.current.textContent = label;
    }
  }, [label]);

  const onInput = useCallback(() => {
    const value = ref.current?.textContent ?? "";
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: value } }
          : node,
      ),
    );
  }, [id, setNodes]);

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      if (!ref.current) return;
      const sel = window.getSelection();
      if (sel?.rangeCount) {
        try {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(text));
          range.collapse(false);
        } catch {
          ref.current.textContent = (ref.current.textContent ?? "") + text;
        }
      } else {
        ref.current.textContent = (ref.current.textContent ?? "") + text;
      }
      onInput();
    },
    [onInput],
  );

  return (
    <div
      className={cn(
        "min-w-[120px] rounded-lg border-2 bg-bg-secondary px-3 py-2 shadow-sm",
        selected ? "border-accent" : "border-border",
        isInput && "border-accent/50",
      )}
    >
      {!isInput && (
        <Handle type="target" position={Position.Top} className="!w-2 !h-2" />
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        onPaste={onPaste}
        onClick={(e) => e.stopPropagation()}
        data-placeholder="Label"
        className="nodrag nopan w-full min-w-0 text-xs font-medium text-txt outline-none [&:empty::before]:content-[attr(data-placeholder)] [&:empty::before]:text-txt-muted"
      />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2" />
    </div>
  );
}

export default memo(EditableDiagramNodeComponent);
