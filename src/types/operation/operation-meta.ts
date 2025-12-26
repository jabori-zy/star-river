import type { InputArrayType, Operation } from ".";

export interface OperationMeta {
	type: string;
	inputType: "Unary" | "Binary" | "Nary";
	label: string;
	description: string;
	params: ParamMeta[];
	output: "Series" | "Scalar";
	// Unary: Aggregation, Transformation, Window
	// Binary: Arithmetic, Statistical
	// Nary: Horizontal, Weighted, Rank
	category?: "Aggregation" | "Transformation" | "Window" | "Arithmetic" | "Statistical" | "Horizontal" | "Weighted" | "Rank";
	defaultOutputDisplayName: string;
	supportScalarInput: boolean;
}

export interface ParamMeta {
	key: string;
	type: "number" | "boolean" | "weights";
	label?: string;
	description?: string;
	min?: number;
	max?: number;
	step?: number;
	defaultValue?: number | boolean | number[];
}

// ============ Operation Metadata Map ============
// Nested structure: InputArrayType -> OperationType -> OperationMeta

export const operationMetaMap: Record<InputArrayType, Record<string, OperationMeta>> = {
	// ============ Unary Operations ============
	Unary: {
		// ============ Aggregation (Series → Scalar) ============
		AggMean: {
			type: "AggMean",
			inputType: "Unary",
			label: "Mean",
			description: "Calculate the mean (average) of the series",
			params: [],
			output: "Scalar",
			category: "Aggregation",
			defaultOutputDisplayName: "Mean",
			supportScalarInput: false,
		},
		AggSum: {
			type: "AggSum",
			inputType: "Unary",
			label: "Sum",
			description: "Calculate the sum of the series",
			params: [],
			output: "Scalar",
			category: "Aggregation",
			defaultOutputDisplayName: "Sum",
			supportScalarInput: false,
		},
		Min: {
			type: "Min",
			inputType: "Unary",
			label: "Min",
			description: "Find the minimum value in the series",
			params: [],
			output: "Scalar",
			category: "Aggregation",
			defaultOutputDisplayName: "Min",
			supportScalarInput: false,
		},
		AggMax: {
			type: "AggMax",
			inputType: "Unary",
			label: "Max",
			description: "Find the maximum value in the series",
			params: [],
			output: "Scalar",
			category: "Aggregation",
			defaultOutputDisplayName: "Max",
			supportScalarInput: false,
		},
		AggMedian: {
			type: "AggMedian",
			inputType: "Unary",
			label: "Median",
			description: "Calculate the median of the series",
			params: [],
			output: "Scalar",
			category: "Aggregation",
			defaultOutputDisplayName: "Median",
			supportScalarInput: false,
		},
		AggStd: {
			type: "AggStd",
			inputType: "Unary",
			label: "Std",
			description: "Calculate the standard deviation of the series",
			params: [],
			output: "Scalar",
			category: "Aggregation",
			defaultOutputDisplayName: "Std",
			supportScalarInput: false,
		},
		AggVariance: {
			type: "AggVariance",
			inputType: "Unary",
			label: "Variance",
			description: "Calculate the variance of the series",
			params: [],
			output: "Scalar",
			category: "Aggregation",
			defaultOutputDisplayName: "Variance",
			supportScalarInput: false,
		},
		AggSkewness: {
			type: "AggSkewness",
			inputType: "Unary",
			label: "Skewness",
			description: "Calculate the skewness of the series",
			params: [],
			output: "Scalar",
			category: "Aggregation",
			defaultOutputDisplayName: "Skewness",
			supportScalarInput: false,
		},
		AggKurtosis: {
			type: "AggKurtosis",
			inputType: "Unary",
			label: "Kurtosis",
			description: "Calculate the kurtosis of the series",
			params: [],
			output: "Scalar",
			category: "Aggregation",
			defaultOutputDisplayName: "Kurtosis",
			supportScalarInput: false,
		},
		AggFirst: {
			type: "AggFirst",
			inputType: "Unary",
			label: "First",
			description: "Get the first value in the series",
			params: [],
			output: "Scalar",
			category: "Aggregation",
			defaultOutputDisplayName: "First",
			supportScalarInput: false,
		},
		AggLast: {
			type: "AggLast",
			inputType: "Unary",
			label: "Last",
			description: "Get the last value in the series",
			params: [],
			output: "Scalar",
			category: "Aggregation",
			defaultOutputDisplayName: "Last",
			supportScalarInput: false,
		},
		AggQuantile: {
			type: "AggQuantile",
			inputType: "Unary",
			label: "Quantile",
			description: "Calculate the quantile value of the series",
			params: [
				{
					key: "q",
					type: "number",
					label: "q",
					min: 0,
					max: 1,
					step: 0.05,
					defaultValue: 0.5,
					description: "Quantile value (0-1)",
				},
			],
			output: "Scalar",
			category: "Aggregation",
			defaultOutputDisplayName: "Quantile",
			supportScalarInput: false,
		},
		AggPower: {
			type: "AggPower",
			inputType: "Unary",
			label: "Power",
			description: "Raise each element to a power",
			params: [
				{
					key: "exponent",
					type: "number",
					label: "exponent",
					step: 0.5,
					defaultValue: 2,
					description: "Power exponent",
				},
			],
			output: "Series",
			category: "Aggregation",
			defaultOutputDisplayName: "Power",
			supportScalarInput: false,
		},
		// ============ Transformation (Series → Series) ============
		Log: {
			type: "Log",
			inputType: "Unary",
			label: "Log",
			description: "Calculate the natural logarithm of each element",
			params: [],
			output: "Series",
			category: "Transformation",
			defaultOutputDisplayName: "Log",
			supportScalarInput: false,
		},
		Abs: {
			type: "Abs",
			inputType: "Unary",
			label: "Abs",
			description: "Calculate the absolute value of each element",
			params: [],
			output: "Series",
			category: "Transformation",
			defaultOutputDisplayName: "Abs",
			supportScalarInput: false,
		},
		Sign: {
			type: "Sign",
			inputType: "Unary",
			label: "Sign",
			description: "Get the sign (-1, 0, 1) of each element",
			params: [],
			output: "Series",
			category: "Transformation",
			defaultOutputDisplayName: "Sign",
			supportScalarInput: false,
		},
		Zscore: {
			type: "Zscore",
			inputType: "Unary",
			label: "Zscore",
			description: "Standardize the series using Z-score normalization",
			params: [],
			output: "Series",
			category: "Transformation",
			defaultOutputDisplayName: "Zscore",
			supportScalarInput: false,
		},
		MinMaxScale: {
			type: "MinMaxScale",
			inputType: "Unary",
			label: "MinMaxScale",
			description: "Scale the series to [0, 1] range",
			params: [],
			output: "Series",
			category: "Transformation",
			defaultOutputDisplayName: "MinMaxScale",
			supportScalarInput: false,
		},
		Lag: {
			type: "Lag",
			inputType: "Unary",
			label: "Lag",
			description: "Shift the series by n periods",
			params: [
				{
					key: "n",
					type: "number",
					label: "n",
					min: 1,
					step: 1,
					defaultValue: 1,
					description: "Number of periods to lag",
				},
			],
			output: "Series",
			category: "Transformation",
			defaultOutputDisplayName: "Lag",
			supportScalarInput: false,
		},
		Diff: {
			type: "Diff",
			inputType: "Unary",
			label: "Diff",
			description: "Calculate the difference between consecutive elements",
			params: [
				{
					key: "n",
					type: "number",
					label: "n",
					min: 1,
					step: 1,
					defaultValue: 1,
					description: "Difference order",
				},
			],
			output: "Series",
			category: "Transformation",
			defaultOutputDisplayName: "Diff",
			supportScalarInput: false,
		},
		PctChange: {
			type: "PctChange",
			inputType: "Unary",
			label: "PctChange",
			description: "Calculate the percentage change between elements",
			params: [
				{
					key: "n",
					type: "number",
					label: "n",
					min: 1,
					step: 1,
					defaultValue: 1,
					description: "Number of periods for percent change",
				},
			],
			output: "Series",
			category: "Transformation",
			defaultOutputDisplayName: "PctChange",
			supportScalarInput: false,
		},
		Rank: {
			type: "Rank",
			inputType: "Unary",
			label: "Rank",
			description: "Rank the values in the series",
			params: [
				{
					key: "ascending",
					type: "boolean",
					label: "Ascending (1 = smallest)",
					defaultValue: true,
				},
			],
			output: "Series",
			category: "Transformation",
			defaultOutputDisplayName: "Rank",
			supportScalarInput: false,
		},
		// ============ Window (Series → Series) ============
		WindowMean: {
			type: "WindowMean",
			inputType: "Unary",
			label: "Mean",
			description: "Calculate rolling mean of the series",
			params: [],
			output: "Series",
			category: "Window",
			defaultOutputDisplayName: "WindowMean",
			supportScalarInput: false,
		},
		WindowSum: {
			type: "WindowSum",
			inputType: "Unary",
			label: "Sum",
			description: "Calculate rolling sum of the series",
			params: [],
			output: "Series",
			category: "Window",
			defaultOutputDisplayName: "WindowSum",
			supportScalarInput: false,
		},
		WindowMin: {
			type: "WindowMin",
			inputType: "Unary",
			label: "Min",
			description: "Calculate rolling minimum of the series",
			params: [],
			output: "Series",
			category: "Window",
			defaultOutputDisplayName: "WindowMin",
			supportScalarInput: false,
		},
		WindowMax: {
			type: "WindowMax",
			inputType: "Unary",
			label: "Max",
			description: "Calculate rolling maximum of the series",
			params: [],
			output: "Series",
			category: "Window",
			defaultOutputDisplayName: "WindowMax",
			supportScalarInput: false,
		},
		WindowMedian: {
			type: "WindowMedian",
			inputType: "Unary",
			label: "Median",
			description: "Calculate rolling median of the series",
			params: [],
			output: "Series",
			category: "Window",
			defaultOutputDisplayName: "WindowMedian",
			supportScalarInput: false,
		},
		WindowStd: {
			type: "WindowStd",
			inputType: "Unary",
			label: "Std",
			description: "Calculate rolling standard deviation of the series",
			params: [],
			output: "Series",
			category: "Window",
			defaultOutputDisplayName: "WindowStd",
			supportScalarInput: false,
		},
		WindowVariance: {
			type: "WindowVariance",
			inputType: "Unary",
			label: "Variance",
			description: "Calculate rolling variance of the series",
			params: [],
			output: "Series",
			category: "Window",
			defaultOutputDisplayName: "WindowVariance",
			supportScalarInput: false,
		},
		WindowSkewness: {
			type: "WindowSkewness",
			inputType: "Unary",
			label: "Skewness",
			description: "Calculate rolling skewness of the series",
			params: [],
			output: "Series",
			category: "Window",
			defaultOutputDisplayName: "WindowSkewness",
			supportScalarInput: false,
		},
		WindowKurtosis: {
			type: "WindowKurtosis",
			inputType: "Unary",
			label: "Kurtosis",
			description: "Calculate rolling kurtosis of the series",
			params: [],
			output: "Series",
			category: "Window",
			defaultOutputDisplayName: "WindowKurtosis",
			supportScalarInput: false,
		},
		WindowQuantile: {
			type: "WindowQuantile",
			inputType: "Unary",
			label: "Quantile",
			description: "Calculate rolling quantile of the series",
			params: [],
			output: "Series",
			category: "Window",
			defaultOutputDisplayName: "WindowQuantile",
			supportScalarInput: false,
		},
		WindowPower: {
			type: "WindowPower",
			inputType: "Unary",
			label: "Power",
			description: "Calculate rolling power of the series",
			params: [],
			output: "Series",
			category: "Window",
			defaultOutputDisplayName: "WindowPower",
			supportScalarInput: false,
		},
		Cumsum: {
			type: "Cumsum",
			inputType: "Unary",
			label: "Cumulative Sum",
			description: "Calculate cumulative sum of the series",
			params: [],
			output: "Series",
			category: "Window",
			defaultOutputDisplayName: "Cumsum",
			supportScalarInput: false,
		},
		Cumprod: {
			type: "Cumprod",
			inputType: "Unary",
			label: "Cumulative Product",
			description: "Calculate cumulative product of the series",
			params: [],
			output: "Series",
			category: "Window",
			defaultOutputDisplayName: "Cumprod",
			supportScalarInput: false,
		},
	},

	// ============ Binary Operations ============
	Binary: {
		Add: {
			type: "Add",
			inputType: "Binary",
			label: "Add",
			description: "Add two series element-wise",
			params: [],
			output: "Series",
			category: "Arithmetic",
			defaultOutputDisplayName: "Add",
			supportScalarInput: true,
		},
		Subtract: {
			type: "Subtract",
			inputType: "Binary",
			label: "Subtract",
			description: "Subtract second series from first element-wise",
			params: [],
			output: "Series",
			category: "Arithmetic",
			defaultOutputDisplayName: "Subtract",
			supportScalarInput: true,
		},
		Multiply: {
			type: "Multiply",
			inputType: "Binary",
			label: "Multiply",
			description: "Multiply two series element-wise",
			params: [],
			output: "Series",
			category: "Arithmetic",
			defaultOutputDisplayName: "Multiply",
			supportScalarInput: true,
		},
		Divide: {
			type: "Divide",
			inputType: "Binary",
			label: "Divide",
			description: "Divide first series by second element-wise",
			params: [],
			output: "Series",
			category: "Arithmetic",
			defaultOutputDisplayName: "Divide",
			supportScalarInput: true,
		},
		Mod: {
			type: "Mod",
			inputType: "Binary",
			label: "Mod",
			description: "Calculate modulo of first series by second element-wise",
			params: [],
			output: "Series",
			category: "Arithmetic",
			defaultOutputDisplayName: "Mod",
			supportScalarInput: true,
		},
		Correlation: {
			type: "Correlation",
			inputType: "Binary",
			label: "Correlation",
			description: "Calculate correlation between two series",
			params: [],
			output: "Scalar",
			category: "Statistical",
			defaultOutputDisplayName: "Correlation",
			supportScalarInput: false,
		},
	},

	// ============ Nary Operations ============
	Nary: {
		Sum: {
			type: "Sum",
			inputType: "Nary",
			label: "Sum",
			description: "Sum all input series element-wise",
			params: [],
			output: "Series",
			category: "Horizontal",
			defaultOutputDisplayName: "Sum",
			supportScalarInput: false,
		},
		Multiply: {
			type: "Multiply",
			inputType: "Nary",
			label: "Multiply",
			description: "Multiply all input series element-wise",
			params: [],
			output: "Series",
			category: "Horizontal",
			defaultOutputDisplayName: "Multiply",
			supportScalarInput: false,
		},
		Min: {
			type: "Min",
			inputType: "Nary",
			label: "Min",
			description: "Find the minimum value in all input series",
			params: [],
			output: "Scalar",
			category: "Horizontal",
			defaultOutputDisplayName: "Min",
			supportScalarInput: false,
		},
		Max: {
			type: "Max",
			inputType: "Nary",
			label: "Max",
			description: "Find the maximum value in all input series",
			params: [],
			output: "Scalar",
			category: "Horizontal",
			defaultOutputDisplayName: "Max",
			supportScalarInput: false,
		},
		Mean: {
			type: "Mean",
			inputType: "Nary",
			label: "Mean",
			description: "Calculate mean of all input series element-wise",
			params: [],
			output: "Series",
			category: "Horizontal",
			defaultOutputDisplayName: "Mean",
			supportScalarInput: false,
		},
		WeightedSum: {
			type: "WeightedSum",
			inputType: "Nary",
			label: "WeightedSum",
			description: "Calculate weighted sum of input series",
			params: [
				{
					key: "weights",
					type: "weights",
					label: "weights",
					defaultValue: [],
					description: "Weights for each input series (comma-separated)",
				},
			],
			output: "Series",
			category: "Weighted",
			defaultOutputDisplayName: "WeightedSum",
			supportScalarInput: false,
		},
		Rank: {
			type: "Rank",
			inputType: "Nary",
			label: "Rank",
			description: "Rank values across multiple series",
			params: [
				{
					key: "ascending",
					type: "boolean",
					label: "Ascending (1 = smallest)",
					defaultValue: true,
				},
			],
			output: "Series",
			category: "Rank",
			defaultOutputDisplayName: "Rank",
			supportScalarInput: false,
		},
		TopN: {
			type: "TopN",
			inputType: "Nary",
			label: "TopN",
			description: "Select top N values across series",
			params: [
				{
					key: "n",
					type: "number",
					label: "n",
					min: 1,
					step: 1,
					defaultValue: 1,
					description: "Number of top elements",
				},
			],
			output: "Series",
			category: "Rank",
			defaultOutputDisplayName: "TopN",
			supportScalarInput: false,
		},
		BottomN: {
			type: "BottomN",
			inputType: "Nary",
			label: "BottomN",
			description: "Select bottom N values across series",
			params: [
				{
					key: "n",
					type: "number",
					label: "n",
					min: 1,
					step: 1,
					defaultValue: 1,
					description: "Number of bottom elements",
				},
			],
			output: "Series",
			category: "Rank",
			defaultOutputDisplayName: "BottomN",
			supportScalarInput: false,
		},
	},
};

// ============ Helper Functions ============

/**
 * Get operation metadata by type and inputArrayType
 */
export const getOperationMeta = (
	type: string,
	inputArrayType: InputArrayType,
): OperationMeta | undefined => {
	return operationMetaMap[inputArrayType]?.[type];
};

/**
 * Get all operations for a given input array type
 */
export const getOperationsByInputType = (inputArrayType: InputArrayType): OperationMeta[] => {
	return Object.values(operationMetaMap[inputArrayType] ?? {});
};

/**
 * Get parameter metadata for an operation type
 */
export const getOperationParamsMeta = (
	type: string,
	inputArrayType?: InputArrayType,
): ParamMeta[] => {
	if (inputArrayType) {
		return getOperationMeta(type, inputArrayType)?.params ?? [];
	}
	// Fallback: search in all types
	for (const arrType of Object.keys(operationMetaMap) as InputArrayType[]) {
		const meta = operationMetaMap[arrType]?.[type];
		if (meta) return meta.params;
	}
	return [];
};

/**
 * Check if operation has parameters
 */
export const operationHasParams = (type: string, inputArrayType?: InputArrayType): boolean => {
	return getOperationParamsMeta(type, inputArrayType).length > 0;
};

/**
 * Get operation output type
 */
export const getOperationOutputType = (
	type: string,
	inputArrayType: InputArrayType,
): "Series" | "Scalar" | undefined => {
	return getOperationMeta(type, inputArrayType)?.output;
};

/**
 * Get default operation with default parameter values from metadata
 */
export const getDefaultOperation = (
	type: string,
	inputArrayType: InputArrayType,
): Operation => {
	const meta = operationMetaMap[inputArrayType]?.[type];
	if (!meta) {
		return { type: "AggMean", inputType: "Unary", category: "Aggregation" };
	}

	// Build operation object with default params
	const operation: Record<string, unknown> = { type, inputType: inputArrayType };

	// Add category if available
	if (meta.category) {
		operation.category = meta.category;
	}

	for (const param of meta.params) {
		if (param.defaultValue !== undefined) {
			operation[param.key] = param.defaultValue;
		} else if (param.type === "number") {
			operation[param.key] = param.min ?? 1;
		} else if (param.type === "boolean") {
			operation[param.key] = true;
		} else if (param.type === "weights") {
			operation[param.key] = [];
		}
	}

	return operation as Operation;
};
