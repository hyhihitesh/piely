
import React from 'react';
import { TableBlock as TableBlockType } from '@/lib/os-blocks';

export function TableBlock({ block }: { block: TableBlockType }) {
    const { title, columns, data } = block;

    const formatValue = (value: unknown, format?: string): string | number => {
        if (value === null || value === undefined) return '-';

        switch (format) {
            case 'currency':
                return typeof value === 'number'
                    ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                    }).format(value)
                    : String(value);
            case 'percent':
                return typeof value === 'number' ? `${value}%` : String(value);
            case 'number':
                return typeof value === 'number'
                    ? new Intl.NumberFormat('en-US').format(value)
                    : String(value);
            default:
                return typeof value === 'string' || typeof value === 'number'
                    ? value
                    : String(value);
        }
    };

    // Guard against null/empty columns or data
    if (!columns || !data || columns.length === 0 || data.length === 0) {
        return (
            <div className="p-6 rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 backdrop-blur-md text-center text-gray-500">
                No table data available
            </div>
        );
    }

    return (
        <div className="p-6 rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 backdrop-blur-md overflow-hidden">
            {title && (
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    {title}
                </h3>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className="px-6 py-3 font-medium tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                        {formatValue(row[col.key], col.format ?? undefined)}
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
