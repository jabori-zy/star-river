import { LayoutMode, KlineChartConfig, SubChartConfig } from ".";

// 回测图表配置
export type BacktestChart = {
	id: number;
	chartName: string;
	klineChartConfig: KlineChartConfig;
	subChartConfigs: SubChartConfig[]; // 子图配置
};

export type BacktestStrategyChartConfig = {
	charts: BacktestChart[];
	layout: LayoutMode;
};
