
import React from 'react';
import { OSModuleData, OSBlock } from '@/lib/os-blocks';
import { MetricBlock } from './blocks/MetricBlock';
import { ChartBlock } from './blocks/ChartBlock';
import { TableBlock } from './blocks/TableBlock';
import { ContentBlock } from './blocks/ContentBlock';

interface DynamicOSRendererProps {
    data: OSModuleData;
}

export function DynamicOSRenderer({ data }: DynamicOSRendererProps) {
    const { title, description, layout } = data;

    const renderBlock = (block: OSBlock) => {
        // Grid column span logic
        const colSpanClass = {
            1: 'col-span-1',
            2: 'col-span-1 md:col-span-2',
            3: 'col-span-1 md:col-span-3',
            4: 'col-span-full',
        }[block.colSpan || 4];

        return (
            <div key={block.id} className={colSpanClass}>
                {block.type === 'metric' && <MetricBlock block={block} />}
                {block.type === 'chart' && <ChartBlock block={block} />}
                {block.type === 'table' && <TableBlock block={block} />}
                {block.type === 'markdown' && <ContentBlock block={block} />}
            </div>
        );
    };

    return (
        <div className="w-full h-full overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                            {description}
                        </p>
                    )}
                </div>

                {/* Dynamic Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {layout.map((block) => renderBlock(block))}
                </div>

            </div>
        </div>
    );
}
