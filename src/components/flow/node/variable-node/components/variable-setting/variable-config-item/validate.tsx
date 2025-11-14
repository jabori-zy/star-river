import { useMemo } from "react";
import type { TFunction } from "i18next";
import type {
	GetVariableConfig,
	UpdateVariableConfig,
	ResetVariableConfig,
} from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getDataFlowTriggerConfig,
	getEffectiveTriggerType,
} from "@/types/node/variable-node";

/**
 * 通用错误对象结构
 */
export interface ValidationErrors {
	variable: string | null;
	symbol?: string | null;
	triggerCase: string | null;
	dataflow?: string | null;
}

/**
 * 通用验证选项
 */
export interface BaseValidationOptions {
	t: TFunction;
	duplicateOperation?: string | null;
}

/**
 * 第一层：基础通用验证
 * 所有配置项都需要的验证逻辑
 */
export const validateBaseConfig = (
	config: { varName?: string },
	options: BaseValidationOptions,
): Pick<ValidationErrors, "variable"> => {
	const errors: Pick<ValidationErrors, "variable"> = {
		variable: null,
	};

	// 1. 检查变量是否必填
	if (!config.varName) {
		errors.variable = options.t("variableNode.variableRequired") || "请选择变量";
		return errors; // 早期返回，避免后续检查
	}

	// 2. 检查重复操作
	if (options.duplicateOperation) {
		errors.variable = options.t("variableNode.duplicateOperationError", {
			operation: options.t(`variableNode.${options.duplicateOperation}`),
		});
	}

	return errors;
};

/**
 * 第二层：触发条件验证（适用于 Get/Update/Reset）
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

	// 检查条件触发是否选择了触发条件
	if (effectiveTriggerType === "condition" && !triggerCase) {
		errors.triggerCase =
			options.t("variableNode.triggerConditionRequired") || "请选择触发条件";
	}

	return errors;
};

// ==================== Get 配置验证 ====================

export interface GetConfigValidationOptions extends BaseValidationOptions {
	shouldShowSymbolSelector: boolean;
	hasSymbol: boolean;
}

/**
 * Get 配置专属验证：交易对选择
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
		errors.symbol = options.t("variableNode.symbolRequired") || "请选择交易对";
	}

	return errors;
};

/**
 * Get 配置完整验证
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
 * React Hook 版本（带 useMemo 优化）
 */
export const useValidateGetConfig = (
	config: GetVariableConfig,
	options: GetConfigValidationOptions,
): ValidationErrors & { hasError: boolean } => {
	return useMemo(() => {
		const errors = validateGetConfig(config, options);
		const hasError = !!(
			errors.variable ||
			errors.symbol ||
			errors.triggerCase
		);
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

// ==================== Update 配置验证 ====================

export interface UpdateConfigValidationOptions extends BaseValidationOptions {
	effectiveTriggerType: "condition" | "timer" | "dataflow";
}

/**
 * Update 配置专属验证：数据流配置
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
				"请选择上游节点和变量";
		}
	}

	return errors;
};

/**
 * Update 配置完整验证
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
 * React Hook 版本
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

// ==================== Reset 配置验证 ====================

/**
 * Reset 配置完整验证（无专属逻辑，仅组合基础验证）
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
 * React Hook 版本
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
