import type {
	IndicatorChartConfig,
	KlineChartConfig,
	LayoutMode,
	OperationChartConfig,
	// SubChartConfig,
} from ".";

// Backtest chart configuration
export type BacktestChartConfig = {
	id: number;
	chartName: string;
	klineChartConfig: KlineChartConfig;
	indicatorChartConfigs: IndicatorChartConfig[];
	operationChartConfigs: OperationChartConfig[];
};

export type BacktestStrategyChartConfig = {
	charts: BacktestChartConfig[];
	layout: LayoutMode;
};
