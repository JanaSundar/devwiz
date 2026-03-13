"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Copy, Download, Eye } from "lucide-react";
import { memo } from "react";
import type { OutputNodeData } from "@/lib/flow-workflow/types";
import { cn } from "@/lib/utils";

function OutputNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as OutputNodeData;
  const Icon =
    d.subtype === "copy" ? Copy : d.subtype === "download" ? Download : Eye;
  const label =
    d.label ||
    (d.subtype === "preview"
      ? "Preview"
      : d.subtype === "copy"
        ? "Copy"
        : "Download");

  return (
    <div
      className={cn(
        "min-w-[140px] rounded-lg border-2 bg-bg-secondary px-3 py-2 shadow-sm",
        selected ? "border-accent" : "border-border",
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent" />
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-accent shrink-0" />
        <span className="text-xs font-medium text-txt truncate">{label}</span>
      </div>
      {d.status === "success" && (
        <p className="mt-1 text-[10px] text-success">Done</p>
      )}
    </div>
  );
}

export default memo(OutputNodeComponent);
