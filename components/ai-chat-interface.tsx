"use client";

import { useEffect } from "react";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";

export default function ChatInterface() {
  useEffect(() => {
    const chatApp = createChat({
      webhookUrl: `${process.env.NEXT_PUBLIC_HOSTEDCHAT}`,
      webhookConfig: {
        method: "POST",
        headers: {},
      },
      target: "#n8n-chat",
      mode: "fullscreen",
      showWindowCloseButton: false,
      chatInputKey: "chatInput",
      chatSessionKey: "sessionId",
      loadPreviousSession: true,
      metadata: {},
      showWelcomeScreen: false,
      defaultLanguage: "en",
      initialMessages: [
        "My name is KHAI. How can I assist you today?",
      ],
      i18n: {
        en: {
          title: "KnowledgeHub AI Assistant",
          subtitle: "this is our personal assistant, feel free to ask me anything about the company documentation",
          footer: "powered by KnowledgeHub AI",
          getStarted: "New Conversation",
          inputPlaceholder: "Type your question..",
          closeButtonTooltip: "Close chat and return to the dashboard",
        },
      },
      enableStreaming: true,
    });

    const container = document.getElementById("n8n-chat");
    if (container) {
      container.style.height = "100%";
    }

    return () => {
      if (container) {
        container.innerHTML = "";
      }
      (chatApp as unknown as { unmount?: () => void })?.unmount?.();
    };
  }, []);

  return (
    <section className="h-[calc(100vh-140px)] min-h-[600px] w-full overflow-hidden rounded-xl border border-border bg-card shadow">
      <div className="flex h-full flex-col">

        <div id="n8n-chat" className="flex-1 bg-background/60" />
      </div>
    </section>
  );
}
