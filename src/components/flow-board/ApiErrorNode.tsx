"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { XCircle } from "lucide-react";
import { memo } from "react";
import type { ApiErrorNodeData } from "@/lib/flow-workflow/types";
import { cn } from "@/lib/utils";

function ApiErrorNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as ApiErrorNodeData;

  return (
    <div
      className={cn(
        "min-w-[180px] rounded-lg border-2 bg-bg-secondary px-3 py-2 shadow-sm",
        selected ? "border-accent" : "border-error/50",
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-error" />
      <Handle type="source" position={Position.Bottom} className="!bg-error" />
      <div className="flex items-center gap-2">
        <XCircle size={14} className="text-error shrink-0" />
        <span className="text-xs font-medium text-txt truncate">Error</span>
      </div>
      <p className="mt-1 text-[10px] text-error truncate max-w-[160px]">
        {d.message}
      </p>
      {d.statusCode && (
        <p className="mt-0.5 text-[10px] text-txt-muted">
          Status: {d.statusCode}
        </p>
      )}
    </div>
  );
}

export default memo(ApiErrorNodeComponent);
