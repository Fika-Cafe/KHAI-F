"use client";

import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/dashboard-layout";

const ChatInterface = dynamic(
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
