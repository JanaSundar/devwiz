"use client";

import type * as React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof Group>) => (
  <Group
    orientation={orientation}
    className={cn(
      "flex h-full w-full data-[panel-group-orientation=vertical]:flex-col",
      className,
    )}
    {...props}
  />
);

const ResizablePanel = Panel;

const ResizableHandle = ({
  className,
  withHandle,
  ...props
}: React.ComponentProps<typeof Separator> & { withHandle?: boolean }) => (
  <Separator
    className={cn(
      "shrink-0 bg-border after:transition-colors",
      "data-[panel-group-orientation=vertical]:h-px data-[panel-group-orientation=vertical]:w-full data-[panel-group-orientation=horizontal]:h-full data-[panel-group-orientation=horizontal]:w-px",
      withHandle &&
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 data-[panel-group-orientation=vertical]:py-1 data-[panel-group-orientation=horizontal]:px-1",
      className,
    )}
    {...props}
  />
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
