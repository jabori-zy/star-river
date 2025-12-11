import { z } from "zod";

// ============ Unary Operations (single series input) ============

// ============ Aggregation Operations (Series → Scalar) ============

// Simple aggregation operations (no params)
const MeanAggSchema = z.object({ type: z.literal("Mean") });
const SumAggSchema = z.object({ type: z.literal("Sum") });
const MinAggSchema = z.object({ type: z.literal("Min") });
const MaxAggSchema = z.object({ type: z.literal("Max") });
const MedianAggSchema = z.object({ type: z.literal("Median") });
const StdAggSchema = z.object({ type: z.literal("Std") });
const VarianceAggSchema = z.object({ type: z.literal("Variance") });
const SkewnessAggSchema = z.object({ type: z.literal("Skewness") });
const KurtosisAggSchema = z.object({ type: z.literal("Kurtosis") });
const FirstAggSchema = z.object({ type: z.literal("First") });
const LastAggSchema = z.object({ type: z.literal("Last") });

// Quantile operation (requires q param)
const QuantileAggSchema = z.object({
    type: z.literal("Quantile"),
    q: z.number().min(0).max(1).default(0.5), // 0-1, e.g., 0.25 for 25th percentile
});

// Power operation (exponent param)
const PowerOperationSchema = z.object({
    type: z.literal("Power"),
    exponent: z.number().default(2), // if provided, use this instead of second input
});

// Union of all aggregation operations
export const AggregationOperationSchema = z.discriminatedUnion("type", [
    MeanAggSchema,
    SumAggSchema,
    MinAggSchema,
    MaxAggSchema,
    MedianAggSchema,
    StdAggSchema,
    VarianceAggSchema,
    SkewnessAggSchema,
    KurtosisAggSchema,
    FirstAggSchema,
    LastAggSchema,
    QuantileAggSchema,
    PowerOperationSchema,
]);
export type AggregationOperation = z.infer<typeof AggregationOperationSchema>;

// Aggregation operation type constants (for UI selection)
export const AggregationOperationTypes = [
    "Mean",
    "Sum",
    "Min",
    "Max",
    "Median",
    "Std",
    "Variance",
    "Skewness",
    "Kurtosis",
    "First",
    "Last",
    "Quantile",
    "Power",
] as const;

// ============ Transform Operations (Series → Series) ============

// Simple transform operations (no params)
const LogTransformSchema = z.object({ type: z.literal("Log") });
const AbsTransformSchema = z.object({ type: z.literal("Abs") });
const SignTransformSchema = z.object({ type: z.literal("Sign") });
const CumsumTransformSchema = z.object({ type: z.literal("Cumsum") });
const CumprodTransformSchema = z.object({ type: z.literal("Cumprod") });
const ZscoreTransformSchema = z.object({ type: z.literal("Zscore") });
const MinMaxScaleTransformSchema = z.object({ type: z.literal("MinMaxScale") });

// Transform operations with params
const LagTransformSchema = z.object({
    type: z.literal("Lag"),
    n: z.number().int().min(1).default(1), // lag periods
});

const DiffTransformSchema = z.object({
    type: z.literal("Diff"),
    n: z.number().int().min(1).default(1), // diff order
});

const PctChangeTransformSchema = z.object({
    type: z.literal("PctChange"),
    n: z.number().int().min(1).default(1), // periods
});

const RankTransformSchema = z.object({
    type: z.literal("Rank"),
    ascending: z.boolean().default(true), // true: 1 is smallest, false: 1 is largest
});

// Union of all transform operations
export const TransformOperationSchema = z.discriminatedUnion("type", [
    LogTransformSchema,
    AbsTransformSchema,
    SignTransformSchema,
    CumsumTransformSchema,
    CumprodTransformSchema,
    ZscoreTransformSchema,
    MinMaxScaleTransformSchema,
    LagTransformSchema,
    DiffTransformSchema,
    PctChangeTransformSchema,
    RankTransformSchema,
]);
export type TransformOperation = z.infer<typeof TransformOperationSchema>;

// Transform operation type constants (for UI selection)
export const TransformOperationTypes = [
    "Log",
    "Abs",
    "Sign",
    "Cumsum",
    "Cumprod",
    "Zscore",
    "MinMaxScale",
    "Lag",
    "Diff",
    "PctChange",
    "Rank",
] as const;

// ============ Combined Unary Operation ============

export const UnaryOperationSchema = z.union([
    AggregationOperationSchema,
    TransformOperationSchema,
]);
export type UnaryOperation = z.infer<typeof UnaryOperationSchema>;

// All unary operation types (for UI selection)
export const UnaryOperationTypes = [
    ...AggregationOperationTypes,
    ...TransformOperationTypes,
] as const;

// ============ Default Operation Factory ============

// Schema map for getting default values
const unarySchemaMap: Record<string, z.ZodTypeAny> = {
    // Aggregation
    Mean: MeanAggSchema,
    Sum: SumAggSchema,
    Min: MinAggSchema,
    Max: MaxAggSchema,
    Median: MedianAggSchema,
    Std: StdAggSchema,
    Variance: VarianceAggSchema,
    Skewness: SkewnessAggSchema,
    Kurtosis: KurtosisAggSchema,
    First: FirstAggSchema,
    Last: LastAggSchema,
    Quantile: QuantileAggSchema,
    Power: PowerOperationSchema,
    // Transform
    Log: LogTransformSchema,
    Abs: AbsTransformSchema,
    Sign: SignTransformSchema,
    Cumsum: CumsumTransformSchema,
    Cumprod: CumprodTransformSchema,
    Zscore: ZscoreTransformSchema,
    MinMaxScale: MinMaxScaleTransformSchema,
    Lag: LagTransformSchema,
    Diff: DiffTransformSchema,
    PctChange: PctChangeTransformSchema,
    Rank: RankTransformSchema,
};

/**
 * Get default unary operation with default parameter values
 */
export const getDefaultUnaryOperation = (type: string): UnaryOperation | null => {
    const schema = unarySchemaMap[type];
    if (!schema) return null;
    return schema.parse({ type }) as UnaryOperation;
};
