'use client';

import { useState } from 'react';
import {
  Thread,
  ThreadWelcome,
  ThreadMessages,
  ThreadViewportFooter,
} from '@assistant-ui/react';
import { useChat } from '@ai-sdk/react';
import { Copy, Check, Send } from 'lucide-react';
import { AIProviderSelector } from './AIProviderSelector';

type Provider = 'groq' | 'openrouter' | 'huggingface' | 'ai-sdk' | 'assistant-ai';

interface ChatClientProps {
  apiKey?: string;
}

export function ChatClient({ apiKey }: ChatClientProps) {
  const [provider, setProvider] = useState<Provider>('groq');
  const [customApiKey, setCustomApiKey] = useState(apiKey || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { messages, input, setInput, append, isLoading } = useChat({
    api: '/api/ai-chat',
    body: {
      provider,
      apiKey: customApiKey || undefined,
      systemPrompt: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.',
    },
  });

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return;

    append({
      role: 'user',
      content: input,
    });

    setInput('');
  };

  const copyToClipboard = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Header */}
      <div className="border-b border-border/50 bg-bg-secondary/40 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-base font-semibold text-txt">AI Chat</h1>
        </div>

        {/* Provider Selector */}
        <AIProviderSelector
          provider={provider}
          setProvider={setProvider}
        />
      </div>

      {/* Chat Thread */}
      <Thread className="flex-1 flex flex-col overflow-hidden">
        {/* Welcome Message */}
        <ThreadWelcome
          defaultMessage="Hi! I'm your AI assistant. How can I help you today?"
        />

        {/* Messages */}
        <ThreadMessages
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          components={{
            Message: ({ message }) => {
              const isUser = message.role === 'user';
              const content = message.content
                .filter((part) => part.type === 'text')
                .map((part) => part.text)
                .join('');
              const messageId = `${message.role}-${messages.indexOf(message)}`;

              return (
                <div
                  className={`flex gap-3 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                      isUser
                        ? 'bg-accent text-white rounded-br-none'
                        : 'bg-bg-secondary border border-border rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {content}
                    </p>
                    {!isUser && content && (
                      <button
                        onClick={() => copyToClipboard(content, messageId)}
                        className="mt-2 p-1 rounded hover:bg-bg-tertiary transition-colors"
                        aria-label="Copy message"
                      >
                        {copiedId === messageId ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy
                            size={14}
                            className="text-txt-muted hover:text-txt"
                          />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            },
          }}
        />

        {/* Input Area */}
        <ThreadViewportFooter className="border-t border-border/50 bg-bg-secondary/40 p-4">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message (Shift+Enter for new line)..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-bg-primary border border-border rounded-lg text-txt placeholder-txt-muted text-sm resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="px-3 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </div>
        </ThreadViewportFooter>
      </Thread>
    </div>
  );
}
