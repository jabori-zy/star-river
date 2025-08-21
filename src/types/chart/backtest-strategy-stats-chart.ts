import type { StatsSeriesConfig } from ".";
import { SeriesType } from ".";
import type { StrategyStatsName } from "../statistics";


export type ValueType = "number" | "percentage";

export type StrategyStatsChartConfig = {
	chartName: string;
	visible: boolean;
	isDelete: boolean;
	valueType: ValueType;
	seriesConfigs: StatsSeriesConfig;
};

// 回测策略统计图表配置
export type BacktestStrategyStatsChartConfig = {
	statsChartConfigs: StrategyStatsChartConfig[];
};

export const defaultBacktestStrategyStatsChartConfig: BacktestStrategyStatsChartConfig = {
	statsChartConfigs: [
		{
			chartName: "账户余额",
			visible: true,
			isDelete: false,
			valueType: "number",
			seriesConfigs: 
				{
					name: "账户余额",
					statsName: "balance",
					type: SeriesType.LINE,
					color: "#000000",
					lineWidth: 2,
				},
			
		},
		{
			chartName: "净值",
			visible: true,
			isDelete: false,
			valueType: "number",
			seriesConfigs: 
				{
					name: "净值",
					statsName: "equity",
					type: SeriesType.LINE,
					color: "#000000",
					lineWidth: 2,
				},
			
		},
		{
			chartName: "未实现盈亏",
			visible: true,
			isDelete: false,
			valueType: "number",
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
			chartName: "已实现盈亏",
			visible: true,
			isDelete: false,
			valueType: "number",
			seriesConfigs: 
				{
					name: "已实现盈亏",
					statsName: "realizedPnl",
					type: SeriesType.LINE,
					color: "#000000",
					lineWidth: 2,
				},
			
		},
		{
			chartName: "累计收益率",
			visible: true,
			isDelete: false,
			valueType: "percentage",
			seriesConfigs: 
				{
					name: "累计收益率",
					statsName: "cumulativeReturn",
					type: SeriesType.LINE,
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
