import type { Node } from "@xyflow/react";
import type { BacktestDataSource, SelectedAccount } from "@/types/strategy";
import type { VariableValueType } from "@/types/variable";


// 定时触发的时间间隔配置
export type TimerConfig = {
	interval: number; // 时间间隔
	unit: "second" | "minute" | "hour" | "day"; // 时间单位
};

// 更新操作类型
export type UpdateOperationType =
	| "set"      // 直接赋值 (适用所有类型)
	| "add"      // 加法 += (仅number)
	| "subtract" // 减法 -= (仅number)
	| "multiply" // 乘法 *= (仅number)
	| "divide"   // 除法 /= (仅number)
	| "max"      // 取最大值 (仅number)
	| "min"      // 取最小值 (仅number)
	| "toggle";  // 布尔切换 (仅bool)

// 基础变量配置（所有操作共享）
type BaseVariableConfig = {
	configId: number;
	inputHandleId: string;
	outputHandleId: string;
	varType: "sys" | "custom"; // 变量类型，系统变量和自定义变量
	varName: string; // 变量名
	varValueType: VariableValueType; // 变量值类型
};

// 获取变量配置
export type GetVariableConfig = BaseVariableConfig & {
	varOperation: "get";
	symbol?: string | null; // 交易对，可以为空，表示不限制交易对
	varTriggerType: "condition" | "timer"; // 获取变量的方式（必填）
	timerConfig?: TimerConfig; // 定时触发的时间间隔配置
	varDisplayName: string; // 变量显示名称
	varValue: string | number | boolean; // 当前变量值
};

// 更新变量配置
export type UpdateVariableConfig = BaseVariableConfig & {
	varOperation: "update";
	updateOperationType: UpdateOperationType; // 更新操作类型
	varTriggerType: "condition" | "dataflow"; // 更新变量的触发方式（条件触发或数据流触发）
	varValue: string | number | boolean; // 要更新的值
};

// 变量配置联合类型（Discriminated Union）
export type VariableConfig = GetVariableConfig | UpdateVariableConfig;

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
