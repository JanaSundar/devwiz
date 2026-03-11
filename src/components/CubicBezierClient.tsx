"use client";

import { Check, Copy } from "lucide-react";
import { motion, useTime, useTransform } from "motion/react";
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
  const scaleX = rect.width / GRAPH_SIZE;
  const scaleY = rect.height / GRAPH_SIZE;
  const svgX = (clientX - rect.left) / scaleX;
  const svgY = (clientY - rect.top) / scaleY;

  // nx is strictly 0-1 as required by CSS
  const nx = (svgX - PADDING) / PLOT_SIZE;
  // ny is also clamped to 0-1 to keep handles within viewport/grid bounds
  const ny = 1 - (svgY - PADDING) / PLOT_SIZE;

  return {
    x: clamp(nx, 0, 1),
    y: clamp(ny, 0, 1),
  };
}

export default function CubicBezierClient() {
  const [p1, setP1] = useState<BezierPoint>({ x: 0.25, y: 0.1 });
  const [p2, setP2] = useState<BezierPoint>({ x: 0.25, y: 1 });
  const [activeHandle, setActiveHandle] = useState<"p1" | "p2" | null>(null);
  const [copiedKey, setCopiedKey] = useState<"css" | "motion" | null>(null);
  const [previewTravelX, setPreviewTravelX] = useState(240);
  const [showVelocity, setShowVelocity] = useState(false);
  const [showProjection, setShowProjection] = useState(false);
  // No more debounce needed for the motion values, we'll use raw p1/p2 for frame-perfect tracking
  const time = useTime();

  // A simple but effective cubic-bezier solver for the preview
  // Based on the standard 0-1 time -> 0-1 progress mapping
  const easedX = useTransform(time, (t: number) => {
    // 1.6s forward, 1.6s back = 3.2s total cycle
    const cycle = 3200;
    const progress = (t % cycle) / 1600;
    const phase = progress > 1 ? 2 - progress : progress;

    // For adaptive feel, we'll use a standard formula
    const t_val = phase;
    const cx = 3 * p1.x;
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = 1 - cx - bx;

    const cy = 3 * p1.y;
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = 1 - cy - by;

    // Find y for a given x (phase)
    // Newton's method to solve x = f(t) for t, then find y = g(t)
    let currentT = t_val;
    for (let i = 0; i < 5; i++) {
      const x_estimate = ((ax * currentT + bx) * currentT + cx) * currentT;
      const dx_dt = (3 * ax * currentT + 2 * bx) * currentT + cx;
      if (Math.abs(dx_dt) < 1e-6) break;
      currentT -= (x_estimate - t_val) / dx_dt;
      currentT = clamp(currentT, 0, 1);
    }

    const easedY = ((ay * currentT + by) * currentT + cy) * currentT;

    // Map easedY to visual range
    return PREVIEW_SIDE_GAP + easedY * (previewTravelX - PREVIEW_SIDE_GAP);
  });

  const easedPathPoint = useTransform(time, (t: number) => {
    const cycle = 3200;
    const progress = (t % cycle) / 1600;
    const phase = progress > 1 ? 2 - progress : progress;

    const t_val = phase;
    const cx = 3 * p1.x;
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = 1 - cx - bx;

    const cy = 3 * p1.y;
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = 1 - cy - by;

    let currentT = t_val;
    for (let i = 0; i < 5; i++) {
      const x_estimate = ((ax * currentT + bx) * currentT + cx) * currentT;
      const dx_dt = (3 * ax * currentT + 2 * bx) * currentT + cx;
      if (Math.abs(dx_dt) < 1e-6) break;
      currentT -= (x_estimate - t_val) / dx_dt;
      currentT = clamp(currentT, 0, 1);
    }

    const easedY = ((ay * currentT + by) * currentT + cy) * currentT;
    const easedX = ((ax * currentT + bx) * currentT + cx) * currentT;

    return {
      x: PADDING + easedX * PLOT_SIZE,
      y: PADDING + (1 - easedY) * PLOT_SIZE,
    };
  });

  const s1 = pointToSvg(p1);
  const s2 = pointToSvg(p2);

  const svgBoundsRef = useRef<DOMRect | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const previewLaneRef = useRef<HTMLDivElement | null>(null);

  const curvePath = useMemo(() => {
    return `M ${PADDING} ${PADDING + PLOT_SIZE} C ${s1.x} ${s1.y}, ${s2.x} ${s2.y}, ${PADDING + PLOT_SIZE} ${PADDING}`;
  }, [s1, s2]);

  const cssOutput = useMemo(
    () =>
      `transition-timing-function: cubic-bezier(${p1.x.toFixed(2)}, ${p1.y.toFixed(2)}, ${p2.x.toFixed(2)}, ${p2.y.toFixed(2)});`,
    [p1.x, p1.y, p2.x, p2.y],
  );

  const motionOutput = useMemo(
    () =>
      `ease: [${p1.x.toFixed(2)}, ${p1.y.toFixed(2)}, ${p2.x.toFixed(2)}, ${p2.y.toFixed(2)}]`,
    [p1.x, p1.y, p2.x, p2.y],
  );

  const velocityPath = useMemo(() => {
    if (!showVelocity) return "";

    const points = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      // f(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
      // f'(t) = 3(1-t)^2(P1-P0) + 6(1-t)t(P2-P1) + 3t^2(P3-P2)
      // Since P0=(0,0) and P3=(1,1):
      const dx =
        3 * (1 - t) ** 2 * p1.x +
        6 * (1 - t) * t * (p2.x - p1.x) +
        3 * t ** 2 * (1 - p2.x);
      const dy =
        3 * (1 - t) ** 2 * p1.y +
        6 * (1 - t) * t * (p2.y - p1.y) +
        3 * t ** 2 * (1 - p2.y);

      const velocity = dy / dx;
      // Clamp for visualization, typically 0-3 range is plenty
      const vNormalized = clamp(velocity / 3, 0, 1);
      const x = PADDING + t * PLOT_SIZE;
      const y = PADDING + (1 - vNormalized) * PLOT_SIZE;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(" L ")}`;
  }, [p1, p2, showVelocity]);

  const projectionPoints = useMemo(() => {
    if (!showProjection) return [];
    const points = [];
    const ax = 1 - 3 * p2.x + 3 * p1.x;
    const bx = 3 * p2.x - 6 * p1.x;
    const cx = 3 * p1.x;

    const ay = 1 - 3 * p2.y + 3 * p1.y;
    const by = 3 * p2.y - 6 * p1.y;
    const cy = 3 * p1.y;

    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = ((ax * t + bx) * t + cx) * t;
      const y = ((ay * t + by) * t + cy) * t;
      points.push({
        x: PADDING + x * PLOT_SIZE,
        y: PADDING + (1 - y) * PLOT_SIZE,
      });
    }
    return points;
  }, [p1, p2, showProjection]);

  const activePreset = useMemo(() => {
    return BEZIER_PRESETS.find(
      (preset) =>
        p1.x.toFixed(2) === preset.p1.x.toFixed(2) &&
        p1.y.toFixed(2) === preset.p1.y.toFixed(2) &&
        p2.x.toFixed(2) === preset.p2.x.toFixed(2) &&
        p2.y.toFixed(2) === preset.p2.y.toFixed(2),
    )?.key;
  }, [p1.x, p1.y, p2.x, p2.y]);

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

  const onPointerMove = (event: React.PointerEvent) => {
    if (!activeHandle || !svgBoundsRef.current) return;

    const nextPoint = svgToPoint(
      event.clientX,
      event.clientY,
      svgBoundsRef.current,
    );

    if (activeHandle === "p1") {
      setP1(nextPoint);
    } else if (activeHandle === "p2") {
      setP2(nextPoint);
    }
  };

  const onPointerDown = (handle: "p1" | "p2", event: React.PointerEvent) => {
    if (!svgRef.current) return;
    svgBoundsRef.current = svgRef.current.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveHandle(handle);
  };

  const copyText = async (text: string, key: "css" | "motion") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1400);
    } catch {}
  };

  return (
    <div className="flex h-full flex-col anim-in select-none">
      <ToolHeader title="Cubic-Bezier Visualizer" badge="Utilities" />

      <div className="lg:grid lg:grid-cols-[1fr_minmax(320px,400px)] lg:overflow-hidden flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2 sm:gap-3 sm:p-3">
        {/* Left Column - Graph */}
        <div className="lg:min-h-0 lg:flex-1 lg:flex lg:flex-col min-w-0 h-full">
          <section className="flex flex-col flex-1 shrink-0 lg:shrink min-h-0 rounded-2xl border border-border bg-bg-secondary p-2 sm:p-3">
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

            <div className="flex-1 flex items-center justify-center min-h-0 p-4">
              <div className="relative h-full w-full max-w-72 sm:max-w-90 lg:max-w-full aspect-square flex items-center justify-center rounded-xl border border-border bg-bg-primary p-2">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${GRAPH_SIZE} ${GRAPH_SIZE}`}
                  className="h-full w-full overflow-visible touch-none select-none"
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
                    transition={
                      activeHandle
                        ? { type: "tween", duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 36 }
                    }
                  />

                  {showVelocity && (
                    <motion.path
                      d={velocityPath}
                      fill="none"
                      stroke="rgba(244, 63, 94, 0.5)"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, d: velocityPath }}
                      exit={{ opacity: 0 }}
                    />
                  )}

                  {showProjection &&
                    projectionPoints.map((pt, i) => (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={PADDING + PLOT_SIZE}
                          r={1.5}
                          fill="rgba(148, 163, 184, 0.4)"
                        />
                        <circle
                          cx={PADDING}
                          cy={pt.y}
                          r={1.5}
                          fill="rgba(148, 163, 184, 0.4)"
                        />
                      </g>
                    ))}

                  <motion.circle
                    cx={useTransform(easedPathPoint, (p) => p.x)}
                    cy={useTransform(easedPathPoint, (p) => p.y)}
                    r={4}
                    fill="rgb(56, 189, 248)"
                    className="shadow-xl"
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(56, 189, 248, 0.6))",
                    }}
                  />

                  <motion.line
                    x1={PADDING}
                    y1={PADDING + PLOT_SIZE}
                    x2={s1.x}
                    y2={s1.y}
                    stroke="rgba(56, 189, 248, 0.65)"
                    strokeWidth={2}
                    animate={{ x2: s1.x, y2: s1.y }}
                    transition={
                      activeHandle === "p1"
                        ? { type: "tween", duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 36 }
                    }
                  />
                  <motion.line
                    x1={PADDING + PLOT_SIZE}
                    y1={PADDING}
                    x2={s2.x}
                    y2={s2.y}
                    stroke="rgba(56, 189, 248, 0.65)"
                    strokeWidth={2}
                    animate={{ x2: s2.x, y2: s2.y }}
                    transition={
                      activeHandle === "p2"
                        ? { type: "tween", duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 36 }
                    }
                  />

                  <motion.circle
                    cx={s1.x}
                    cy={s1.y}
                    r={HANDLE_RADIUS}
                    fill="rgb(56, 189, 248)"
                    animate={{ cx: s1.x, cy: s1.y }}
                    transition={
                      activeHandle === "p1"
                        ? { type: "tween", duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                    pointerEvents="none"
                  />

                  <motion.circle
                    cx={s2.x}
                    cy={s2.y}
                    r={HANDLE_RADIUS}
                    fill="rgb(14, 165, 233)"
                    animate={{ cx: s2.x, cy: s2.y }}
                    transition={
                      activeHandle === "p2"
                        ? { type: "tween", duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                    pointerEvents="none"
                  />

                  {/* Hit Areas */}
                  <circle
                    cx={s1.x}
                    cy={s1.y}
                    r={HANDLE_RADIUS * 4}
                    fill="transparent"
                    className="cursor-grab active:cursor-grabbing"
                    onPointerDown={(e) => onPointerDown("p1", e)}
                    onPointerMove={onPointerMove}
                    onPointerUp={(event) => {
                      event.currentTarget.releasePointerCapture(
                        event.pointerId,
                      );
                      setActiveHandle(null);
                    }}
                  />
                  <circle
                    cx={s2.x}
                    cy={s2.y}
                    r={HANDLE_RADIUS * 4}
                    fill="transparent"
                    className="cursor-grab active:cursor-grabbing"
                    onPointerDown={(e) => onPointerDown("p2", e)}
                    onPointerMove={onPointerMove}
                    onPointerUp={(event) => {
                      event.currentTarget.releasePointerCapture(
                        event.pointerId,
                      );
                      setActiveHandle(null);
                    }}
                  />
                </svg>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Controls & Code */}
        <div className="lg:overflow-y-auto lg:pr-1 flex flex-col gap-2 sm:gap-3">
          <section className="shrink-0 rounded-2xl border border-border bg-bg-secondary p-2 sm:p-3">
            <div className="flex-1 flex flex-col gap-2 rounded-xl border border-border bg-bg-primary p-2 sm:p-3">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <p className="text-[10px] uppercase tracking-wide text-txt-muted">
                    Active timing preview
                  </p>
                  <div
                    ref={previewLaneRef}
                    className="relative h-8 overflow-hidden rounded-md border border-border/70 bg-bg-secondary"
                  >
                    <motion.div
                      className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                      style={{ x: easedX }}
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-border/50 my-1" />

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowVelocity(!showVelocity)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[11px] tr-smooth ${
                    showVelocity
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
                      : "border-border bg-bg-secondary text-txt-muted hover:text-txt"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${showVelocity ? "bg-rose-500" : "bg-txt-muted/30"}`}
                  />
                  Velocity
                </button>
                <button
                  onClick={() => setShowProjection(!showProjection)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[11px] tr-smooth ${
                    showProjection
                      ? "border-accent/30 bg-accent/10 text-accent"
                      : "border-border bg-bg-secondary text-txt-muted hover:text-txt"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${showProjection ? "bg-accent" : "bg-txt-muted/30"}`}
                  />
                  Projection
                </button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-txt-muted text-center italic">
              cubic-bezier({p1.x.toFixed(2)}, {p1.y.toFixed(2)},{" "}
              {p2.x.toFixed(2)}, {p2.y.toFixed(2)})
            </p>
          </section>

          <section className="shrink-0 min-w-0 grid gap-2 rounded-2xl border border-border bg-bg-secondary p-2 sm:p-3">
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
