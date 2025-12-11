import { z } from "zod";

// ============ N-ary Operations (N inputs) ============

// Sum all inputs
const SumOperationSchema = z.object({ type: z.literal("Sum") });

// weighted sum operation
const WeightedSumOperationSchema = z.object({
    type: z.literal("WeightedSum"),
    weights: z.array(z.number()).default([1, 1]),
});

// Mean operation
const MeanOperationSchema = z.object({ type: z.literal("Mean") });

// Rank operation
const RankOperationSchema = z.object({
    type: z.literal("Rank"),
    ascending: z.boolean().default(true), // true: 1 is smallest, false: 1 is largest
});

// TopN operation
const TopNOperationSchema = z.object({
    type: z.literal("TopN"),
    n: z.number().int().min(1).default(3), // number of top elements to select
});

// BottomN operation
const BottomNOperationSchema = z.object({
    type: z.literal("BottomN"),
    n: z.number().int().min(1).default(3), // number of bottom elements to select
});

// Union of all n-ary operations
export const NaryOperationSchema = z.discriminatedUnion("type", [
    SumOperationSchema,
    WeightedSumOperationSchema,
    MeanOperationSchema,
    RankOperationSchema,
    TopNOperationSchema,
    BottomNOperationSchema,
]);
export type NaryOperation = z.infer<typeof NaryOperationSchema>;

// Operation type constants (for UI selection)
export const NaryOperationTypes = [
    "Sum",
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
