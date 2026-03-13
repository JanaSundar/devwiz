"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import "@excalidraw/excalidraw/index.css";
import { Sparkles } from "lucide-react";
import ToolHeader from "@/components/tooling/ToolHeader";
import { useExcalidrawStore } from "@/lib/stores/excalidrawStore";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false },
);

export default function ExcalidrawClient() {
  const { resolvedTheme } = useTheme();
  const elements = useExcalidrawStore((s) => s.elements);
  const setElements = useExcalidrawStore((s) => s.setElements);

  const isDark = resolvedTheme === "dark";
  const initialData = useMemo(() => {
    if (!elements || elements.length === 0) return undefined;
    return { elements };
  }, [elements]);

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
            onChange={(next) => setElements(next)}
          />
        </div>
      </div>
    </div>
  );
}
