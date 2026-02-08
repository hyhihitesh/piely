
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MarkdownBlock } from '@/lib/os-blocks';

export function ContentBlock({ block }: { block: MarkdownBlock }) {
    return (
        <div className="p-6 rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 backdrop-blur-md">
            {block.title && (
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    {block.title}
                </h3>
            )}
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{block.content}</ReactMarkdown>
            </div>
        </div>
    );
}
