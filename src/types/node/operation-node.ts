import { z } from "zod";
import { NodeDataBaseSchema, NodeType } from "@/types/node";
import type { Node } from "@xyflow/react";
// Import operation schemas from individual files to avoid circular dependency
import { UnaryOperationSchema } from "@/types/operation/unary";
import { BinaryOperationSchema } from "@/types/operation/binary";
import { NaryOperationSchema } from "@/types/operation/n-ary";

// ============ Input Array Type ============
// Defined here to avoid circular dependency with @/types/operation

export const InputArrayTypeSchema = z.enum(["Unary", "Binary", "Nary"]);
export type InputArrayType = z.infer<typeof InputArrayTypeSchema>;

// ============ Combined Operation Schema ============

export const OperationSchema = z.union([
    UnaryOperationSchema,
    BinaryOperationSchema,
    NaryOperationSchema,
]);
export type Operation = z.infer<typeof OperationSchema>;

// ============ Window Config ============

export const RollingWindowConfigSchema = z.object({
    windowType: z.literal("rolling"),
    windowSize: z.number().int().min(1),
});
export type RollingWindowConfig = z.infer<typeof RollingWindowConfigSchema>;

export const ExpandingWindowConfigSchema = z.object({
    windowType: z.literal("expanding"),
    initialWindowSize: z.number().int().min(1),
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

// ============ Input Config ============
// OperationNode only exists inside a Group, so source is always "Group"

// Series input from OperationStartNode or other OperationNode
export const InputSeriesConfigSchema = z.object({
    type: z.literal("Series"),
    source: z.literal("Group"),
    configId: z.number(),
    fromNodeType: z.nativeEnum(NodeType),
    fromNodeId: z.string(),
    fromNodeName: z.string(),
    fromHandleId: z.string(),
    fromSeriesConfigId: z.number(),
    fromSeriesName: z.string(),
    fromSeriesDisplayName: z.string(),
});

export type InputSeriesConfig = z.infer<typeof InputSeriesConfigSchema>;

// Scalar input from OperationStartNode or other OperationNode - with variable name
export const InputScalarConfigSchema = z.object({
    type: z.literal("Scalar"),
    source: z.literal("Group"),
    configId: z.number(),
    fromNodeType: z.nativeEnum(NodeType),
    fromNodeId: z.string(),
    fromNodeName: z.string(),
    fromHandleId: z.string(),
    fromScalarConfigId: z.number(),
    fromScalarName: z.string(),
    fromScalarDisplayName: z.string(),
});
export type InputScalarConfig = z.infer<typeof InputScalarConfigSchema>;

// Self-defined custom scalar value (no source)
export const InputScalarValueConfigSchema = z.object({
    type: z.literal("CustomScalarValue"),
    source: z.null(),
    configId: z.number(),
    scalarValue: z.number(),
});
export type InputScalarValueConfig = z.infer<typeof InputScalarValueConfigSchema>;

// Custom scalar value from OperationStartNode (parent Group's input)
export const InputGroupScalarValueConfigSchema = z.object({
    type: z.literal("CustomScalarValue"),
    source: z.literal("Group"),
    configId: z.number(),
    fromNodeType: z.nativeEnum(NodeType),
    fromNodeId: z.string(),
    fromNodeName: z.string(),
    fromHandleId: z.string(),
    fromScalarConfigId: z.number(),
    fromScalarDisplayName: z.string(),
    fromScalarValue: z.number(),
});
export type InputGroupScalarValueConfig = z.infer<typeof InputGroupScalarValueConfigSchema>;

// Union type for all input configs
export const InputConfigSchema = z.union([
    InputSeriesConfigSchema,
    InputScalarConfigSchema,
    InputScalarValueConfigSchema,
    InputGroupScalarValueConfigSchema,
]);
export type InputConfig = z.infer<typeof InputConfigSchema>;

// Type guards for input configs
export const isSeriesInput = (config: unknown): config is InputSeriesConfig => {
    return InputSeriesConfigSchema.safeParse(config).success;
};

export const isScalarInput = (config: unknown): config is InputScalarConfig => {
    return InputScalarConfigSchema.safeParse(config).success;
};

export const isScalarValueInput = (config: unknown): config is InputScalarValueConfig => {
    return InputScalarValueConfigSchema.safeParse(config).success;
};

export const isGroupScalarValueInput = (config: unknown): config is InputGroupScalarValueConfig => {
    return InputGroupScalarValueConfigSchema.safeParse(config).success;
};

// ============ Unary Input Config ============
export const UnaryInputConfigSchema = z.object({
    type: z.literal("Unary"),
    input: InputSeriesConfigSchema,
});
export type UnaryInputConfig = z.infer<typeof UnaryInputConfigSchema>;

// ============ Binary Input Config ============
export const BinaryInputConfigSchema = z.object({
    type: z.literal("Binary"),
    input1: InputConfigSchema.nullable(),
    input2: InputConfigSchema.nullable(),
});

export type BinaryInputConfig = z.infer<typeof BinaryInputConfigSchema>;

// ============ Nary Input Config ============
export const NaryInputConfigSchema = z.object({
    type: z.literal("Nary"),
    inputs: z.array(InputSeriesConfigSchema),
});

export type NaryInputConfig = z.infer<typeof NaryInputConfigSchema>;


// ============ Output Config ============

export const OutputSeriesConfigSchema = z.object({
    type: z.literal("Series"),
    configId: z.number(),
    outputHandleId: z.string(),
    seriesDisplayName: z.string(),
});

export type OutputSeriesConfig = z.infer<typeof OutputSeriesConfigSchema>;

export const OutputScalarConfigSchema = z.object({
    type: z.literal("Scalar"),
    configId: z.number(),
    outputHandleId: z.string(),
    scalarDisplayName: z.string(),
});
export type OutputScalarConfig = z.infer<typeof OutputScalarConfigSchema>;

export const OutputConfigSchema = z.union([
    OutputSeriesConfigSchema,
    OutputScalarConfigSchema,
]);
export type OutputConfig = z.infer<typeof OutputConfigSchema>;

// Type guards for output configs
export const isSeriesOutput = (config: unknown): config is OutputSeriesConfig => {
    return OutputSeriesConfigSchema.safeParse(config).success;
};

export const isScalarOutput = (config: unknown): config is OutputScalarConfig => {
    return OutputScalarConfigSchema.safeParse(config).success;
};


// ============ Operation Node ============

// Combined input config schema that supports all three input types
export const OperationInputConfigSchema = z.union([
    UnaryInputConfigSchema,
    BinaryInputConfigSchema,
    NaryInputConfigSchema,
]);
export type OperationInputConfig = z.infer<typeof OperationInputConfigSchema>;

export const OperationNodeDataSchema = NodeDataBaseSchema.extend({
    inputArrayType: InputArrayTypeSchema,
    operation: OperationSchema,
    inputConfig: OperationInputConfigSchema.nullable(),
    outputConfig: OutputConfigSchema.nullable(),
    windowConfig: WindowConfigSchema,
    fillingMethod: FillingMethodSchema,
});

export type OperationNodeData = z.infer<typeof OperationNodeDataSchema>;


export type OperationNode = Node<OperationNodeData, "operationNode">;
