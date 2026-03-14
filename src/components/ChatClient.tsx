'use client';

import { useState } from 'react';
import {
  AssistantRuntimeProvider,
  Thread,
  ThreadWelcome,
  ThreadMessages,
  ThreadViewportFooter,
} from '@assistant-ui/react';
import { useChatRuntime, AssistantChatTransport } from '@assistant-ui/react-ai-sdk';
import { Copy, Check, Send } from 'lucide-react';
import { AIProviderSelector } from './AIProviderSelector';

type Provider = 'groq' | 'openrouter' | 'huggingface' | 'ai-sdk' | 'assistant-ai';

interface ChatClientProps {
  apiKey?: string;
}

function ChatContent({ copiedId, setCopiedId }: { copiedId: string | null; setCopiedId: (id: string | null) => void }) {
  const copyToClipboard = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <Thread className="flex flex-col h-full">
      {/* Messages */}
      <ThreadMessages
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        components={{
          UserMessage: ({ message }) => {
            const content =
              message.content
                .filter((part: any) => part.type === 'text')
                .map((part: any) => part.text)
                .join('') || '';

            return (
              <div className="flex gap-3 justify-end">
                <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg bg-accent text-white rounded-br-none">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {content}
                  </p>
                </div>
              </div>
            );
          },
          AssistantMessage: ({ message }) => {
            const content =
              message.content
                .filter((part: any) => part.type === 'text')
                .map((part: any) => part.text)
                .join('') || '';
            const messageId = `assistant-${message.id}`;

            return (
              <div className="flex gap-3 justify-start">
                <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg bg-bg-secondary border border-border rounded-bl-none">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {content}
                  </p>
                  {content && (
                    <button
                      onClick={() => copyToClipboard(content, messageId)}
                      className="mt-2 p-1 rounded hover:bg-bg-tertiary transition-colors"
                      aria-label="Copy message"
                    >
                      {copiedId === messageId ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} className="text-txt-muted hover:text-txt" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          },
        }}
      />

      {/* Welcome Message */}
      <ThreadWelcome
        className="flex-1 flex items-center justify-center"
        components={{
          Empty: () => (
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-txt">Welcome to AI Chat</h2>
              <p className="text-txt-muted">
                Start a conversation with your AI assistant
              </p>
            </div>
          ),
        }}
      />

      {/* Input Area */}
      <ThreadViewportFooter className="border-t border-border/50 bg-bg-secondary/40 p-4">
        <div className="flex items-end gap-2">
          <textarea
            placeholder="Type your message (Shift+Enter for new line)..."
            className="flex-1 px-3 py-2 bg-bg-primary border border-border rounded-lg text-txt placeholder-txt-muted text-sm resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 disabled:opacity-50"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
              }
            }}
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </ThreadViewportFooter>
    </Thread>
  );
}

export function ChatClient({ apiKey }: ChatClientProps) {
  const [provider, setProvider] = useState<Provider>('groq');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: '/api/ai-chat',
      body: {
        provider,
        apiKey: apiKey || undefined,
      },
    }),
  });

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Header */}
      <div className="border-b border-border/50 bg-bg-secondary/40 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-base font-semibold text-txt">AI Chat</h1>
        </div>

        {/* Provider Selector */}
        <AIProviderSelector provider={provider} setProvider={setProvider} />
      </div>

      {/* Chat Runtime */}
      <AssistantRuntimeProvider runtime={runtime}>
        <ChatContent copiedId={copiedId} setCopiedId={setCopiedId} />
      </AssistantRuntimeProvider>
    </div>
  );
}
