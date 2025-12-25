export interface ImportStrategyData {
	nodes?: unknown[];
	edges?: unknown[];
}

export interface CheckImportStrategyResult {
	valid: boolean;
	nodes?: unknown[];
	edges?: unknown[];
}

/**
 * Check if the imported strategy data is valid
 *
 * Rules:
 * 1. Must have nodes and edges fields
 * 2. edges can be an empty array
 * 3. nodes and edges cannot both be empty
 *
 * @param data Parsed JSON data from imported file
 * @returns Check result with valid flag and extracted data
 */
export function checkImportStrategy(
	data: unknown,
): CheckImportStrategyResult {
	// Check if data is an object
	if (!data || typeof data !== "object") {
		return { valid: false };
	}

	const strategyData = data as ImportStrategyData;

	// Check if nodes field exists and is an array
	if (!Array.isArray(strategyData.nodes)) {
		return { valid: false };
	}

	// Check if edges field exists and is an array
	if (!Array.isArray(strategyData.edges)) {
		return { valid: false };
	}

	// Check if both nodes and edges are empty
	if (strategyData.nodes.length === 0 && strategyData.edges.length === 0) {
		return { valid: false };
	}

	return {
		valid: true,
		nodes: strategyData.nodes,
		edges: strategyData.edges,
	};
}
