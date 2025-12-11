import type { InputArrayType, Operation } from ".";

export interface OperationMeta {
	type: string;
	label: string;
	description: string;
	params: ParamMeta[];
	output: "Series" | "Scalar";
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
		// Aggregation
		Mean: {
			type: "Mean",
			label: "Mean",
			description: "Calculate the mean (average) of the series",
			params: [],
			output: "Scalar",
			defaultOutputDisplayName: "Mean",
			supportScalarInput: false,
		},
		Sum: {
			type: "Sum",
			label: "Sum",
			description: "Calculate the sum of the series",
			params: [],
			output: "Scalar",
			defaultOutputDisplayName: "Sum",
			supportScalarInput: false,
		},
		Min: {
			type: "Min",
			label: "Min",
			description: "Find the minimum value in the series",
			params: [],
			output: "Scalar",
			defaultOutputDisplayName: "Min",
			supportScalarInput: false,
		},
		Max: {
			type: "Max",
			label: "Max",
			description: "Find the maximum value in the series",
			params: [],
			output: "Scalar",
			defaultOutputDisplayName: "Max",
			supportScalarInput: false,
		},
		Median: {
			type: "Median",
			label: "Median",
			description: "Calculate the median of the series",
			params: [],
			output: "Scalar",
			defaultOutputDisplayName: "Median",
			supportScalarInput: false,
		},
		Std: {
			type: "Std",
			label: "Std",
			description: "Calculate the standard deviation of the series",
			params: [],
			output: "Scalar",
			defaultOutputDisplayName: "Std",
			supportScalarInput: false,
		},
		Variance: {
			type: "Variance",
			label: "Variance",
			description: "Calculate the variance of the series",
			params: [],
			output: "Scalar",
			defaultOutputDisplayName: "Variance",
			supportScalarInput: false,
		},
		Skewness: {
			type: "Skewness",
			label: "Skewness",
			description: "Calculate the skewness of the series",
			params: [],
			output: "Scalar",
			defaultOutputDisplayName: "Skewness",
			supportScalarInput: false,
		},
		Kurtosis: {
			type: "Kurtosis",
			label: "Kurtosis",
			description: "Calculate the kurtosis of the series",
			params: [],
			output: "Scalar",
			defaultOutputDisplayName: "Kurtosis",
			supportScalarInput: false,
		},
		First: {
			type: "First",
			label: "First",
			description: "Get the first value in the series",
			params: [],
			output: "Scalar",
			defaultOutputDisplayName: "First",
			supportScalarInput: false,
		},
		Last: {
			type: "Last",
			label: "Last",
			description: "Get the last value in the series",
			params: [],
			output: "Scalar",
			defaultOutputDisplayName: "Last",
			supportScalarInput: false,
		},
		Quantile: {
			type: "Quantile",
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
			defaultOutputDisplayName: "Quantile",
			supportScalarInput: false,
		},
		Power: {
			type: "Power",
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
			defaultOutputDisplayName: "Power",
			supportScalarInput: false,
		},
		// Transform
		Log: {
			type: "Log",
			label: "Log",
			description: "Calculate the natural logarithm of each element",
			params: [],
			output: "Series",
			defaultOutputDisplayName: "Log",
			supportScalarInput: false,
		},
		Abs: {
			type: "Abs",
			label: "Abs",
			description: "Calculate the absolute value of each element",
			params: [],
			output: "Series",
			defaultOutputDisplayName: "Abs",
			supportScalarInput: false,
		},
		Sign: {
			type: "Sign",
			label: "Sign",
			description: "Get the sign (-1, 0, 1) of each element",
			params: [],
			output: "Series",
			defaultOutputDisplayName: "Sign",
			supportScalarInput: false,
		},
		Cumsum: {
			type: "Cumsum",
			label: "Cumsum",
			description: "Calculate cumulative sum of the series",
			params: [],
			output: "Series",
			defaultOutputDisplayName: "Cumsum",
			supportScalarInput: false,
		},
		Cumprod: {
			type: "Cumprod",
			label: "Cumprod",
			description: "Calculate cumulative product of the series",
			params: [],
			output: "Series",
			defaultOutputDisplayName: "Cumprod",
			supportScalarInput: false,
		},
		Zscore: {
			type: "Zscore",
			label: "Zscore",
			description: "Standardize the series using Z-score normalization",
			params: [],
			output: "Series",
			defaultOutputDisplayName: "Zscore",
			supportScalarInput: false,
		},
		MinMaxScale: {
			type: "MinMaxScale",
			label: "MinMaxScale",
			description: "Scale the series to [0, 1] range",
			params: [],
			output: "Series",
			defaultOutputDisplayName: "MinMaxScale",
			supportScalarInput: false,
		},
		Lag: {
			type: "Lag",
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
			defaultOutputDisplayName: "Lag",
			supportScalarInput: false,
		},
		Diff: {
			type: "Diff",
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
			defaultOutputDisplayName: "Diff",
			supportScalarInput: false,
		},
		PctChange: {
			type: "PctChange",
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
			defaultOutputDisplayName: "PctChange",
			supportScalarInput: false,
		},
		Rank: {
			type: "Rank",
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
			defaultOutputDisplayName: "Rank",
			supportScalarInput: false,
		},
	},

	// ============ Binary Operations ============
	Binary: {
		Add: {
			type: "Add",
			label: "Add",
			description: "Add two series element-wise",
			params: [],
			output: "Series",
			defaultOutputDisplayName: "Add",
			supportScalarInput: true,
		},
		Subtract: {
			type: "Subtract",
			label: "Subtract",
			description: "Subtract second series from first element-wise",
			params: [],
			output: "Series",
			defaultOutputDisplayName: "Subtract",
			supportScalarInput: true,
		},
		Multiply: {
			type: "Multiply",
			label: "Multiply",
			description: "Multiply two series element-wise",
			params: [],
			output: "Series",
			defaultOutputDisplayName: "Multiply",
			supportScalarInput: true,
		},
		Divide: {
			type: "Divide",
			label: "Divide",
			description: "Divide first series by second element-wise",
			params: [],
			output: "Series",
			defaultOutputDisplayName: "Divide",
			supportScalarInput: true,
		},
		Mod: {
			type: "Mod",
			label: "Mod",
			description: "Calculate modulo of first series by second element-wise",
			params: [],
			output: "Series",
			defaultOutputDisplayName: "Mod",
			supportScalarInput: true,
		},
		Correlation: {
			type: "Correlation",
			label: "Correlation",
			description: "Calculate correlation between two series",
			params: [],
			output: "Scalar",
			defaultOutputDisplayName: "Correlation",
			supportScalarInput: false,
		},
	},

	// ============ Nary Operations ============
	Nary: {
		Sum: {
			type: "Sum",
			label: "Sum (N-ary)",
			description: "Sum all input series element-wise",
			params: [],
			output: "Series",
			defaultOutputDisplayName: "Sum (N-ary)",
			supportScalarInput: false,
		},
		Mean: {
			type: "Mean",
			label: "Mean (N-ary)",
			description: "Calculate mean of all input series element-wise",
			params: [],
			output: "Series",
			defaultOutputDisplayName: "Mean (N-ary)",
			supportScalarInput: false,
		},
		WeightedSum: {
			type: "WeightedSum",
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
			defaultOutputDisplayName: "WeightedSum",
			supportScalarInput: false,
		},
		Rank: {
			type: "Rank",
			label: "Rank (N-ary)",
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
			defaultOutputDisplayName: "Rank (N-ary)",
			supportScalarInput: false,
		},
		TopN: {
			type: "TopN",
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
			defaultOutputDisplayName: "TopN",
			supportScalarInput: false,
		},
		BottomN: {
			type: "BottomN",
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
		return { type: "Mean" };
	}

	// Build operation object with default params
	const operation: Record<string, unknown> = { type };

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
