import { create } from "zustand";
import type { PersistStorage, StorageValue } from "zustand/middleware";
import { createJSONStorage, persist } from "zustand/middleware";
import { safeGetItem, safeRemoveItem } from "@/lib/storage";
import { createSafeStorage } from "./safeStorage";

export const DEFAULT_MODEL = "Qwen/Qwen2.5-Coder-32B-Instruct";

interface SettingsPersisted {
  apiKeyHuggingface: string;
  hfModel: string;
}

interface SettingsState extends SettingsPersisted {
  setApiKeyHuggingface: (value: string) => void;
  setHfModel: (value: string) => void;
  setSettings: (settings: Partial<SettingsPersisted>) => void;
}

/** Migrate from legacy localStorage keys on first load */
function createSettingsStorage(): PersistStorage<SettingsPersisted> {
  const base = createJSONStorage<SettingsPersisted>(() => createSafeStorage());
  if (!base) throw new Error("Failed to create storage");
  return {
    getItem: (name: string): StorageValue<SettingsPersisted> | null => {
      const raw = base.getItem(name) as StorageValue<SettingsPersisted> | null;
      if (raw && "state" in raw && raw.state) return raw;
      const token = safeGetItem("api_key_huggingface");
      const model = safeGetItem("hf_model");
      if (token || model) {
        safeRemoveItem("api_key_huggingface");
        safeRemoveItem("hf_model");
        return {
          state: {
            apiKeyHuggingface: token || "",
            hfModel: model || DEFAULT_MODEL,
          },
          version: 0,
        };
      }
      return null;
    },
    setItem: base.setItem,
    removeItem: base.removeItem,
  };
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKeyHuggingface: "",
      hfModel: DEFAULT_MODEL,
      setApiKeyHuggingface: (apiKeyHuggingface) => set({ apiKeyHuggingface }),
      setHfModel: (hfModel) => set({ hfModel }),
      setSettings: (settings) =>
        set((s) => ({
          ...s,
          ...settings,
        })),
    }),
    {
      name: "devwiz-settings",
      storage: createSettingsStorage(),
      partialize: (s) => ({
        apiKeyHuggingface: s.apiKeyHuggingface,
        hfModel: s.hfModel,
      }),
    },
  ),
);
