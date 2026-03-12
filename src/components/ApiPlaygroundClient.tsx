"use client";

import axios from "axios";
import { JSONPath } from "jsonpath-plus";
import {
  Braces,
  ChevronDown,
  Clock,
  Copy,
  FileJson,
  Key,
  Loader2,
  Minus,
  Plus,
  Search,
  Send,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import CodeEditor from "@/components/CodeEditor";
import ToolHeader from "@/components/tooling/ToolHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const;
const BODY_TYPES = [
  "None",
  "JSON",
  "XML",
  "Form Data",
  "Form URL Encoded",
  "Raw",
] as const;

const SOAP_ENVELOPE_PLACEHOLDER = `<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetData xmlns="http://example.com/service">
      <param>value</param>
    </GetData>
  </soap:Body>
</soap:Envelope>`;
const AUTH_TYPES = ["None", "Bearer Token", "Basic Auth", "API Key"] as const;
const REQUEST_TABS = ["Params", "Headers", "Body", "Auth"] as const;
const RESPONSE_TABS = ["Body", "Headers"] as const;

type KeyValueRow = { id: string; key: string; value: string };
type FormFieldValueType = "text" | "file";
type FormFieldRow = KeyValueRow & {
  valueType?: FormFieldValueType;
  file?: { name: string; data: string };
};

const DEFAULT_URL = "https://jsonplaceholder.typicode.com/posts/1";
const DEFAULT_BODY = '{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}';

function generateId() {
  return Math.random().toString(36).slice(2);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function KeyValueTable({
  rows,
  onAdd,
  onRemove,
  onUpdate,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: {
  rows: KeyValueRow[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: "key" | "value", val: string) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}) {
  return (
    <div className="space-y-1">
      {rows.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center text-[10px] font-medium text-txt-muted uppercase tracking-wider px-1">
          <span>{keyPlaceholder}</span>
          <span>{valuePlaceholder}</span>
          <span className="w-6" />
        </div>
      )}
      {rows.map((r) => (
        <div
          key={r.id}
          className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
        >
          <Input
            value={r.key}
            onChange={(e) => onUpdate(r.id, "key", e.target.value)}
            placeholder={keyPlaceholder}
            className="font-mono text-[12px] h-8"
          />
          <Input
            value={r.value}
            onChange={(e) => onUpdate(r.id, "value", e.target.value)}
            placeholder={valuePlaceholder}
            className="font-mono text-[12px] h-8"
          />
          <button
            type="button"
            onClick={() => onRemove(r.id)}
            className="p-1.5 rounded hover:bg-error/10 text-txt-muted hover:text-error"
            aria-label="Remove"
          >
            <Minus size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-1.5 text-[11px] text-txt-muted hover:text-accent py-1.5"
      >
        <Plus size={12} />
        Add
      </button>
    </div>
  );
}

function FormFieldTable({
  fields,
  isFormData,
  onAdd,
  onRemove,
  onUpdate,
}: {
  fields: FormFieldRow[];
  isFormData: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FormFieldRow>) => void;
}) {
  const gridCols = isFormData
    ? "grid-cols-[1fr_auto_1fr_auto]"
    : "grid-cols-[1fr_1fr_auto]";
  return (
    <div className="space-y-1">
      <div
        className={cn(
          "grid gap-2 items-center text-[10px] font-medium text-txt-muted uppercase tracking-wider px-1",
          gridCols,
        )}
      >
        <span>Key</span>
        {isFormData && <span className="w-20">Type</span>}
        <span>Value</span>
        <span className="w-6" />
      </div>
      {fields.map((f) => (
        <FormFieldRowEditor
          key={f.id}
          field={f}
          isFormData={isFormData}
          onUpdate={(updates) => onUpdate(f.id, updates)}
          onRemove={() => onRemove(f.id)}
        />
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-1.5 text-[11px] text-txt-muted hover:text-accent py-1.5"
      >
        <Plus size={12} />
        Add More
      </button>
    </div>
  );
}

function FormFieldRowEditor({
  field,
  isFormData,
  onUpdate,
  onRemove,
}: {
  field: FormFieldRow;
  isFormData: boolean;
  onUpdate: (updates: Partial<FormFieldRow>) => void;
  onRemove: () => void;
}) {
  const valueType = field.valueType ?? "text";
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const data = await fileToBase64(file);
      onUpdate({ file: { name: file.name, data }, value: "" });
    },
    [onUpdate],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: !isFormData || valueType !== "file",
    accept: { "image/*": [], "application/*": [], "*/*": [] },
  });

  const gridCols = isFormData
    ? "grid-cols-[1fr_auto_1fr_auto]"
    : "grid-cols-[1fr_1fr_auto]";

  return (
    <div className={cn("grid gap-2 items-center", gridCols)}>
      <Input
        value={field.key}
        onChange={(e) => onUpdate({ key: e.target.value })}
        placeholder="Key"
        className="font-mono text-[12px] h-8"
      />
      {isFormData && (
        <select
          value={valueType}
          onChange={(e) => {
            const t = e.target.value as FormFieldValueType;
            onUpdate({
              valueType: t,
              file: t === "text" ? undefined : field.file,
              value: t === "file" ? "" : field.value,
            });
          }}
          className="h-8 px-2 rounded-lg border border-border bg-bg-primary text-[12px] font-mono text-txt min-w-[72px]"
        >
          <option value="text">Text</option>
          <option value="file">File</option>
        </select>
      )}
      {isFormData ? (
        valueType === "text" ? (
          <Input
            value={field.value}
            onChange={(e) =>
              onUpdate({ value: e.target.value, file: undefined })
            }
            placeholder="Value"
            className="font-mono text-[12px] h-8"
          />
        ) : field.file ? (
          <div className="flex items-center gap-2 h-8 px-2.5 rounded-lg border border-border bg-bg-primary min-w-0">
            <span className="text-[12px] font-mono text-txt truncate flex-1 min-w-0">
              {field.file.name}
            </span>
            <button
              type="button"
              onClick={() => onUpdate({ file: undefined })}
              className="text-[11px] text-error hover:underline shrink-0"
            >
              Remove
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-dashed text-[11px] cursor-pointer tr-smooth min-h-[32px]",
              isDragActive
                ? "border-accent bg-accent/5 text-accent"
                : "border-border text-txt-muted hover:border-accent/40",
            )}
          >
            <input {...getInputProps()} />
            <Upload size={12} />
            or drop file
          </div>
        )
      ) : (
        <Input
          value={field.value}
          onChange={(e) => onUpdate({ value: e.target.value, file: undefined })}
          placeholder="Value"
          className="font-mono text-[12px] h-8"
        />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded hover:bg-error/10 text-txt-muted hover:text-error"
        aria-label="Remove"
      >
        <Minus size={14} />
      </button>
    </div>
  );
}

export default function ApiPlaygroundClient() {
  const [method, setMethod] = useState<(typeof METHODS)[number]>("GET");
  const [url, setUrl] = useState(DEFAULT_URL);
  const [requestTab, setRequestTab] =
    useState<(typeof REQUEST_TABS)[number]>("Params");
  const [responseTab, setResponseTab] =
    useState<(typeof RESPONSE_TABS)[number]>("Body");
  const [params, setParams] = useState<KeyValueRow[]>([]);
  const [authType, setAuthType] = useState<(typeof AUTH_TYPES)[number]>("None");
  const [bearerToken, setBearerToken] = useState("");
  const [basicUser, setBasicUser] = useState("");
  const [basicPass, setBasicPass] = useState("");
  const [apiKeyName, setApiKeyName] = useState("X-API-Key");
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [apiKeyAddTo, setApiKeyAddTo] = useState<"header" | "query">("header");
  const [headers, setHeaders] = useState<KeyValueRow[]>([
    { id: generateId(), key: "Content-Type", value: "application/json" },
  ]);
  const [bodyType, setBodyType] = useState<(typeof BODY_TYPES)[number]>("JSON");
  const [body, setBody] = useState(DEFAULT_BODY);
  const [formFields, setFormFields] = useState<FormFieldRow[]>([
    { id: generateId(), key: "name", value: "value", valueType: "text" },
  ]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    duration: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [jsonPath, setJsonPath] = useState("");
  const [findText, setFindText] = useState("");

  const hasBody = !["GET", "HEAD"].includes(method);
  const showBodySection = hasBody && bodyType !== "None";

  const setBodyTypeWithHeaders = useCallback(
    (next: (typeof BODY_TYPES)[number]) => {
      setBodyType(next);
      if (next === "XML") {
        setBody(SOAP_ENVELOPE_PLACEHOLDER);
        setHeaders((prev) => {
          const ct = prev.find(
            (h) => h.key.toLowerCase().trim() === "content-type",
          );
          if (ct && ct.value.includes("json")) {
            return prev.map((h) =>
              h.key.toLowerCase().trim() === "content-type"
                ? { ...h, value: "text/xml" }
                : h,
            );
          }
          if (!ct) {
            return [
              ...prev,
              { id: generateId(), key: "Content-Type", value: "text/xml" },
            ];
          }
          return prev;
        });
      } else if (next === "JSON") {
        setBody(DEFAULT_BODY);
        setHeaders((prev) => {
          const ct = prev.find(
            (h) => h.key.toLowerCase().trim() === "content-type",
          );
          if (ct && ct.value.includes("xml")) {
            return prev.map((h) =>
              h.key.toLowerCase().trim() === "content-type"
                ? { ...h, value: "application/json" }
                : h,
            );
          }
          if (!ct) {
            return [
              ...prev,
              {
                id: generateId(),
                key: "Content-Type",
                value: "application/json",
              },
            ];
          }
          return prev;
        });
      } else if (next === "Raw") {
        setBody("");
      }
    },
    [],
  );

  const addRow = useCallback(
    (setter: React.Dispatch<React.SetStateAction<KeyValueRow[]>>) => {
      setter((prev) => [...prev, { id: generateId(), key: "", value: "" }]);
    },
    [],
  );
  const addFormField = useCallback(() => {
    setFormFields((prev) => [
      ...prev,
      { id: generateId(), key: "", value: "", valueType: "text" },
    ]);
  }, []);
  const removeRow = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<KeyValueRow[]>>,
      id: string,
    ) => {
      setter((prev) => prev.filter((r) => r.id !== id));
    },
    [],
  );
  const removeFormField = useCallback((id: string) => {
    setFormFields((prev) => prev.filter((r) => r.id !== id));
  }, []);
  const updateRow = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<KeyValueRow[]>>,
      id: string,
      field: "key" | "value",
      val: string,
    ) => {
      setter((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)),
      );
    },
    [],
  );
  const updateFormField = useCallback(
    (
      id: string,
      updates: Partial<Pick<FormFieldRow, "key" | "value" | "file">>,
    ) => {
      setFormFields((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      );
    },
    [],
  );

  const buildParams = useCallback((): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const p of params) {
      const k = p.key.trim();
      if (k) out[k] = p.value.trim();
    }
    return out;
  }, [params]);

  const buildHeaders = useCallback((): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const h of headers) {
      const k = h.key.trim();
      if (k) out[k] = h.value.trim();
    }
    return out;
  }, [headers]);

  const buildAuth = useCallback(():
    | { type: "none" }
    | { type: "bearer"; token: string }
    | { type: "basic"; username: string; password: string }
    | {
        type: "apiKey";
        key: string;
        value: string;
        addTo: "header" | "query";
      } => {
    if (authType === "None") return { type: "none" };
    if (authType === "Bearer Token")
      return { type: "bearer", token: bearerToken };
    if (authType === "Basic Auth")
      return { type: "basic", username: basicUser, password: basicPass };
    if (authType === "API Key")
      return {
        type: "apiKey",
        key: apiKeyName,
        value: apiKeyValue,
        addTo: apiKeyAddTo,
      };
    return { type: "none" };
  }, [
    authType,
    bearerToken,
    basicUser,
    basicPass,
    apiKeyName,
    apiKeyValue,
    apiKeyAddTo,
  ]);

  const buildBodyType = useCallback(():
    | "json"
    | "form"
    | "formUrlEncoded"
    | "raw" => {
    if (bodyType === "None" || !hasBody) return "json";
    if (bodyType === "JSON") return "json";
    if (bodyType === "XML") return "raw";
    if (bodyType === "Form Data") return "form";
    if (bodyType === "Form URL Encoded") return "formUrlEncoded";
    return "raw";
  }, [bodyType, hasBody]);

  const buildFormFields = useCallback(
    (): {
      key: string;
      value?: string;
      file?: { name: string; data: string };
    }[] =>
      formFields
        .filter((f) => f.key.trim())
        .filter((f) => {
          if (buildBodyType() === "form" && (f.valueType ?? "text") === "file")
            return !!f.file;
          return true;
        })
        .map((f) =>
          f.file
            ? { key: f.key.trim(), file: f.file }
            : { key: f.key.trim(), value: f.value },
        ),
    [formFields, buildBodyType],
  );

  const sendRequest = useCallback(async () => {
    setError(null);
    setResponse(null);
    setLoading(true);

    const payload = {
      method,
      url: url.trim(),
      headers: buildHeaders(),
      params: buildParams(),
      auth: buildAuth(),
      bodyType: buildBodyType(),
      body:
        showBodySection &&
        (bodyType === "JSON" || bodyType === "XML" || bodyType === "Raw")
          ? body
          : null,
      formFields:
        buildBodyType() === "form" || buildBodyType() === "formUrlEncoded"
          ? buildFormFields()
          : undefined,
    };

    try {
      const res = await axios.post("/api/request", payload, {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
      });

      const data = res.data as {
        status?: number;
        statusText?: string;
        headers?: Record<string, string>;
        body?: string;
        duration?: number;
        error?: string;
      };

      if (res.status !== 200) {
        setError(data.error ?? "Request failed");
        return;
      }

      setResponse({
        status: data.status ?? 0,
        statusText: data.statusText ?? "",
        headers: data.headers ?? {},
        body: data.body ?? "",
        duration: data.duration ?? 0,
      });
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? ((err.response?.data as { error?: string })?.error ?? err.message)
        : err instanceof Error
          ? err.message
          : "Request failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [
    method,
    url,
    body,
    hasBody,
    showBodySection,
    bodyType,
    buildHeaders,
    buildParams,
    buildAuth,
    buildBodyType,
    buildFormFields,
  ]);

  const copyAsCurl = useCallback(() => {
    const p = buildParams();
    const auth = buildAuth();
    let finalUrl = url.trim();
    const urlObj = new URL(finalUrl);
    for (const [k, v] of Object.entries(p)) {
      if (k && v) urlObj.searchParams.set(k, v);
    }
    if (
      auth.type === "apiKey" &&
      auth.addTo === "query" &&
      auth.key &&
      auth.value
    ) {
      urlObj.searchParams.set(String(auth.key), String(auth.value));
    }
    finalUrl = urlObj.toString();

    const h = buildHeaders();
    if (auth.type === "bearer" && auth.token)
      h["Authorization"] = `Bearer ${auth.token}`;
    if (auth.type === "basic" && auth.username) {
      h["Authorization"] =
        `Basic ${btoa(`${auth.username}:${auth.password ?? ""}`)}`;
    }
    if (
      auth.type === "apiKey" &&
      auth.addTo === "header" &&
      auth.key &&
      auth.value
    ) {
      h[auth.key] = auth.value;
    }
    const headerLines = Object.entries(h)
      .filter(([k, v]) => k && v)
      .map(([k, v]) => `  -H '${k}: ${String(v).replace(/'/g, "'\\''")}'`)
      .join(" \\\n");
    let bodyPart = "";
    if (showBodySection) {
      if (bodyType === "JSON" || bodyType === "XML" || bodyType === "Raw") {
        bodyPart = body.trim()
          ? `  -d '${body.replace(/'/g, "'\\''").replace(/\n/g, " ")}'`
          : "";
      } else if (bodyType === "Form Data") {
        const fields = buildFormFields();
        bodyPart = fields
          .map((f) =>
            f.file
              ? `  -F '${f.key}=@<${f.file.name}>'`
              : `  -F '${f.key}=${String(f.value ?? "").replace(/'/g, "'\\''")}'`,
          )
          .join(" \\\n");
      } else if (bodyType === "Form URL Encoded") {
        const fields = buildFormFields().filter((f) => !f.file);
        bodyPart = fields
          .map(
            (f) =>
              `  -d '${f.key}=${String(f.value ?? "").replace(/'/g, "'\\''")}'`,
          )
          .join(" \\\n");
      }
    }
    const curl = `curl -X ${method} '${finalUrl}'${headerLines ? ` \\\n${headerLines}` : ""}${bodyPart ? ` \\\n${bodyPart}` : ""}`;
    navigator.clipboard.writeText(curl).catch(() => {});
    setCopied("curl");
    setTimeout(() => setCopied(null), 2000);
  }, [
    method,
    url,
    body,
    hasBody,
    showBodySection,
    bodyType,
    buildHeaders,
    buildParams,
    buildAuth,
    buildFormFields,
  ]);

  const isJsonResponse =
    response &&
    (response.headers["content-type"]?.includes("application/json") ||
      /^\s*[{[]/.test(response.body));

  const isHtmlResponse =
    response &&
    (response.headers["content-type"]?.includes("text/html") ||
      /^\s*</.test(response.body));

  const getDisplayBody = useCallback((): { text: string; error?: string } => {
    if (!response) return { text: "" };
    let raw = response.body;
    if (isJsonResponse && jsonPath.trim()) {
      try {
        const parsed = JSON.parse(response.body);
        const result = JSONPath({ path: jsonPath.trim(), json: parsed });
        raw = JSON.stringify(result);
      } catch (e) {
        return {
          text: response.body,
          error: e instanceof Error ? e.message : "Invalid JSONPath",
        };
      }
    }
    return { text: raw };
  }, [response, isJsonResponse, jsonPath]);

  const displayBodyText = getDisplayBody().text;
  const [formattedBody, setFormattedBody] = useState<string | null>(null);

  useEffect(() => {
    if (!displayBodyText || (!isJsonResponse && !isHtmlResponse)) {
      setFormattedBody(null);
      return;
    }
    const type = isJsonResponse ? "json" : "html";
    let cancelled = false;
    axios
      .post<{ formatted: string }>("/api/format", {
        content: displayBodyText,
        type,
      })
      .then((res) => {
        if (!cancelled && res.data?.formatted)
          setFormattedBody(res.data.formatted);
      })
      .catch(() => {
        if (!cancelled) {
          if (isJsonResponse) {
            try {
              setFormattedBody(
                JSON.stringify(JSON.parse(displayBodyText), null, 2),
              );
            } catch {
              setFormattedBody(null);
            }
          } else {
            setFormattedBody(null);
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, [displayBodyText, isJsonResponse, isHtmlResponse]);

  const bodyToDisplay = formattedBody ?? displayBodyText;
  const highlightedBody = useMemo(() => {
    if (!findText.trim()) return null;
    const escaped = bodyToDisplay
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const re = new RegExp(
      `(${findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = escaped.split(re);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <mark key={i} className="bg-amber-500/30 text-inherit rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  }, [bodyToDisplay, findText]);

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader
        title="API Playground"
        badge="Playground"
        rightSlot={
          <button
            onClick={copyAsCurl}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-glass hover:border-accent/30 tr-smooth",
              copied === "curl" && "text-accent border-accent/30",
            )}
          >
            {copied === "curl" ? (
              <>
                <Copy size={12} />
                Copied
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy as cURL
              </>
            )}
          </button>
        }
      />

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Request panel - Thunder Client style */}
        <section className="flex-1 min-h-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-bg-secondary/30 shrink-0 min-w-0">
          {/* Method + URL bar */}
          <div className="p-3 border-b border-border shrink-0 flex items-center gap-2">
            <div className="relative">
              <select
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value as (typeof METHODS)[number])
                }
                className="h-9 pl-3 pr-8 rounded-lg border border-border bg-bg-primary text-txt font-mono text-sm focus:outline-none focus:border-accent/40 appearance-none cursor-pointer"
                aria-label="HTTP method"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none"
              />
            </div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading && url.trim()) sendRequest();
              }}
              placeholder="https://api.example.com/endpoint"
              className="font-mono text-sm flex-1 min-w-0"
              aria-label="Request URL"
            />
            <Button
              onClick={sendRequest}
              disabled={loading || !url.trim()}
              size="sm"
              className="btn-accent gap-1.5 shrink-0"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Send
            </Button>
          </div>

          {/* Request tabs */}
          <div className="border-b border-border shrink-0">
            <div className="flex gap-0 px-3">
              {REQUEST_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRequestTab(tab)}
                  className={cn(
                    "px-3 py-2.5 text-[12px] font-medium border-b-2 -mb-px tr-smooth",
                    requestTab === tab
                      ? "text-accent border-accent"
                      : "text-txt-muted hover:text-txt border-transparent",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-4">
            {requestTab === "Params" && (
              <div className="flex-1 min-h-0 overflow-y-auto">
                <KeyValueTable
                  rows={params}
                  onAdd={() => addRow(setParams)}
                  onRemove={(id) => removeRow(setParams, id)}
                  onUpdate={(id, f, v) => updateRow(setParams, id, f, v)}
                  keyPlaceholder="Query param"
                  valuePlaceholder="Value"
                />
              </div>
            )}
            {requestTab === "Headers" && (
              <div className="flex-1 min-h-0 overflow-y-auto">
                <KeyValueTable
                  rows={headers}
                  onAdd={() => addRow(setHeaders)}
                  onRemove={(id) => removeRow(setHeaders, id)}
                  onUpdate={(id, f, v) => updateRow(setHeaders, id, f, v)}
                  keyPlaceholder="Header name"
                  valuePlaceholder="Value"
                />
              </div>
            )}
            {requestTab === "Body" && (
              <div
                className={cn(
                  "flex flex-col gap-3",
                  hasBody &&
                    (bodyType === "JSON" ||
                      bodyType === "XML" ||
                      bodyType === "Raw") &&
                    "flex-1 min-h-0",
                )}
              >
                {hasBody ? (
                  <>
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      {BODY_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setBodyTypeWithHeaders(t)}
                          className={cn(
                            "px-2.5 py-1 rounded text-[11px] tr-smooth",
                            bodyType === t
                              ? "bg-accent/15 text-accent border border-accent/30"
                              : "btn-glass hover:border-accent/20",
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {bodyType === "JSON" && (
                      <div className="flex-1 min-h-0 rounded-xl border border-border overflow-hidden bg-bg-primary">
                        <CodeEditor
                          value={body}
                          onChange={setBody}
                          language="json"
                          placeholder="{}"
                        />
                      </div>
                    )}
                    {bodyType === "XML" && (
                      <div className="flex-1 min-h-0 rounded-xl border border-border overflow-hidden bg-bg-primary">
                        <CodeEditor
                          value={body}
                          onChange={setBody}
                          language="xml"
                          placeholder={SOAP_ENVELOPE_PLACEHOLDER}
                        />
                      </div>
                    )}
                    {bodyType === "Raw" && (
                      <div className="flex-1 min-h-0 rounded-xl border border-border overflow-hidden bg-bg-primary">
                        <CodeEditor
                          value={body}
                          onChange={setBody}
                          language="markdown"
                        />
                      </div>
                    )}
                    {(bodyType === "Form Data" ||
                      bodyType === "Form URL Encoded") && (
                      <div className="max-h-48 overflow-y-auto">
                        <FormFieldTable
                          fields={formFields}
                          isFormData={bodyType === "Form Data"}
                          onAdd={addFormField}
                          onRemove={removeFormField}
                          onUpdate={updateFormField}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-txt-muted">
                    No body for GET/HEAD requests
                  </p>
                )}
              </div>
            )}
            {requestTab === "Auth" && (
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {AUTH_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAuthType(t)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] tr-smooth",
                          authType === t
                            ? "bg-accent/15 text-accent border border-accent/30"
                            : "btn-glass hover:border-accent/20",
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {authType === "Bearer Token" && (
                    <Input
                      value={bearerToken}
                      onChange={(e) => setBearerToken(e.target.value)}
                      placeholder="Bearer token"
                      className="font-mono text-[12px] h-8"
                    />
                  )}
                  {authType === "Basic Auth" && (
                    <div className="flex gap-2">
                      <Input
                        value={basicUser}
                        onChange={(e) => setBasicUser(e.target.value)}
                        placeholder="Username"
                        className="font-mono text-[12px] h-8 flex-1"
                      />
                      <Input
                        value={basicPass}
                        onChange={(e) => setBasicPass(e.target.value)}
                        placeholder="Password"
                        type="password"
                        className="font-mono text-[12px] h-8 flex-1"
                      />
                    </div>
                  )}
                  {authType === "API Key" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={apiKeyName}
                          onChange={(e) => setApiKeyName(e.target.value)}
                          placeholder="Header/Param name"
                          className="font-mono text-[12px] h-8 flex-1"
                        />
                        <Input
                          value={apiKeyValue}
                          onChange={(e) => setApiKeyValue(e.target.value)}
                          placeholder="Value"
                          className="font-mono text-[12px] h-8 flex-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setApiKeyAddTo("header")}
                          className={cn(
                            "px-2 py-1 rounded text-[11px]",
                            apiKeyAddTo === "header"
                              ? "bg-accent/15 text-accent"
                              : "btn-glass",
                          )}
                        >
                          Add to Header
                        </button>
                        <button
                          type="button"
                          onClick={() => setApiKeyAddTo("query")}
                          className={cn(
                            "px-2 py-1 rounded text-[11px]",
                            apiKeyAddTo === "query"
                              ? "bg-accent/15 text-accent"
                              : "btn-glass",
                          )}
                        >
                          Add to Query
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Response panel */}
        <section className="flex-1 min-h-0 flex flex-col bg-bg-secondary/20 overflow-hidden min-w-0">
          <div className="px-4 py-2.5 border-b border-border shrink-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {RESPONSE_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setResponseTab(tab)}
                  className={cn(
                    "px-2.5 py-1.5 text-[11px] font-medium rounded tr-smooth",
                    responseTab === tab
                      ? "bg-accent/15 text-accent"
                      : "text-txt-muted hover:text-txt",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            {response && (
              <div className="flex items-center gap-3 text-[11px] shrink-0">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded font-medium",
                    response.status >= 200 &&
                      response.status < 300 &&
                      "bg-success/15 text-success",
                    response.status >= 400 && "bg-error/15 text-error",
                    response.status >= 300 &&
                      response.status < 400 &&
                      "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                  )}
                >
                  {response.status} {response.statusText}
                </span>
                <span className="flex items-center gap-1 text-txt-muted">
                  <Clock size={12} />
                  {response.duration}ms
                </span>
              </div>
            )}
          </div>

          <div
            className={cn(
              "flex-1 min-h-0 overflow-auto p-4",
              response && responseTab === "Body" && "flex flex-col",
            )}
          >
            {error && (
              <div className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}
            {!loading && !response && !error && (
              <div className="flex flex-col items-center justify-center h-full text-center text-txt-muted">
                <FileJson size={32} className="mb-3 opacity-50" />
                <p className="text-sm">Send a request to see the response</p>
                <p className="text-[11px] mt-1">
                  Requests are proxied to bypass CORS
                </p>
              </div>
            )}
            {response && (
              <>
                {responseTab === "Body" && (
                  <div className="flex flex-col flex-1 min-h-0 gap-2">
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {isJsonResponse && (
                          <>
                            <Braces
                              size={12}
                              className="text-txt-muted shrink-0"
                            />
                            <Input
                              value={jsonPath}
                              onChange={(e) => setJsonPath(e.target.value)}
                              placeholder="e.g. $.data.items[*].name"
                              className="h-7 text-[11px] font-mono text-txt bg-bg-primary border-border flex-1 min-w-0"
                            />
                          </>
                        )}
                        <Search size={12} className="text-txt-muted shrink-0" />
                        <Input
                          value={findText}
                          onChange={(e) => setFindText(e.target.value)}
                          placeholder="Find in response"
                          className="h-7 text-[11px] font-mono text-txt bg-bg-primary border-border flex-1 min-w-0"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(bodyToDisplay);
                          setCopied("body");
                          setTimeout(() => setCopied(null), 2000);
                        }}
                        className="text-[11px] text-txt-muted hover:text-txt flex items-center gap-1 shrink-0"
                      >
                        <Copy size={12} />
                        {copied === "body" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    {getDisplayBody().error && (
                      <p className="text-[11px] text-error shrink-0">
                        {getDisplayBody().error}
                      </p>
                    )}
                    <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-border bg-bg-primary">
                      <pre className="text-xs font-mono text-txt whitespace-pre-wrap wrap-break-word p-3 min-h-full">
                        {highlightedBody ?? bodyToDisplay}
                      </pre>
                    </div>
                  </div>
                )}
                {responseTab === "Headers" && (
                  <div className="space-y-1">
                    {Object.entries(response.headers).map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-[12px] font-mono">
                        <span className="text-txt-muted shrink-0">{k}:</span>
                        <span className="text-txt break-all">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
