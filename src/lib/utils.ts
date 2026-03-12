import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Safely parse JSON from a Response. Handles empty body and invalid JSON. */
export async function safeParseJson<T = Record<string, unknown>>(
  res: Response,
): Promise<T> {
  const text = await res.text();
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    return { error: "Invalid response from server" } as T;
  }
}
