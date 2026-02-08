"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

export function QuickStartInput() {
    const router = useRouter();
    const [idea, setIdea] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!idea.trim() || isLoading) return;

        setIsLoading(true);

        // Save to localStorage for OnboardingPage to pick up
        localStorage.setItem("piely_startup_idea", idea);
        // Clean any previous stage/messages to ensure fresh start
        localStorage.removeItem("piely_startup_stage");
        localStorage.removeItem("piely_onboarding_messages");

        // Delay slightly for UX feedback
        setTimeout(() => {
            router.push("/onboarding");
        }, 500);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-xl">
            <div className="relative group">
                <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-orange-500 to-blue-600 opacity-20 group-hover:opacity-40 transition duration-300 blur" />
                <div className="relative flex items-center bg-background border border-border rounded-lg shadow-sm">
                    <div className="pl-4 text-muted-foreground">
                        <Sparkles className="w-5 h-5 text-orange-500" />
                    </div>
                    <input
                        className="flex-1 bg-transparent px-4 py-4 outline-none text-base sm:text-lg font-medium placeholder:text-muted-foreground/70"
                        placeholder="What do you want to build today?"
                        aria-label="Enter your startup idea"
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!idea.trim() || isLoading}
                        aria-label="Submit idea"
                        className="mr-2 p-3 rounded-md bg-orange-600 hover:bg-orange-700 text-white transition-all disabled:opacity-50 disabled:grayscale cursor-pointer"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 block border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <ArrowRight className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 pl-1">
                Press <kbd className="font-mono bg-muted px-1 rounded text-[10px]">Enter</kbd> to launch the AI Architect
            </p>
        </form>
    );
}
