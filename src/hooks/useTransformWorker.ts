"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { safeGetItem } from "@/lib/storage";

type WorkerResult = { id: string; output: string; error: string | null };

const AI_TOOLS = new Set([
  "ai-regex-explainer",
  "ai-code-commenter",
  "ai-readme-writer",
  "ai-mock-data",
  "ai-commit-msg",
  "ai-error-explainer",
]);

export function useTransformWorker() {
  const workerRef = useRef<Worker | null>(null);
  const callbacksRef = useRef<Map<string, (r: WorkerResult) => void>>(
    new Map(),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const w = new Worker(
      new URL("../workers/transform.worker.ts", import.meta.url),
    );
    w.onmessage = (e: MessageEvent<WorkerResult>) => {
      const cb = callbacksRef.current.get(e.data.id);
      if (cb) {
        cb(e.data);
        callbacksRef.current.delete(e.data.id);
      }
    };
    workerRef.current = w;
    return () => w.terminate();
  }, []);

  const transform = useCallback(
    async (
      toolId: string,
      input: string,
      onStream?: (chunk: string) => void,
      options?: Record<string, unknown>,
    ): Promise<{ output: string; error: string | null }> => {
      // AI tools go through the API route with streaming
      if (AI_TOOLS.has(toolId)) {
        return streamAI(toolId, input, onStream, setIsGenerating, abortRef);
      }

      // SVG to JSX runs on the server API to avoid heavy Babel bundles in the browser
      if (toolId === "svg-to-jsx") {
        try {
          const res = await fetch("/api/transform/svgr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input, options }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to transform SVG");
          return { output: data.output, error: null };
        } catch (err) {
          return {
            output: "",
            error: err instanceof Error ? err.message : "Transformation failed",
          };
        }
      }

      // Non-AI transforms go through the Web Worker
      return new Promise((resolve) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        callbacksRef.current.set(id, (r) =>
          resolve({ output: r.output, error: r.error }),
        );
        workerRef.current?.postMessage({ id, toolId, input });
      });
    },
    [],
  );

  return { transform, isGenerating };
}

async function streamAI(
  toolId: string,
  input: string,
  onStream: ((chunk: string) => void) | undefined,
  setIsGenerating: (v: boolean) => void,
  abortRef: React.RefObject<AbortController | null>,
): Promise<{ output: string; error: string | null }> {
  const apiKey = safeGetItem("api_key_huggingface");
  const model = safeGetItem("hf_model");

  // Abort any previous AI request
  if (abortRef.current) abortRef.current.abort();
  const controller = new AbortController();
  abortRef.current = controller;

  setIsGenerating(true);

  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId, input, apiKey, model }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const data = await res.json();
      setIsGenerating(false);
      return { output: "", error: data.error || `API error (${res.status})` };
    }

    // Read the stream
    const reader = res.body?.getReader();
    if (!reader) {
      setIsGenerating(false);
      return { output: "", error: "No response stream" };
    }

    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onStream?.(fullText);
    }

    setIsGenerating(false);
    return { output: fullText, error: null };
  } catch (err) {
    setIsGenerating(false);
    if ((err as Error).name === "AbortError") {
      return { output: "", error: null };
    }
    return {
      output: "",
      error: err instanceof Error ? err.message : "Failed to reach AI service",
    };
  }
}
