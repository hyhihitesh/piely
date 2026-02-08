
import React from 'react';
import { MetricBlock as MetricBlockType } from '@/lib/os-blocks';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export function MetricBlock({ block }: { block: MetricBlockType }) {
    const { label, value, trend, variant } = block;

    const getTrendIcon = (direction: string) => {
        switch (direction) {
            case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
            case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
            default: return <Minus className="w-4 h-4 text-gray-500" />;
        }
    };

    const getTrendColor = (direction: string) => {
        switch (direction) {
            case 'up': return "text-green-500";
            case 'down': return "text-red-500";
            default: return "text-gray-500";
        }
    };

    return (
        <div className={`p-6 rounded-2xl border backdrop-blur-md bg-white/5 dark:bg-black/5 
      ${variant === 'highlight' ? 'border-primary/50 bg-primary/5' : 'border-white/10 dark:border-white/5'}
      hover:border-primary/30 transition-all duration-300 group`}>

            <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                    {label}
                </h3>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor(trend.direction)}`}>
                        {getTrendIcon(trend.direction)}
                        {trend.value}%
                    </div>
                )}
            </div>

            <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {value}
            </div>

            {trend?.label && (
                <p className="mt-2 text-xs text-gray-400">
                    {trend.label}
                </p>
            )}

            {block.details && (
                <p className="mt-2 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
                    {block.details}
                </p>
            )}
        </div>
    );
}
