// Safe localStorage wrapper — handles cases where localStorage is blocked
// (incognito mode, iframe restrictions, strict privacy settings)

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // silently fail if storage is blocked
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // silently fail if storage is blocked
  }
}
