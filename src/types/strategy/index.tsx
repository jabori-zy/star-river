import type { Edge, Node } from "@xyflow/react";
import type { BacktestStrategyChartConfig } from "@/types/chart";
import type { Exchange } from "@/types/market";
import type { CustomVariable } from "@/types/variable";
import type { BacktestStrategyRunStatus } from "@/types/strategy/backtest-strategy";

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

export type StrategyRunState = BacktestStrategyRunStatus;


export interface Strategy {
	id: number; // strategy id
	name: string; // strategy name
	description: string; // strategy description
	isDeleted: boolean; // is deleted
	status: StrategyRunState; // status
	tradeMode: TradeMode; // trade mode
	nodes: Node[]; // nodes
	edges: Edge[]; // edges
	backtestChartConfig: BacktestStrategyChartConfig | null; // backtest chart config
	createTime: string; // create time
	updateTime: string; // update time
}

