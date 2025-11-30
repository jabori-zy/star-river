import {
	TbAbc,
	TbClock,
	TbListLetters,
	TbNumber,
	TbPercentage,
	TbToggleLeft,
} from "react-icons/tb";
import type { TFunction } from "i18next";

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
	TOTAL_CURRENT_POSITION_AMOUNT = "total_current_position_amount", // 当前总持仓数量
	CURRENT_POSITION_AMOUNT = "current_position_amount", // 当前持仓数量(指定交易对)
	TOTAL_HISTORY_POSITION_AMOUNT = "total_history_position_amount", // 历史总持仓数量
	HISTORY_POSITION_AMOUNT = "history_position_amount", // 历史持仓数量(指定交易对)
	TOTAL_UNFILLED_ORDER_AMOUNT = "total_unfilled_order_amount", // 总未成交订单数量
	UNFILLED_ORDER_AMOUNT = "unfilled_order_amount", // 未成交订单数量(指定交易对)
	TOTAL_HISTORY_ORDER_AMOUNT = "total_history_order_amount", // 历史总订单数量
	HISTORY_ORDER_AMOUNT = "history_order_amount", // 历史订单数量(指定交易对)
	CURRENT_ROI = "current_roi", // 当前投资回报率
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
	t: TFunction,
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
	[SystemVariableType.TOTAL_CURRENT_POSITION_AMOUNT]: {
		varName: "total_current_position_amount",
		varDisplayName: t("variableNode.systemVariableName.totalCurrentPositionAmount"),
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: false,
		description: t("variableNode.systemVariableName.totalCurrentPositionAmount"),
	},
	[SystemVariableType.TOTAL_UNFILLED_ORDER_AMOUNT]: {
		varName: "total_unfilled_order_amount",
		varDisplayName: t("variableNode.systemVariableName.totalUnfilledOrderAmount"),
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: false,
		description: t("variableNode.systemVariableName.totalUnfilledOrderAmount"),
	},
	[SystemVariableType.CURRENT_POSITION_AMOUNT]: {
		varName: "current_position_amount",
		varDisplayName: t("variableNode.systemVariableName.currentPositionAmount"),
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: true,
		description: t("variableNode.systemVariableName.currentPositionAmount"),
	},
	[SystemVariableType.UNFILLED_ORDER_AMOUNT]: {
		varName: "unfilled_order_amount",
		varDisplayName: t("variableNode.systemVariableName.unfilledOrderAmount"),
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: true,
		description: t("variableNode.systemVariableName.unfilledOrderAmount"),
	},
	[SystemVariableType.TOTAL_HISTORY_POSITION_AMOUNT]: {
		varName: "total_history_position_amount",
		varDisplayName: t("variableNode.systemVariableName.totalHistoryPositionAmount"),
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: false,
		description: t("variableNode.systemVariableName.totalHistoryPositionAmount"),
	},
	[SystemVariableType.HISTORY_POSITION_AMOUNT]: {
		varName: "history_position_amount",
		varDisplayName: t("variableNode.systemVariableName.historyPositionAmount"),
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: true,
		description: t("variableNode.systemVariableName.historyPositionAmount"),
	},
	[SystemVariableType.TOTAL_HISTORY_ORDER_AMOUNT]: {
		varName: "total_history_order_amount",
		varDisplayName: t("variableNode.systemVariableName.totalHistoryOrderAmount"),
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: false,
		description: t("variableNode.systemVariableName.totalHistoryOrderAmount"),
	},
	[SystemVariableType.HISTORY_ORDER_AMOUNT]: {
		varName: "history_order_amount",
		varDisplayName: t("variableNode.systemVariableName.historyOrderAmount"),
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: true,
		description: t("variableNode.systemVariableName.historyOrderAmount"),
	},
	[SystemVariableType.CUMULATIVE_YIELD]: {
		varName: "cumulative_yield",
		varDisplayName: t("variableNode.systemVariableName.cumulativeYield"),
		varValueType: VariableValueType.PERCENTAGE,
		shouldSelectSymbol: false,
		description: t("variableNode.systemVariableName.cumulativeYield"),
	},
	[SystemVariableType.CURRENT_ROI]: {
		varName: "current_roi",
		varDisplayName: t("variableNode.systemVariableName.currentRoi"),
		varValueType: VariableValueType.PERCENTAGE,
		shouldSelectSymbol: true,
		description: t("variableNode.systemVariableName.currentRoi"),
	},
});
