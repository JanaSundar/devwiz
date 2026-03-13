"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Braces } from "lucide-react";
import { memo } from "react";
import type { JsonStructureNodeData } from "@/lib/flow-workflow/types";
import { cn } from "@/lib/utils";

function JsonStructureNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as JsonStructureNodeData;

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
        <Braces size={14} className="text-accent shrink-0" />
        <span className="text-xs font-medium text-txt truncate">
          JSON Structure
        </span>
      </div>
      {d.structure && (
        <p className="mt-1 text-[10px] text-txt-muted truncate max-w-[160px]">
          {d.structure}
        </p>
      )}
      {d.error && (
        <p className="mt-1 text-[10px] text-error truncate max-w-[160px]">
          {d.error}
        </p>
      )}
    </div>
  );
}

export default memo(JsonStructureNodeComponent);
