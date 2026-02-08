"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Project Error:", error);
    }, [error]);

    return (
        <div className="h-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold font-heading mb-2">Project Canvas Error</h2>
            <p className="text-muted-foreground max-w-md mb-8">
                We encountered an issue rendering this project roadmap. This might be a temporary glitch or a network issue.
            </p>

            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default" className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/dashboard" className="gap-2">
                        <Home className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <div className="mt-12 text-xs text-muted-foreground/50 font-mono">
                Error Digest: {error.digest || "Unknown"}
            </div>
        </div>
    );
}
