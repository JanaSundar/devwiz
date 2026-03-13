import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { create } from "zustand";
import type { PersistStorage, StorageValue } from "zustand/middleware";
import { createJSONStorage, persist } from "zustand/middleware";
import { createSafeStorage } from "./safeStorage";

const LEGACY_KEY = "devforge-excalidraw-scene-v1";

export type ExcalidrawElements = readonly ExcalidrawElement[];

interface ExcalidrawPersisted {
  elements: ExcalidrawElements | null;
}

interface ExcalidrawState extends ExcalidrawPersisted {
  setElements: (elements: ExcalidrawElements | null) => void;
}

function createExcalidrawStorage(): PersistStorage<ExcalidrawPersisted> {
  const base = createJSONStorage<ExcalidrawPersisted>(() =>
    createSafeStorage(),
  );
  if (!base) throw new Error("Failed to create storage");
  return {
    getItem: (name: string): StorageValue<ExcalidrawPersisted> | null => {
      const raw = base.getItem(
        name,
      ) as StorageValue<ExcalidrawPersisted> | null;
      if (raw && "state" in raw && raw.state) return raw;
      try {
        const s = createSafeStorage();
        const legacy = s.getItem(LEGACY_KEY);
        if (legacy) {
          const parsed = JSON.parse(legacy) as unknown;
          const elements = Array.isArray(parsed)
            ? (parsed as ExcalidrawElement[])
            : null;
          if (elements) {
            s.removeItem(LEGACY_KEY);
            return {
              state: { elements },
              version: 0,
            };
          }
        }
      } catch {
        // ignore
      }
      return null;
    },
    setItem: base.setItem,
    removeItem: base.removeItem,
  };
}

export const useExcalidrawStore = create<ExcalidrawState>()(
  persist(
    (set) => ({
      elements: null,
      setElements: (elements) => set({ elements }),
    }),
    {
      name: "devwiz-excalidraw",
      storage: createExcalidrawStorage(),
      partialize: (s) => ({ elements: s.elements }),
    },
  ),
);
