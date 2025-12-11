import type { Node } from "@xyflow/react";
import { z } from "zod";
import { NodeDataBaseSchema, NodeType } from "@/types/node";

// Operation parameter schema
export const SeriesConfigSchema = z.object({
    type: z.literal("Series"),
    configId: z.number(),
    outputHandleId: z.string(),
    seriesDisplayName: z.string(),
    fromNodeType: z.nativeEnum(NodeType),
    fromNodeId: z.string(),
    fromNodeName: z.string(),
    fromHandleId: z.string(),
    fromSeriesConfigId: z.number(),
    fromSeriesName: z.string(),
    fromSeriesDisplayName: z.string()
});

export type SeriesConfig = z.infer<typeof SeriesConfigSchema>;


export const ScalarConfigSchema = z.object({
    type: z.literal("Scalar"),
    configId: z.number(),
    outputHandleId: z.string(),
    scalarValue: z.number(),
    scalarDisplayName: z.string(),
});

export type ScalarConfig = z.infer<typeof ScalarConfigSchema>;

// Union type for operation configs
export const OperationConfigSchema = z.discriminatedUnion("type", [
    SeriesConfigSchema,
    ScalarConfigSchema,
]);

export type OperationConfig = z.infer<typeof OperationConfigSchema>;

// Operation group data schema
export const OperationGroupDataSchema = NodeDataBaseSchema.extend({
    inputConfigs: z.array(OperationConfigSchema),
    isCollapsed: z.boolean().default(false),
    expandedWidth: z.number().optional(),
    expandedHeight: z.number().optional(),
});

export type OperationGroupData = z.infer<typeof OperationGroupDataSchema>;

export type OperationGroup = Node<OperationGroupData, "operationGroup">;
