import { z } from "zod";

// ============ Binary Operations (two inputs) ============

// Arithmetic operations (no params)
const AddOperationSchema = z.object({ type: z.literal("Add") });
const SubtractOperationSchema = z.object({ type: z.literal("Subtract") });
const MultiplyOperationSchema = z.object({ type: z.literal("Multiply") });
const DivideOperationSchema = z.object({ type: z.literal("Divide") });
const ModOperationSchema = z.object({ type: z.literal("Mod") });
const CorrelationOperationSchema = z.object({ type: z.literal("Correlation") });

// Union of all binary operations
export const BinaryOperationSchema = z.discriminatedUnion("type", [
    AddOperationSchema,
    SubtractOperationSchema,
    MultiplyOperationSchema,
    DivideOperationSchema,
    ModOperationSchema,
    CorrelationOperationSchema,
]);
export type BinaryOperation = z.infer<typeof BinaryOperationSchema>;

// Operation type constants (for UI selection)
export const BinaryOperationTypes = [
    "Add",
    "Subtract",
    "Multiply",
    "Divide",
    "Mod",
    "Correlation",
] as const;

// ============ Default Operation Factory ============

// Schema map for getting default values
const binarySchemaMap: Record<string, z.ZodTypeAny> = {
    Add: AddOperationSchema,
    Subtract: SubtractOperationSchema,
    Multiply: MultiplyOperationSchema,
    Divide: DivideOperationSchema,
    Mod: ModOperationSchema,
    Correlation: CorrelationOperationSchema,
};

/**
 * Get default binary operation with default parameter values
 */
export const getDefaultBinaryOperation = (type: string): BinaryOperation | null => {
    const schema = binarySchemaMap[type];
    if (!schema) return null;
    return schema.parse({ type }) as BinaryOperation;
};
