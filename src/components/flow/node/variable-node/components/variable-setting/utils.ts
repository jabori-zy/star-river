import {
	type VariableConfig,
	type UpdateOperationType,
} from "@/types/node/variable-node";
import { SystemVariable } from "@/types/variable";

/**
 * 获取变量类型的中文名称
 */
export const getVariableLabel = (type: string): string => {
	switch (type) {
		case SystemVariable.POSITION_NUMBER:
			return "持仓数量";
		case SystemVariable.Filled_ORDER_NUMBER:
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
 * 只对 get 操作进行重复检查
 */
export const isDuplicateConfig = (
	existingConfigs: VariableConfig[],
	editingIndex: number | null,
	symbol: string,
	variable: string,
	triggerType: "condition" | "timer",
): boolean => {
	return existingConfigs.some(
		(config, index) =>
			index !== editingIndex &&
			config.varOperation === "get" && // 只检查 get 操作
			(config.symbol || "") === symbol &&
			config.varName === variable &&
			config.varTriggerType === triggerType,
	);
};

/**
 * 获取更新操作的输入框占位符文本
 */
export const getUpdateOperationPlaceholder = (
	operationType: UpdateOperationType,
): string => {
	const placeholderMap: Record<UpdateOperationType, string> = {
		set: "输入新值",
		add: "输入增加值",
		subtract: "输入减少值",
		multiply: "输入乘数",
		divide: "输入除数",
		max: "输入比较值",
		min: "输入比较值",
		toggle: "输入值",
	};
	return placeholderMap[operationType] || "输入值";
};
