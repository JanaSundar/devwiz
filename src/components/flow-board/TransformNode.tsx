"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { memo } from "react";
import type { TransformNodeData } from "@/lib/flow-workflow/types";
import { cn } from "@/lib/utils";

function TransformNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as TransformNodeData;

  return (
    <div
      className={cn(
        "min-w-[180px] rounded-lg border-2 bg-bg-secondary px-3 py-2 shadow-sm",
        selected ? "border-accent" : "border-border",
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent" />
      <Handle type="source" position={Position.Bottom} className="!bg-accent" />
      <div className="flex items-center gap-2">
        {d.status === "running" ? (
          <Loader2 size={14} className="text-accent animate-spin shrink-0" />
        ) : (
          <ArrowRightLeft size={14} className="text-accent shrink-0" />
        )}
        <span className="text-xs font-medium text-txt truncate">
          {d.label || d.transformId}
        </span>
      </div>
      {d.error && (
        <p className="mt-1 text-[10px] text-error truncate">{d.error}</p>
      )}
      {d.output && !d.error && (
        <p className="mt-1 text-[10px] text-txt-muted truncate max-w-[160px]">
          {d.output.length > 50 ? `${d.output.slice(0, 50)}…` : d.output}
        </p>
      )}
    </div>
  );
}

export default memo(TransformNodeComponent);
