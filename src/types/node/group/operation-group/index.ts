import type { Node } from "@xyflow/react";
import { z } from "zod";
import { NodeDataBaseSchema, NodeType } from "@/types/node";

// ============ Source Types ============
// Source type for input configs
// - OuterNode: External nodes like KlineNode, IndicatorNode, VariableNode
// - OperationNode: OperationNode within the same group
// - ParentGroup: Data from parent OperationGroup (via OperationStartNode)
// - ChildGroup: Output from nested child OperationGroup
export const InputSourceSchema = z.enum([
    "OuterNode",
    "OperationNode",
    "ParentGroup",
    "ChildGroup",
]);
export type InputSource = z.infer<typeof InputSourceSchema>;

// ============ Input Configs ============

// Operation parameter schema - Series type
export const OperationInputSeriesConfigSchema = z.object({
    type: z.literal("Series"),
    source: InputSourceSchema,
    configId: z.number(),
    inputName: z.string(),
    fromNodeType: z.nativeEnum(NodeType),
    fromNodeId: z.string(),
    fromNodeName: z.string(),
    fromHandleId: z.string(),
    fromSeriesConfigId: z.number(),
    fromSeriesName: z.string(),
    fromSeriesDisplayName: z.string(),
});

export type OperationInputSeriesConfig = z.infer<typeof OperationInputSeriesConfigSchema>;

// Custom scalar value - self-defined (source: null)
export const OperationCustomScalarValueConfigSchema = z.object({
    type: z.literal("CustomScalarValue"),
    source: z.null(),
    configId: z.number(),
    inputName: z.string(),
    scalarValue: z.number()
});

export type OperationCustomScalarValueConfig = z.infer<typeof OperationCustomScalarValueConfigSchema>;

// Custom scalar value from parent Group (source: ParentGroup)
export const OperationParentGroupScalarValueConfigSchema = z.object({
    type: z.literal("CustomScalarValue"),
    source: z.literal("ParentGroup"),
    configId: z.number(),
    inputName: z.string(),
    fromNodeType: z.nativeEnum(NodeType),
    fromNodeId: z.string(),
    fromNodeName: z.string(),
    fromHandleId: z.string(),
    fromScalarConfigId: z.number(),
    fromScalarDisplayName: z.string(),
    fromScalarValue: z.number(),
});

export type OperationParentGroupScalarValueConfig = z.infer<typeof OperationParentGroupScalarValueConfigSchema>;

// Scalar with variable name from various sources
export const OperationInputScalarConfigSchema = z.object({
    type: z.literal("Scalar"),
    source: InputSourceSchema,
    configId: z.number(),
    inputName: z.string(),
    fromNodeType: z.nativeEnum(NodeType),
    fromNodeId: z.string(),
    fromNodeName: z.string(),
    fromHandleId: z.string(),
    fromScalarConfigId: z.number(),
    fromScalarName: z.string(),
    fromScalarDisplayName: z.string(),
});
export type OperationInputScalarConfig = z.infer<typeof OperationInputScalarConfigSchema>;

// Union type for operation configs
export const OperationInputConfigSchema = z.union([
    OperationInputSeriesConfigSchema,
    OperationInputScalarConfigSchema,
    OperationCustomScalarValueConfigSchema,
    OperationParentGroupScalarValueConfigSchema,
]);

export type OperationInputConfig = z.infer<typeof OperationInputConfigSchema>;

// ============ Type Guards for Input Configs ============

export const isOperationInputConfig = (config: unknown): config is OperationInputConfig => {
    return OperationInputConfigSchema.safeParse(config).success;
};

// Type guards by config type
export const isSeriesInput = (config: unknown): config is OperationInputSeriesConfig => {
    return OperationInputSeriesConfigSchema.safeParse(config).success;
};

export const isScalarInput = (config: unknown): config is OperationInputScalarConfig => {
    return OperationInputScalarConfigSchema.safeParse(config).success;
};

export const isScalarValueInput = (config: unknown): config is OperationCustomScalarValueConfig => {
    return OperationCustomScalarValueConfigSchema.safeParse(config).success;
};

export const isParentGroupScalarValueInput = (config: unknown): config is OperationParentGroupScalarValueConfig => {
    return OperationParentGroupScalarValueConfigSchema.safeParse(config).success;
};

// Type guards by source - Series
export const isSeriesFromOuterNode = (config: unknown): config is OperationInputSeriesConfig => {
    return isSeriesInput(config) && config.source === "OuterNode";
};

export const isSeriesFromOperationNode = (config: unknown): config is OperationInputSeriesConfig => {
    return isSeriesInput(config) && config.source === "OperationNode";
};

export const isSeriesFromParentGroup = (config: unknown): config is OperationInputSeriesConfig => {
    return isSeriesInput(config) && config.source === "ParentGroup";
};

export const isSeriesFromChildGroup = (config: unknown): config is OperationInputSeriesConfig => {
    return isSeriesInput(config) && config.source === "ChildGroup";
};

// Type guards by source - Scalar
export const isScalarFromOuterNode = (config: unknown): config is OperationInputScalarConfig => {
    return isScalarInput(config) && config.source === "OuterNode";
};

export const isScalarFromOperationNode = (config: unknown): config is OperationInputScalarConfig => {
    return isScalarInput(config) && config.source === "OperationNode";
};

export const isScalarFromParentGroup = (config: unknown): config is OperationInputScalarConfig => {
    return isScalarInput(config) && config.source === "ParentGroup";
};

export const isScalarFromChildGroup = (config: unknown): config is OperationInputScalarConfig => {
    return isScalarInput(config) && config.source === "ChildGroup";
};

// Combined type guards - check if from parent group (any type)
export const isFromParentGroup = (config: unknown): boolean => {
    if (isSeriesInput(config) || isScalarInput(config)) {
        return config.source === "ParentGroup";
    }
    if (isParentGroupScalarValueInput(config)) {
        return true;
    }
    return false;
};

// Backward compatibility alias (to be removed later)
/** @deprecated Use isParentGroupScalarValueInput instead */
export const isGroupScalarValueInput = isParentGroupScalarValueInput;

// ============ Output Configs ============

export const OperationOutputSeriesConfigSchema = z.object({
    type: z.literal("Series"),
    configId: z.number(),
    outputHandleId: z.string(),
    outputName: z.string(),
    sourceNodeId: z.string(),
    sourceNodeName: z.string(),
    sourceSeriesName: z.string(),
    sourceHandleId: z.string(),
    sourceOutputConfigId: z.number(),
});

export type OperationOutputSeriesConfig = z.infer<typeof OperationOutputSeriesConfigSchema>;

export const OperationOutputScalarConfigSchema = z.object({
    type: z.literal("Scalar"),
    configId: z.number(),
    outputHandleId: z.string(),
    outputName: z.string(),
    // Source info (from OperationNode connected to EndNode)
    sourceNodeId: z.string(),
    sourceNodeName: z.string(),
    sourceScalarName: z.string(),
    sourceHandleId: z.string(),
    sourceOutputConfigId: z.number(),
});
export type OperationOutputScalarConfig = z.infer<typeof OperationOutputScalarConfigSchema>;

export const OperationOutputConfigSchema = z.union([
    OperationOutputSeriesConfigSchema,
    OperationOutputScalarConfigSchema,
]);


export type OperationOutputConfig = z.infer<typeof OperationOutputConfigSchema>;

// Type guards for OperationOutputConfig
export const isSeriesOutput = (config: unknown): config is OperationOutputSeriesConfig => {
    return OperationOutputSeriesConfigSchema.safeParse(config).success;
};

export const isScalarOutput = (config: unknown): config is OperationOutputScalarConfig => {
    return OperationOutputScalarConfigSchema.safeParse(config).success;
};

// ============ Window Config ============

export const RollingWindowConfigSchema = z.object({
    windowType: z.literal("rolling"),
    windowSize: z.number().int().min(1),
});
export type RollingWindowConfig = z.infer<typeof RollingWindowConfigSchema>;

export const ExpandingWindowConfigSchema = z.object({
    windowType: z.literal("expanding"),
    // initialWindowSize: z.number().int().min(1),
});
export type ExpandingWindowConfig = z.infer<typeof ExpandingWindowConfigSchema>;


export const WindowConfigSchema = z.discriminatedUnion("windowType", [
    RollingWindowConfigSchema,
    ExpandingWindowConfigSchema,
]);
export type WindowConfig = z.infer<typeof WindowConfigSchema>;

// ============ Filling Method ============

export const FillingMethodSchema = z.enum([
    "FFill", // forward fill
    "BFill", // backward fill
    "Zero", // zero fill
    "Mean", // mean fill
]);
export type FillingMethod = z.infer<typeof FillingMethodSchema>;

// ============ Operation Group Data ============

export const OperationGroupDataSchema = NodeDataBaseSchema.extend({
    groupOutputName:z.string(),
    isChildGroup: z.boolean().default(false),
    inputInterval: z.string().nullable(),
    inputConfigs: z.array(OperationInputConfigSchema),
    outputConfigs: z.array(OperationOutputConfigSchema),
    inputWindow: WindowConfigSchema.nullable(),
    fillingMethod: FillingMethodSchema,
    isCollapsed: z.boolean().default(false),
    expandedWidth: z.number().optional(),
    expandedHeight: z.number().optional(),
});

export type OperationGroupData = z.infer<typeof OperationGroupDataSchema>;

export type OperationGroup = Node<OperationGroupData, "operationGroup">;
