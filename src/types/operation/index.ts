import { z } from "zod";

import { UnaryOperationSchema } from "./unary";
import { BinaryOperationSchema } from "./binary";
import { NaryOperationSchema } from "./n-ary";
import { NodeType } from "@/types/node";

// Re-export from split files
export {
    UnaryOperationSchema,
    type UnaryOperation,
    UnaryOperationTypes,
} from "./unary";

export {
    BinaryOperationSchema,
    type BinaryOperation,
    BinaryOperationTypes,
} from "./binary";

export {
    NaryOperationSchema,
    type NaryOperation,
    NaryOperationTypes,
} from "./n-ary";

// ============ Input Array Type ============

export const InputArrayTypeSchema = z.enum(["Unary", "Binary", "Nary"]);
export type InputArrayType = z.infer<typeof InputArrayTypeSchema>;


// ============ Input Config ============

export const InputSeriesConfigSchema = z.object({
    type: z.literal("Series"),
    seriesId: z.number(),
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
    scalarId: z.number(),
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



// output config
export const OutputSeriesConfigSchema = z.object({
    type: z.literal("Series"),
    outputHandleId: z.string(),
    seriesDisplayName: z.string(),
});

export type OutputSeriesConfig = z.infer<typeof OutputSeriesConfigSchema>;

export const OutputScalarConfigSchema = z.object({
    type: z.literal("Scalar"),
    outputHandleId: z.string(),
    scalarDisplayName: z.string(),
});
export type OutputScalarConfig = z.infer<typeof OutputScalarConfigSchema>;

export const OutputConfigSchema = z.union([
    OutputSeriesConfigSchema,
    OutputScalarConfigSchema,
]);
export type OutputConfig = z.infer<typeof OutputConfigSchema>;

// ============ Combined Operation Schema ============

export const OperationSchema = z.union([
    UnaryOperationSchema,
    BinaryOperationSchema,
    NaryOperationSchema,
]);
export type Operation = z.infer<typeof OperationSchema>;

// ============ Window Config ============

// Rolling Window Config
export const RollingWindowConfigSchema = z.object({
    windowType: z.literal("rolling"),
    windowSize: z.number().int().min(1),
});
export type RollingWindowConfig = z.infer<typeof RollingWindowConfigSchema>;

// Expanding Window Config
export const ExpandingWindowConfigSchema = z.object({
    windowType: z.literal("expanding"),
    initialWindowSize: z.number().int().min(1),
});
export type ExpandingWindowConfig = z.infer<typeof ExpandingWindowConfigSchema>;

// Union Type
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

// ============ Helper Functions ============

// Check if operation requires params
export const operationRequiresParams = (type: string): boolean => {
    return ["Quantile", "Power", "Rank", "TopN", "BottomN"].includes(type);
};
