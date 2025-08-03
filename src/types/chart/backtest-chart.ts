import type {
	IndicatorChartConfig,
	KlineChartConfig,
	LayoutMode,
	// SubChartConfig,
} from ".";

// 回测图表配置
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
