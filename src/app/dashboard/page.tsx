import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Layout, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { QuickStartInput } from "@/components/dashboard/QuickStartInput";

import { AppHeader } from "@/components/layout/AppHeader";

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/auth");
    }

    // Fetch user's projects
    const { data: projects } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <AppHeader user={user} />

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold font-heading">Your Blueprints</h1>
                        <p className="text-muted-foreground mt-1">Manage and evolve your startup architectures.</p>
                    </div>

                    {/* Quick Start Hero */}
                    <div className="bg-card border border-border rounded-xl p-8 shadow-sm bg-gradient-to-br from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950">
                        <h2 className="text-lg font-semibold mb-3 font-heading">Start a new venture</h2>
                        <QuickStartInput />
                    </div>
                </div>

                {projects && projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/project/${project.id}`}
                                className="group block bg-card border border-border rounded-lg p-6 hover:border-orange-500/50 transition-all hover:shadow-lg dark:hover:shadow-orange-900/10 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="w-5 h-5 text-orange-500 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                </div>

                                <div className="mb-4">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-md flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                                        <Layout className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-orange-600 transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2 h-10">
                                        {project.idea_description || "No description provided."}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {project.created_at
                                            ? `Created ${formatDistanceToNow(new Date(project.created_at))} ago`
                                            : "Just now"}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl bg-gray-50/50 dark:bg-zinc-900/50">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                            <Layout className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                        <p className="text-muted-foreground max-w-sm text-center mb-8">
                            Start by architecting your first idea. Our AI will help you build a roadmap in minutes.
                        </p>
                        <Link
                            href="/onboarding"
                            className="bg-foreground text-background px-6 py-3 rounded-md font-medium hover:bg-foreground/90 transition-colors"
                        >
                            Create First Project
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
