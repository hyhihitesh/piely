"use server";

import crypto from "crypto";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

interface VerifySolanaParams {
    publicKey: string;
    signature: string; // Base58 encoded signature from client
    message: string;   // The raw message string signed by the user
}

// Deterministic salt for Solana identity bridge
const SOLANA_AUTH_SECRET = "piely_architect_secure_salt_v1";

export async function verifySolanaLogin({ publicKey, signature, message }: VerifySolanaParams) {
    try {
        const signatureBytes = bs58.decode(signature);
        const publicKeyBytes = bs58.decode(publicKey);
        const messageBytes = new TextEncoder().encode(message);

        const verified = nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            publicKeyBytes
        );

        if (!verified) {
            return { error: "Signature verification failed" };
        }

        // Verification Successful!
        const supabase = await createClient(); // Context-aware client (sets cookies)

        // Admin client for privileged operations (bypassing email confirmation)
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const email = `${publicKey}@solana.piely.app`;

        // Deterministic password based on public key and server secret
        // Hash it to ensure it stays within 72 char limit (SHA-256 hex is 64 chars)
        const rawPassword = `${publicKey}_${SOLANA_AUTH_SECRET}`;
        const password = crypto.createHash('sha256').update(rawPassword).digest('hex');

        // 1. Try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        // 2. Handle Errors
        if (signInError) {

            // CASE A: User exists but email not confirmed (Common when dashboard requires confirmation)
            if (signInError.code === "email_not_confirmed") {
                // Find user ID to confirm them directly
                const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

                if (listError) console.error("Admin: List users error", listError);

                // Supabase stores emails in lowercase, but our generated email might have mixed case public key
                const userToConfirm = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

                if (userToConfirm) {
                    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userToConfirm.id, {
                        email_confirm: true
                    });

                    if (updateError) console.error("Admin: Update user error", updateError);

                    // Retry Sign In
                    const repost = await supabase.auth.signInWithPassword({ email, password });
                    if (repost.error) {
                        console.error("Admin: Retry login failed", repost.error);
                        throw repost.error;
                    }

                    revalidatePath("/", "layout");
                    return { success: true, user: repost.data.user };
                }
            }

            // CASE B: User doesn't exist ("Invalid login credentials")
            if (signInError.message.includes("Invalid login credentials")) {
                // Create pre-confirmed user via Admin API
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { data: _newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email,
                    password,
                    email_confirm: true, // Bypass confirmation
                    user_metadata: {
                        wallet_address: publicKey,
                        auth_method: "solana"
                    }
                });

                if (createError) throw createError;

                // Sign In to set session cookies
                const repost = await supabase.auth.signInWithPassword({ email, password });
                if (repost.error) throw repost.error;

                revalidatePath("/", "layout");
                return { success: true, user: repost.data.user };
            }

            throw signInError;
        }

        revalidatePath("/", "layout");
        return { success: true, user: signInData.user };

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Verification process failed';
        console.error("Solana Verification Error:", error);
        return { error: errorMessage };
    }
}
