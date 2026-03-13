/** How JSON is visualized: each property as a node, or full JSON in one node */
export type DiagramDisplayMode = "expanded" | "compact";

const STORAGE_KEY = "devwiz-flow-diagram-config";

export interface DiagramConfig {
  displayMode: DiagramDisplayMode;
}

const DEFAULT: DiagramConfig = {
  displayMode: "expanded",
};

export function getDiagramConfig(): DiagramConfig {
  if (typeof localStorage === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<DiagramConfig>;
    return {
      displayMode: parsed.displayMode === "compact" ? "compact" : "expanded",
    };
  } catch {
    return DEFAULT;
  }
}

export function setDiagramConfig(config: Partial<DiagramConfig>): void {
  if (typeof localStorage === "undefined") return;
  try {
    const current = getDiagramConfig();
    const next = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}
