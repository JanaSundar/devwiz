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
  value: Provider;
  onChange: (provider: Provider) => void;
}

export function AIProviderSelector({
  value,
  onChange,
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

  const selectedProvider = PROVIDERS.find((p) => p.id === value);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-bg-secondary hover:bg-bg-tertiary transition-colors text-sm font-medium"
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
        <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-input bg-bg-secondary shadow-lg z-50 overflow-hidden">
          {PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              onClick={() => {
                onChange(provider.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 transition-colors text-sm hover:bg-bg-tertiary",
                value === provider.id && "bg-primary/10 border-l-2 border-primary"
              )}
            >
              <div className="font-medium">{provider.name}</div>
              <div className="text-xs text-muted-foreground">
                {provider.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
