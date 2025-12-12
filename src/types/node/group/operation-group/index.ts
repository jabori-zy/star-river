import type { Node } from "@xyflow/react";
import { z } from "zod";
import { NodeDataBaseSchema, NodeType } from "@/types/node";

// Operation parameter schema
export const InputSeriesConfigSchema = z.object({
    type: z.literal("Series"),
    configId: z.number(),
    seriesDisplayName: z.string(),
    fromNodeType: z.nativeEnum(NodeType),
    fromNodeId: z.string(),
    fromNodeName: z.string(),
    fromHandleId: z.string(),
    fromSeriesConfigId: z.number(),
    fromSeriesName: z.string(),
    fromSeriesDisplayName: z.string(),
});

export type InputSeriesConfig = z.infer<typeof InputSeriesConfigSchema>;


export const InputScalarValueConfigSchema = z.object({
    type: z.literal("Scalar"),
    source: z.literal("Value"),
    configId: z.number(),
    scalarValue: z.number(),
    scalarDisplayName: z.string(),
});

export type InputScalarValueConfig = z.infer<typeof InputScalarValueConfigSchema>;

export const InputScalarConfigSchema = z.object({
    type: z.literal("Scalar"),
    source: z.literal("Node"),
    configId: z.number(),
    scalarDisplayName: z.string(),
    fromNodeType: z.nativeEnum(NodeType),
    fromNodeId: z.string(),
    fromNodeName: z.string(),
    fromHandleId: z.string(),
    fromScalarConfigId: z.number(),
    fromScalarName: z.string(),
    fromScalarDisplayName: z.string(),
});
export type InputScalarConfig = z.infer<typeof InputScalarConfigSchema>;


// Union type for operation configs (use z.union because Scalar has two sources)
export const InputConfigSchema = z.union([
    InputSeriesConfigSchema,
    InputScalarConfigSchema,
    InputScalarValueConfigSchema,
]);


// output config
export const OutputSeriesConfigSchema = z.object({
    type: z.literal("Series"),
    configId: z.number(),
    outputHandleId: z.string(),
    seriesDisplayName: z.string(),
    sourceNodeId: z.string(),
    sourceNodeName: z.string(),
    sourceHandleId: z.string(),
});

export type OutputSeriesConfig = z.infer<typeof OutputSeriesConfigSchema>;

export const OutputScalarConfigSchema = z.object({
    type: z.literal("Scalar"),
    configId: z.number(),
    outputHandleId: z.string(),
    scalarDisplayName: z.string(),
    // Source info (from OperationNode connected to EndNode)
    sourceNodeId: z.string(),
    sourceNodeName: z.string(),
    sourceHandleId: z.string(),
});
export type OutputScalarConfig = z.infer<typeof OutputScalarConfigSchema>;

export const OutputConfigSchema = z.union([
    OutputSeriesConfigSchema,
    OutputScalarConfigSchema,
]);
export type OutputConfig = z.infer<typeof OutputConfigSchema>;




export type OperationConfig = z.infer<typeof InputConfigSchema>;

// Operation group data schema
export const OperationGroupDataSchema = NodeDataBaseSchema.extend({
    inputConfigs: z.array(InputConfigSchema),
    outputConfigs: z.array(OutputConfigSchema),
    isCollapsed: z.boolean().default(false),
    expandedWidth: z.number().optional(),
    expandedHeight: z.number().optional(),
});

export type OperationGroupData = z.infer<typeof OperationGroupDataSchema>;

export type OperationGroup = Node<OperationGroupData, "operationGroup">;
