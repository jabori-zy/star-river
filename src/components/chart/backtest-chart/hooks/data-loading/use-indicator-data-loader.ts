import type { SingleValueData, UTCTimestamp } from "lightweight-charts";
import { useCallback } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { getChartAlignedUtcTimestamp } from "@/components/chart/backtest-chart/utls";
import { getStrategyDataApi } from "@/service/backtest-strategy/get-strategy-data";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

interface SeriesConfig {
	indicatorValueKey: string;
}

interface UseIndicatorDataLoaderProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
}

interface UseIndicatorDataLoaderReturn {
	loadIndicatorHistory: (
		indicatorKeyStr: string,
		firstIndicatorDateTime: string,
		seriesConfigs: SeriesConfig[],
	) => Promise<void>;
}

/**
 * Indicator historical data loading
 *
 * Responsibilities:
 * - Load indicator historical data
 * - Batch process multiple indicator series
 * - Data transformation and merging
 */
export const useIndicatorDataLoader = ({
	strategyId,
	chartConfig,
}: UseIndicatorDataLoaderProps): UseIndicatorDataLoaderReturn => {
	const { getIndicatorSeriesRef } = useBacktestChartStore(chartConfig.id);

	const loadIndicatorHistory = useCallback(
		async (
			indicatorKeyStr: string,
			firstIndicatorDateTime: string,
			seriesConfigs: SeriesConfig[],
		) => {
			try {
				const data = await getStrategyDataApi({
					strategyId,
					keyStr: indicatorKeyStr,
					datetime: firstIndicatorDateTime,
					limit: 100,
				});

				const indicatorData = data as Record<
					keyof IndicatorValueConfig,
					number | Date
				>[];
				if (!indicatorData || !Array.isArray(indicatorData)) {
					return;
				}

				// Remove the last data point (to avoid duplicate slice calculations)
				const trimmedData = indicatorData.slice(0, -1);
				if (trimmedData.length === 0) {
					return;
				}
				// console.log("Loading indicator historical data", trimmedData.length);

				const partialIndicatorData: Record<
					keyof IndicatorValueConfig,
					SingleValueData[]
				> = {};

				// Optimization: Pre-build data structure to avoid repeated array expansion
				trimmedData.forEach((item) => {
					Object.entries(item).forEach(([indicatorValueField, value]) => {
						// Skip datetime field, only process indicator values, and filter out data where value is 0 or null
						if (
							indicatorValueField !== "datetime" &&
							value !== 0 &&
							value !== null
						) {
							const key = indicatorValueField as keyof IndicatorValueConfig;
							if (!partialIndicatorData[key]) {
								partialIndicatorData[key] = [];
							}
							partialIndicatorData[key].push({
								time: getChartAlignedUtcTimestamp(
									item.datetime as unknown as string,
								) as UTCTimestamp,
								value: value as number,
							} as SingleValueData);
						}
					});
				});

				// Update data for each series
				seriesConfigs.forEach((seriesConfig) => {
					const indicatorSeriesRef = getIndicatorSeriesRef(
						indicatorKeyStr,
						seriesConfig.indicatorValueKey,
					);
					if (indicatorSeriesRef) {
						const originalData = indicatorSeriesRef.data() as SingleValueData[];
						const partialData =
							partialIndicatorData[
								seriesConfig.indicatorValueKey as keyof IndicatorValueConfig
							];
						if (partialData && partialData.length > 0) {
							const newData = [...partialData, ...originalData];
							indicatorSeriesRef.setData(newData);
						}
					}
				});
			} catch (error) {
				console.error(`Error loading historical data for indicator ${indicatorKeyStr}:`, error);
			}
		},
		[strategyId, getIndicatorSeriesRef],
	);

	return { loadIndicatorHistory };
};

export type { UseIndicatorDataLoaderProps, UseIndicatorDataLoaderReturn };
