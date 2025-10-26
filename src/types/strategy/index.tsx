import type { Edge, Node } from "@xyflow/react";
import type { StrategyChartConfig } from "@/types/chart/strategy-chart-config";
import type { Exchange } from "@/types/market";
import type { CustomVariable } from "@/types/variable";

export type StrategyId = number;

export enum TradeMode {
	LIVE = "live",
	SIMULATE = "simulate",
	BACKTEST = "backtest",
}

// 策略已选择的账户
export type SelectedAccount = {
	id: number;
	exchange: string | Exchange;
	accountName: string;
	availableBalance?: number;
};

// 实盘交易配置
export interface StrategyLiveConfig {
	selectedAccounts: Array<SelectedAccount>; // 已选账户
	customVariables: CustomVariable[]; // 实盘策略自定义变量
}

// 模拟交易配置
export interface StrategySimulateConfig {
	selectedAccounts: Array<SelectedAccount>; // 已选账户
	customVariables: CustomVariable[]; // 模拟策略自定义变量
}

// 回测交易配置
// k线节点回测交易 数据来源
export enum BacktestDataSource {
	FILE = "file", // 文件
	EXCHANGE = "exchange", // 交易所
}

export type TimeRange = {
	startDate: string;
	endDate: string;
};

// // 数据源交易所
// export type DataSourceExchange = {
//   id: number;
//   exchange: Exchange | string;
//   accountName: string;
// }

// 回测交易所模式设置
export type StrategyBacktestExchangeModeConfig = {
	selectedAccounts: Array<SelectedAccount>; // 数据来源交易所
	timeRange: TimeRange; // 时间范围
};

export type StrategyBacktestFileModeConfig = {
	filePath: string; // 文件路径
	timeRange: TimeRange; // 时间范围
};

// 回测交易配置
export interface StrategyBacktestConfig {
	dataSource: BacktestDataSource; // 数据来源
	exchangeModeConfig?: StrategyBacktestExchangeModeConfig | null; //交易所模式设置
	fileModeConfig?: StrategyBacktestFileModeConfig | null; //文件模式设置
	initialBalance: number; // 初始资金
	leverage: number; // 杠杆倍数
	feeRate: number; // 手续费率
	playSpeed: number; // 回放速度
	customVariables: CustomVariable[]; // 回测策略自定义变量
}

// 策略变量定义

// 策略配置
export interface StrategyConfig {
	liveConfig: StrategyLiveConfig | null; // 实盘交易配置
	simulateConfig: StrategySimulateConfig | null; // 模拟交易配置
	backtestConfig: StrategyBacktestConfig | null; // 回测交易配置
}

export interface Strategy {
	id: number; // 策略ID
	name: string; // 策略名称
	description: string; // 策略描述
	isDeleted: boolean; // 是否删除
	status: number; // 状态
	tradeMode: TradeMode; // 交易模式
	config: StrategyConfig; // 策略配置
	nodes: Node[]; // 节点列表
	edges: Edge[]; // 边列表
	chartConfig: StrategyChartConfig[]; // 图表配置
	createTime: string; // 创建时间
	updateTime: string; // 更新时间
}

// 策略列表项组件的属性
export interface StrategyItemProps {
	strategyId: number;
	// 策略名称
	strategyName: string;
	// 策略描述
	strategyDescription: string;
	// 创建时间
	createTime: string;
	// 状态
	strategyStatus: "running" | "paused" | "error";
	onDelete: () => void;
}
