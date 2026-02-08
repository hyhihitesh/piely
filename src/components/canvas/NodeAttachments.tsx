"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Upload, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadNodeAttachment, fetchNodeAttachments, deleteNodeAttachment } from "@/actions/node-attachments";

interface NodeAttachmentsProps {
    nodeId: string;
}

interface Attachment {
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
    created_at: string;
}

export function NodeAttachments({ nodeId }: NodeAttachmentsProps) {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadAttachments();
    }, [nodeId]);

    async function loadAttachments() {
        setIsLoading(true);
        const data = await fetchNodeAttachments(nodeId);
        setAttachments(data);
        setIsLoading(false);
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("nodeId", nodeId);

        const result = await uploadNodeAttachment(formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("File uploaded successfully");
            loadAttachments();
        }
        setIsUploading(false);
        // Reset input
        e.target.value = "";
    }

    async function handleDelete(id: string, path: string) {
        if (!confirm("Are you sure you want to delete this file?")) return;

        const result = await deleteNodeAttachment(id, path);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("File deleted");
            loadAttachments();
        }
    }

    function formatSize(bytes: number) {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-muted/20">
                <label htmlFor="file-upload" className="cursor-pointer">
                    <div className={`flex items-center justify-center gap-2 w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:bg-muted/50 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        {isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                            <Upload className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium text-muted-foreground">
                            {isUploading ? "Uploading..." : "Upload File (PDF, IMG, DOC)"}
                        </span>
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={isUploading}
                        />
                    </div>
                </label>
            </div>

            <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : attachments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No attachments yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {attachments.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 rounded-md bg-card border shadow-sm group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{file.file_name}</p>
                                        <p className="text-xs text-muted-foreground">{formatSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                        <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(file.id, file.file_name)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
