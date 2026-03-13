export interface InputNodeData {
  type: "input";
  subtype: "json" | "text" | "xml";
  value?: string;
  label?: string;
  error?: string;
}

export interface TransformNodeData {
  type: "transform";
  transformId: string;
  label?: string;
  output?: string;
  error?: string;
  status?: "idle" | "running" | "success" | "error";
}

export interface OutputNodeData {
  type: "output";
  subtype: "preview" | "copy" | "download";
  label?: string;
  input?: string;
  status?: "idle" | "success" | "error";
}

export type KeyValueRow = { id: string; key: string; value: string };

export interface ApiRequestNodeData {
  type: "apiRequest";
  method: string;
  url?: string;
  headers?: KeyValueRow[];
  params?: KeyValueRow[];
  body?: string;
  /** JSONPath to extract a specific field from the response (e.g. "$.data.users"). Leave empty for entire response. */
  responsePath?: string;
  status?: "idle" | "running" | "success" | "error";
}

export interface ApiResponseNodeData {
  type: "apiResponse";
  status: number;
  statusText?: string;
  duration?: number;
  headers?: Record<string, string>;
  body?: string;
}

export interface ApiErrorNodeData {
  type: "apiError";
  message: string;
  statusCode?: number;
  stack?: string;
}

export interface JsonStructureNodeData {
  type: "jsonStructure";
  body?: string;
  structure?: string;
  error?: string;
}
