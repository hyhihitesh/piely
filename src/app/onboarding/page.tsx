"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { getTextFromMessageParts } from "@/utils/ai";
import { STAGES, StartupStage } from "@/lib/stages";
import { createProject } from "@/actions/create-project";
import { RotatingStatus } from "@/components/ui/RotatingStatus";



export default function OnboardingPage() {
    const router = useRouter();
    const [idea, setIdea] = useState<string | null>(null);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const hasStartedRef = useRef(false);

    // We use Vercel AI SDK's useChat hook
    // Stable configuration for the hook
    const { messages, sendMessage, status } = useChat({
        id: "onboarding-chat",
        onFinish: ({ message }) => {
            // Check if the AI decided the stage (hidden JSON block)
            try {
                const content = getTextFromMessageParts(message);
                if (!content) return;

                const match = content.match(/\{[\s\S]*?"stage":\s*"(validation|build|growth)"[\s\S]*?\}/);
                if (match) {
                    const jsonStr = match[0];
                    const data = JSON.parse(jsonStr);
                    completeOnboarding(data.stage);
                }
            } catch (e) {
                // Not a JSON decision yet
            }
        }
    });

    const isLoading = status === "streaming" || status === "submitted" || isFinalizing;
    const [input, setInput] = useState("");

    const handleCustomSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Pass context via sendMessage options
        await sendMessage(
            { parts: [{ type: "text", text: input }] },
            { body: { mode: "onboarding", context: { idea } } }
        );
        setInput("");
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const completeOnboarding = async (stage: string) => {
        const validStage = (stage === "validation" || stage === "build" || stage === "growth")
            ? stage as StartupStage
            : "validation";

        // Save stage for potential resume after auth redirect
        localStorage.setItem("piely_startup_stage", validStage);

        // Save chat history for resume (in case of auth redirect)
        if (messages.length > 0) {
            localStorage.setItem("piely_onboarding_messages", JSON.stringify(messages));
        }

        // Prepare messages for server: Use current state OR stored state (for rescue flow)
        let messagesToSend = messages;
        if (messages.length === 0) {
            const storedMessages = localStorage.getItem("piely_onboarding_messages");
            if (storedMessages) {
                try {
                    messagesToSend = JSON.parse(storedMessages);
                } catch (e) {
                    console.error("Failed to parse stored messages", e);
                }
            }
        }

        try {
            const project = await createProject(idea || "Untitled", validStage, messagesToSend);
            if (project?.id) {
                // Successful creation! Clear state and move to project
                localStorage.removeItem("piely_startup_stage");
                localStorage.removeItem("piely_onboarding_messages"); // Clean up messages as they are now in DB
                router.push(`/project/${project.id}`);
            }
        } catch (e: unknown) {
            console.error("Project creation failed:", e);

            const errorMessage = e instanceof Error ? e.message : '';
            if (errorMessage.includes("Authentication required")) {
                // Rescue flow: User is not logged in.
                // localStorage is already set, so we can redirect to auth
                router.push("/auth?intent=onboarding_complete");
            }
        }
    };

    useEffect(() => {
        const storedIdea = localStorage.getItem("piely_startup_idea");
        const storedStage = localStorage.getItem("piely_startup_stage");

        if (storedIdea && storedStage && !hasStartedRef.current) {
            hasStartedRef.current = true;
            setIdea(storedIdea);
            setIsFinalizing(true);
            completeOnboarding(storedStage);
            return;
        }

        if (storedIdea && !hasStartedRef.current) {
            hasStartedRef.current = true;
            setIdea(storedIdea);

            // Initial message with context
            sendMessage(
                { parts: [{ type: "text", text: `I want to build: ${storedIdea}. Help me scope this project.` }] },
                { body: { mode: "onboarding", context: { idea: storedIdea } } }
            );
        }
    }, [sendMessage]);


    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground max-w-2xl mx-auto px-6 py-12">

            {/* Header */}
            <div className="flex items-center justify-between mb-12 border-b border-border pb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-mono uppercase tracking-wider">AI Architect</span>
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                    {idea ? `Project: ${idea.substring(0, 20)}...` : "New Project"}
                </div>
            </div>

            {/* Finalizing Overlay */}
            {isFinalizing && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
                    <div className="p-8 bg-gray-50 dark:bg-zinc-900 border border-border rounded-xl shadow-sm">
                        <RotatingStatus />
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">Finalizing your technical blueprint...</p>
                </div>
            )}

            {!isFinalizing && (
                <>
                    {/* Chat Area */}
                    <div className="flex-1 space-y-6 mb-8">
                        {messages.filter((m) => m.role !== 'system').map((m) => {
                            const textContent = getTextFromMessageParts(m);
                            const isJson = /\{[\s\S]*?"stage":\s*"(validation|build|growth)"[\s\S]*?\}/.test(textContent);
                            const cleanText = textContent.replace(/\{[\s\S]*?"stage":\s*"(validation|build|growth)"[\s\S]*?\}/g, "").trim();

                            if (isJson && !cleanText) {
                                return (
                                    <div key={m.id} className="flex justify-start">
                                        <div className="bg-gray-50 dark:bg-zinc-900 border border-border px-4 py-3 rounded-lg">
                                            <RotatingStatus />
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={m.id}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`
                    max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed
                    ${m.role === 'user'
                                                ? 'bg-foreground text-background'
                                                : 'bg-gray-50 dark:bg-zinc-900 border border-border text-foreground'
                                            }
                  `}
                                    >
                                        {cleanText}
                                    </div>
                                </div>
                            );
                        })}
                        {status === "streaming" && (
                            <div className="flex justify-start">
                                <div className="bg-gray-50 dark:bg-zinc-900 border border-border px-4 py-3 rounded-lg">
                                    <RotatingStatus />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleCustomSubmit} className="relative group sticky bottom-12 pt-4 bg-background/80 backdrop-blur-sm">
                        <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-orange-500 to-blue-600 opacity-0 group-focus-within:opacity-20 transition duration-300 blur" />
                        <div className="relative flex items-center bg-background border border-border rounded-lg shadow-sm">
                            <input
                                className="flex-1 bg-transparent px-4 py-3 outline-none text-sm font-medium"
                                placeholder="Type your answer..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="mr-2 p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground transition-colors disabled:opacity-50"
                            >
                                <ArrowUp className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground mt-4 font-mono uppercase tracking-tighter italic">
                            The Architect is calculating...
                        </p>
                    </form>
                </>
            )}
        </div>
    );
}
