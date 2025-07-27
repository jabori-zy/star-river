import type { Node } from "@xyflow/react";
import type { BacktestDataSource, SelectedAccount } from "@/types/strategy";

// 策略系统变量
export enum StrategySysVariable {
	POSITION_NUMBER = "position_number", // 持仓数量
	Filled_ORDER_NUMBER = "filled_order_number", // 已完成的订单数量
}

export type VariableValue = number | string | boolean;

// 获取变量的方式：条件触发和定时触发两种
export enum GetVariableType {
	CONDITION = "condition", // 条件触发
	TIMER = "timer", // 定时触发
}

// 定时触发的时间间隔配置
export type TimerConfig = {
	interval: number; // 时间间隔
	unit: "second" | "minute" | "hour" | "day"; // 时间单位
};

export type VariableConfig = {
	configId: number;
	inputHandleId: string;
	outputHandleId: string;
	symbol: string | null; // 交易对
	getVariableType: GetVariableType; // 获取变量的方式
	timerConfig?: TimerConfig; // 定时触发的时间间隔配置
	variableName: string; // 变量名称
	variable: string; // 变量类型，使用StrategySysVariable的值
	variableValue: VariableValue; // 变量值
};

export type VariableNodeLiveConfig = {
	selectedAccount: SelectedAccount | null; // 账户选择
	variableConfigs: VariableConfig[];
};

export type VariableNodeSimulateConfig = {
	selectedAccount: SelectedAccount | null; // 账户选择
	variableConfigs: VariableConfig[];
};

// 回测配置
// 回测模式：交易所模式和数据源模式
export type VariableNodeBacktestExchangeModeConfig = {
	selectedAccount: SelectedAccount; // 数据来源账户
};

export type VariableNodeBacktestConfig = {
	dataSource: BacktestDataSource;
	exchangeModeConfig?: VariableNodeBacktestExchangeModeConfig; // 交易所模式配置
	variableConfigs: VariableConfig[];
};

export type VariableNodeData = {
	strategyId: number;
	nodeName: string;
	liveConfig?: VariableNodeLiveConfig;
	simulateConfig?: VariableNodeSimulateConfig;
	backtestConfig?: VariableNodeBacktestConfig;
};

export type VariableNode = Node<VariableNodeData, "variableNode">;
