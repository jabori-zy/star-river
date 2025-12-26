import type { Node } from "@xyflow/react";
import type { IndicatorType } from "@/types/indicator";
import type { Exchange } from "@/types/market";
import type {
	BacktestDataSource,
	SelectedAccount,
	TimeRange,
} from "@/types/strategy";
import type { NodeDataBase } from ".";
import type { SelectedSymbol } from "./kline-node";

// Selected indicator, used to connect to other nodes, using new indicator configuration structure
export type SelectedIndicator = {
	configId: number; // Indicator id
	outputHandleId: string; // Output id, used to connect to other nodes
	indicatorType: IndicatorType; // Indicator type
	indicatorConfig: Record<string, unknown>; // getConfig() return value using new structure
	value: Record<string, number>;
};

// Live trading indicator configuration
export type IndicatorNodeLiveConfig = {
	exchange: string | Exchange | null; // Exchange
	symbol: string | null; // Trading pair
	interval: string | null; // Time interval
	selectedIndicators: SelectedIndicator[]; // Selected indicators
};

// Simulated trading indicator configuration
export type IndicatorNodeSimulateConfig = {
	exchange?: string | Exchange; // Exchange
	symbol?: string; // Trading pair
	interval?: string; // Time interval
	selectedIndicators: SelectedIndicator[]; // Selected indicators
};

export type IndicatorNodeBacktestFileConfig = {
	filePath: string; // File path
};

// Backtest trading exchange configuration
export type IndicatorNodeBacktestExchangeModeConfig = {
	selectedAccount: SelectedAccount | null; // Selected account
	selectedSymbol: SelectedSymbol | null; // Selected trading pair
	selectedIndicators: SelectedIndicator[]; // Selected indicators
	timeRange: TimeRange; // Time range
};

// Indicator node backtest mode configuration
export type IndicatorNodeBacktestConfig = {
	dataSource: BacktestDataSource; // Data source
	fileModeConfig: IndicatorNodeBacktestFileConfig | null; // File data source configuration
	exchangeModeConfig: IndicatorNodeBacktestExchangeModeConfig | null; // Exchange data source configuration
	sourceSeriesLength?: number; // Source series length
};

// Indicator node data type
export type IndicatorNodeData = NodeDataBase & {
	liveConfig?: IndicatorNodeLiveConfig; // Live trading configuration
	simulateConfig?: IndicatorNodeSimulateConfig; // Simulated trading configuration
	backtestConfig?: IndicatorNodeBacktestConfig; // Backtest trading configuration
};

export type IndicatorNode = Node<IndicatorNodeData, "indicatorNode">;
