import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
            <div className="concept-border p-8 rounded-2xl bg-muted/20 backdrop-blur-md max-w-sm w-full">
                <h2 className="text-4xl font-bold font-heading mb-2">404</h2>
                <p className="text-sm font-mono text-orange-500 mb-4 tracking-widest uppercase">Node Not Found</p>
                <p className="text-muted-foreground mb-8 text-sm">
                    The coordinate you&apos;re looking for doesn&apos;t exist in this roadmap.
                </p>
                <Link
                    href="/"
                    className="inline-block w-full py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-all font-mono text-sm"
                >
                    RESET_POSITION
                </Link>
            </div>
        </div>
    );
}
