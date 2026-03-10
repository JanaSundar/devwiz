import type { ReactNode } from "react";

type ToolPanelsProps = {
  left: ReactNode;
  right: ReactNode;
};

export function ToolPanels({ left, right }: ToolPanelsProps) {
  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-4 gap-4 overflow-y-auto lg:overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 min-h-75 lg:min-h-0">
        {left}
      </div>
      <div className="flex-1 flex flex-col min-w-0 min-h-75 lg:min-h-0">
        {right}
      </div>
    </div>
  );
}

type ToolPanelProps = {
  title: string;
  statusClassName?: string;
  children: ReactNode;
  frameClassName?: string;
};

export function ToolPanel({
  title,
  statusClassName = "bg-accent",
  frameClassName,
  children,
}: ToolPanelProps) {
  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-txt-muted border-b border-border shrink-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${statusClassName}`} />
        <span className="font-medium shrink-0">{title}</span>
      </div>
      <div
        className={`flex-1 rounded-b-xl border border-border bg-bg-secondary overflow-hidden flex flex-col ${frameClassName || ""}`}
      >
        {children}
      </div>
    </>
  );
}
