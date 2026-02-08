import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { generatePseudonym } from "@/utils/names";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/layout/UserMenu";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PielyLogo } from "@/components/ui/PielyLogo";

interface AppHeaderProps {
    user: User;
    variant?: "default" | "overlay";
    className?: string;
    breadcrumb?: {
        title: string;
        href?: string;
    };
}

export function AppHeader({ user, variant = "default", className, breadcrumb }: AppHeaderProps) {
    const pseudonym = generatePseudonym(user.id);
    const isOverlay = variant === "overlay";

    return (
        <header
            className={cn(
                "w-full h-16 flex items-center justify-between px-6 z-50",
                isOverlay
                    ? "fixed top-0 left-0 bg-transparent pointer-events-none"
                    : "sticky top-0 border-b border-border bg-gray-50/50 dark:bg-zinc-900/50 backdrop-blur-sm",
                className
            )}
        >
            {/* Left: Brand & Breadcrumbs */}
            <div className={cn("flex items-center gap-4", isOverlay && "pointer-events-auto")}>
                <Link href="/dashboard" className="flex items-center gap-2.5 group">
                    <PielyLogo size={36} className="group-hover:opacity-80 transition-opacity" />
                    <span className="font-heading font-bold text-lg tracking-tight text-foreground">Piely</span>
                </Link>

                {breadcrumb && (
                    <>
                        <span className="text-muted-foreground/40 text-lg font-light">/</span>
                        <div className="flex items-center gap-2">
                            {/* Small dot to indicate project */}
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50" />
                            {breadcrumb.href ? (
                                <Link href={breadcrumb.href} className="font-medium text-sm hover:underline underline-offset-4">
                                    {breadcrumb.title}
                                </Link>
                            ) : (
                                <span className="font-medium text-sm text-foreground/80">
                                    {breadcrumb.title}
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Right: Theme Toggle & User */}
            <div className={cn("flex items-center gap-3", isOverlay && "pointer-events-auto")}>
                <ThemeToggle />
                <UserMenu user={user} pseudonym={pseudonym} />
            </div>
        </header>
    );
}
