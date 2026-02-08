import { z } from "zod";

export const roadmapStageIdSchema = z.string(); // Dynamic - AI can create custom stages

export const roadmapDetailLevelSchema = z.enum(["high_level", "detailed"]);

export const layoutTypeSchema = z.enum([
  "timeline",
  "tree",
  "swimlanes",
  "radial",
  "flow",
  "custom",
]);

export const roadmapStageSchema = z.object({
  id: roadmapStageIdSchema,
  name: z.string(),
  stageOrder: z.number().int(),
  description: z.string(),
  timeline: z.string().optional(),
});

export const roadmapItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  stageId: roadmapStageIdSchema,
  category: z.enum(["product", "gtm", "hiring", "funding", "operations"]),
  description: z.string(),
  difficulty: z.enum(["low", "medium", "high"]),
  impact: z.enum(["low", "medium", "high"]),
  dependencies: z.array(z.string()),
});

export const roadmapEdgeSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  type: z.enum(["depends_on", "precedes", "related"]),
});

export const roadmapResponseSchema = z.object({
  stages: z.array(roadmapStageSchema),
  items: z.array(roadmapItemSchema),
  edges: z.array(roadmapEdgeSchema).optional(),
  layoutType: layoutTypeSchema.optional(),
  layoutHints: z
    .record(
      z.string(),
      z.object({
        lane: z.number().optional(),
        level: z.number().optional(),
        suggestedX: z.number().optional(),
        suggestedY: z.number().optional(),
      }),
    )
    .optional(),
});

export type RoadmapResponseSchema = z.infer<typeof roadmapResponseSchema>;

