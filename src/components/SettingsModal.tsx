"use client";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ExternalLink,
  Loader2,
  RefreshCw,
  Save,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { safeGetItem, safeRemoveItem, safeSetItem } from "@/lib/storage";

export const DEFAULT_MODEL = "Qwen/Qwen2.5-Coder-32B-Instruct";

type HFModel = {
  id: string;
  likes: number;
  downloads: number;
  gated: boolean | string;
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [hfToken, setHfToken] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);

  useEffect(() => {
    setTimeout(() => {
      setHfToken(safeGetItem("api_key_huggingface") || "");
      setModel(safeGetItem("hf_model") || DEFAULT_MODEL);
    }, 0);
  }, []);

  const {
    data: modelsData,
    isLoading: loadingModels,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hf-models", hfToken],
    queryFn: async () => {
      // Using the current hfToken text or local storage fallback for the query
      const tokenToUse = hfToken || safeGetItem("api_key_huggingface") || "";
      const url = tokenToUse
        ? `/api/models?token=${encodeURIComponent(tokenToUse)}`
        : `/api/models`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.models as HFModel[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const models = modelsData || [];
  const modelError = error ? (error as Error).message : null;

  const fetchModels = () => refetch();

  const save = () => {
    if (hfToken.trim()) safeSetItem("api_key_huggingface", hfToken.trim());
    else safeRemoveItem("api_key_huggingface");

    safeSetItem("hf_model", model);

    // Clean up old keys
    safeRemoveItem("api_key_gemini");
    safeRemoveItem("api_key_openai");

    onClose();
  };

  const selectedInList = models.some((m) => m.id === model);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 anim-in">
      <div className="w-full max-w-md bg-bg-primary border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Settings size={16} className="text-accent-light" /> Settings &amp;
            API Keys
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-txt-muted hover:text-txt-sec hover:bg-glass-hover tr-smooth"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-xs text-accent-light font-medium mb-1">
              🤗 Free &amp; Open Source AI
            </p>
            <p className="text-[11px] text-txt-sec leading-relaxed">
              DevWiz uses Hugging Face Inference API with open-source models.
              Get a free token to start — upgrade to HF Pro for premium models.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-txt-sec flex justify-between items-center">
              <span>Hugging Face Token</span>
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline text-[10px] flex items-center gap-1"
              >
                Get Free Token <ExternalLink size={10} />
              </a>
            </label>
            <input
              type="password"
              value={hfToken}
              onChange={(e) => setHfToken(e.target.value)}
              placeholder="hf_..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-bg-secondary border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:ring-1 focus:ring-accent/50 tr-smooth"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-txt-sec flex justify-between items-center mb-2">
              <span>AI Model</span>
              <button
                onClick={fetchModels}
                disabled={loadingModels}
                className="text-accent hover:underline text-[10px] flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw
                  size={10}
                  className={loadingModels ? "animate-spin" : ""}
                />{" "}
                Refresh
              </button>
            </label>

            {loadingModels && models.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-txt-muted">
                <Loader2 size={14} className="animate-spin" />
                Loading models from Hugging Face...
              </div>
            ) : modelError && models.length === 0 ? (
              <div className="text-xs text-error py-2">{modelError}</div>
            ) : (
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-bg-secondary border border-border text-txt focus:outline-none focus:ring-1 focus:ring-accent/50 tr-smooth appearance-none cursor-pointer pr-8"
                >
                  {/* Show current model at top if not in fetched list */}
                  {!selectedInList && (
                    <option value={model}>
                      {model.split("/").pop()} (current)
                    </option>
                  )}
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id.split("/").pop()} — ❤ {formatNumber(m.likes)}
                      {m.gated ? " 🔒" : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none"
                />
              </div>
            )}

            <p className="text-[10px] text-txt-muted">
              {models.length > 0
                ? `${models.length} models available · 🔒 = gated (may need approval)`
                : "Models loaded from Hugging Face API"}
            </p>
          </div>

          <p className="text-[10px] text-txt-muted">
            Token stored locally in your browser. Never sent anywhere except
            Hugging Face.
          </p>
        </div>

        <div className="px-4 py-3 border-t border-border/50 flex justify-end gap-2 bg-bg-secondary/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs rounded-lg btn-glass"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-1.5 text-xs rounded-lg btn-accent flex items-center gap-1.5"
          >
            <Save size={14} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
