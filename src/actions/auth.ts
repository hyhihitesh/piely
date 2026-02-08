"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signOutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
}

export async function login(prevState: unknown, formData: FormData) {
    const supabase = await createClient();
    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
        // Return state for useActionState to display
        return { error: error.message };
    }
    redirect("/dashboard");
}

export async function signup(prevState: unknown, formData: FormData) {
    const supabase = await createClient();
    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };
    const { error } = await supabase.auth.signUp(data);
    if (error) {
        return { error: error.message };
    }
    // Success but usually requires email confirmation
    return { success: "Account created! Please check your email to confirm." };
}

export async function loginWithOAuth(provider: "google", nextUrl?: string) {
    const supabase = await createClient();
    const redirectTo = nextUrl
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(nextUrl)}`
        : `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo,
        },
    });

    if (error) {
        throw error;
    }

    if (data.url) {
        redirect(data.url);
    }
}
