import { create } from "zustand";
import type { ApiFlowPayload } from "./apiFlowChannel";

interface ApiFlowStore {
  pendingPayload: ApiFlowPayload | null;
  setPendingPayload: (payload: ApiFlowPayload | null) => void;
  consumePayload: () => ApiFlowPayload | null;
}

export const useApiFlowStore = create<ApiFlowStore>((set, get) => ({
  pendingPayload: null,
  setPendingPayload: (payload) => set({ pendingPayload: payload }),
  consumePayload: () => {
    const payload = get().pendingPayload;
    set({ pendingPayload: null });
    return payload;
  },
}));
