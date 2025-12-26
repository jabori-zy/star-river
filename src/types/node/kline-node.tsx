import type { Node } from "@xyflow/react";
import type { Kline } from "@/types/kline";
import type {
	BacktestDataSource,
	SelectedAccount,
	TimeRange,
} from "@/types/strategy";
import type { NodeDataBase } from ".";

export type SelectedSymbol = {
	configId: number; // Configuration id
	outputHandleId: string; // Output id, used to connect to other nodes
	symbol: string; // Trading pair
	interval: string; // Time interval
	klineValue?: Kline;
};

// Kline node live trading configuration
export type KlineNodeLiveConfig = {
	selectedAccount: SelectedAccount | null; // Selected account
	selectedSymbols: SelectedSymbol[]; // Selected trading pairs (multiple selection allowed)
};

// Kline node simulated trading configuration
export type KlineNodeSimulateConfig = {
	selectedAccount: SelectedAccount; // Selected account
	selectedSymbols: SelectedSymbol[]; // Selected trading pairs (multiple selection allowed)
};

// Kline node backtest trading file data source configuration
export type KlineNodeBacktestFileModeConfig = {
	filePath: string; // File path
};

// Kline node backtest trading exchange data source configuration
export type KlineNodeBacktestExchangeModeConfig = {
	selectedAccount: SelectedAccount | null; // Data source account
	selectedSymbols: SelectedSymbol[]; // Selected trading pairs (multiple selection allowed)
	timeRange: TimeRange; // Time range
};

// Kline node backtest trading configuration
export type KlineNodeBacktestConfig = {
	dataSource: BacktestDataSource; // Data source
	fileModeConfig: KlineNodeBacktestFileModeConfig | null; // File data source configuration
	exchangeModeConfig: KlineNodeBacktestExchangeModeConfig | null; // Exchange data source configuration
	seriesLength?: number; // Series length
};

export type KlineData = {
	timestamp: number | null; // Timestamp
	open: number | null; // Open price
	high: number | null; // High price
	low: number | null; // Low price
	close: number | null; // Close price
	volume: number | null; // Trading volume
};

// Real-time data node data
export type KlineNodeData = NodeDataBase & {
	liveConfig?: KlineNodeLiveConfig; // Live trading configuration. Among the three configurations, only one is valid, can coexist
	simulateConfig?: KlineNodeSimulateConfig; // Simulated trading configuration
	backtestConfig?: KlineNodeBacktestConfig; // Backtest trading configuration
};
export type KlineNode = Node<KlineNodeData, "klineNode">;
