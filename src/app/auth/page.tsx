"use client";

import { useEffect, useState, useActionState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { login, signup, loginWithOAuth } from "@/actions/auth";

import { verifySolanaLogin } from "@/actions/solana-auth";
import bs58 from "bs58";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

function AuthPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [idea, setIdea] = useState<string | null>(null);
    const { connected, publicKey, signMessage } = useWallet();
    const { setVisible } = useWalletModal(); // Modal Control
    const [mode, setMode] = useState<"login" | "signup">("login");

    // Server Actions Hooks - Disabling lint for unused state vars that are needed for form patterns
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_state, formAction, isPending] = useActionState(login, null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_signupState, signupAction] = useActionState(signup, null);

    const [mounted, setMounted] = useState(false);

    // Determine redirect destination
    const intent = searchParams.get("intent");
    const nextUrl = (intent === "onboarding_complete" || intent === "build")
        ? "/onboarding"
        : searchParams.get("next") || "/dashboard";

    useEffect(() => {
        // Separate the mounted state from data fetching to avoid warnings
        const storedIdea = localStorage.getItem("piely_startup_idea");
        if (storedIdea) {
            setIdea(storedIdea);
        }
        setMounted(true);
    }, []);

    const handleGoogleLogin = async () => {
        await loginWithOAuth("google", nextUrl);
    };

    const handleSolanaSignIn = async () => {
        if (!connected || !publicKey || !signMessage) return;

        try {
            const message = new TextEncoder().encode(
                `Sign in to Piely with Solana\nWallet: ${publicKey.toBase58()}\nTimestamp: ${Date.now()}`
            );

            const signature = await signMessage(message);

            // Send to backend for verification
            const serializedSignature = bs58.encode(signature);
            const serializedMessage = new TextDecoder().decode(message);

            const result = await verifySolanaLogin({
                publicKey: publicKey.toBase58(),
                signature: serializedSignature,
                message: serializedMessage
            });

            if (result.success) {
                // Determine destination based on if we have a project staged
                router.push(nextUrl);
            } else {
                alert("Verification Failed: " + result.error);
            }


        } catch {
            // Silently fail or handled by UI
        }

    };



    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground">
            {/* ... (Keep Left Panel) ... */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-gray-50 dark:bg-zinc-900 border-r border-border relative overflow-hidden">
                {/* ... (Keep Background & Branding) ... */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, gray 1px, transparent 0)`,
                        backgroundSize: `24px 24px`
                    }}
                />

                <div className="z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-6 h-6 bg-foreground rounded-sm" />
                        <span className="font-heading font-bold text-xl tracking-tight">Piely</span>
                    </div>

                    <h2 className="text-4xl font-heading font-semibold leading-tight mb-4">
                        {idea ? (
                            <>
                                Let&apos;s build <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-blue-600">
                                    {idea}
                                </span>
                            </>
                        ) : (
                            "Architect your next big thing."
                        )}
                    </h2>
                    <p className="text-muted-foreground font-light max-w-md">
                        Join 10,000+ founders using Ghost Nodes to validate, build, and scale their SaaS.
                    </p>
                </div>

                <div className="z-10">
                    <div className="p-6 bg-background rounded-lg border border-border shadow-sm max-w-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold">Secure Workspace</div>
                                <div className="text-xs text-muted-foreground">End-to-end encrypted</div>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-orange-500 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: The Gate */}
            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h1 className="text-2xl font-bold font-heading">Sign in to your account</h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            {intent === 'onboarding_complete' ? (
                                <span className="text-orange-600 font-medium">Save your project to continue.</span>
                            ) : (
                                "Start your intelligent building journey."
                            )}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Web2: Google */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-border text-foreground py-2.5 rounded-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all font-medium shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Web3: Solana */}
                        {/* Web3: Solana Unified Button */}
                        <div className="w-full flex justify-center">
                            {mounted && (
                                <button
                                    onClick={() => {
                                        if (connected) {
                                            handleSolanaSignIn();
                                        } else {
                                            setVisible(true);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-[#9945FF] text-white py-2.5 rounded-sm hover:bg-[#7c37cc] transition-all font-medium shadow-sm transition-transform active:scale-[0.98]"
                                >
                                    <svg viewBox="0 0 397 311" className="w-4 h-4 fill-current">
                                        <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7zm0-160c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7zm325.9-81.8l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1z" />
                                    </svg>
                                    {connected ? "Verify & Sign In" : "Connect Wallet"}
                                </button>
                            )}
                        </div>

                        {/* Hidden Standard Button to keep Adapter Logic happy if needed, but usually Provider handles it */}
                        {/* We use useWalletModal so we don't need the default button visible */}

                        {connected && (
                            <div className="text-center text-xs text-green-600 font-medium animate-in fade-in slide-in-from-top-2 flex items-center justify-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)} connected
                            </div>
                        )}

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                            </div>
                        </div>

                        <form action={formAction} className="space-y-4">
                            <input type="hidden" name="next" value={nextUrl} />
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Email address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-mono text-sm"
                                    placeholder="name@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-mono text-sm"
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Mode Toggle (Login vs Signup) */}
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white py-2.5 rounded-sm hover:bg-orange-700 transition-colors font-medium shadow-sm concept-border border-transparent"
                                    onClick={() => setMode("login")}
                                >
                                    {isPending && mode === "login" ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-1 flex items-center justify-center gap-2 bg-background border border-border text-foreground py-2.5 rounded-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors font-medium shadow-sm"
                                    formAction={signupAction}
                                    onClick={() => setMode("signup")}
                                >
                                    {isPending && mode === "signup" ? (
                                        <span className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                                    ) : (
                                        "Sign Up"
                                    )}
                                </button>
                            </div>
                            {/* State handling temporarily disabled - actions redirect on success */}
                            {/* {state?.error && (
                                <p className="text-red-500 text-sm text-center">{state.error}</p>
                            )}
                            {signupState?.success && (
                                <p className="text-green-500 text-sm text-center">{signupState.success}</p>
                            )}
                            {signupState?.error && (
                                <p className="text-red-500 text-sm text-center">{signupState.error}</p>
                            )} */}
                        </form>
                    </div>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <a href="#" className="underline underline-offset-4 hover:text-primary">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="underline underline-offset-4 hover:text-primary">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground">
                <div className="hidden lg:flex flex-col justify-between p-12 bg-gray-50 dark:bg-zinc-900 border-r border-border relative overflow-hidden">
                    <div className="absolute inset-0 bg-gray-100/50 animate-pulse" />
                </div>
                <div className="flex items-center justify-center p-8">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        }>
            <AuthPageContent />
        </Suspense>
    );
}
