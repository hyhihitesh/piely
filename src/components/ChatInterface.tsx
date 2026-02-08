"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Sparkles, Plus, MessageCircle, X } from "lucide-react";
import { createAINode, AINodeData } from "@/actions/create-ai-node";
import { RoadmapResponse } from "@/lib/roadmapTypes";

interface ChatInterfaceProps {
  idea: string;
  roadmap: RoadmapResponse | null;
  projectId: string;
  currentStage?: string;
  onNodeCreated?: (nodeId: string) => void;
  onRoadmapUpdate?: (roadmap: RoadmapResponse) => void;
  onAction?: (action: string) => void;
  initialMessages?: unknown[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  nodeCreated?: boolean;
}

export function ChatInterface({
  idea,
  roadmap,
  projectId,
  currentStage = "validation",
  onNodeCreated,
  onRoadmapUpdate,
  onAction,
  initialMessages = [],
}: ChatInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the canvas mode API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "canvas",
          messages: [{ role: "user", content: userMessage.content }],
          context: { idea, stage: currentStage },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const result = await response.json();

      // If AI decided to create a node
      if (result.shouldCreateNode && result.node !== null) {
        const nodeData: AINodeData = {
          title: result.node.title,
          description: result.node.description,
          type: result.node.type,
          stageId: currentStage,
        };

        // Create the node via server action
        startTransition(async () => {
          const createResult = await createAINode(projectId, nodeData);

          if (createResult.success && createResult.nodeId) {
            onNodeCreated?.(createResult.nodeId);

            // Add success message with node creation indicator
            const successMessage: ChatMessage = {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: `✨ **${result.node.title}** added to canvas!\n\n${result.confirmation}`,
              nodeCreated: true,
            };
            setMessages((prev) => [...prev, successMessage]);
          } else {
            // Node creation failed
            const errorMessage: ChatMessage = {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: `I tried to create "${result.node.title}" but encountered an error. ${result.confirmation}`,
            };
            setMessages((prev) => [...prev, errorMessage]);
          }
        });
      } else {
        // Just a regular response, no node created
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.confirmation,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isProcessing = isLoading || isPending;

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:shadow-xl hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Add to Canvas
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-orange-500/10 to-blue-500/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-blue-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-medium block">Piely Architect</span>
                  <span className="text-[10px] text-muted-foreground">Tell me what to add to your blueprint</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition p-1 rounded-md hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-3 p-4 h-[350px] overflow-y-auto bg-background/50 backdrop-blur-sm">
              {messages.length === 0 && (
                <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                  <p className="text-center">
                    Describe a feature, module, or milestone to add to your canvas.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Add user authentication",
                      "Build payment system",
                      "Create landing page",
                      "Set up analytics",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="text-left px-3 py-2 rounded-lg border border-border hover:bg-muted hover:border-orange-500/50 transition-all text-xs"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${message.role === "user"
                      ? "bg-foreground text-background"
                      : message.nodeCreated
                        ? "bg-gradient-to-r from-orange-500/10 to-green-500/10 border border-green-500/30 text-foreground"
                        : "bg-muted border border-border text-foreground"
                      }`}
                  >
                    {message.content}
                  </div>
                  {message.nodeCreated && (
                    <span className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Node added to canvas
                    </span>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-muted border border-border text-foreground rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-orange-500 animate-spin" />
                    <span className="text-muted-foreground">Creating node...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 bg-muted/20">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add user authentication, payment flow, analytics..."
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none transition-all"
                  rows={1}
                  disabled={isProcessing}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isProcessing}
                  className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
