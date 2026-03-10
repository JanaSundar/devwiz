"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useMemo, useState } from "react";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { Sparkles } from "lucide-react";
import ToolHeader from "@/components/tooling/ToolHeader";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false },
);
const EXCALIDRAW_STORAGE_KEY = "devforge-excalidraw-scene-v1";

export default function ExcalidrawClient() {
  const { resolvedTheme } = useTheme();
  const [initialElements] = useState<ExcalidrawElement[] | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(EXCALIDRAW_STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? (parsed as ExcalidrawElement[]) : null;
    } catch {
      return null;
    }
  });

  const isDark = resolvedTheme === "dark";
  const initialData = useMemo(() => {
    if (!initialElements) return undefined;
    return { elements: initialElements };
  }, [initialElements]);

  return (
    <div className="flex flex-col h-full bg-bg-primary overflow-hidden w-full relative">
      <ToolHeader
        title="Whiteboard"
        badge="Utilities"
        poweredBy={{
          label: "Powered by Excalidraw",
          href: "https://docs.excalidraw.com/docs/@excalidraw/excalidraw/integration",
          icon: <Sparkles size={10} />,
        }}
      />
      <div
        className="w-full grow relative overflow-hidden"
        style={{ minHeight: 0 }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <Excalidraw
            theme={isDark ? "dark" : "light"}
            initialData={initialData}
            onChange={(elements) => {
              try {
                localStorage.setItem(
                  EXCALIDRAW_STORAGE_KEY,
                  JSON.stringify(elements),
                );
              } catch {
                // Ignore storage failures (private mode / quota)
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
