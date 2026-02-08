import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="concept-border bg-muted/20 backdrop-blur-md p-8 rounded-2xl flex flex-col items-center max-w-md w-full text-center space-y-6">

                {/* Animated Brand Element */}
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <div className="relative bg-background p-4 rounded-xl border border-border shadow-lg">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-heading font-semibold">Initializing Architect Interface...</h2>
                    <p className="text-muted-foreground text-sm">
                        Preparing your secure workspace and creating session context.
                    </p>
                </div>

                {/* Fake Code Loader */}
                <div className="w-full bg-black/50 rounded-lg p-3 font-mono text-xs text-left text-green-400 overflow-hidden">
                    <div className="animate-pulse space-y-1 opacity-70">
                        <div>&gt; establish_secure_link()</div>
                        <div>&gt; load_modules(CORE)</div>
                        <div>&gt; verify_identity_token... OK</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
