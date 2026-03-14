"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type Provider = "groq" | "openrouter" | "huggingface" | "ai-sdk" | "assistant-ai";

const PROVIDERS: { id: Provider; name: string; description: string }[] = [
  {
    id: "huggingface",
    name: "HuggingFace",
    description: "Fast & reliable text generation",
  },
  {
    id: "groq",
    name: "Groq",
    description: "Ultra-fast LLM inference",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Access multiple models",
  },
  {
    id: "ai-sdk",
    name: "AI SDK",
    description: "Vercel AI SDK default",
  },
  {
    id: "assistant-ai",
    name: "Assistant AI",
    description: "Structured conversations",
  },
];

interface AIProviderSelectorProps {
  provider: Provider;
  setProvider: (provider: Provider) => void;
}

export function AIProviderSelector({
  provider,
  setProvider,
}: AIProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedProvider = PROVIDERS.find((p) => p.id === provider);

  return (
    <div className="relative inline-block w-full" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-bg-secondary hover:bg-bg-tertiary transition-colors text-sm font-medium text-txt"
      >
        <span>{selectedProvider?.name}</span>
        <ChevronDown
          size={16}
          className={cn(
            "transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full rounded-lg border border-border bg-bg-secondary shadow-lg z-50 overflow-hidden">
          {PROVIDERS.map((prov) => (
            <button
              key={prov.id}
              onClick={() => {
                setProvider(prov.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 transition-colors text-sm hover:bg-bg-tertiary",
                provider === prov.id && "bg-accent/10 border-l-2 border-accent"
              )}
            >
              <div className="font-medium text-txt">{prov.name}</div>
              <div className="text-xs text-txt-muted">
                {prov.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
