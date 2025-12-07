import type { Edge, Node } from "@xyflow/react";
import type { BacktestStrategyChartConfig } from "@/types/chart";
import type { Exchange } from "@/types/market";
import type { BacktestStrategyRunState } from "@/types/strategy/backtest-strategy";
import type { CustomVariable } from "@/types/variable";

export type StrategyId = number;

export enum TradeMode {
	LIVE = "live",
	SIMULATE = "simulate",
	BACKTEST = "backtest",
}

// Strategy selected accounts
export type SelectedAccount = {
	id: number;
	exchange: string | Exchange;
	accountName: string;
	availableBalance?: number;
};

// Live trading config
export interface StrategyLiveConfig {
	selectedAccounts: Array<SelectedAccount>; // Selected accounts
	customVariables: CustomVariable[]; // Live strategy custom variables
}

// Simulate trading config
export interface StrategySimulateConfig {
	selectedAccounts: Array<SelectedAccount>; // Selected accounts
	customVariables: CustomVariable[]; // Simulate strategy custom variables
}

// Backtest trading config
// Kline node backtest trading data source
export enum BacktestDataSource {
	FILE = "file", // File
	EXCHANGE = "exchange", // Exchange
}

export type TimeRange = {
	startDate: string;
	endDate: string;
};

// // Data source exchange
// export type DataSourceExchange = {
//   id: number;
//   exchange: Exchange | string;
//   accountName: string;
// }

// Backtest exchange mode config
export type StrategyBacktestExchangeModeConfig = {
	selectedAccounts: Array<SelectedAccount>; // Data source exchange
	timeRange: TimeRange; // Time range
};

export type StrategyBacktestFileModeConfig = {
	filePath: string; // File path
	timeRange: TimeRange; // Time range
};

// Backtest trading config
export interface StrategyBacktestConfig {
	dataSource: BacktestDataSource; // Data source
	exchangeModeConfig?: StrategyBacktestExchangeModeConfig | null; // Exchange mode config
	fileModeConfig?: StrategyBacktestFileModeConfig | null; // File mode config
	initialBalance: number; // Initial balance
	leverage: number; // Leverage multiplier
	feeRate: number; // Fee rate
	playSpeed: number; // Playback speed
	customVariables: CustomVariable[]; // Backtest strategy custom variables
}

export type StrategyRunState = BacktestStrategyRunState;

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
