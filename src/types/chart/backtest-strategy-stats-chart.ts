import type { StatsSeriesConfig } from ".";
import { SeriesType } from ".";

export type StrategyStatsChartConfig = {
	chartName: string;
	visible: boolean;
	seriesConfigs: StatsSeriesConfig;
};

// 回测策略统计图表配置
export type BacktestStrategyStatsChartConfig = {
	strategyId: number;
	statsChartConfigs: StrategyStatsChartConfig[];
};

export const defaultBacktestStrategyStatsChartConfig: Omit<
	BacktestStrategyStatsChartConfig,
	"strategyId"
> = {
	statsChartConfigs: [
		{
			chartName: "未实现盈亏",
			visible: true,
			seriesConfigs: 
				{
					name: "未实现盈亏",
					statsName: "unrealizedPnl",
					type: SeriesType.LINE,
					color: "#000000",
					lineWidth: 2,
				},
			
		},
		{
			chartName: "总资产价值",
			visible: true,
			seriesConfigs: 
				{
					name: "总资产价值",
					statsName: "totalEquity",
					type: SeriesType.LINE,
					color: "#000000",
					lineWidth: 2,
				},
			
		},
	],
};
