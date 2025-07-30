import type { KlineChartConfig, LayoutMode, SubChartConfig } from ".";

// 回测图表配置
export type BacktestChartConfig = {
	id: number;
	chartName: string;
	klineChartConfig: KlineChartConfig;
	subChartConfigs: SubChartConfig[]; // 子图配置
};

export type BacktestStrategyChartConfig = {
	charts: BacktestChartConfig[];
	layout: LayoutMode;
};
