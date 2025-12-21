import { z } from "zod";

// ============ Unary Operations (single series input) ============

// ============ Aggregation Operations (Series → Scalar) ============

// Simple aggregation operations (no params)
const AggMeanSchema = z.object({ type: z.literal("AggMean"), inputType: z.literal("Unary"), category: z.literal("Aggregation") });
const AggSumSchema = z.object({ type: z.literal("AggSum"), inputType: z.literal("Unary"), category: z.literal("Aggregation") });
const AggMinSchema = z.object({ type: z.literal("Min"), inputType: z.literal("Unary"), category: z.literal("Aggregation") });
const AggMaxSchema = z.object({ type: z.literal("AggMax"), inputType: z.literal("Unary"), category: z.literal("Aggregation") });
const AggMedianSchema = z.object({ type: z.literal("AggMedian"), inputType: z.literal("Unary"), category: z.literal("Aggregation") });
const AggStdSchema = z.object({ type: z.literal("AggStd"), inputType: z.literal("Unary"), category: z.literal("Aggregation") });
const AggVarianceSchema = z.object({ type: z.literal("AggVariance"), inputType: z.literal("Unary"), category: z.literal("Aggregation") });
const AggSkewnessSchema = z.object({ type: z.literal("AggSkewness"), inputType: z.literal("Unary"), category: z.literal("Aggregation") });
const AggKurtosisSchema = z.object({ type: z.literal("AggKurtosis"), inputType: z.literal("Unary"), category: z.literal("Aggregation") });
const AggFirstSchema = z.object({ type: z.literal("AggFirst"), inputType: z.literal("Unary"), category: z.literal("Aggregation") });
const AggLastSchema = z.object({ type: z.literal("AggLast"), inputType: z.literal("Unary"), category: z.literal("Aggregation") });

// Quantile operation (requires q param)
const AggQuantileSchema = z.object({
    type: z.literal("AggQuantile"), 
    inputType: z.literal("Unary"), 
    category: z.literal("Aggregation"),
    q: z.number().min(0).max(1).default(0.5), // 0-1, e.g., 0.25 for 25th percentile
});

// Power operation (exponent param)
const AggPowerSchema = z.object({
    type: z.literal("AggPower"), 
    inputType: z.literal("Unary"), 
    category: z.literal("Aggregation"),
    exponent: z.number().default(2), // if provided, use this instead of second input
});

// Union of all aggregation operations
export const AggregationOperationSchema = z.discriminatedUnion("type", [
    AggMeanSchema,
    AggSumSchema,
    AggMinSchema,
    AggMaxSchema,
    AggMedianSchema,
    AggStdSchema,
    AggVarianceSchema,
    AggSkewnessSchema,
    AggKurtosisSchema,
    AggFirstSchema,
    AggLastSchema,
    AggQuantileSchema,
    AggPowerSchema,
]);
export type AggregationOperation = z.infer<typeof AggregationOperationSchema>;

// Aggregation operation type constants (for UI selection)
export const AggregationOperationTypes = [
    "AggMean",
    "AggSum",
    "AggMin",
    "AggMax",
    "AggMedian",
    "AggStd",
    "AggVariance",
    "AggSkewness",
    "AggKurtosis",
    "AggFirst",
    "AggLast",
    "AggQuantile",
    "AggPower",
] as const;

// ============ Transform Operations (Series → Series) ============

// Simple transform operations (no params)
const TransformLogSchema = z.object({ type: z.literal("Log"), inputType: z.literal("Unary"), category: z.literal("Transformation") });
const TransformAbsSchema = z.object({ type: z.literal("Abs"), inputType: z.literal("Unary"), category: z.literal("Transformation") });
const TransformSignSchema = z.object({ type: z.literal("Sign"), inputType: z.literal("Unary"), category: z.literal("Transformation") });
const ZscoreTransformSchema = z.object({ type: z.literal("Zscore"), inputType: z.literal("Unary"), category: z.literal("Transformation") });
const TransformMinMaxScaleSchema = z.object({ type: z.literal("MinMaxScale"), inputType: z.literal("Unary"), category: z.literal("Transformation") });

// Transform operations with params
const LagTransformSchema = z.object({
    type: z.literal("Lag"),
    inputType: z.literal("Unary"),
    category: z.literal("Transformation"),
    n: z.number().int().min(1).default(1), // lag periods
});

const TransformDiffSchema = z.object({
    type: z.literal("Diff"),
    inputType: z.literal("Unary"),
    category: z.literal("Transformation"),
    n: z.number().int().min(1).default(1), // diff order
});

const TransformPctChangeSchema = z.object({
    type: z.literal("PctChange"),
    inputType: z.literal("Unary"),
    category: z.literal("Transformation"),
    n: z.number().int().min(1).default(1), // periods
});

const TransformRankSchema = z.object({
    type: z.literal("Rank"),
    inputType: z.literal("Unary"),
    category: z.literal("Transformation"),
    ascending: z.boolean().default(true), // true: 1 is smallest, false: 1 is largest
});

// Union of all transform operations
export const TransformOperationSchema = z.discriminatedUnion("type", [
    TransformLogSchema,
    TransformAbsSchema,
    TransformSignSchema,
    ZscoreTransformSchema,
    TransformMinMaxScaleSchema,
    LagTransformSchema,
    TransformDiffSchema,
    TransformPctChangeSchema,
    TransformRankSchema,
]);
export type TransformOperation = z.infer<typeof TransformOperationSchema>;

// Transform operation type constants (for UI selection)
export const TransformOperationTypes = [
    "Log",
    "Abs",
    "Sign",
    "Zscore",
    "MinMaxScale",
    "Lag",
    "Diff",
    "PctChange",
    "Rank",
] as const;



// ============ windows operations ============

const WindowMeanSchema = z.object({ type: z.literal("WindowMean"), inputType: z.literal("Unary"), category: z.literal("Window") });
const WindowSumSchema = z.object({ type: z.literal("WindowSum"), inputType: z.literal("Unary"), category: z.literal("Window") });
const WindowMinSchema = z.object({ type: z.literal("WindowMin"), inputType: z.literal("Unary"), category: z.literal("Window") });
const WindowMaxSchema = z.object({ type: z.literal("WindowMax"), inputType: z.literal("Unary"), category: z.literal("Window") });
const WindowMedianSchema = z.object({ type: z.literal("WindowMedian"), inputType: z.literal("Unary"), category: z.literal("Window") });
const WindowStdSchema = z.object({ type: z.literal("WindowStd"), inputType: z.literal("Unary"), category: z.literal("Window") });
const WindowVarianceSchema = z.object({ type: z.literal("WindowVariance"), inputType: z.literal("Unary"), category: z.literal("Window") });
const WindowSkewnessSchema = z.object({ type: z.literal("WindowSkewness"), inputType: z.literal("Unary"), category: z.literal("Window") });
const WindowKurtosisSchema = z.object({ type: z.literal("WindowKurtosis"), inputType: z.literal("Unary"), category: z.literal("Window") });
const WindowQuantileSchema = z.object({ type: z.literal("WindowQuantile"), inputType: z.literal("Unary"), category: z.literal("Window") });
const WindowPowerSchema = z.object({ type: z.literal("WindowPower"), inputType: z.literal("Unary"), category: z.literal("Window") });
const CumsumSchema = z.object({ type: z.literal("Cumsum"), inputType: z.literal("Unary"), category: z.literal("Window") });
const CumprodSchema = z.object({ type: z.literal("Cumprod"), inputType: z.literal("Unary"), category: z.literal("Window") });


export const WindowOperationSchema = z.discriminatedUnion("type", [
    WindowMeanSchema,
    WindowSumSchema,
    WindowMinSchema,
    WindowMaxSchema,
    WindowMedianSchema,
    WindowStdSchema,
    WindowVarianceSchema,
    WindowSkewnessSchema,
    WindowKurtosisSchema,
    WindowQuantileSchema,
    WindowPowerSchema,
    CumsumSchema,
    CumprodSchema,
]);
export type WindowOperation = z.infer<typeof WindowOperationSchema>;


// Window operation type constants (for UI selection)
export const WindowOperationTypes = [
    "WindowMean",
    "WindowSum",
    "WindowMin",
    "WindowMax",
    "WindowMedian",
    "WindowStd",
    "WindowVariance",
    "WindowSkewness",
    "WindowKurtosis",
    "WindowQuantile",
    "WindowPower",
    "Cumsum",
    "Cumprod",
] as const;

// ============ Combined Unary Operation ============

export const UnaryOperationSchema = z.union([
    AggregationOperationSchema,
    TransformOperationSchema,
    WindowOperationSchema,
]);
export type UnaryOperation = z.infer<typeof UnaryOperationSchema>;

// All unary operation types (for UI selection)
export const UnaryOperationTypes = [
    ...AggregationOperationTypes,
    ...TransformOperationTypes,
    ...WindowOperationTypes,
] as const;

// ============ Default Operation Factory ============

// Schema map for getting default values
const unarySchemaMap: Record<string, z.ZodTypeAny> = {
    // Aggregation
    Mean: AggMeanSchema,
    Sum: AggSumSchema,
    Min: AggMinSchema,
    Max: AggMaxSchema,
    Median: AggMedianSchema,
    Std: AggStdSchema,
    Variance: AggVarianceSchema,
    Skewness: AggSkewnessSchema,
    Kurtosis: AggKurtosisSchema,
    First: AggFirstSchema,
    Last: AggLastSchema,
    Quantile: AggQuantileSchema,
    Power: AggPowerSchema,
    // Transform
    Log: TransformLogSchema,
    Abs: TransformAbsSchema,
    Sign: TransformSignSchema,
    Zscore: ZscoreTransformSchema,
    MinMaxScale: TransformMinMaxScaleSchema,
    Lag: LagTransformSchema,
    Diff: TransformDiffSchema,
    PctChange: TransformPctChangeSchema,
    Rank: TransformRankSchema,
    // Window
    WindowMean: WindowMeanSchema,
    WindowSum: WindowSumSchema,
    WindowMin: WindowMinSchema,
    WindowMax: WindowMaxSchema,
    WindowMedian: WindowMedianSchema,
    WindowStd: WindowStdSchema,
    WindowVariance: WindowVarianceSchema,
    WindowSkewness: WindowSkewnessSchema,
    WindowKurtosis: WindowKurtosisSchema,
    WindowQuantile: WindowQuantileSchema,
    WindowPower: WindowPowerSchema,
    Cumsum: CumsumSchema,
    Cumprod: CumprodSchema,
};

/**
 * Get default unary operation with default parameter values
 */
export const getDefaultUnaryOperation = (type: string): UnaryOperation | null => {
    const schema = unarySchemaMap[type];
    if (!schema) return null;
    return schema.parse({ type }) as UnaryOperation;
};
