"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { CheckCircle, XCircle } from "lucide-react";
import { memo } from "react";
import type { ApiResponseNodeData } from "@/lib/flow-workflow/types";
import { cn } from "@/lib/utils";

function ApiResponseNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as ApiResponseNodeData;
  const isOk = d.status >= 200 && d.status < 300;
  const Icon = isOk ? CheckCircle : XCircle;

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
        <Icon
          size={14}
          className={cn("shrink-0", isOk ? "text-success" : "text-error")}
        />
        <span className="text-xs font-medium text-txt">
          {d.status} {d.statusText}
        </span>
      </div>
      <p className="mt-1 text-[10px] text-txt-muted">{d.duration}ms</p>
      {d.body && (
        <p className="mt-1 text-[10px] text-txt-muted truncate max-w-[160px]">
          {d.body.length > 50 ? `${d.body.slice(0, 50)}…` : d.body}
        </p>
      )}
    </div>
  );
}

export default memo(ApiResponseNodeComponent);
