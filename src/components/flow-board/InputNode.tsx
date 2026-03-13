"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { FileJson, FileText } from "lucide-react";
import { memo } from "react";
import type { InputNodeData } from "@/lib/flow-workflow/types";
import { cn } from "@/lib/utils";

function InputNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as InputNodeData;
  const Icon = d.subtype === "json" ? FileJson : FileText;
  const label = d.label || (d.subtype === "json" ? "JSON Input" : "Text Input");

  return (
    <div
      className={cn(
        "min-w-[160px] rounded-lg border-2 bg-bg-secondary px-3 py-2 shadow-sm",
        selected ? "border-accent" : "border-border",
      )}
    >
      <Handle type="source" position={Position.Bottom} className="!bg-accent" />
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-accent shrink-0" />
        <span className="text-xs font-medium text-txt truncate">{label}</span>
      </div>
      {d.error && (
        <p className="mt-1 text-[10px] text-error truncate">{d.error}</p>
      )}
      {d.value && (
        <p className="mt-1 text-[10px] text-txt-muted truncate max-w-[140px]">
          {d.value.length > 40 ? `${d.value.slice(0, 40)}…` : d.value}
        </p>
      )}
    </div>
  );
}

export default memo(InputNodeComponent);
