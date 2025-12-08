import type {
	IndicatorChartConfig,
	KlineChartConfig,
	LayoutMode,
	// SubChartConfig,
} from ".";

// Backtest chart configuration
export type BacktestChartConfig = {
	id: number;
	chartName: string;
	klineChartConfig: KlineChartConfig;
	indicatorChartConfigs: IndicatorChartConfig[];
};

export type BacktestStrategyChartConfig = {
	charts: BacktestChartConfig[];
	layout: LayoutMode;
};
