"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AI_TOOL_IDS } from "@/lib/registry";

function parseSoapInput(input: string): {
  url: string;
  soapBody: string;
  soapAction?: string;
} {
  const lines = input.split("\n");
  let url = "https://example.com/soap";
  let soapAction: string | undefined;
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (line.startsWith("URL:")) {
      const val = line.slice(4).trim();
      if (val) url = val;
    } else if (line.startsWith("SOAPAction:")) {
      const val = line.slice(11).trim();
      if (val) soapAction = val;
    } else if (trimmed.startsWith("<?xml") || trimmed.startsWith("<")) {
      bodyStart = i;
      break;
    } else if (trimmed === "" && i > 0) {
      bodyStart = i + 1;
      break;
    }
  }

  const soapBody = lines.slice(bodyStart).join("\n").trim();
  return { url, soapBody, soapAction };
}

import { useSettingsStore } from "@/lib/stores/settingsStore";
import { safeParseJson } from "@/lib/utils";

type WorkerResult = { id: string; output: string; error: string | null };

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
      if (AI_TOOL_IDS.has(toolId)) {
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
          const data = await safeParseJson<{ output?: string; error?: string }>(
            res,
          );
          if (!res.ok) throw new Error(data.error || "Failed to transform SVG");
          return { output: data.output ?? "", error: null };
        } catch (err) {
          return {
            output: "",
            error: err instanceof Error ? err.message : "Transformation failed",
          };
        }
      }

      // SOAP to REST runs on the server API
      if (toolId === "soap-to-rest") {
        try {
          const { url, soapBody, soapAction } = parseSoapInput(input);
          const target = (options?.target as string) || "javascript";
          const res = await fetch("/api/soap-to-rest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, soapBody, soapAction, target }),
          });
          const data = await safeParseJson<{ output?: string; error?: string }>(
            res,
          );
          if (!res.ok) throw new Error(data.error || "Failed to convert SOAP");
          return { output: data.output ?? "", error: null };
        } catch (err) {
          return {
            output: "",
            error: err instanceof Error ? err.message : "Conversion failed",
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
  const { apiKeyHuggingface: apiKey, hfModel: model } =
    useSettingsStore.getState();

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
      const data = await safeParseJson<{ error?: string }>(res);
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
