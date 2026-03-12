"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ExternalLink,
  Key,
  Loader2,
  RefreshCw,
  Save,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { safeGetItem, safeRemoveItem, safeSetItem } from "@/lib/storage";
import { safeParseJson } from "@/lib/utils";

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
  const [showToken, setShowToken] = useState(false);

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
      const tokenToUse = hfToken || safeGetItem("api_key_huggingface") || "";
      const url = tokenToUse
        ? `/api/models?token=${encodeURIComponent(tokenToUse)}`
        : `/api/models`;
      const res = await fetch(url);
      const data = await safeParseJson<{ models?: HFModel[]; error?: string }>(
        res,
      );
      if (!res.ok) throw new Error("Network response was not ok");
      if (data.error) throw new Error(data.error);
      return data.models as HFModel[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const models = modelsData || [];
  const modelError = error ? (error as Error).message : null;

  const fetchModels = () => refetch();

  const save = () => {
    if (hfToken.trim()) safeSetItem("api_key_huggingface", hfToken.trim());
    else safeRemoveItem("api_key_huggingface");

    safeSetItem("hf_model", model);

    safeRemoveItem("api_key_gemini");
    safeRemoveItem("api_key_openai");

    onClose();
  };

  const selectedInList = models.some((m) => m.id === model);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-bg-primary border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Settings size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-txt">API Settings</h3>
              <p className="text-[11px] text-txt-muted">
                Configure AI provider for Regex, Code, Mock Data & more
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-txt-muted hover:text-txt hover:bg-bg-tertiary tr-smooth"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Hugging Face banner */}
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-txt mb-0.5">
                  Hugging Face Inference API
                </p>
                <p className="text-[12px] text-txt-sec leading-relaxed">
                  Free & open-source AI. Get a token to start — upgrade to HF
                  Pro for premium models.
                </p>
              </div>
            </div>
          </div>

          {/* Token input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider flex items-center gap-2">
                <Key size={12} />
                Hugging Face Token
              </label>
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-accent hover:underline flex items-center gap-1"
              >
                Get free token <ExternalLink size={10} />
              </a>
            </div>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={hfToken}
                onChange={(e) => setHfToken(e.target.value)}
                placeholder="hf_..."
                className="w-full px-4 py-3 text-sm rounded-xl bg-bg-secondary border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 tr-smooth font-mono"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-txt-muted hover:text-txt"
              >
                {showToken ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Model selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                AI Model
              </label>
              <button
                onClick={fetchModels}
                disabled={loadingModels}
                className="text-[11px] text-accent hover:underline flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw
                  size={12}
                  className={loadingModels ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {loadingModels && models.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 rounded-xl border border-border bg-bg-secondary">
                <Loader2 size={16} className="animate-spin text-accent" />
                <span className="text-sm text-txt-muted">Loading models…</span>
              </div>
            ) : modelError && models.length === 0 ? (
              <div className="py-4 px-4 rounded-xl border border-error/20 bg-error/5 text-sm text-error">
                {modelError}
              </div>
            ) : (
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl bg-bg-secondary border border-border text-txt focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 tr-smooth appearance-none cursor-pointer pr-10"
                >
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
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none"
                />
              </div>
            )}

            <p className="text-[11px] text-txt-muted">
              {models.length > 0
                ? `${models.length} models · 🔒 = gated (may need approval)`
                : "Models loaded from Hugging Face API"}
            </p>
          </div>

          <p className="text-[11px] text-txt-muted flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success/60" />
            Token stored locally only. Never sent except to Hugging Face.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex justify-end gap-3 bg-bg-secondary/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl btn-glass"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-2 text-sm rounded-xl btn-accent flex items-center gap-2"
          >
            <Save size={14} />
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
