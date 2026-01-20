"use client";

import nextDynamic from "next/dynamic";
import { DashboardLayout } from "@/components/dashboard-layout";

const ChatInterface = nextDynamic(
  () => import("@/components/ai-chat-interface"),
  { ssr: false, loading: () => <div>Loading chat...</div> }
);

export default function ChatPage() {
  return (
    <DashboardLayout>
      <ChatInterface />
    </DashboardLayout>
  );
}
