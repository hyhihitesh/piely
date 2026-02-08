import { RotatingStatus } from "@/components/ui/RotatingStatus";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header Skeleton */}
            <header className="border-b border-border bg-gray-50/50 dark:bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-600 rounded-sm opacity-50" />
                        <span className="font-heading font-bold text-lg tracking-tight opacity-50">Piely</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="bg-card border border-border rounded-xl p-12 shadow-sm flex flex-col items-center gap-6 max-w-md w-full text-center">
                    <RotatingStatus className="scale-110" />
                    <p className="text-muted-foreground text-sm font-mono animate-pulse">
                        Loading your portfolio...
                    </p>
                </div>
            </main>
        </div>
    );
}
