"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { ChatInput } from "./ChatInput";
import { LoadingShimmer } from "./LoadingShimmer";
import { AIProviderSelector } from "./AIProviderSelector";
import { cn } from "@/lib/utils";

type Provider = "groq" | "openrouter" | "huggingface" | "ai-sdk" | "assistant-ai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatClientProps {
  apiKey?: string;
}

export function ChatClient({ apiKey }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<Provider>("groq");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              ...messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              { role: "user", content },
            ],
            provider,
            apiKey,
            stream: true,
            systemPrompt:
              "You are a helpful AI assistant. Provide clear, concise, and accurate responses.",
          }),
        });

        if (!response.ok) {
          let errorMessage = `Failed to get response (${response.status})`;
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch {
            // Response is not JSON
            const text = await response.text();
            if (text) errorMessage = text;
          }
          throw new Error(errorMessage);
        }

        let assistantContent = "";

        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: "",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            assistantContent += chunk;

            setMessages((prev) => {
              const updated = [...prev];
              const lastMessage = updated[updated.length - 1];
              if (lastMessage && lastMessage.role === "assistant") {
                lastMessage.content = assistantContent;
              }
              return updated;
            });
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorMsg: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Error: ${errorMessage}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, provider, apiKey]
  );

  const copyToClipboard = (id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-bg-secondary">
        <h1 className="text-xl font-bold">AI Chat</h1>
        <AIProviderSelector value={provider} onChange={setProvider} />
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Welcome to AI Chat</h2>
              <p className="text-muted-foreground">
                Start a conversation with {" "}
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-fadeIn",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-bg-secondary text-foreground border border-border rounded-bl-none"
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
              {message.role === "assistant" && (
                <button
                  onClick={() => copyToClipboard(message.id, message.content)}
                  className="mt-2 p-1 rounded hover:bg-bg-tertiary transition-colors"
                  aria-label="Copy message"
                >
                  {copiedId === message.id ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} className="text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && <LoadingShimmer />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder="Type your message or use Shift+Enter for new line..."
      />
    </div>
  );
}
