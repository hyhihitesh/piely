"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ExternalLink, Zap } from "lucide-react";
import { getToolsForNode, ToolDefinition } from "@/lib/toolRegistry";
import { toast } from "sonner";
import { executeTool } from "@/actions/execute-tool";

interface NodeActionsProps {
    nodeId: string;
    nodeTitle: string;
}

export function NodeActions({ nodeId, nodeTitle }: NodeActionsProps) {
    const tools = getToolsForNode(nodeTitle);
    const [executing, setExecuting] = useState<string | null>(null);
    const [inputs, setInputs] = useState<Record<string, string>>({});

    if (tools.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No automated actions available for this milestone.</p>
            </div>
        );
    }

    async function handleExecute(tool: ToolDefinition) {
        if (!tool.isAutomated && tool.actionUrl) {
            window.open(tool.actionUrl, "_blank");
            return;
        }

        if (tool.isAutomated) {
            // Validate inputs
            if (tool.requiredInputs?.some(input => !inputs[input.key])) {
                toast.error("Please fill in all required fields.");
                return;
            }

            setExecuting(tool.id);
            const result = await executeTool(tool.id, nodeId, inputs);

            if (result.success) {
                toast.success(result.message);
                setInputs({}); // Reset
            } else {
                toast.error(result.message);
            }
            setExecuting(null);
        }
    }

    return (
        <div className="p-4 space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm text-primary mb-4">
                <strong>⚡ Power Up:</strong> Automated tools detected for this step.
            </div>

            {tools.map((tool) => (
                <div key={tool.id} className="border rounded-lg p-4 bg-card shadow-sm space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-md">
                            <tool.icon className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm">{tool.name}</h4>
                            <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                    </div>

                    {tool.isAutomated && tool.requiredInputs && (
                        <div className="space-y-2 mt-2 pl-[44px]">
                            {tool.requiredInputs.map(input => (
                                <div key={input.key}>
                                    <Input
                                        placeholder={input.label}
                                        value={inputs[input.key] || ""}
                                        onChange={(e) => setInputs(prev => ({ ...prev, [input.key]: e.target.value }))}
                                        className="h-8 text-xs"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pl-[44px]">
                        <Button
                            size="sm"
                            className="w-full justify-start"
                            variant={tool.isAutomated ? "default" : "outline"}
                            onClick={() => handleExecute(tool)}
                            disabled={executing === tool.id}
                        >
                            {executing === tool.id ? (
                                <>
                                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                    Running...
                                </>
                            ) : tool.isAutomated ? (
                                <>
                                    <Zap className="w-3 h-3 mr-2" />
                                    Run Action
                                </>
                            ) : (
                                <>
                                    <ExternalLink className="w-3 h-3 mr-2" />
                                    Open Tool
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
