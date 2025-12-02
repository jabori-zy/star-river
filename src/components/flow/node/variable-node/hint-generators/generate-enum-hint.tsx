import type { HintGeneratorParams } from "./types";
import {
	generateSymbolHighlight,
	generateTriggerPrefix,
	generateValueHighlight,
	generateVariableHighlight,
} from "./utils";

/**
 * ENUM 类型提示生成器
 * 支持操作：
 * - get: 获取变量值
 * - update: 更新变量（set/append/remove/clear）
 * - reset: 重置变量
 */
export const generateEnumHint = (
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

	// 构建显示值
	const hasValues = selectedValues && selectedValues.length > 0;
	const valueList = hasValues ? selectedValues.join("、") : "";
	const displayValue = hasValues
		? `[${valueList}]`
		: value !== undefined && value !== null && value !== ""
			? value
			: "[]";

	// 场景1: 获取交易对变量
	if (symbol) {
		return (
			<>
				{triggerPrefix}
				将会获取 {generateSymbolHighlight(symbol)}{" "}
				{generateVariableHighlight(variableDisplayName)} 的值
			</>
		);
	}

	// 场景2: 已有值 - 显示当前值
	if (displayValue !== "[]") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)} 当前值为{" "}
				{generateValueHighlight(displayValue)}
			</>
		);
	}

	// 场景3: 默认 - 将会获取值
	return (
		<>
			{triggerPrefix}
			将会获取 {generateVariableHighlight(variableDisplayName)} 的值
		</>
	);
}

// ==================== UPDATE 操作 ====================

/**
 * UPDATE 操作 - 更新变量
 * 操作类型：
 * - set: 设置为指定值（支持数据流触发）
 * - append: 添加元素
 * - remove: 删除元素
 * - clear: 清空所有元素
 */
function generateUpdateOperation(params: HintGeneratorParams): React.ReactNode {
	const { operationType, dataflowTrigger } = params;

	// clear 操作
	if (operationType === "clear") {
		return generateClearHint(params);
	}

	// set 操作（数据流触发）
	if (operationType === "set" && dataflowTrigger?.fromVarDisplayName) {
		return generateDataflowSetHint(params);
	}

	// set/append/remove 操作（普通触发）
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
 * Clear 操作 - 清空所有元素
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
 * 普通更新操作 - set/append/remove
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

	// 构建显示值
	const hasValues = selectedValues && selectedValues.length > 0;
	const valueList = hasValues ? selectedValues.join("、") : "";
	const displayValue = hasValues
		? `[${valueList}]`
		: value !== undefined && value !== null && value !== ""
			? value
			: "[]";

	// set 操作
	if (operationType === "set") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.set")} {generateValueHighlight(displayValue)}
			</>
		);
	}

	// append 操作
	if (operationType === "append") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.append")} {generateValueHighlight(displayValue)}
			</>
		);
	}

	// remove 操作
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

// ==================== RESET 操作 ====================

/**
 * RESET 操作 - 重置变量为指定值
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

	// 构建显示值
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
