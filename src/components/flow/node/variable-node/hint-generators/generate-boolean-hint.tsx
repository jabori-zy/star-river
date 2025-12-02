import type { HintGeneratorParams } from "./types";
import {
	generateSymbolHighlight,
	generateTriggerPrefix,
	generateValueHighlight,
	generateVariableHighlight,
} from "./utils";

/**
 * BOOLEAN 类型提示生成器
 * 支持操作：
 * - get: 获取变量值
 * - update: 更新变量（set/toggle）
 * - reset: 重置变量
 */
export const generateBooleanHint = (
	params: HintGeneratorParams,
): React.ReactNode => {
	const { varOperation } = params;

	// ============ GET 操作 ============
	if (varOperation === "get") {
		return generateGetOperation(params);
	}

	// ============ UPDATE 操作 ============
	if (varOperation === "update") {
		return generateUpdateOperation(params);
	}

	// ============ RESET 操作 ============
	if (varOperation === "reset") {
		return generateResetOperation(params);
	}

	return null;
};

// ==================== GET 操作 ====================

/**
 * GET 操作 - 获取变量值
 * 场景：
 * 1. 获取交易对变量（有 symbol）
 * 2. 已有值 - 显示当前值
 * 3. 默认 - 将会获取值
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

	// 场景1: 获取交易对变量
	if (symbol) {
		return (
			<>
				{triggerPrefix} {t("variableNode.hint.get")}{" "}
				{generateSymbolHighlight(symbol)}{" "}
				{generateVariableHighlight(variableDisplayName)}
			</>
		);
	}

	// 场景2: 已有值 - 显示当前值
	if (value) {
		return (
			<>
				{triggerPrefix} {generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.currentValue")}{" "}
				{generateValueHighlight(valueLabel)}
			</>
		);
	}

	// 场景3: 默认 - 将会获取值
	return (
		<>
			{triggerPrefix} {t("variableNode.hint.get")}{" "}
			{generateVariableHighlight(variableDisplayName)}
		</>
	);
}

// ==================== UPDATE 操作 ====================

/**
 * UPDATE 操作 - 更新变量
 * 操作类型：
 * - toggle: 切换 True/False
 * - set: 设置为指定值（支持数据流触发）
 */
function generateUpdateOperation(params: HintGeneratorParams): React.ReactNode {
	const { operationType, dataflowTrigger } = params;

	// toggle 操作
	if (operationType === "toggle") {
		return generateToggleHint(params);
	}

	// set 操作
	if (operationType === "set") {
		// 数据流触发
		if (dataflowTrigger?.fromVarDisplayName) {
			return generateDataflowSetHint(params);
		}
		// 条件/定时触发
		return generateNormalSetHint(params);
	}

	return null;
}

/**
 * Toggle 操作 - 在 True/False 之间切换
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
 * 数据流触发的 Set 操作 - 设置为来源变量的值
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
 * 普通 Set 操作 - 设置为指定值（条件/定时触发）
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

// ==================== RESET 操作 ====================

/**
 * RESET 操作 - 重置变量为指定值
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
