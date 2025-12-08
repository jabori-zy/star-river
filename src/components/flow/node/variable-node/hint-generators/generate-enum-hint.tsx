import type { HintGeneratorParams } from "./types";
import {
	generateSymbolHighlight,
	generateTriggerPrefix,
	generateValueHighlight,
	generateVariableHighlight,
} from "./utils";

/**
 * ENUM type hint generator
 * Supported operations:
 * - get: Get variable value
 * - update: Update variable (set/append/remove/clear)
 * - reset: Reset variable
 */
export const generateEnumHint = (
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
		selectedValues,
		symbol,
		conditionTrigger,
		timerTrigger,
	} = params;

	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
		t,
	});

	// Build display value
	const hasValues = selectedValues && selectedValues.length > 0;
	const valueList = hasValues ? selectedValues.join("、") : "";
	const displayValue = hasValues
		? `[${valueList}]`
		: value !== undefined && value !== null && value !== ""
			? value
			: "[]";

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
	if (displayValue !== "[]") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)} 当前值为{" "}
				{generateValueHighlight(displayValue)}
			</>
		);
	}

	// Scenario 3: Default - Will get value
	return (
		<>
			{triggerPrefix}
			将会获取 {generateVariableHighlight(variableDisplayName)} 的值
		</>
	);
}

// ==================== UPDATE operation ====================

/**
 * UPDATE operation - Update variable
 * Operation types:
 * - set: Set to specified value (supports dataflow trigger)
 * - append: Add elements
 * - remove: Remove elements
 * - clear: Clear all elements
 */
function generateUpdateOperation(params: HintGeneratorParams): React.ReactNode {
	const { operationType, dataflowTrigger } = params;

	// clear operation
	if (operationType === "clear") {
		return generateClearHint(params);
	}

	// set operation (dataflow trigger)
	if (operationType === "set" && dataflowTrigger?.fromVarDisplayName) {
		return generateDataflowSetHint(params);
	}

	// set/append/remove operations (normal trigger)
	if (
		operationType === "set" ||
		operationType === "append" ||
		operationType === "remove"
	) {
		return generateNormalUpdateHint(params);
	}

	return null;
}

/**
 * Clear operation - Clear all elements
 */
function generateClearHint(params: HintGeneratorParams): React.ReactNode {
	const { t, variableDisplayName, conditionTrigger, timerTrigger } = params;
	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
		t,
	});

	return (
		<>
			{triggerPrefix} {generateVariableHighlight(variableDisplayName)}{" "}
			{t("variableNode.hint.clear")}
		</>
	);
}

/**
 * Dataflow-triggered Set operation - Set to source variable value
 */
function generateDataflowSetHint(params: HintGeneratorParams): React.ReactNode {
	const { variableDisplayName, dataflowTrigger, t } = params;

	return (
		<>
			{generateVariableHighlight(variableDisplayName)}{" "}
			{t("variableNode.hint.set")}{" "}
			{generateValueHighlight(dataflowTrigger?.fromVarDisplayName || "")}
		</>
	);
}

/**
 * Normal update operation - set/append/remove
 */
function generateNormalUpdateHint(
	params: HintGeneratorParams,
): React.ReactNode {
	const {
		t,
		variableDisplayName,
		operationType,
		value,
		selectedValues,
		conditionTrigger,
		timerTrigger,
	} = params;

	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
		t,
	});

	// Build display value
	const hasValues = selectedValues && selectedValues.length > 0;
	const valueList = hasValues ? selectedValues.join("、") : "";
	const displayValue = hasValues
		? `[${valueList}]`
		: value !== undefined && value !== null && value !== ""
			? value
			: "[]";

	// set operation
	if (operationType === "set") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.set")} {generateValueHighlight(displayValue)}
			</>
		);
	}

	// append operation
	if (operationType === "append") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.append")} {generateValueHighlight(displayValue)}
			</>
		);
	}

	// remove operation
	if (operationType === "remove") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.remove")} {generateValueHighlight(displayValue)}
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
	const {
		t,
		variableDisplayName,
		value,
		selectedValues,
		conditionTrigger,
		timerTrigger,
	} = params;

	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
		t,
	});

	// Build display value
	const hasValues = selectedValues && selectedValues.length > 0;
	const valueList = hasValues ? selectedValues.join("、") : "";
	const displayValue = hasValues
		? `[${valueList}]`
		: value !== undefined && value !== null && value !== ""
			? value
			: "[]";

	return (
		<>
			{triggerPrefix}
			{generateVariableHighlight(variableDisplayName)}{" "}
			{t("variableNode.hint.reset")} {generateValueHighlight(displayValue)}
		</>
	);
}
