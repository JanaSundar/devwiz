"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Loader2, Send } from "lucide-react";
import { memo } from "react";
import type { ApiRequestNodeData } from "@/lib/flow-workflow/types";
import { cn } from "@/lib/utils";

function ApiRequestNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as ApiRequestNodeData;

  return (
    <div
      className={cn(
        "min-w-[180px] rounded-lg border-2 bg-bg-secondary px-3 py-2 shadow-sm",
        selected ? "border-accent" : "border-border",
      )}
    >
      <Handle type="source" position={Position.Bottom} className="!bg-accent" />
      <div className="flex items-center gap-2">
        {d.status === "running" ? (
          <Loader2 size={14} className="text-accent animate-spin shrink-0" />
        ) : (
          <Send size={14} className="text-accent shrink-0" />
        )}
        <span className="text-xs font-medium text-txt truncate">
          {d.method}{" "}
          {d.url
            ? (() => {
                try {
                  return new URL(d.url).pathname || "/";
                } catch {
                  return d.url.slice(0, 30);
                }
              })()
            : "—"}
        </span>
      </div>
      {d.url && (
        <p className="mt-1 text-[10px] text-txt-muted truncate max-w-[160px]">
          {d.url}
        </p>
      )}
    </div>
  );
}

export default memo(ApiRequestNodeComponent);
