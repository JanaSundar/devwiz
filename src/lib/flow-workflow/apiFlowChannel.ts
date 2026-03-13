import { useApiFlowStore } from "./apiFlowStore";

const CHANNEL_NAME = "devwiz-flow-board-api";

export interface ApiRequestResponsePayload {
  type: "api-request-response";
  /** When "diagram", open Flow Board in Diagram mode with response body as flow. When "workflow" or omitted, open Workflow mode. */
  openAs?: "diagram" | "workflow";
  request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: string;
  };
  response?: {
    status: number;
    statusText: string;
    duration: number;
    headers?: Record<string, string>;
    body?: string;
  };
  error?: {
    message: string;
    statusCode?: number;
  };
}

export interface MermaidFlowPayload {
  type: "mermaid-flow";
  openAs?: "diagram";
  mermaid: string;
}

export type ApiFlowPayload = ApiRequestResponsePayload | MermaidFlowPayload;

export function broadcastApiToFlowBoard(payload: ApiFlowPayload): void {
  useApiFlowStore.getState().setPendingPayload(payload);
  if (typeof BroadcastChannel === "undefined") return;
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(payload);
    channel.close();
  } catch {
    // BroadcastChannel not supported
  }
}

export function storeApiPayloadForFlowBoard(payload: ApiFlowPayload): void {
  useApiFlowStore.getState().setPendingPayload(payload);
}

export function getStoredApiPayload(): ApiFlowPayload | null {
  return useApiFlowStore.getState().consumePayload();
}

export function subscribeToApiFlow(
  onMessage: (payload: ApiFlowPayload) => void,
): () => void {
  if (typeof BroadcastChannel === "undefined") return () => {};
  const channel = new BroadcastChannel(CHANNEL_NAME);
  const handler = (e: MessageEvent<ApiFlowPayload>) => {
    if (
      e.data?.type === "api-request-response" ||
      e.data?.type === "mermaid-flow"
    ) {
      onMessage(e.data);
    }
  };
  channel.addEventListener("message", handler);
  return () => {
    channel.removeEventListener("message", handler);
    channel.close();
  };
}
