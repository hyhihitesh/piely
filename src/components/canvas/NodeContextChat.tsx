"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { fetchNodeChatHistory } from "@/actions/node-chat";
import { getTextFromMessageParts } from "@/utils/ai";

interface NodeContextChatProps {
    nodeId: string;
    nodeTitle: string;
    nodeDescription: string;
    projectId: string;
}

// Simple message type for display
interface DisplayMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export function NodeContextChat({ nodeId, nodeTitle, nodeDescription, projectId }: NodeContextChatProps) {
    const [historyMessages, setHistoryMessages] = useState<DisplayMessage[]>([]);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [chatInput, setChatInput] = useState("");

    // Use chat hook with id and body options only (ai-sdk v4 pattern)
    const { messages, sendMessage, status } = useChat({
        id: `node-chat-${nodeId}`,
        // Note: SDK v4 uses a different method for API routes
        // The route is inferred or set via fetch options
    });

    const isLoading = status === "streaming" || status === "submitted";

    // Load history when node changes
    useEffect(() => {
        let isMounted = true;

        async function loadHistory() {
            setHistoryLoaded(false);
            const history = await fetchNodeChatHistory(nodeId);
            if (isMounted) {
                // Convert to display format
                setHistoryMessages(history.map(m => ({
                    id: m.id,
                    role: m.role,
                    content: m.parts[0]?.text || ""
                })));
                setHistoryLoaded(true);
            }
        }

        loadHistory();

        return () => { isMounted = false; };
    }, [nodeId]);

    // Convert SDK messages to display format
    const sdkDisplayMessages: DisplayMessage[] = messages.map(m => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: getTextFromMessageParts(m)
    }));

    // Combine history and SDK messages for display
    const allMessages: DisplayMessage[] = [
        ...historyMessages,
        ...sdkDisplayMessages
    ];

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [allMessages.length]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isLoading) return;

        // Include context via options body
        await sendMessage(
            { parts: [{ type: "text", text: chatInput }] },
            {
                body: {
                    nodeId,
                    nodeTitle,
                    nodeDescription,
                    projectId
                }
            }
        );
        setChatInput("");
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!historyLoaded && (
                    <div className="text-center text-muted-foreground py-4">
                        <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                        Loading chat history...
                    </div>
                )}

                {historyLoaded && allMessages.length === 0 && (
                    <div className="text-center text-muted-foreground py-12 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-primary" />
                        </div>
                        <div className="max-w-[80%] text-sm">
                            I&apos;m your <strong>{nodeTitle}</strong> expert. Ask me to draft content, suggest strategies, or explain technical details!
                        </div>
                    </div>
                )}

                {allMessages.map((m) => (
                    <div
                        key={m.id}
                        className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                        <Avatar className="w-8 h-8">
                            <AvatarFallback className={m.role === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-primary/10 text-primary'}>
                                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </AvatarFallback>
                        </Avatar>
                        <div
                            className={`rounded-lg p-3 text-sm max-w-[85%] ${m.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-muted text-foreground"
                                }`}
                        >
                            <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, "<br/>") }} />
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary/10">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg p-3 text-sm text-foreground/50 italic">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`Ask about ${nodeTitle}...`}
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !chatInput.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
