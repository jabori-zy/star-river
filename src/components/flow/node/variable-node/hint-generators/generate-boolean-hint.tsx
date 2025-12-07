import type { HintGeneratorParams } from "./types";
import {
	generateSymbolHighlight,
	generateTriggerPrefix,
	generateValueHighlight,
	generateVariableHighlight,
} from "./utils";

/**
 * BOOLEAN type hint generator
 * Supported operations:
 * - get: Get variable value
 * - update: Update variable (set/toggle)
 * - reset: Reset variable
 */
export const generateBooleanHint = (
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
		symbol,
		conditionTrigger,
		timerTrigger,
	} = params;

	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
		t,
	});
	const valueLabel = value === "false" ? "False" : "True";

	// Scenario 1: Get trading pair variable
	if (symbol) {
		return (
			<>
				{triggerPrefix} {t("variableNode.hint.get")}{" "}
				{generateSymbolHighlight(symbol)}{" "}
				{generateVariableHighlight(variableDisplayName)}
			</>
		);
	}

	// Scenario 2: Has value - Display current value
	if (value) {
		return (
			<>
				{triggerPrefix} {generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.currentValue")}{" "}
				{generateValueHighlight(valueLabel)}
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
 * - toggle: Toggle True/False
 * - set: Set to specified value (supports dataflow trigger)
 */
function generateUpdateOperation(params: HintGeneratorParams): React.ReactNode {
	const { operationType, dataflowTrigger } = params;

	// toggle operation
	if (operationType === "toggle") {
		return generateToggleHint(params);
	}

	// set operation
	if (operationType === "set") {
		// Dataflow trigger
		if (dataflowTrigger?.fromVarDisplayName) {
			return generateDataflowSetHint(params);
		}
		// Condition/timer trigger
		return generateNormalSetHint(params);
	}

	return null;
}

/**
 * Toggle operation - Toggle between True/False
 */
function generateToggleHint(params: HintGeneratorParams): React.ReactNode {
	const { t, variableDisplayName, conditionTrigger, timerTrigger } = params;
	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
		t,
	});

	return (
		<>
			{triggerPrefix} {generateVariableHighlight(variableDisplayName)}{" "}
			{t("variableNode.hint.toggle")}
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
 * Normal Set operation - Set to specified value (condition/timer trigger)
 */
function generateNormalSetHint(params: HintGeneratorParams): React.ReactNode {
	const { t, variableDisplayName, value, conditionTrigger, timerTrigger } =
		params;

	if (!value) return null;

	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
		t,
	});
	const valueLabel = value === "false" ? "False" : "True";

	return (
		<>
			{triggerPrefix} {generateVariableHighlight(variableDisplayName)}{" "}
			{t("variableNode.hint.set")} {generateValueHighlight(valueLabel)}
		</>
	);
}

// ==================== RESET operation ====================

/**
 * RESET operation - Reset variable to specified value
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
	const valueLabel = value === "false" ? "False" : "True";

	return (
		<>
			{triggerPrefix}
			{generateVariableHighlight(variableDisplayName)}{" "}
			{t("variableNode.hint.reset")} {generateValueHighlight(valueLabel)}
		</>
	);
}
