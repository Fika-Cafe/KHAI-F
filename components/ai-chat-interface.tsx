"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, FileText, LinkIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    id: string;
    title: string;
    type: "document" | "link";
  }>;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello! I'm your AI knowledge assistant. I can help you find information from your company's knowledge base. What would you like to know?",
  },
];

const suggestedQuestions = [
  "What is our onboarding process for new employees?",
  "How do I submit an expense report?",
  "What are the security best practices?",
  "Explain our API authentication system",
];

export function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const webhookUrl = process.env.NEXT_PUBLIC_HOSTEDCHAT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (!webhookUrl) {
        throw new Error("Missing NEXT_PUBLIC_HOSTEDCHAT environment variable");
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMsg =
          (data as any)?.error || `Request failed: ${response.status}`;
        throw new Error(errorMsg);
      }

      const content =
        (data as any)?.content ||
        (data as any)?.message ||
        (data as any)?.response ||
        (typeof data === "string" ? data : null) ||
        "I couldn't find an answer right now.";

      const sources = Array.isArray((data as any)?.sources)
        ? (data as any)?.sources
        : undefined;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content,
        sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          err?.message || "Something went wrong contacting the assistant.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-6 text-foreground" />
          <h1 className="text-3xl font-semibold text-foreground">AI Chat</h1>
        </div>
        <p className="text-muted-foreground">
          Ask questions about your company knowledge base
        </p>
      </div>

      {/* Messages Container */}
      <Card className="flex-1 border-border flex flex-col mb-4 overflow-hidden">
        <CardContent className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] space-y-3",
                    message.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>

                  {message.sources && message.sources.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">
                        Sources:
                      </p>
                      <div className="space-y-2">
                        {message.sources.map((source) => (
                          <div
                            key={source.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-accent/50 border border-border hover:bg-accent transition-colors cursor-pointer"
                          >
                            {source.type === "link" ? (
                              <LinkIcon className="size-4 text-muted-foreground" />
                            ) : (
                              <FileText className="size-4 text-muted-foreground" />
                            )}
                            <span className="text-xs text-foreground">
                              {source.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="size-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="size-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="size-2 bg-muted-foreground rounded-full animate-bounce" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Questions (only show at start) */}
      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-3">
            Suggested questions:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-3 px-4 text-left justify-start text-sm font-normal bg-transparent"
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Textarea
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[60px] max-h-[120px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          className="size-[60px] shrink-0"
          disabled={!input.trim() || isLoading}
        >
          <Send className="size-5" />
        </Button>
      </form>
    </div>
  );
}
