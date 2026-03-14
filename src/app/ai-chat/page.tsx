import { ChatClient } from "@/components/ChatClient";

export const metadata = {
  title: "AI Chat",
  description: "Chat with AI powered by multiple providers",
};

export default function AIChatPage() {
  return (
    <div className="w-full h-screen flex flex-col bg-bg-primary">
      <ChatClient />
    </div>
  );
}
