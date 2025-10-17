import type { Node } from "@xyflow/react";
import type { IconType } from "react-icons";
import { TbEdit, TbFileImport, TbRefresh } from "react-icons/tb";
import type { NodeType } from "@/types/node/index";
import type { BacktestDataSource, SelectedAccount } from "@/types/strategy";
import type { VariableValueType } from "@/types/variable";

// 时间单位
export type TimerUnit = "second" | "minute" | "hour" | "day";

// 重复模式
export type RepeatMode =
	| "hourly" // 每小时
	| "daily" // 每天
	| "weekly" // 每周
	| "monthly"; // 每月

// 固定间隔模式配置
export type IntervalTimerConfig = {
	mode: "interval";
	interval: number;
	unit: TimerUnit;
};

// 月度执行日期类型
export type DayOfMonth =
	| number // 1-31 具体日期
	| "first" // 第一天
	| "last"; // 最后一天

// 月份回退策略（当该月没有指定日期时）
export type MonthlyFallbackStrategy =
	| "last-day" // 在该月最后一天执行
	| "skip"; // 跳过该月

// 定时执行模式配置
export type ScheduledTimerConfig = {
	mode: "scheduled";
	time: string; // "09:30" HH:mm 格式
	repeatMode: RepeatMode;
	hourlyInterval?: number; // 小时间隔，仅当 repeatMode 为 hourly 时使用，默认为 1（每小时）
	customWeekdays?: number[]; // [1,2,3,4,5] 周一到周五（仅当 repeatMode 为 daily/weekly 时使用）
	dayOfMonth?: DayOfMonth; // 每月执行的日期（仅当 repeatMode 为 monthly 时使用）
	monthlyFallback?: MonthlyFallbackStrategy; // 月份回退策略（仅当 dayOfMonth 为 29/30/31 时使用）
	cronExpression?: string; // Cron 表达式，用于后端处理
};

// 定时触发配置（联合类型）
export type TimerConfig = IntervalTimerConfig | ScheduledTimerConfig;

// 更新操作类型
export type UpdateOperationType =
	| "set" // 直接赋值 (适用所有类型)
	| "add" // 加法 += (仅number)
	| "subtract" // 减法 -= (仅number)
	| "multiply" // 乘法 *= (仅number)
	| "divide" // 除法 /= (仅number)
	| "max" // 取最大值 (仅number)
	| "min" // 取最小值 (仅number)
	| "toggle" // 布尔切换 (仅bool)
	| "append" // 添加元素 (仅enum, 支持多个)
	| "remove" // 删除元素 (仅enum, 支持多个)
	| "clear"; // 清空数组 (仅enum)

// 基础变量配置（所有操作共享）
type BaseVariableConfig = {
	configId: number;
	inputHandleId: string;
	outputHandleId: string;
	varType: "system" | "custom"; // 变量类型，系统变量和自定义变量
	varName: string; // 变量名
	varDisplayName: string; // 变量显示名称
	varValueType: VariableValueType; // 变量值类型
};

// 获取变量配置
export type GetVariableConfig = BaseVariableConfig & {
	varOperation: "get";
	symbol?: string | null; // 交易对，可以为空，表示不限制交易对
	varTriggerType: "condition" | "timer"; // 获取变量的方式（必填）
	timerConfig?: TimerConfig; // 定时触发的时间间隔配置
	triggerCase?: TriggerCase | null; // 条件触发配置（当 varTriggerType 为 "condition" 时使用）
	varValue: string | number | boolean | string[]; // 当前变量值
};

// 更新变量配置

/**
 * 触发数据流配置
 */
export type TriggerDataFlow = {
	fromNodeType: NodeType | null;
	fromNodeId: string;
	fromNodeName: string;
	fromHandleId: string;
	fromVar: string;
	fromVarDisplayName: string;
	fromVarValueType: VariableValueType | null;
	fromVarConfigId: number;
};

/**
 * Case 分支触发配置
 */
export type CaseBranchTrigger = {
	triggerType: "case";
	fromNodeType: NodeType | null;
	fromHandleId: string;
	fromNodeId: string;
	fromNodeName: string;
	caseId: number; // case ID（必填）
};

/**
 * Else 分支触发配置
 */
export type ElseBranchTrigger = {
	triggerType: "else";
	fromNodeType: NodeType | null;
	fromHandleId: string;
	fromNodeId: string;
	fromNodeName: string;
};

/**
 * 条件触发配置（联合类型）
 * 用于表示 if-else 节点的触发分支
 */
export type TriggerCase = CaseBranchTrigger | ElseBranchTrigger;

export type UpdateVariableConfig = BaseVariableConfig & {
	varOperation: "update";
	updateOperationType: UpdateOperationType; // 更新操作类型
	varTriggerType: "condition" | "timer" | "dataflow"; // 更新变量的触发方式（条件触发、定时触发或数据流触发）
	timerConfig?: TimerConfig; // 定时触发的时间间隔配置
	triggerCase?: TriggerCase | null; // 条件触发配置（当 varTriggerType 为 "condition" 时使用）
	updateOperationValue: string | number | boolean | string[] | TriggerDataFlow; // 更新操作值
};

// 重置变量配置
export type ResetVariableConfig = BaseVariableConfig & {
	varOperation: "reset";
	varTriggerType: "condition" | "timer" | "dataflow"; // 重置变量的触发方式（条件触发、定时触发或数据流触发）
	timerConfig?: TimerConfig; // 定时触发的时间间隔配置
	triggerCase?: TriggerCase | null; // 条件触发配置（当 varTriggerType 为 "condition" 时使用）
	varInitialValue: string | number | boolean | string[]; // 初始变量值
};

// 变量配置联合类型（Discriminated Union）
export type VariableConfig =
	| GetVariableConfig
	| UpdateVariableConfig
	| ResetVariableConfig;

// 变量操作类型
export type VariableOperation = "get" | "update" | "reset";

// 获取变量操作对应的图标组件
export const getVariableOperationIcon = (
	operation: VariableOperation,
): IconType => {
	switch (operation) {
		case "get":
			return TbFileImport;
		case "update":
			return TbEdit;
		case "reset":
			return TbRefresh;
		default:
			return TbFileImport;
	}
};

// 获取变量操作对应的图标颜色类名
export const getVariableOperationIconColor = (
	operation: VariableOperation,
): string => {
	switch (operation) {
		case "get":
			return "text-blue-600";
		case "update":
			return "text-green-600";
		case "reset":
			return "text-orange-600";
		default:
			return "text-blue-600";
	}
};

// 获取变量操作对应的显示名称
export const getVariableOperationDisplayName = (
	operation: VariableOperation,
): string => {
	switch (operation) {
		case "get":
			return "获取变量";
		case "update":
			return "更新变量";
		case "reset":
			return "重置变量";
		default:
			return "获取变量";
	}
};

// 获取变量操作对应的描述
export const getVariableOperationDescription = (
	operation: VariableOperation,
): string => {
	switch (operation) {
		case "get":
			return "从系统或自定义变量中获取值";
		case "update":
			return "修改自定义变量的值(赋值、运算等)";
		case "reset":
			return "将自定义变量重置为初始值";
		default:
			return "从系统或自定义变量中获取值";
	}
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
