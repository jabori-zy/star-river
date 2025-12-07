import type { TFunction } from "i18next";
import { useMemo } from "react";
import type {
	GetVariableConfig,
	ResetVariableConfig,
	UpdateVariableConfig,
} from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getDataFlowTriggerConfig,
	getEffectiveTriggerType,
} from "@/types/node/variable-node";

/**
 * Common error object structure
 */
export interface ValidationErrors {
	variable: string | null;
	symbol?: string | null;
	triggerCase: string | null;
	dataflow?: string | null;
}

/**
 * Common validation options
 */
export interface BaseValidationOptions {
	t: TFunction;
	duplicateOperation?: string | null;
}

/**
 * First layer: Basic common validation
 * Validation logic required by all configuration items
 */
export const validateBaseConfig = (
	config: { varName?: string },
	options: BaseValidationOptions,
): Pick<ValidationErrors, "variable"> => {
	const errors: Pick<ValidationErrors, "variable"> = {
		variable: null,
	};

	// 1. Check if variable is required
	if (!config.varName) {
		errors.variable =
			options.t("variableNode.variableRequired") || "Please select variable";
		return errors; // Early return to avoid subsequent checks
	}

	// 2. Check for duplicate operations
	if (options.duplicateOperation) {
		errors.variable = options.t("variableNode.duplicateOperationError", {
			operation: options.t(`variableNode.${options.duplicateOperation}`),
		});
	}

	return errors;
};

/**
 * Second layer: Trigger condition validation (applicable to Get/Update/Reset)
 */
export const validateTriggerConfig = (
	config: { triggerConfig?: any },
	options: { t: TFunction },
): Pick<ValidationErrors, "triggerCase"> => {
	const errors: Pick<ValidationErrors, "triggerCase"> = {
		triggerCase: null,
	};

	const effectiveTriggerType = getEffectiveTriggerType(config) ?? "condition";
	const triggerCase = getConditionTriggerConfig(config) ?? null;

	// Check if trigger condition is selected for condition trigger
	if (effectiveTriggerType === "condition" && !triggerCase) {
		errors.triggerCase =
			options.t("variableNode.triggerConditionRequired") || "Please select trigger condition";
	}

	return errors;
};

// ==================== Get Configuration Validation ====================

export interface GetConfigValidationOptions extends BaseValidationOptions {
	shouldShowSymbolSelector: boolean;
	hasSymbol: boolean;
}

/**
 * Get configuration specific validation: Trading pair selection
 */
export const validateGetConfigSymbol = (
	options: Pick<
		GetConfigValidationOptions,
		"shouldShowSymbolSelector" | "hasSymbol" | "t"
	>,
): Pick<ValidationErrors, "symbol"> => {
	const errors: Pick<ValidationErrors, "symbol"> = {
		symbol: null,
	};

	if (options.shouldShowSymbolSelector && !options.hasSymbol) {
		errors.symbol = options.t("variableNode.symbolRequired") || "Please select trading pair";
	}

	return errors;
};

/**
 * Get configuration complete validation
 */
export const validateGetConfig = (
	config: GetVariableConfig,
	options: GetConfigValidationOptions,
): ValidationErrors => {
	const baseErrors = validateBaseConfig(config, options);
	const triggerErrors = validateTriggerConfig(config, options);
	const symbolErrors = validateGetConfigSymbol(options);

	return {
		...baseErrors,
		...triggerErrors,
		...symbolErrors,
	};
};

/**
 * React Hook version (with useMemo optimization)
 */
export const useValidateGetConfig = (
	config: GetVariableConfig,
	options: GetConfigValidationOptions,
): ValidationErrors & { hasError: boolean } => {
	return useMemo(() => {
		const errors = validateGetConfig(config, options);
		const hasError = !!(errors.variable || errors.symbol || errors.triggerCase);
		return { ...errors, hasError };
	}, [
		config.varName,
		"symbol" in config ? config.symbol : undefined,
		config.triggerConfig,
		options.duplicateOperation,
		options.shouldShowSymbolSelector,
		options.hasSymbol,
	]);
};

// ==================== Update Configuration Validation ====================

export interface UpdateConfigValidationOptions extends BaseValidationOptions {
	effectiveTriggerType: "condition" | "timer" | "dataflow";
}

/**
 * Update configuration specific validation: Dataflow configuration
 */
export const validateUpdateConfigDataflow = (
	config: UpdateVariableConfig,
	options: Pick<UpdateConfigValidationOptions, "effectiveTriggerType" | "t">,
): Pick<ValidationErrors, "dataflow"> => {
	const errors: Pick<ValidationErrors, "dataflow"> = {
		dataflow: null,
	};

	if (options.effectiveTriggerType === "dataflow") {
		const dataflowConfig = getDataFlowTriggerConfig(config);
		if (!dataflowConfig?.fromNodeId || !dataflowConfig?.fromVar) {
			errors.dataflow =
				options.t("variableNode.dataflowSourceRequired") ||
				"Please select upstream node and variable";
		}
	}

	return errors;
};

/**
 * Update configuration complete validation
 */
export const validateUpdateConfig = (
	config: UpdateVariableConfig,
	options: UpdateConfigValidationOptions,
): ValidationErrors => {
	const baseErrors = validateBaseConfig(config, options);
	const triggerErrors = validateTriggerConfig(config, options);
	const dataflowErrors = validateUpdateConfigDataflow(config, options);

	return {
		...baseErrors,
		...triggerErrors,
		...dataflowErrors,
	};
};

/**
 * React Hook version
 */
export const useValidateUpdateConfig = (
	config: UpdateVariableConfig,
	options: UpdateConfigValidationOptions,
): ValidationErrors & { hasError: boolean } => {
	return useMemo(() => {
		const errors = validateUpdateConfig(config, options);
		const hasError = !!(
			errors.variable ||
			errors.triggerCase ||
			errors.dataflow
		);
		return { ...errors, hasError };
	}, [
		config.varName,
		config.triggerConfig,
		options.duplicateOperation,
		options.effectiveTriggerType,
	]);
};

// ==================== Reset Configuration Validation ====================

/**
 * Reset configuration complete validation (no specific logic, only combines basic validation)
 */
export const validateResetConfig = (
	config: ResetVariableConfig,
	options: BaseValidationOptions,
): Omit<ValidationErrors, "symbol" | "dataflow"> => {
	const baseErrors = validateBaseConfig(config, options);
	const triggerErrors = validateTriggerConfig(config, options);

	return {
		...baseErrors,
		...triggerErrors,
	};
};

/**
 * React Hook version
 */
export const useValidateResetConfig = (
	config: ResetVariableConfig,
	options: BaseValidationOptions,
): Omit<ValidationErrors, "symbol" | "dataflow"> & { hasError: boolean } => {
	return useMemo(() => {
		const errors = validateResetConfig(config, options);
		const hasError = !!(errors.variable || errors.triggerCase);
		return { ...errors, hasError };
	}, [config.varName, config.triggerConfig, options.duplicateOperation]);
};
