"use strict";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, MessageSquare, FileText, Info } from "lucide-react";
import { RoadmapItem, RoadmapStage } from "@/lib/roadmapTypes";
import { NodeContextChat } from "./NodeContextChat";
import { NodeAttachments } from "./NodeAttachments";
import { NodeActions } from "./NodeActions";
import { Rocket } from "lucide-react";

interface NodeDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedNode: RoadmapItem | RoadmapStage | null;
    projectId: string;
}

export function NodeDrawer({
    isOpen,
    onClose,
    selectedNode,
    projectId,
}: NodeDrawerProps) {
    if (!selectedNode) return null;

    const isStage = "stageOrder" in selectedNode;
    const title = isStage ? (selectedNode as RoadmapStage).name : (selectedNode as RoadmapItem).title;
    const description = isStage ? "" : (selectedNode as RoadmapItem).description;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 gap-0" side="right">
                {/* Header */}
                <div className="p-6 border-b bg-muted/20">
                    <SheetHeader className="mb-4">
                        <SheetTitle className="text-xl font-cal leading-tight">{title}</SheetTitle>
                        <SheetDescription className="line-clamp-2">
                            {description || "Explore deeper context for this milestone."}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${isStage ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            }`}>
                            {isStage ? "Stage" : "Milestone"}
                        </span>
                    </div>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 pt-2 border-b">
                        <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-4">
                            <TabsTrigger
                                value="chat"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3 pt-2 text-muted-foreground data-[state=active]:text-foreground"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Context Chat
                            </TabsTrigger>
                            <TabsTrigger
                                value="files"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3 pt-2 text-muted-foreground data-[state=active]:text-foreground"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Files
                            </TabsTrigger>
                            <TabsTrigger
                                value="actions"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3 pt-2 text-muted-foreground data-[state=active]:text-foreground"
                            >
                                <Rocket className="w-4 h-4 mr-2" />
                                Actions
                            </TabsTrigger>
                            <TabsTrigger
                                value="details"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3 pt-2 text-muted-foreground data-[state=active]:text-foreground"
                            >
                                <Info className="w-4 h-4 mr-2" />
                                Details
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden bg-background">
                        <TabsContent value="chat" className="h-full m-0 data-[state=inactive]:hidden flex flex-col">
                            <NodeContextChat
                                nodeId={selectedNode.id}
                                nodeTitle={title}
                                nodeDescription={description}
                                projectId={projectId}
                            />
                        </TabsContent>

                        <TabsContent value="files" className="h-full m-0 p-0 data-[state=inactive]:hidden">
                            <NodeAttachments nodeId={selectedNode.id} />
                        </TabsContent>

                        <TabsContent value="actions" className="h-full m-0 p-0 data-[state=inactive]:hidden">
                            <NodeActions nodeId={selectedNode.id} nodeTitle={title} />
                        </TabsContent>

                        <TabsContent value="details" className="h-full m-0 p-6 data-[state=inactive]:hidden">
                            <ScrollArea className="h-full pr-4">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                                        <p className="text-sm leading-relaxed">{description || "No description provided."}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Raw ID</h4>
                                        <code className="text-xs bg-muted p-1 rounded block">{selectedNode.id}</code>
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </div>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
