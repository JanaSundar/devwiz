"use client";

import { Send } from "lucide-react";
import {
  useRef,
  useState,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-expand textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="flex items-end gap-2 p-4 bg-bg-primary border-t border-border rounded-lg">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 min-h-10 max-h-32 p-3 rounded-lg border border-input bg-bg-secondary text-sm resize-none outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
        rows={1}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="flex-shrink-0 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <Send size={20} />
      </button>
    </div>
  );
}
