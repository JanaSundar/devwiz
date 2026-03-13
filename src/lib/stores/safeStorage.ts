/** Safe localStorage for Zustand persist - handles SSR and blocked storage */
function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage;
  } catch {
    return null;
  }
}

export interface StateStorage {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
}

export function createSafeStorage(): StateStorage {
  return {
    getItem: (name: string) => {
      const s = getStorage();
      if (!s) return null;
      try {
        return s.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      const s = getStorage();
      if (!s) return;
      try {
        s.setItem(name, value);
      } catch {
        // ignore
      }
    },
    removeItem: (name: string) => {
      const s = getStorage();
      if (!s) return;
      try {
        s.removeItem(name);
      } catch {
        // ignore
      }
    },
  };
}
