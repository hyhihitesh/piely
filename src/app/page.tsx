"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles, Box, Layers, Zap } from "lucide-react";
import { PielyLogo } from "@/components/ui/PielyLogo";
import { createClient } from "@/utils/supabase/client";

export default function LandingPage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Check if user is signed in
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsSignedIn(!!user);
    };
    checkAuth();
  }, []);

  const handleStart = () => {
    if (!idea.trim()) return;

    // The "Commitment Hook" 🪝
    // Save the specific idea to guide the Onboarding AI later.
    if (typeof window !== "undefined") {
      localStorage.setItem("piely_startup_idea", idea);
    }

    router.push("/auth?intent=build");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleStart();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">

      {/* Landing Header */}
      <header className="w-full h-16 flex items-center justify-between px-6 z-50">
        <Link href="/" className="flex items-center gap-2.5 group">
          <PielyLogo size={36} className="group-hover:opacity-80 transition-opacity" />
          <span className="font-heading font-bold text-lg tracking-tight text-foreground">Piely</span>
        </Link>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-foreground text-background rounded-md font-medium text-sm hover:bg-foreground/90 transition-colors flex items-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/auth"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center relative">

        {/* Background Grid (Technical / Blueprint feel) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 dark:bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)]" />

        <div className="z-10 w-full max-w-3xl px-6 flex flex-col items-center text-center space-y-8">

          {/* Badge */}
          <div className="concept-border rounded-full px-4 py-1.5 bg-background/50 backdrop-blur-sm">
            <span className="text-xs font-mono tracking-wider font-medium text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              V2.0 // SYSTEM ARCHITECT
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight leading-[1.1]">
            Your Startup, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-blue-600">
              Architected by AI.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-light leading-relaxed">
            From generic idea to executable roadmap. Use the <span className="font-medium text-foreground">Ghost Node</span> engine to validate, plan, and launch your SaaS.
          </p>

          {/* The "Input Hook" */}
          <div
            className={`
            w-full max-w-lg mt-8 relative group transition-all duration-300
            ${isFocused ? "scale-[1.02]" : "scale-100"}
          `}
          >
            <div className={`
            absolute -inset-0.5 rounded-lg bg-gradient-to-r from-orange-500 to-blue-600 opacity-20 blur group-hover:opacity-40 transition duration-500
            ${isFocused ? "opacity-60 blur-md" : ""}
          `} />

            <div className="relative flex items-center bg-background rounded-lg border border-border shadow-sm p-2">
              <div className="pl-4 pr-3 text-muted-foreground">
                <Sparkles className="w-5 h-5 text-orange-500" />
              </div>
              <input
                type="text"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="I want to build..."
                aria-label="Enter your startup idea"
                className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50 py-3 font-medium"
                autoFocus
              />
              <button
                onClick={handleStart}
                disabled={!idea.trim()}
                aria-label="Start building your startup"
                className={`
                px-6 py-3 rounded-md font-medium text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer
                ${idea.trim()
                    ? "bg-foreground text-background hover:bg-foreground/90 shadow-md translate-x-0 opacity-100"
                    : "bg-muted text-muted-foreground cursor-not-allowed translate-x-2 opacity-0 w-0 px-0 overflow-hidden"
                  }
              `}
              >
                Start Building
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Technical Footer / Feature Grid */}
          <div className="mt-20 pt-10 border-t border-border w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { icon: Box, title: "Structured OS", desc: "Financials, GTM, and Pitch Decks generated instantly." },
              { icon: Zap, title: "Ghost Nodes", desc: "Autonomous agents that research competitors for you." },
              { icon: Layers, title: "Project Scoping", desc: "A tailored workspace that evolves with your stage." }
            ].map((feature, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center gap-3 mb-2">
                  <feature.icon className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                  <h3 className="font-semibold text-sm font-heading">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
