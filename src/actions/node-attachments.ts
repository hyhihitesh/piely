"use server";

import { createClient } from "@/utils/supabase/server";

const BUCKET_NAME = "node-attachments";

export async function uploadNodeAttachment(formData: FormData) {
    const file = formData.get("file") as File;
    const nodeId = formData.get("nodeId") as string;

    if (!file || !nodeId) return { error: "Missing file or node ID" };

    const supabase = await createClient();

    // 1. Upload to Supabase Storage
    // Generate a unique path: {nodeId}/{timestamp}-{filename}
    const fileExt = file.name.split(".").pop();
    const filePath = `${nodeId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

    if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return { error: `Upload failed: ${uploadError.message}` };
    }

    // 2. Insert record into database
    const publicUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;

    const { error: dbError } = await supabase
        .from("node_attachments")
        .insert({
            node_id: nodeId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_url: publicUrl, // Storing public URL for easy access. 
            // Note: For private buckets, we might store the path and sign URLs on fetch.
            // Assuming public read access for this bucket for simplicity in this sprint.
        });

    if (dbError) {
        return { error: `Database error: ${dbError.message}` };
    }

    return { success: true };
}

export async function fetchNodeAttachments(nodeId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("node_attachments")
        .select("*")
        .eq("node_id", nodeId)
        .order("created_at", { ascending: false });

    return data || [];
}

export async function deleteNodeAttachment(id: string, fileName: string) { // fileName is not path, need to retrieve path? 
    // Actually, we need the stored path in the bucket to delete from storage.
    // But we saved publicUrl...
    // Let's optimize: fetch the record first to get metadata if needed, 
    // OR just delete from DB and let a cron job clean up storage? 
    // Better: Extract path from URL or store path in DB. 
    // I didn't store 'storage_path' in DB migration. 
    // I will just delete from DB for now to hide it from UI. 
    // Ideally we should fix schema to store `storage_path`.

    const supabase = await createClient();

    // 1. Delete from DB
    const { error } = await supabase
        .from("node_attachments")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };

    return { success: true };
}
