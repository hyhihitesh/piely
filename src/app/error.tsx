"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
            <div className="concept-border p-8 rounded-2xl bg-muted/20 backdrop-blur-md max-w-md w-full">
                <h2 className="text-2xl font-bold font-heading mb-4">Something went wrong!</h2>
                <p className="text-muted-foreground mb-8">
                    The system encountered an unexpected architecting error. Don&apos;t worry, your progress is safe.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="w-full py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-all font-mono text-sm"
                    >
                        RETRY_SYSTEM_INIT()
                    </button>
                    <Link
                        href="/"
                        className="w-full py-3 border border-border rounded-lg font-medium hover:bg-muted transition-all font-mono text-sm"
                    >
                        RETURN_TO_DASHBOARD
                    </Link>
                </div>
            </div>
        </div>
    );
}
