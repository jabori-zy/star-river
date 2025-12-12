import { z } from "zod";

import { UnaryOperationSchema } from "./unary";
import { BinaryOperationSchema } from "./binary";
import { NaryOperationSchema } from "./n-ary";

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


// ============ Re-export Input/Output Config from operation-node ============
// These configs are defined in operation-node.ts to avoid circular dependencies

export {
    // Input configs
    InputSeriesConfigSchema,
    type InputSeriesConfig,
    InputScalarConfigSchema,
    type InputScalarConfig,
    InputScalarValueConfigSchema,
    type InputScalarValueConfig,
    InputConfigSchema,
    type InputConfig,
    UnaryInputConfigSchema,
    type UnaryInputConfig,
    BinaryInputConfigSchema,
    type BinaryInputConfig,
    NaryInputConfigSchema,
    type NaryInputConfig,
    // Output configs
    OutputSeriesConfigSchema,
    type OutputSeriesConfig,
    OutputScalarConfigSchema,
    type OutputScalarConfig,
    OutputConfigSchema,
    type OutputConfig,
} from "@/types/node/operation-node";


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
