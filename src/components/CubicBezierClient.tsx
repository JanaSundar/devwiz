"use client";

import { Check, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";

type BezierPoint = {
  x: number;
  y: number;
};

const GRAPH_SIZE = 300;
const PADDING = 24;
const PLOT_SIZE = GRAPH_SIZE - PADDING * 2;
const HANDLE_RADIUS = 8;
const PREVIEW_DOT_SIZE = 16;
const PREVIEW_SIDE_GAP = 8;

const BEZIER_PRESETS = [
  { key: "linear", label: "linear", p1: { x: 0, y: 0 }, p2: { x: 1, y: 1 } },
  {
    key: "ease",
    label: "ease",
    p1: { x: 0.25, y: 0.1 },
    p2: { x: 0.25, y: 1 },
  },
  {
    key: "ease-in",
    label: "ease-in",
    p1: { x: 0.42, y: 0 },
    p2: { x: 1, y: 1 },
  },
  {
    key: "ease-out",
    label: "ease-out",
    p1: { x: 0, y: 0 },
    p2: { x: 0.58, y: 1 },
  },
  {
    key: "ease-in-out",
    label: "ease-in-out",
    p1: { x: 0.42, y: 0 },
    p2: { x: 0.58, y: 1 },
  },
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function pointToSvg(point: BezierPoint) {
  return {
    x: PADDING + point.x * PLOT_SIZE,
    y: PADDING + (1 - point.y) * PLOT_SIZE,
  };
}

function svgToPoint(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): BezierPoint {
  const localX = clamp(clientX - rect.left - PADDING, 0, PLOT_SIZE);
  const localY = clamp(clientY - rect.top - PADDING, 0, PLOT_SIZE);

  return {
    x: clamp(localX / PLOT_SIZE, 0, 1),
    y: clamp(1 - localY / PLOT_SIZE, 0, 1),
  };
}

export default function CubicBezierClient() {
  const [p1, setP1] = useState<BezierPoint>({ x: 0.25, y: 0.1 });
  const [p2, setP2] = useState<BezierPoint>({ x: 0.25, y: 1 });
  const [activeHandle, setActiveHandle] = useState<"p1" | "p2" | null>(null);
  const [copiedKey, setCopiedKey] = useState<"css" | "motion" | null>(null);
  const [previewTravelX, setPreviewTravelX] = useState(240);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const previewLaneRef = useRef<HTMLDivElement | null>(null);

  const s1 = pointToSvg(p1);
  const s2 = pointToSvg(p2);

  const curvePath = `M ${PADDING} ${PADDING + PLOT_SIZE} C ${s1.x} ${s1.y}, ${s2.x} ${s2.y}, ${PADDING + PLOT_SIZE} ${PADDING}`;

  const cssOutput = useMemo(
    () =>
      `transition-timing-function: cubic-bezier(${p1.x.toFixed(2)}, ${p1.y.toFixed(2)}, ${p2.x.toFixed(2)}, ${p2.y.toFixed(2)});`,
    [p1, p2],
  );

  const motionOutput = useMemo(
    () =>
      `ease: [${p1.x.toFixed(2)}, ${p1.y.toFixed(2)}, ${p2.x.toFixed(2)}, ${p2.y.toFixed(2)}]`,
    [p1, p2],
  );

  const activePreset = useMemo(() => {
    return BEZIER_PRESETS.find(
      (preset) =>
        p1.x.toFixed(2) === preset.p1.x.toFixed(2) &&
        p1.y.toFixed(2) === preset.p1.y.toFixed(2) &&
        p2.x.toFixed(2) === preset.p2.x.toFixed(2) &&
        p2.y.toFixed(2) === preset.p2.y.toFixed(2),
    )?.key;
  }, [p1, p2]);

  const animationRunKey = useMemo(
    () =>
      `${p1.x.toFixed(3)}-${p1.y.toFixed(3)}-${p2.x.toFixed(3)}-${p2.y.toFixed(3)}`,
    [p1, p2],
  );

  useEffect(() => {
    if (!previewLaneRef.current) return;

    const lane = previewLaneRef.current;
    const updateTravel = () => {
      const width = lane.clientWidth;
      const maxX = Math.max(
        PREVIEW_SIDE_GAP,
        width - PREVIEW_SIDE_GAP - PREVIEW_DOT_SIZE,
      );
      setPreviewTravelX(maxX);
    };

    updateTravel();
    const observer = new ResizeObserver(updateTravel);
    observer.observe(lane);

    return () => observer.disconnect();
  }, []);

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!activeHandle || !svgRef.current) return;

    const nextPoint = svgToPoint(
      event.clientX,
      event.clientY,
      svgRef.current.getBoundingClientRect(),
    );

    if (activeHandle === "p1") {
      setP1(nextPoint);
      return;
    }

    setP2(nextPoint);
  };

  const copyText = async (text: string, key: "css" | "motion") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1400);
    } catch {}
  };

  return (
    <div className="flex h-full flex-col anim-in">
      <ToolHeader title="Cubic-Bezier Visualizer" badge="Utilities" />

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto sm:overflow-hidden p-2 sm:gap-3 sm:p-3">
        <section className="shrink-0 rounded-2xl border border-border bg-bg-secondary p-2 sm:flex sm:min-h-0 sm:flex-1 sm:flex-col sm:p-3">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-txt-muted">
            Curve Graph
          </p>

          <div className="mb-2 flex flex-wrap items-center gap-1 sm:mb-3 sm:gap-1.5">
            {BEZIER_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => {
                  setP1(preset.p1);
                  setP2(preset.p2);
                }}
                className={`rounded-md border px-2 py-0.5 text-[10px] tr-smooth sm:py-1 sm:text-[11px] ${
                  activePreset === preset.key
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-border bg-bg-primary text-txt-muted hover:text-txt"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-1 flex items-center justify-center sm:mt-0 sm:min-h-0 sm:flex-1">
            <div className="mx-auto w-full max-w-72 rounded-xl border border-border bg-bg-primary p-1.5 sm:max-w-90 sm:p-2">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${GRAPH_SIZE} ${GRAPH_SIZE}`}
                className="h-auto w-full touch-none"
                onPointerMove={onPointerMove}
                onPointerUp={() => setActiveHandle(null)}
                onPointerLeave={() => setActiveHandle(null)}
              >
                <defs>
                  <pattern
                    id="grid"
                    width="25"
                    height="25"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 25 0 L 0 0 0 25"
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.18)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>

                <rect
                  x={PADDING}
                  y={PADDING}
                  width={PLOT_SIZE}
                  height={PLOT_SIZE}
                  fill="url(#grid)"
                  stroke="rgba(148, 163, 184, 0.3)"
                />

                <line
                  x1={PADDING}
                  y1={PADDING + PLOT_SIZE}
                  x2={PADDING + PLOT_SIZE}
                  y2={PADDING}
                  stroke="rgba(148, 163, 184, 0.65)"
                  strokeDasharray="6 4"
                />

                <motion.path
                  d={curvePath}
                  fill="none"
                  stroke="rgb(56, 189, 248)"
                  strokeWidth={3}
                  animate={{ d: curvePath }}
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />

                <motion.line
                  x1={PADDING}
                  y1={PADDING + PLOT_SIZE}
                  x2={s1.x}
                  y2={s1.y}
                  stroke="rgba(56, 189, 248, 0.65)"
                  strokeWidth={2}
                  animate={{ x2: s1.x, y2: s1.y }}
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
                <motion.line
                  x1={PADDING + PLOT_SIZE}
                  y1={PADDING}
                  x2={s2.x}
                  y2={s2.y}
                  stroke="rgba(56, 189, 248, 0.65)"
                  strokeWidth={2}
                  animate={{ x2: s2.x, y2: s2.y }}
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />

                <motion.circle
                  cx={s1.x}
                  cy={s1.y}
                  r={HANDLE_RADIUS}
                  fill="rgb(56, 189, 248)"
                  className="cursor-grab"
                  animate={{ cx: s1.x, cy: s1.y }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setActiveHandle("p1");
                  }}
                />
                <motion.circle
                  cx={s2.x}
                  cy={s2.y}
                  r={HANDLE_RADIUS}
                  fill="rgb(14, 165, 233)"
                  className="cursor-grab"
                  animate={{ cx: s2.x, cy: s2.y }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setActiveHandle("p2");
                  }}
                />
              </svg>
            </div>
          </div>
        </section>

        <section className="shrink-0 rounded-2xl border border-border bg-bg-secondary p-2 sm:p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-txt-muted">
            Preview Area
          </p>

          <div className="rounded-xl border border-border bg-bg-primary p-2 sm:p-3">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-txt-muted">
                Active timing preview
              </p>
              <div
                ref={previewLaneRef}
                className="relative h-8 overflow-hidden rounded-md border border-border/70 bg-bg-secondary"
              >
                <motion.div
                  key={`active-${animationRunKey}`}
                  className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-accent"
                  initial={{ x: PREVIEW_SIDE_GAP }}
                  animate={{ x: previewTravelX }}
                  transition={{
                    duration: 1.6,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: [p1.x, p1.y, p2.x, p2.y],
                  }}
                />
              </div>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-txt-muted">
            Active: cubic-bezier({p1.x.toFixed(2)}, {p1.y.toFixed(2)},{" "}
            {p2.x.toFixed(2)}, {p2.y.toFixed(2)})
          </p>
        </section>

        <section className="shrink-0 min-w-0 grid gap-2 rounded-2xl border border-border bg-bg-secondary p-2 sm:p-3 md:grid-cols-2">
          <CodeOutputCard
            title="CSS"
            value={cssOutput}
            copied={copiedKey === "css"}
            onCopy={() => copyText(cssOutput, "css")}
          />
          <CodeOutputCard
            title="Framer Motion"
            value={motionOutput}
            copied={copiedKey === "motion"}
            onCopy={() => copyText(motionOutput, "motion")}
          />
        </section>
      </div>
    </div>
  );
}

function CodeOutputCard({
  title,
  value,
  copied,
  onCopy,
}: {
  title: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-bg-primary p-3">
      <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
        <p className="truncate text-xs font-semibold uppercase tracking-wider text-txt-muted">
          {title}
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-txt tr-smooth hover:border-accent/40 hover:text-accent"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-hidden whitespace-pre-wrap break-words rounded-md border border-border/70 bg-bg-secondary p-2 text-[11px] text-txt-sec">
        {value}
      </pre>
    </div>
  );
}
