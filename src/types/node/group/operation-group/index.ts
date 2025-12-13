import type { Node } from "@xyflow/react";
import { z } from "zod";
import { NodeDataBaseSchema, NodeType } from "@/types/node";

// Operation parameter schema
export const OperationInputSeriesConfigSchema = z.object({
    type: z.literal("Series"),
    source: z.union([z.literal("Node"), z.literal("Group")]),
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

export type OperationInputSeriesConfig = z.infer<typeof OperationInputSeriesConfigSchema>;



export const OperationInputScalarValueConfigSchema = z.object({
    type: z.literal("CustomScalarValue"),
    source: z.null(),
    configId: z.number(),
    scalarDisplayName: z.string(),
    scalarValue: z.number()
});

export type OperationInputScalarValueConfig = z.infer<typeof OperationInputScalarValueConfigSchema>;

export const OperationInputGroupScalarValueConfigSchema = z.object({
    type: z.literal("CustomScalarValue"),
    source: z.literal("Group"),
    configId: z.number(),
    scalarDisplayName: z.string(),
    fromNodeType: z.nativeEnum(NodeType),
    fromNodeId: z.string(),
    fromNodeName: z.string(),
    fromHandleId: z.string(),
    fromScalarConfigId: z.number(),
    fromScalarDisplayName: z.string(),
    fromScalarValue:z.number(),
});

export type OperationInputGroupScalarValueConfig = z.infer<typeof OperationInputGroupScalarValueConfigSchema>;


export const OperationInputScalarConfigSchema = z.object({
    type: z.literal("Scalar"),
    source: z.union([z.literal("Node"), z.literal("Group")]),
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
export type OperationInputScalarConfig = z.infer<typeof OperationInputScalarConfigSchema>;



// Union type for operation configs (use z.union because Scalar has two sources)
export const OperationInputConfigSchema = z.union([
    OperationInputSeriesConfigSchema,
    OperationInputScalarConfigSchema,
    OperationInputScalarValueConfigSchema,
    OperationInputGroupScalarValueConfigSchema,
]);

export const isOperationInputConfig = (config: unknown): config is OperationInputConfig => {
    return OperationInputConfigSchema.safeParse(config).success;
};

export const isSeriesInput = (config: unknown): config is OperationInputSeriesConfig => {
    return OperationInputSeriesConfigSchema.safeParse(config).success;
};

export const isScalarInput = (config: unknown): config is OperationInputScalarConfig => {
    return OperationInputScalarConfigSchema.safeParse(config).success;
};

export const isScalarValueInput = (config: unknown): config is OperationInputScalarValueConfig => {
    return OperationInputScalarValueConfigSchema.safeParse(config).success;
};

export const isGroupScalarValueInput = (config: unknown): config is OperationInputGroupScalarValueConfig => {
    return OperationInputGroupScalarValueConfigSchema.safeParse(config).success;
};


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

export const OperationOutputConfigSchema = z.union([
    OutputSeriesConfigSchema,
    OutputScalarConfigSchema,
]);


export type OperationOutputConfig = z.infer<typeof OperationOutputConfigSchema>;

export type OperationInputConfig = z.infer<typeof OperationInputConfigSchema>;

// Type guards for OperationOutputConfig
export const isSeriesOutput = (config: unknown): config is OutputSeriesConfig => {
    return OutputSeriesConfigSchema.safeParse(config).success;
};

export const isScalarOutput = (config: unknown): config is OutputScalarConfig => {
    return OutputScalarConfigSchema.safeParse(config).success;
};

// Operation group data schema
export const OperationGroupDataSchema = NodeDataBaseSchema.extend({
    inputConfigs: z.array(OperationInputConfigSchema),
    outputConfigs: z.array(OperationOutputConfigSchema),
    isCollapsed: z.boolean().default(false),
    expandedWidth: z.number().optional(),
    expandedHeight: z.number().optional(),
});

export type OperationGroupData = z.infer<typeof OperationGroupDataSchema>;

export type OperationGroup = Node<OperationGroupData, "operationGroup">;
