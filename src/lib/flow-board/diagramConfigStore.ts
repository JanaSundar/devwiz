import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createSafeStorage } from "@/lib/stores/safeStorage";

export type DiagramDisplayMode = "expanded" | "compact";

export interface DiagramConfig {
  displayMode: DiagramDisplayMode;
}

const DEFAULT: DiagramConfig = {
  displayMode: "expanded",
};

interface DiagramConfigStore extends DiagramConfig {
  setDisplayMode: (mode: DiagramDisplayMode) => void;
  setConfig: (config: Partial<DiagramConfig>) => void;
}

export const useDiagramConfigStore = create<DiagramConfigStore>()(
  persist(
    (set) => ({
      ...DEFAULT,
      setDisplayMode: (displayMode) => set({ displayMode }),
      setConfig: (config) => set((s) => ({ ...s, ...config })),
    }),
    {
      name: "devwiz-flow-diagram-config",
      storage: createJSONStorage(() => createSafeStorage()),
      partialize: (s) => ({ displayMode: s.displayMode }),
    },
  ),
);

/** @deprecated Use useDiagramConfigStore. Kept for migration. */
export function getDiagramConfig(): DiagramConfig {
  const state = useDiagramConfigStore.getState();
  return { displayMode: state.displayMode };
}

/** @deprecated Use useDiagramConfigStore.getState().setConfig. Kept for migration. */
export function setDiagramConfig(config: Partial<DiagramConfig>): void {
  useDiagramConfigStore.getState().setConfig(config);
}
