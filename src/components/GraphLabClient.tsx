"use client";

import {
  AlertCircle,
  BarChart3,
  Braces,
  Download,
  LayoutGrid,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Funnel,
  FunnelChart,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Scatter,
  ScatterChart,
  Treemap,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import CodeEditor from "@/components/CodeEditor";
import ToolHeader from "@/components/tooling/ToolHeader";
import { ToolPanel, ToolPanels } from "@/components/tooling/ToolPanels";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

type Row = Record<string, string | number | null>;
type ChartType =
  | "line"
  | "area"
  | "bar"
  | "stackedBar"
  | "composed"
  | "pie"
  | "donut"
  | "radar"
  | "radialBar"
  | "scatter"
  | "treemap"
  | "funnel";

const DEFAULT_GRAPH_JSON = `{
  "data": [
    { "month": "Jan", "sales": 186, "users": 80, "growth": 40 },
    { "month": "Feb", "sales": 305, "users": 200, "growth": 55 },
    { "month": "Mar", "sales": 237, "users": 120, "growth": 48 },
    { "month": "Apr", "sales": 273, "users": 190, "growth": 62 },
    { "month": "May", "sales": 209, "users": 130, "growth": 53 },
    { "month": "Jun", "sales": 314, "users": 240, "growth": 67 }
  ]
}`;

const CHART_TYPES: { id: ChartType; label: string }[] = [
  { id: "line", label: "Line" },
  { id: "area", label: "Area" },
  { id: "bar", label: "Bar" },
  { id: "stackedBar", label: "Stacked Bar" },
  { id: "composed", label: "Composed" },
  { id: "pie", label: "Pie" },
  { id: "donut", label: "Donut" },
  { id: "radar", label: "Radar" },
  { id: "radialBar", label: "Radial Bar" },
  { id: "scatter", label: "Scatter" },
  { id: "treemap", label: "Treemap" },
  { id: "funnel", label: "Funnel" },
];

const COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#22c55e", // green
  "#f97316", // orange
  "#e11d48", // rose
  "#a855f7", // violet
  "#06b6d4", // cyan
  "#facc15", // yellow
];

function parseRows(input: string): Row[] {
  const parsed = JSON.parse(input) as unknown;
  if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { data?: unknown[] }).data)
  ) {
    return (parsed as { data: Row[] }).data;
  }
  if (Array.isArray(parsed)) return parsed as Row[];
  throw new Error("Expected { data: [...] } or JSON array");
}

function inferKeys(rows: Row[]) {
  const first = rows[0] ?? {};
  const keys = Object.keys(first);
  const numericKeys = keys.filter((key) =>
    rows.some((row) => typeof row[key] === "number"),
  );
  const categoryKey =
    keys.find((key) => rows.some((row) => typeof row[key] === "string")) ||
    keys[0] ||
    "name";
  return { numericKeys, categoryKey };
}

function buildChartConfig(
  keys: string[],
  customColors: Record<string, string>,
): ChartConfig {
  return keys.reduce<ChartConfig>((acc, key, index) => {
    const userColor = customColors[key];
    acc[key] = {
      label: key,
      color:
        userColor && userColor.trim().length > 0
          ? userColor
          : COLORS[index % COLORS.length],
    };
    return acc;
  }, {});
}

function RenderChart({
  chartType,
  rows,
  numericKeys,
  categoryKey,
  customColors,
  themeKey,
}: {
  chartType: ChartType;
  rows: Row[];
  numericKeys: string[];
  categoryKey: string;
  customColors: Record<string, string>;
  themeKey: string;
}) {
  const seriesKeys = numericKeys.length > 0 ? numericKeys : ["value"];
  const firstSeries = seriesKeys[0];
  const secondSeries = seriesKeys[1] ?? seriesKeys[0];
  const config = buildChartConfig(seriesKeys, customColors);

  const withFallback = rows.map((row, index) => ({
    name: String(row[categoryKey] ?? `Item ${index + 1}`),
    ...seriesKeys.reduce<Record<string, number>>((acc, key) => {
      const val = row[key];
      acc[key] = typeof val === "number" ? val : 0;
      return acc;
    }, {}),
  }));

  if (chartType === "pie" || chartType === "donut") {
    return (
      <ChartContainer
        key={themeKey}
        config={config}
        className="h-full aspect-video w-full"
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Pie
            data={withFallback}
            dataKey={firstSeries}
            nameKey="name"
            outerRadius={140}
            innerRadius={chartType === "donut" ? 70 : 0}
            stroke="none"
          />
          <ChartLegend content={<ChartLegendContent />} />
        </PieChart>
      </ChartContainer>
    );
  }

  if (chartType === "radar") {
    return (
      <ChartContainer
        key={themeKey}
        config={config}
        className="h-full aspect-video w-full"
      >
        <RadarChart data={withFallback}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          {seriesKeys.slice(0, 3).map((key, index) => (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              fill={config[key]?.color ?? COLORS[index % COLORS.length]}
              stroke={config[key]?.color ?? COLORS[index % COLORS.length]}
              fillOpacity={0.25}
            />
          ))}
          <ChartLegend content={<ChartLegendContent />} />
        </RadarChart>
      </ChartContainer>
    );
  }

  if (chartType === "radialBar") {
    return (
      <ChartContainer
        key={themeKey}
        config={config}
        className="h-full aspect-video w-full"
      >
        <RadialBarChart
          data={withFallback}
          innerRadius={40}
          outerRadius={160}
          barSize={18}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            dataKey={firstSeries}
            fill={config[firstSeries]?.color ?? COLORS[0]}
            background
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </RadialBarChart>
      </ChartContainer>
    );
  }

  if (chartType === "scatter") {
    return (
      <ChartContainer
        key={themeKey}
        config={config}
        className="h-full aspect-video w-full"
      >
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey={firstSeries} name={firstSeries} />
          <YAxis type="number" dataKey={secondSeries} name={secondSeries} />
          <ZAxis type="number" dataKey={secondSeries} range={[40, 400]} />
          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Scatter
            data={withFallback}
            fill={config[firstSeries]?.color ?? COLORS[0]}
          />
        </ScatterChart>
      </ChartContainer>
    );
  }

  if (chartType === "treemap") {
    return (
      <ChartContainer
        key={themeKey}
        config={config}
        className="h-full aspect-video w-full"
      >
        <Treemap
          data={withFallback}
          dataKey={firstSeries}
          nameKey="name"
          stroke="#0f172a"
          fill={config[firstSeries]?.color ?? COLORS[0]}
          aspectRatio={4 / 3}
        />
      </ChartContainer>
    );
  }

  if (chartType === "funnel") {
    return (
      <ChartContainer
        key={themeKey}
        config={config}
        className="h-full aspect-video w-full"
      >
        <FunnelChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Funnel
            data={withFallback}
            dataKey={firstSeries}
            nameKey="name"
            fill={config[firstSeries]?.color ?? COLORS[0]}
          >
            <LabelList
              position="right"
              fill="currentColor"
              stroke="none"
              dataKey="name"
            />
          </Funnel>
        </FunnelChart>
      </ChartContainer>
    );
  }

  if (chartType === "composed") {
    return (
      <ChartContainer key={themeKey} config={config} className="h-full w-full">
        <ComposedChart data={withFallback}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey={firstSeries}
            fill={config[firstSeries]?.color ?? COLORS[0]}
            radius={[8, 8, 0, 0]}
          />
          <Area
            dataKey={secondSeries}
            fill={config[secondSeries]?.color ?? COLORS[1]}
            stroke={config[secondSeries]?.color ?? COLORS[1]}
            fillOpacity={0.18}
          />
          <Line
            dataKey={seriesKeys[2] ?? firstSeries}
            stroke={config[seriesKeys[2] ?? firstSeries]?.color ?? COLORS[2]}
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ChartContainer>
    );
  }

  if (chartType === "stackedBar") {
    return (
      <ChartContainer
        key={themeKey}
        config={config}
        className="h-full aspect-video w-full"
      >
        <BarChart data={withFallback}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {seriesKeys.slice(0, 4).map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="stack"
              fill={config[key]?.color ?? COLORS[index % COLORS.length]}
              radius={[index === 0 ? 8 : 0, index === 0 ? 8 : 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ChartContainer>
    );
  }

  if (chartType === "bar") {
    return (
      <ChartContainer key={themeKey} config={config} className="h-full w-full">
        <BarChart data={withFallback}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {seriesKeys.slice(0, 4).map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={config[key]?.color ?? COLORS[index % COLORS.length]}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </BarChart>
      </ChartContainer>
    );
  }

  if (chartType === "area") {
    return (
      <ChartContainer
        key={themeKey}
        config={config}
        className="h-full aspect-video w-full"
      >
        <AreaChart data={withFallback}>
          <defs>
            {seriesKeys.slice(0, 4).map((key, index) => (
              <linearGradient
                key={key}
                id={`grad-${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={
                    config[key]?.color ?? COLORS[index % COLORS.length]
                  }
                  stopOpacity={0.7}
                />
                <stop
                  offset="95%"
                  stopColor={
                    config[key]?.color ?? COLORS[index % COLORS.length]
                  }
                  stopOpacity={0.05}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {seriesKeys.slice(0, 4).map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              fill={`url(#grad-${key})`}
              stroke={config[key]?.color ?? COLORS[index % COLORS.length]}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      key={themeKey}
      config={config}
      className="h-full aspect-video w-full"
    >
      <LineChart data={withFallback}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {seriesKeys.slice(0, 4).map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={config[key]?.color ?? COLORS[index % COLORS.length]}
            strokeWidth={2.5}
            dot={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}

export default function GraphLabClient() {
  const { resolvedTheme } = useTheme();
  const [graphJson, setGraphJson] = useState(DEFAULT_GRAPH_JSON);
  const [chartType, setChartType] = useState<ChartType>("line");
  const [graphError, setGraphError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [customColors, setCustomColors] = useState<Record<string, string>>({});
  const chartWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const parsedRows = parseRows(graphJson);
      if (parsedRows.length === 0) {
        setRows([]);
        setGraphError("Data array is empty");
        return;
      }
      setRows(parsedRows);
      setGraphError(null);
    } catch (e) {
      setRows([]);
      setGraphError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [graphJson]);

  const keyInfo = useMemo(() => inferKeys(rows), [rows]);

  const handleColorChange = (key: string, value: string) => {
    setCustomColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleDownloadSvg = () => {
    const root = chartWrapperRef.current;
    if (!root) return;
    const svgEl = root.querySelector("svg");
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chart-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-bg-primary anim-in">
      <ToolHeader
        title="Chart Studio"
        badge="Utilities"
        rightSlot={
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-secondary px-2.5 py-1.5 text-[11px] hover:border-accent/60 hover:text-accent tr-smooth"
          >
            <Download size={12} />
            SVG
          </button>
        }
      />

      <ToolPanels
        left={
          <ToolPanel title="DATA INPUT" statusClassName="bg-accent">
            <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-border bg-bg-primary">
              <div className="flex items-center gap-1.5 border-b border-border/80 px-3 py-2 text-[11px] text-txt-muted">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-secondary px-2 py-0.5">
                  <LayoutGrid size={10} />
                  <span className="uppercase tracking-wide">JSON</span>
                </span>
                <span className="hidden sm:inline">
                  Paste JSON array or {"{ data: [...] }"}
                </span>
              </div>
              <CodeEditor
                value={graphJson}
                onChange={setGraphJson}
                language="json"
                placeholder={DEFAULT_GRAPH_JSON}
              />
            </div>
            <div className="shrink-0 border-t border-border p-3 space-y-3">
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-txt-muted">
                  Chart type
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CHART_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setChartType(t.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[11px] tr-smooth",
                        chartType === t.id
                          ? "border-accent/60 bg-accent/20 text-accent"
                          : "btn-glass hover:border-accent/40",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-txt-muted">
                Accepts JSON array or <code>{"{ data: [...] }"}</code>. First
                string field becomes X axis; numeric fields become series.
              </p>

              {keyInfo.numericKeys.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-txt-muted">
                    Series colors
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {keyInfo.numericKeys.slice(0, 6).map((key, index) => {
                      const currentColor =
                        customColors[key] && customColors[key].trim().length > 0
                          ? customColors[key]
                          : COLORS[index % COLORS.length];
                      return (
                        <div
                          key={key}
                          className="flex flex-col gap-1 rounded-xl border border-border bg-bg-primary px-2.5 py-1.5 text-[11px]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-txt-muted">{key}</span>
                            <div className="relative h-5 w-5">
                              <div
                                className="h-5 w-5 rounded-full"
                                style={{ backgroundColor: currentColor }}
                              />
                              <input
                                type="color"
                                value={currentColor}
                                onChange={(e) =>
                                  handleColorChange(key, e.target.value)
                                }
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                aria-label={`Pick color for ${key}`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </ToolPanel>
        }
        right={
          <ToolPanel
            title="CHART PREVIEW"
            statusClassName={graphError ? "bg-error" : "bg-success"}
            frameClassName="overflow-hidden p-0 flex flex-col min-h-0"
          >
            <div className="mb-2 flex items-center justify-between gap-2 px-3 pt-3 text-[11px] text-txt-muted">
              <div className="inline-flex items-center gap-1.5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-xl bg-bg-tertiary">
                  <BarChart3 size={14} />
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-txt">Preview</span>
                  <span className="text-[10px] text-txt-muted">
                    {rows.length > 0
                      ? `${rows.length} rows detected`
                      : "Waiting for data"}
                  </span>
                </div>
              </div>
              <span className="hidden text-[10px] sm:inline">
                x: <strong className="text-txt">{keyInfo.categoryKey}</strong> ·
                series:{" "}
                <strong className="text-txt">
                  {keyInfo.numericKeys.join(", ") || "value"}
                </strong>
              </span>
            </div>

            <div
              className="flex-1 min-h-0 rounded-2xl border border-border bg-bg-primary p-2 m-3"
              ref={chartWrapperRef}
            >
              {graphError ? (
                <div className="m-3 flex items-start gap-2 rounded-xl border border-error/30 bg-error p-3 text-xs text-error-foreground">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{graphError}</span>
                </div>
              ) : rows.length > 0 ? (
                <RenderChart
                  chartType={chartType}
                  rows={rows}
                  numericKeys={keyInfo.numericKeys}
                  categoryKey={keyInfo.categoryKey}
                  customColors={customColors}
                  themeKey={resolvedTheme === "dark" ? "dark" : "light"}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-tertiary">
                    <Braces size={22} className="text-txt-muted" />
                  </div>
                  <p className="text-sm text-txt">
                    Paste chart data on the left to visualize it.
                  </p>
                  <button
                    type="button"
                    onClick={() => setGraphJson(DEFAULT_GRAPH_JSON)}
                    className="rounded-full border border-border bg-bg-secondary px-3 py-1.5 text-xs hover:border-accent/40 tr-smooth"
                  >
                    Load example
                  </button>
                </div>
              )}
            </div>
          </ToolPanel>
        }
      />
    </div>
  );
}
