import type { HintGeneratorParams } from "./types";
import {
	generateSymbolHighlight,
	generateTriggerPrefix,
	generateValueHighlight,
	generateVariableHighlight,
} from "./utils";

/**
 * TIME type hint generator
 * Supported operations:
 * - get: Get variable value
 * - update: Update variable (set/add/subtract/multiply/divide/max/min)
 * - reset: Reset variable
 *
 * Note: Although logic is same as NUMBER type, maintained independently for future differentiation
 */
export const generateTimeHint = (
	params: HintGeneratorParams,
): React.ReactNode => {
	const { varOperation } = params;

	// ============ GET Operation ============
	if (varOperation === "get") {
		return generateGetOperation(params);
	}

	// ============ UPDATE Operation ============
	if (varOperation === "update") {
		return generateUpdateOperation(params);
	}

	// ============ RESET Operation ============
	if (varOperation === "reset") {
		return generateResetOperation(params);
	}

	return null;
};

// ==================== GET Operation ====================

/**
 * GET Operation - Get variable value
 * Scenarios:
 * 1. Get trading pair variable (with symbol)
 * 2. Has value - Show current value
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

	// Scenario 2: Has value - Show current value
	if (value) {
		return (
			<>
				{triggerPrefix} {generateVariableHighlight(variableDisplayName)}{" "}
				当前值为 {generateValueHighlight(value)}
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

// ==================== UPDATE Operation ====================

/**
 * UPDATE Operation - Update variable
 * Operation types:
 * - set: Set to specified value
 * - add: Add
 * - subtract: Subtract
 * - multiply: Multiply by
 * - divide: Divide by
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
 * Dataflow triggered update operation
 * Contains special formats:
 * - max/min: "Get max/min value between Variable A and Variable B"
 * - add/subtract/multiply/divide: "Variable A + Variable B" (operator format)
 * - set: "Variable A will be set to Variable B"
 */
function generateDataflowUpdateHint(
	params: HintGeneratorParams,
): React.ReactNode {
	const { t, language, variableDisplayName, operationType, dataflowTrigger } =
		params;

	const fromVarName = dataflowTrigger?.fromVarDisplayName || "";

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
					{generateValueHighlight(fromVarName)} 中的{operationLabel}
				</>
			);
		}
		if (language === "en-US") {
			return (
				<>
					Get the {operationLabel} value between{" "}
					{generateVariableHighlight(variableDisplayName)} and{" "}
					{generateValueHighlight(fromVarName)}
				</>
			);
		}
	}

	// add operation - Addition operator format
	if (operationType === "add") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} +{" "}
				{generateValueHighlight(fromVarName)}
			</>
		);
	}

	// subtract operation - Subtraction operator format
	if (operationType === "subtract") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} -{" "}
				{generateValueHighlight(fromVarName)}
			</>
		);
	}

	// multiply operation - Multiplication operator format
	if (operationType === "multiply") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} ×{" "}
				{generateValueHighlight(fromVarName)}
			</>
		);
	}

	// divide operation - Division operator format
	if (operationType === "divide") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} ÷{" "}
				{generateValueHighlight(fromVarName)}
			</>
		);
	}

	// set operation - Default format
	if (operationType === "set") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.set")} {generateValueHighlight(fromVarName)}
			</>
		);
	}

	return null;
}

/**
 * Normal update operation (condition/timer trigger)
 * Uses fixed value for update
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

	if (!value || !operationType) return null;

	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
		t,
	});

	// Operation text mapping
	const operationTextMap: Record<string, string> = {
		set: "will be set to",
		add: "will increase by",
		subtract: "will decrease by",
		multiply: "will multiply by",
		divide: "will divide by",
		max: "will take max value",
		min: "will take min value",
	};

	const operationText = operationTextMap[operationType];
	if (!operationText) return null;

	return (
		<>
			{triggerPrefix}
			{generateVariableHighlight(variableDisplayName)} {operationText}{" "}
			{generateValueHighlight(value)}
		</>
	);
}

// ==================== RESET Operation ====================

/**
 * RESET Operation - Reset variable to specified value
 */
function generateResetOperation(params: HintGeneratorParams): React.ReactNode {
	const { t, variableDisplayName, value, conditionTrigger, timerTrigger } =
		params;

	if (!value) return null;

	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
		t,
	});

	return (
		<>
			{triggerPrefix} {generateVariableHighlight(variableDisplayName)}{" "}
			{t("variableNode.hint.reset")} {generateValueHighlight(value)}
		</>
	);
}
