import { z } from "zod";
import {
    InputArrayTypeSchema,
    OperationSchema,
    WindowConfigSchema,
    FillingMethodSchema,
} from "@/types/operation";
import { NodeDataBaseSchema, NodeType } from "@/types/node";
import type { Node } from "@xyflow/react";

// ============ Input Config ============

export const InputSeriesConfigSchema = z.object({
    type: z.literal("Series"),
    configId: z.number(),
    seriesDisplayName: z.string(),
    fromNodeType: z.nativeEnum(NodeType),
    fromNodeId: z.string(),
    fromNodeName: z.string(),
    fromHandleId: z.string(),
});

export type InputSeriesConfig = z.infer<typeof InputSeriesConfigSchema>;

export const InputScalarConfigSchema = z.object({
    type: z.literal("Scalar"),
    source: z.literal("Node"),
    configId: z.number(),
    scalarDisplayName: z.string(),
    scalarValue: z.number(),
    fromNodeType: z.nativeEnum(NodeType),
    fromNodeId: z.string(),
    fromNodeName: z.string(),
    fromHandleId: z.string(),
});
export type InputScalarConfig = z.infer<typeof InputScalarConfigSchema>;


export const InputScalarValueConfigSchema = z.object({
    type: z.literal("Scalar"),
    source: z.literal("Value"),
    scalarValue: z.number(),
});
export type InputScalarValueConfig = z.infer<typeof InputScalarValueConfigSchema>;


export const InputConfigSchema = z.union([
    InputSeriesConfigSchema,
    InputScalarConfigSchema,
    InputScalarValueConfigSchema,
]);
export type InputConfig = z.infer<typeof InputConfigSchema>;

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
