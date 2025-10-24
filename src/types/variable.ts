import {
	TbAbc,
	TbClock,
	TbListLetters,
	TbNumber,
	TbPercentage,
	TbToggleLeft,
} from "react-icons/tb";

export enum VariableValueType {
	NUMBER = "number", // 数字
	STRING = "string", // 字符串
	BOOLEAN = "boolean", // 布尔
	TIME = "time", // 时间
	ENUM = "enum", // 枚举类型
	PERCENTAGE = "percentage", // 百分比
}

// 获取变量类型对应的图标组件
export const getVariableValueTypeIcon = (type: VariableValueType) => {
	switch (type) {
		case VariableValueType.NUMBER:
			return TbNumber;
		case VariableValueType.BOOLEAN:
			return TbToggleLeft;
		case VariableValueType.STRING:
			return TbAbc;
		case VariableValueType.TIME:
			return TbClock;
		case VariableValueType.ENUM:
			return TbListLetters;
		case VariableValueType.PERCENTAGE:
			return TbPercentage;
		default:
			return TbNumber;
	}
};

// 获取变量类型对应的图标颜色类名
export const getVariableValueTypeIconColor = (type: VariableValueType): string => {
	switch (type) {
		case VariableValueType.NUMBER:
			return "text-blue-500";
		case VariableValueType.ENUM:
			return "text-blue-500";
		case VariableValueType.BOOLEAN:
			return "text-purple-500";
		case VariableValueType.TIME:
			return "text-blue-500";
		case VariableValueType.STRING:
			return "text-green-500";
		case VariableValueType.PERCENTAGE:
			return "text-orange-500";
		default:
			return "text-blue-500";
	}
};


export type StrategyVariable = CustomVariable | SystemVariable;


export function isCustomVariable(variable: StrategyVariable): variable is CustomVariable {
	return variable.varType === "custom";
}

export function isSystemVariable(variable: StrategyVariable): variable is SystemVariable {
	return variable.varType === "system";
}


export interface SystemVariable {
	varType: "system";
	varName: string;
	varDisplayName: string;
	varValueType: VariableValueType;
	symbol?: string | null;
	varValue: string | number | boolean | string[] | null;

}





export interface CustomVariable {
	varType: "custom";
	varName: string; // 变量名（代码中使用的名称，符合变量命名规则）
	varDisplayName: string; // 显示名称
	varValueType: VariableValueType; // 变量类型
	initialValue: string | number | boolean | string[]; // 初始值(初始值不能为空)
	previousValue: string | number | boolean | string[] | null; // 前一个变量值(初始值为空)
	varValue: string | number | boolean | string[] | null; // 当前变量值
}

// 策略系统变量
export enum SystemVariableType {
	CURRENT_TIME = "current_time", // 当前时间
	IS_MARKET_OPEN = "is_market_open", // 是否开盘
	IS_MARKET_CLOSED = "is_market_closed", // 是否收盘
	IS_TRADABLE = "is_tradable", // 是否可交易
	TOTAL_POSITION_NUMBER = "total_position_number", // 总持仓数量
	POSITION_NUMBER = "position_number", // 持仓数量
	TOTAL_FILLED_ORDER_NUMBER = "total_filled_order_number", // 总已成交订单数量
	FILLED_ORDER_NUMBER = "filled_order_number", // 已成交订单数量
	CUMULATIVE_YIELD = "cumulative_yield", // 累计收益率
}

// 系统变量元数据
export interface SystemVariableMetadata {
	varName: string;
	varDisplayName: string;
	varValueType: VariableValueType;
	shouldSelectSymbol: boolean; // 是否需要选择交易对
	description: string;
}

// 工具函数：获取系统变量元数据（支持多语言）
export const getSystemVariableMetadata = (
	t: (key: string) => string,
): Record<SystemVariableType, SystemVariableMetadata> => ({
	[SystemVariableType.CURRENT_TIME]: {
		varName: "current_time",
		varDisplayName: t("variableNode.systemVariableName.currentTime"),
		varValueType: VariableValueType.TIME,
		shouldSelectSymbol: false,
		description: t("variableNode.systemVariableName.currentTime"),
	},
	[SystemVariableType.IS_MARKET_OPEN]: {
		varName: "is_market_open",
		varDisplayName: t("variableNode.systemVariableName.isMarketOpen"),
		varValueType: VariableValueType.BOOLEAN,
		shouldSelectSymbol: true,
		description: t("variableNode.systemVariableName.isMarketOpen"),
	},
	[SystemVariableType.IS_MARKET_CLOSED]: {
		varName: "is_market_closed",
		varDisplayName: t("variableNode.systemVariableName.isMarketClosed"),
		varValueType: VariableValueType.BOOLEAN,
		shouldSelectSymbol: true,
		description: t("variableNode.systemVariableName.isMarketClosed"),
	},
	[SystemVariableType.IS_TRADABLE]: {
		varName: "is_tradable",
		varDisplayName: t("variableNode.systemVariableName.isTradable"),
		varValueType: VariableValueType.BOOLEAN,
		shouldSelectSymbol: true,
		description: t("variableNode.systemVariableName.isTradable"),
	},
	[SystemVariableType.TOTAL_POSITION_NUMBER]: {
		varName: "total_position_number",
		varDisplayName: t("variableNode.systemVariableName.totalPositionNumber"),
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: false,
		description: t("variableNode.systemVariableName.totalPositionNumber"),
	},
	[SystemVariableType.TOTAL_FILLED_ORDER_NUMBER]: {
		varName: "total_filled_order_number",
		varDisplayName: t("variableNode.systemVariableName.totalFilledOrderNumber"),
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: false,
		description: t("variableNode.systemVariableName.totalFilledOrderNumber"),
	},
	[SystemVariableType.POSITION_NUMBER]: {
		varName: "position_number",
		varDisplayName: t("variableNode.systemVariableName.positionNumber"),
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: true,
		description: t("variableNode.systemVariableName.positionNumber"),
	},
	[SystemVariableType.FILLED_ORDER_NUMBER]: {
		varName: "filled_order_number",
		varDisplayName: t("variableNode.systemVariableName.filledOrderNumber"),
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: true,
		description: t("variableNode.systemVariableName.filledOrderNumber"),
	},
	[SystemVariableType.CUMULATIVE_YIELD]: {
		varName: "cumulative_yield",
		varDisplayName: t("variableNode.systemVariableName.cumulativeYield"),
		varValueType: VariableValueType.PERCENTAGE,
		shouldSelectSymbol: false,
		description: t("variableNode.systemVariableName.cumulativeYield"),
	},
});
