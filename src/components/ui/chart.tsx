"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used inside ChartContainer");
  }
  return context;
}

export function ChartContainer({
  id,
  className,
  children,
  config,
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const chartId = React.useId().replace(/:/g, "");
  const safeId = `chart-${id || chartId}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={safeId}
        className={cn("flex aspect-video justify-center text-xs", className)}
      >
        <style
          // Recharts items can consume these css vars if needed.
          dangerouslySetInnerHTML={{
            __html: Object.entries(config)
              .map(
                ([key, value], index) =>
                  `[data-chart=${safeId}] { --color-${key}: ${value.color ?? `hsl(var(--chart-${index + 1}))`}; }`,
              )
              .join("\n"),
          }}
        />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip({
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) {
  return <RechartsPrimitive.Tooltip {...props} />;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    name?: string | number;
    value?: string | number;
    color?: string;
  }>;
  label?: string | number;
}) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-[160px] rounded-lg border border-border bg-bg-primary/95 p-2 shadow-lg backdrop-blur">
      {label !== undefined && (
        <div className="mb-1 text-[11px] font-medium text-txt">
          {String(label)}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item) => {
          const key = String(item.dataKey ?? "");
          const cfg = config[key];
          return (
            <div
              key={`${key}-${item.value}`}
              className="flex items-center justify-between gap-2 text-[11px]"
            >
              <div className="flex items-center gap-1.5 text-txt-muted">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      (typeof item.color === "string" && item.color) ||
                      cfg?.color ||
                      "currentColor",
                  }}
                />
                <span>{cfg?.label || item.name || key}</span>
              </div>
              <span className="font-medium text-txt">
                {String(item.value ?? "-")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartLegend({
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Legend>) {
  return <RechartsPrimitive.Legend {...props} />;
}

export function ChartLegendContent({
  payload,
}: {
  payload?: Array<{
    dataKey?: string | number;
    value?: string | number;
    color?: string;
  }>;
}) {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      {payload.map((item) => {
        const key = String(item.dataKey ?? item.value ?? "");
        const cfg = config[key];
        return (
          <div
            key={key}
            className="flex items-center gap-1.5 text-[11px] text-txt-muted"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  (typeof item.color === "string" && item.color) ||
                  cfg?.color ||
                  "currentColor",
              }}
            />
            <span>{cfg?.label || String(item.value ?? key)}</span>
          </div>
        );
      })}
    </div>
  );
}
