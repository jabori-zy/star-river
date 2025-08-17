import type { StatsSeriesConfig } from ".";
import { SeriesType } from ".";
import type { StrategyStatsName } from "../statistics";

export type StrategyStatsChartConfig = {
	chartName: string;
	visible: boolean;
	seriesConfigs: StatsSeriesConfig;
};

// 回测策略统计图表配置
export type BacktestStrategyStatsChartConfig = {
	statsChartConfigs: StrategyStatsChartConfig[];
};

export const defaultBacktestStrategyStatsChartConfig: BacktestStrategyStatsChartConfig = {
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
					type: SeriesType.MOUNTAIN,
					color: "#000000",
					lineWidth: 2,
				},
			
		},
	],
};



export function getStatsChartConfig(statsName: StrategyStatsName): StrategyStatsChartConfig {
	const config = defaultBacktestStrategyStatsChartConfig.statsChartConfigs.find(config => config.seriesConfigs.statsName === statsName)
	if (!config) {
		throw new Error(`Stats chart config not found for stats name: ${statsName}`)
	}
	return config
}
