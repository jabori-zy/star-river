import type { HintGeneratorParams } from "./types";
import {
	generateDataflowPath,
	generateSymbolHighlight,
	generateTriggerPrefix,
	generateValueHighlight,
	generateVariableHighlight,
} from "./utils";

/**
 * PERCENTAGE type hint generator
 * Supported operations:
 * - get: Get variable value
 * - update: Update variable (set/add/subtract/multiply/divide/max/min)
 * - reset: Reset variable
 *
 * Special handling: Automatically add percent sign (%) suffix
 */
export const generatePercentageHint = (
	params: HintGeneratorParams,
): React.ReactNode => {
	const { varOperation } = params;

	// ============ GET operation ============
	if (varOperation === "get") {
		return generateGetOperation(params);
	}

	// ============ UPDATE operation ============
	if (varOperation === "update") {
		return generateUpdateOperation(params);
	}

	// ============ RESET operation ============
	if (varOperation === "reset") {
		return generateResetOperation(params);
	}

	return null;
};

/**
 * Format percentage value - Ensure value has % suffix
 */
function formatPercentageValue(value?: string): string | null {
	if (!value) return null;

	const trimmedValue = value.trim();
	if (!trimmedValue) return null;

	// If already has %, return directly
	if (trimmedValue.endsWith("%")) {
		return trimmedValue;
	}

	// Otherwise add %
	return `${trimmedValue}%`;
}

// ==================== GET operation ====================

/**
 * GET operation - Get variable value
 * Scenarios:
 * 1. Get trading pair variable (has symbol)
 * 2. Has value - Display current value
 * 3. Default - Will get value
 */
function generateGetOperation(params: HintGeneratorParams): React.ReactNode {
	const {
		t,
		variableDisplayName,
		value,
		symbol,
		conditionTrigger,
		timerTrigger,
	} = params;

	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
		t,
	});

	const formattedValue = formatPercentageValue(value);

	// Scenario 1: Get trading pair variable
	if (symbol) {
		return (
			<>
				{triggerPrefix}
				将会获取 {generateSymbolHighlight(symbol)}{" "}
				{generateVariableHighlight(variableDisplayName)} 的值
			</>
		);
	}

	// Scenario 2: Has value - Display current value
	if (formattedValue) {
		return (
			<>
				{triggerPrefix} {generateVariableHighlight(variableDisplayName)}{" "}
				当前值为 {generateValueHighlight(formattedValue)}
			</>
		);
	}

	// Scenario 3: Default - Will get value
	return (
		<>
			{triggerPrefix} {t("variableNode.hint.get")}{" "}
			{generateVariableHighlight(variableDisplayName)}
		</>
	);
}

// ==================== UPDATE operation ====================

/**
 * UPDATE operation - Update variable
 * Operation types:
 * - set: Set to specified value
 * - add: Add
 * - subtract: Subtract
 * - multiply: Multiply
 * - divide: Divide
 * - max: Take maximum value
 * - min: Take minimum value
 *
 * Supports dataflow trigger (get value from other variables)
 */
function generateUpdateOperation(params: HintGeneratorParams): React.ReactNode {
	const { operationType, dataflowTrigger } = params;

	if (!operationType) return null;

	// Special handling for dataflow trigger
	if (dataflowTrigger?.fromVarDisplayName) {
		return generateDataflowUpdateHint(params);
	}

	// Normal trigger (condition/timer)
	return generateNormalUpdateHint(params);
}

/**
 * Dataflow-triggered update operation
 * Contains special formats:
 * - max/min: "Get the max/min value between variable A and variable B"
 * - add/subtract/multiply/divide: "variable A + variable B" (operator format)
 * - set: "variable A will be set to variable B"
 */
function generateDataflowUpdateHint(
	params: HintGeneratorParams,
): React.ReactNode {
	const { t, language, variableDisplayName, operationType, dataflowTrigger } =
		params;

	if (!dataflowTrigger) return null;

	// Build full path: node name/node type config ID/variable display name
	const fullPath = generateDataflowPath(
		dataflowTrigger.fromNodeName,
		dataflowTrigger.fromNodeType,
		dataflowTrigger.fromVarConfigId,
		dataflowTrigger.fromVarDisplayName,
		t,
	);

	// max/min operation
	if (operationType === "max" || operationType === "min") {
		const operationLabel =
			operationType === "max"
				? t("variableNode.hint.max")
				: t("variableNode.hint.min");

		if (language === "zh-CN") {
			return (
				<>
					取 {generateVariableHighlight(variableDisplayName)} 与{" "}
					{generateValueHighlight(fullPath)} 中的{operationLabel}
				</>
			);
		}
		if (language === "en-US") {
			return (
				<>
					Get the {operationLabel} value between{" "}
					{generateVariableHighlight(variableDisplayName)} and{" "}
					{generateValueHighlight(fullPath)}
				</>
			);
		}
	}

	// add operation - Addition operator format
	if (operationType === "add") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} +{" "}
				{generateValueHighlight(fullPath)}
			</>
		);
	}

	// subtract operation - Subtraction operator format
	if (operationType === "subtract") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} -{" "}
				{generateValueHighlight(fullPath)}
			</>
		);
	}

	// multiply operation - Multiplication operator format
	if (operationType === "multiply") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} ×{" "}
				{generateValueHighlight(fullPath)}
			</>
		);
	}

	// divide operation - Division operator format
	if (operationType === "divide") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} ÷{" "}
				{generateValueHighlight(fullPath)}
			</>
		);
	}

	// set operation - Default format
	if (operationType === "set") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.set")} {generateValueHighlight(fullPath)}
			</>
		);
	}

	return null;
}

/**
 * Normal update operation (condition/timer trigger)
 * Update using fixed value
 */
function generateNormalUpdateHint(
	params: HintGeneratorParams,
): React.ReactNode {
	const {
		t,
		variableDisplayName,
		operationType,
		value,
		conditionTrigger,
		timerTrigger,
	} = params;

	if (!operationType) return null;

	const formattedValue = formatPercentageValue(value);
	if (!formattedValue) return null;

	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
		t,
	});

	// set operation
	if (operationType === "set") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.set")} {generateValueHighlight(formattedValue)}
			</>
		);
	}

	// add operation
	if (operationType === "add") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.add")} {generateValueHighlight(formattedValue)}
			</>
		);
	}

	// subtract operation
	if (operationType === "subtract") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.subtract")}{" "}
				{generateValueHighlight(formattedValue)}
			</>
		);
	}

	// multiply operation
	if (operationType === "multiply") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.multiply")}{" "}
				{generateValueHighlight(formattedValue)}
			</>
		);
	}

	// divide operation
	if (operationType === "divide") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.divide")} {generateValueHighlight(formattedValue)}
			</>
		);
	}

	return null;
}

// ==================== RESET operation ====================

/**
 * RESET operation - Reset variable to specified value
 */
function generateResetOperation(params: HintGeneratorParams): React.ReactNode {
	const { t, variableDisplayName, value, conditionTrigger, timerTrigger } =
		params;

	const formattedValue = formatPercentageValue(value);
	if (!formattedValue) return null;

	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
		t,
	});

	return (
		<>
			{triggerPrefix} {generateVariableHighlight(variableDisplayName)}{" "}
			{t("variableNode.hint.reset")} {generateValueHighlight(formattedValue)}
		</>
	);
}
