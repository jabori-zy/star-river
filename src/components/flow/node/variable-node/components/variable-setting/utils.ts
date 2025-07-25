import {
	StrategySysVariable,
	type VariableConfig,
} from "@/types/node/variable-node";

/**
 * 获取变量类型的中文名称
 */
export const getVariableLabel = (type: string): string => {
	switch (type) {
		case StrategySysVariable.POSITION_NUMBER:
			return "持仓数量";
		case StrategySysVariable.Filled_ORDER_NUMBER:
			return "已成交订单数量";
		default:
			return type;
	}
};

/**
 * 生成默认变量名称
 */
export const generateVariableName = (
	variableType: string,
	existingConfigsLength: number,
): string => {
	const typeLabel = getVariableLabel(variableType);
	const nextIndex = existingConfigsLength + 1;
	return `${typeLabel}${nextIndex}`;
};

/**
 * 检查是否存在重复配置（相同交易对+变量类型+触发方式）
 */
export const isDuplicateConfig = (
	existingConfigs: VariableConfig[],
	editingIndex: number | null,
	symbol: string,
	variable: string,
	getVariableType: string,
): boolean => {
	return existingConfigs.some(
		(config, index) =>
			index !== editingIndex &&
			(config.symbol || "") === symbol &&
			config.variable === variable &&
			config.getVariableType === getVariableType,
	);
};
