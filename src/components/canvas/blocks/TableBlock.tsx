import React from "react";
import { TableBlock as TableBlockType } from "@/lib/os-blocks";

// Removed Shadcn imports to ensure stability
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"; 

interface TableBlockProps {
    block: TableBlockType;
}

export function TableBlock({ block }: TableBlockProps) {
    const { title, columns, data } = block;

    if (!columns || !data || data.length === 0) {
        return (
            <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm h-full flex items-center justify-center text-muted-foreground text-sm">
                No table data available
            </div>
        );
    }

    const formatValue = (value: unknown, format?: string | null) => {
        if (value === null || value === undefined) return "-";
        if (format === "currency" && typeof value === 'number') return `$${value.toLocaleString()}`;
        if (format === "percent") return `${value}%`;
        return String(value);
    };

    return (
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm h-full overflow-hidden flex flex-col">
            {title && <h4 className="text-sm font-medium mb-3">{title}</h4>}
            <div className="flex-1 overflow-auto -mx-4 px-4">
                {/* Simple Table Implementation */}
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-xs uppercase text-muted-foreground bg-muted/50 sticky top-0 font-display tracking-wider">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className="px-5 py-4 font-medium text-left">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-muted/50 transition-colors">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-5 py-4 align-top border-b border-border/50">
                                        {formatValue(row[col.key], col.format)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
