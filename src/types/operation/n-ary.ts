import { z } from "zod";

// ============ N-ary Operations (N inputs) ============

// Sum all inputs
const SumOperationSchema = z.object({ type: z.literal("Sum"), inputType: z.literal("Nary"), category: z.literal("Horizontal") });
const SubtractOperationSchema = z.object({ type: z.literal("Subtract"), inputType: z.literal("Nary"), category: z.literal("Horizontal") });
const MultiplyOperationSchema = z.object({ type: z.literal("Multiply"), inputType: z.literal("Nary"), category: z.literal("Horizontal") });
const DivideOperationSchema = z.object({ type: z.literal("Divide"), inputType: z.literal("Nary"), category: z.literal("Horizontal") });
const MeanOperationSchema = z.object({ type: z.literal("Mean"), inputType: z.literal("Nary"), category: z.literal("Horizontal") });

// weighted sum operation
const WeightedSumOperationSchema = z.object({
    type: z.literal("WeightedSum"),
    inputType: z.literal("Nary"),
    weights: z.array(z.number()).default([1, 1]),
    category: z.literal("Weighted"),
});

// Rank operation
const RankOperationSchema = z.object({
    type: z.literal("Rank"),
    inputType: z.literal("Nary"),
    ascending: z.boolean().default(true), // true: 1 is smallest, false: 1 is largest
    category: z.literal("Rank"),
});

// TopN operation
const TopNOperationSchema = z.object({
    type: z.literal("TopN"),
    inputType: z.literal("Nary"),
    n: z.number().int().min(1).default(3), // number of top elements to select
    category: z.literal("Rank"),
});

// BottomN operation
const BottomNOperationSchema = z.object({
    type: z.literal("BottomN"),
    inputType: z.literal("Nary"),
    n: z.number().int().min(1).default(3), // number of bottom elements to select
    category: z.literal("Rank"),
});

// Union of all n-ary operations
export const NaryOperationSchema = z.discriminatedUnion("type", [
    SumOperationSchema,
    SubtractOperationSchema,
    MultiplyOperationSchema,
    DivideOperationSchema,
    MeanOperationSchema,
    WeightedSumOperationSchema,
    RankOperationSchema,
    TopNOperationSchema,
    BottomNOperationSchema,
]);
export type NaryOperation = z.infer<typeof NaryOperationSchema>;

// Operation type constants (for UI selection)
export const NaryOperationTypes = [
    "Sum",
    "Subtract",
    "Multiply",
    "Divide",
    "WeightedSum",
    "Mean",
    "Rank",
    "TopN",
    "BottomN",
] as const;

// ============ Default Operation Factory ============

// Schema map for getting default values
const narySchemaMap: Record<string, z.ZodTypeAny> = {
    Sum: SumOperationSchema,
    Subtract: SubtractOperationSchema,
    Multiply: MultiplyOperationSchema,
    Divide: DivideOperationSchema,
    WeightedSum: WeightedSumOperationSchema,
    Mean: MeanOperationSchema,
    Rank: RankOperationSchema,
    TopN: TopNOperationSchema,
    BottomN: BottomNOperationSchema,
};

/**
 * Get default n-ary operation with default parameter values
 */
export const getDefaultNaryOperation = (type: string): NaryOperation | null => {
    const schema = narySchemaMap[type];
    if (!schema) return null;
    return schema.parse({ type }) as NaryOperation;
};
