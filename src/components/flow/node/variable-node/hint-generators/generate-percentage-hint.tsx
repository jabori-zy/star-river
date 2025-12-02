import type { HintGeneratorParams } from "./types";
import {
	generateDataflowPath,
	generateSymbolHighlight,
	generateTriggerPrefix,
	generateValueHighlight,
	generateVariableHighlight,
} from "./utils";

/**
 * PERCENTAGE 类型提示生成器
 * 支持操作：
 * - get: 获取变量值
 * - update: 更新变量（set/add/subtract/multiply/divide/max/min）
 * - reset: 重置变量
 *
 * 特殊处理：自动添加百分号（%）后缀
 */
export const generatePercentageHint = (
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

/**
 * 格式化百分比值 - 确保值带有 % 后缀
 */
function formatPercentageValue(value?: string): string | null {
	if (!value) return null;

	const trimmedValue = value.trim();
	if (!trimmedValue) return null;

	// 如果已经有 %，直接返回
	if (trimmedValue.endsWith("%")) {
		return trimmedValue;
	}

	// 否则添加 %
	return `${trimmedValue}%`;
}

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

	const formattedValue = formatPercentageValue(value);

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
	if (formattedValue) {
		return (
			<>
				{triggerPrefix} {generateVariableHighlight(variableDisplayName)}{" "}
				当前值为 {generateValueHighlight(formattedValue)}
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
 * - set: 设置为指定值
 * - add: 增加
 * - subtract: 减少
 * - multiply: 乘以
 * - divide: 除以
 * - max: 取最大值
 * - min: 取最小值
 *
 * 支持数据流触发（从其他变量获取值）
 */
function generateUpdateOperation(params: HintGeneratorParams): React.ReactNode {
	const { operationType, dataflowTrigger } = params;

	if (!operationType) return null;

	// 数据流触发的特殊处理
	if (dataflowTrigger?.fromVarDisplayName) {
		return generateDataflowUpdateHint(params);
	}

	// 普通触发（条件/定时）
	return generateNormalUpdateHint(params);
}

/**
 * 数据流触发的更新操作
 * 包含特殊格式：
 * - max/min: "取 变量A 与 变量B 中的最大值/最小值"
 * - add/subtract/multiply/divide: "变量A + 变量B"（运算符格式）
 * - set: "变量A 将被设置为 变量B"
 */
function generateDataflowUpdateHint(
	params: HintGeneratorParams,
): React.ReactNode {
	const { t, language, variableDisplayName, operationType, dataflowTrigger } =
		params;

	if (!dataflowTrigger) return null;

	// 构建完整路径：节点名称/节点类型配置ID/变量显示名称
	const fullPath = generateDataflowPath(
		dataflowTrigger.fromNodeName,
		dataflowTrigger.fromNodeType,
		dataflowTrigger.fromVarConfigId,
		dataflowTrigger.fromVarDisplayName,
		t,
	);

	// max/min 操作
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

	// add 操作 - 加法运算符格式
	if (operationType === "add") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} +{" "}
				{generateValueHighlight(fullPath)}
			</>
		);
	}

	// subtract 操作 - 减法运算符格式
	if (operationType === "subtract") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} -{" "}
				{generateValueHighlight(fullPath)}
			</>
		);
	}

	// multiply 操作 - 乘法运算符格式
	if (operationType === "multiply") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} ×{" "}
				{generateValueHighlight(fullPath)}
			</>
		);
	}

	// divide 操作 - 除法运算符格式
	if (operationType === "divide") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} ÷{" "}
				{generateValueHighlight(fullPath)}
			</>
		);
	}

	// set 操作 - 默认格式
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
 * 普通更新操作（条件/定时触发）
 * 使用固定值进行更新
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

	// set 操作
	if (operationType === "set") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.set")} {generateValueHighlight(formattedValue)}
			</>
		);
	}

	// add 操作
	if (operationType === "add") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)}{" "}
				{t("variableNode.hint.add")} {generateValueHighlight(formattedValue)}
			</>
		);
	}

	// subtract 操作
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

	// multiply 操作
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

	// divide 操作
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

// ==================== RESET 操作 ====================

/**
 * RESET 操作 - 重置变量为指定值
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
