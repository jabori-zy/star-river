import type { TFunction } from "i18next";
import type { StrategyStatsName } from "../statistics";
import type { StatsSeriesConfig } from ".";
import { SeriesType } from ".";

export type ValueType = "number" | "percentage";

export type StrategyStatsChartConfig = {
	chartName: string;
	visible: boolean;
	isDelete: boolean;
	valueType: ValueType;
	seriesConfigs: StatsSeriesConfig;
};

// Backtest strategy stats chart configuration
export type BacktestStrategyStatsChartConfig = {
	statsChartConfigs: StrategyStatsChartConfig[];
};

export const defaultBacktestStrategyStatsChartConfig: BacktestStrategyStatsChartConfig =
	{
		statsChartConfigs: [
			{
				chartName: "账户余额",
				visible: true,
				isDelete: false,
				valueType: "number",
				seriesConfigs: {
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
				seriesConfigs: {
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
				seriesConfigs: {
					name: "未实现盈亏",
					statsName: "unrealizedPnl",
					type: SeriesType.BASELINE,
					color: "#000000",
					lineWidth: 1,
				},
			},
			{
				chartName: "已实现盈亏",
				visible: true,
				isDelete: false,
				valueType: "number",
				seriesConfigs: {
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
				seriesConfigs: {
					name: "累计收益率",
					statsName: "cumulativeReturn",
					type: SeriesType.LINE,
					color: "#000000",
					lineWidth: 2,
				},
			},
			{
				chartName: "可用余额",
				visible: true,
				isDelete: false,
				valueType: "number",
				seriesConfigs: {
					name: "可用余额",
					statsName: "availableBalance",
					type: SeriesType.LINE,
					color: "#000000",
					lineWidth: 2,
				},
			},
		],
	};

/**
 * Get stats chart configuration (supports multiple languages)
 * @param statsName Stats metric name
 * @param t Internationalization translation function
 * @returns Chart configuration (with translated names)
 */
export function getStatsChartConfig(
	statsName: StrategyStatsName,
	t: TFunction,
): StrategyStatsChartConfig {
	const config = defaultBacktestStrategyStatsChartConfig.statsChartConfigs.find(
		(config) => config.seriesConfigs.statsName === statsName,
	);
	if (!config) {
		throw new Error(
			`Stats chart config not found for stats name: ${statsName}`,
		);
	}

	// Get the multilingual version of the chart name
	const chartName = t(`desktop.backtestPage.performance.${statsName}`);

	// Return configuration with translated names
	return {
		...config,
		chartName,
		seriesConfigs: {
			...config.seriesConfigs,
			name: chartName,
		},
	};
}
