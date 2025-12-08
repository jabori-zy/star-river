import type { TFunction } from "i18next";
import {
	TbAbc,
	TbClock,
	TbListLetters,
	TbNumber,
	TbPercentage,
	TbToggleLeft,
} from "react-icons/tb";

export enum VariableValueType {
	NUMBER = "number", // Number
	STRING = "string", // String
	BOOLEAN = "boolean", // Boolean
	TIME = "time", // Time
	ENUM = "enum", // Enum type
	PERCENTAGE = "percentage", // Percentage
}

// Get the icon component for the variable type
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

// Get the icon color class name for the variable type
export const getVariableValueTypeIconColor = (
	type: VariableValueType,
): string => {
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

export function isCustomVariable(
	variable: StrategyVariable,
): variable is CustomVariable {
	return variable.varType === "custom";
}

export function isSystemVariable(
	variable: StrategyVariable,
): variable is SystemVariable {
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
	varName: string; // Variable name (name used in code, follows variable naming rules)
	varDisplayName: string; // Display name
	varValueType: VariableValueType; // Variable type
	initialValue: string | number | boolean | string[]; // Initial value (cannot be empty)
	previousValue: string | number | boolean | string[] | null; // Previous variable value (initially empty)
	varValue: string | number | boolean | string[] | null; // Current variable value
}

// Strategy system variables
export enum SystemVariableType {
	CURRENT_TIME = "current_time", // Current time
	IS_MARKET_OPEN = "is_market_open", // Whether market is open
	IS_MARKET_CLOSED = "is_market_closed", // Whether market is closed
	IS_TRADABLE = "is_tradable", // Whether tradable
	TOTAL_CURRENT_POSITION_AMOUNT = "total_current_position_amount", // Total current position amount
	CURRENT_POSITION_AMOUNT = "current_position_amount", // Current position amount (for specific trading pair)
	TOTAL_HISTORY_POSITION_AMOUNT = "total_history_position_amount", // Total historical position amount
	HISTORY_POSITION_AMOUNT = "history_position_amount", // Historical position amount (for specific trading pair)
	TOTAL_UNFILLED_ORDER_AMOUNT = "total_unfilled_order_amount", // Total unfilled order amount
	UNFILLED_ORDER_AMOUNT = "unfilled_order_amount", // Unfilled order amount (for specific trading pair)
	TOTAL_HISTORY_ORDER_AMOUNT = "total_history_order_amount", // Total historical order amount
	HISTORY_ORDER_AMOUNT = "history_order_amount", // Historical order amount (for specific trading pair)
	CURRENT_ROI = "current_roi", // Current return on investment
	CUMULATIVE_YIELD = "cumulative_yield", // Cumulative yield
}

// System variable metadata
export interface SystemVariableMetadata {
	varName: string;
	varDisplayName: string;
	varValueType: VariableValueType;
	shouldSelectSymbol: boolean; // Whether trading pair selection is required
	description: string;
}

// Utility function: Get system variable metadata (supports multiple languages)
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
		varDisplayName: t(
			"variableNode.systemVariableName.totalCurrentPositionAmount",
		),
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: false,
		description: t(
			"variableNode.systemVariableName.totalCurrentPositionAmount",
		),
	},
	[SystemVariableType.TOTAL_UNFILLED_ORDER_AMOUNT]: {
		varName: "total_unfilled_order_amount",
		varDisplayName: t(
			"variableNode.systemVariableName.totalUnfilledOrderAmount",
		),
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
		varDisplayName: t(
			"variableNode.systemVariableName.totalHistoryPositionAmount",
		),
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: false,
		description: t(
			"variableNode.systemVariableName.totalHistoryPositionAmount",
		),
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
		varDisplayName: t(
			"variableNode.systemVariableName.totalHistoryOrderAmount",
		),
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
