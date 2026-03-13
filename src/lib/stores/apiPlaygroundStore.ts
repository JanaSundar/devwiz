import { create } from "zustand";
import type { PersistStorage, StorageValue } from "zustand/middleware";
import { createJSONStorage, persist } from "zustand/middleware";
import { safeGetItem, safeRemoveItem } from "@/lib/storage";
import { createSafeStorage } from "./safeStorage";

interface ApiPlaygroundPersisted {
  sendToFlowBoard: boolean;
}

interface ApiPlaygroundState extends ApiPlaygroundPersisted {
  setSendToFlowBoard: (value: boolean) => void;
  toggleSendToFlowBoard: () => void;
}

function createApiPlaygroundStorage(): PersistStorage<ApiPlaygroundPersisted> {
  const base = createJSONStorage<ApiPlaygroundPersisted>(() =>
    createSafeStorage(),
  );
  if (!base) throw new Error("Failed to create storage");
  return {
    getItem: (name: string): StorageValue<ApiPlaygroundPersisted> | null => {
      const raw = base.getItem(
        name,
      ) as StorageValue<ApiPlaygroundPersisted> | null;
      if (raw && "state" in raw && raw.state) return raw;
      const legacy = safeGetItem("api_send_to_flow_board");
      if (legacy !== null) {
        safeRemoveItem("api_send_to_flow_board");
        return {
          state: { sendToFlowBoard: legacy === "true" },
          version: 0,
        };
      }
      return null;
    },
    setItem: base.setItem,
    removeItem: base.removeItem,
  };
}

export const useApiPlaygroundStore = create<ApiPlaygroundState>()(
  persist(
    (set) => ({
      sendToFlowBoard: false,
      setSendToFlowBoard: (sendToFlowBoard) => set({ sendToFlowBoard }),
      toggleSendToFlowBoard: () =>
        set((s) => ({ sendToFlowBoard: !s.sendToFlowBoard })),
    }),
    {
      name: "devwiz-api-playground",
      storage: createApiPlaygroundStorage(),
      partialize: (s) => ({ sendToFlowBoard: s.sendToFlowBoard }),
    },
  ),
);
