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

export interface CustomVariable {
	varName: string; // 变量名（代码中使用的名称，符合变量命名规则）
	varDisplayName: string; // 显示名称
	varValueType: VariableValueType; // 变量类型
	initialValue: string | number | boolean | string[]; // 初始值(初始值不能为空)
	varValue: string | number | boolean | string[] | null; // 当前变量值
}

// 策略系统变量
export enum SystemVariable {
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

export const SYSTEM_VARIABLE_METADATA: Record<
	SystemVariable,
	SystemVariableMetadata
> = {
	[SystemVariable.CURRENT_TIME]: {
		varName: "current_time",
		varDisplayName: "当前时间",
		varValueType: VariableValueType.TIME,
		shouldSelectSymbol: false,
		description: "当前时区的时间",
	},
	[SystemVariable.IS_MARKET_OPEN]: {
		varName: "is_market_open",
		varDisplayName: "是否开盘",
		varValueType: VariableValueType.BOOLEAN,
		shouldSelectSymbol: true,
		description: "当前交易对是否开盘",
	},
	[SystemVariable.IS_MARKET_CLOSED]: {
		varName: "is_market_closed",
		varDisplayName: "是否收盘",
		varValueType: VariableValueType.BOOLEAN,
		shouldSelectSymbol: true,
		description: "当前交易对是否收盘",
	},
	[SystemVariable.IS_TRADABLE]: {
		varName: "is_tradable",
		varDisplayName: "是否可交易",
		varValueType: VariableValueType.BOOLEAN,
		shouldSelectSymbol: true,
		description: "当前交易对是否可交易",
	},
	[SystemVariable.TOTAL_POSITION_NUMBER]: {
		varName: "total_position_number",
		varDisplayName: "总持仓数量",
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: false,
		description: "总持仓数量",
	},
	[SystemVariable.TOTAL_FILLED_ORDER_NUMBER]: {
		varName: "total_filled_order_number",
		varDisplayName: "总已成交订单数量",
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: false,
		description: "总已成交订单数量",
	},
	[SystemVariable.POSITION_NUMBER]: {
		varName: "position_number",
		varDisplayName: "持仓数量",
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: true,
		description: "当前交易对的持仓数量",
	},
	[SystemVariable.FILLED_ORDER_NUMBER]: {
		varName: "filled_order_number",
		varDisplayName: "已完成订单数",
		varValueType: VariableValueType.NUMBER,
		shouldSelectSymbol: true,
		description: "已完成的订单数量",
	},
	[SystemVariable.CUMULATIVE_YIELD]: {
		varName: "cumulative_yield",
		varDisplayName: "累计收益率",
		varValueType: VariableValueType.PERCENTAGE,
		shouldSelectSymbol: false,
		description: "累计收益率",
	},
};

// 工具函数
export const getSystemVariableMetadata = (
	variable: SystemVariable,
): SystemVariableMetadata => {
	return SYSTEM_VARIABLE_METADATA[variable];
};
