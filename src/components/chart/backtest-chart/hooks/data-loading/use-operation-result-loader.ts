import type { SingleValueData, UTCTimestamp } from "lightweight-charts";
import { useCallback } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { getChartAlignedUtcTimestamp } from "@/components/chart/backtest-chart/utls";
import { getStrategyDataApi } from "@/service/backtest-strategy/get-strategy-data";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";

interface SeriesConfig {
	outputSeriesKey: string;
}

interface UseOperationResultLoaderProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
}

interface UseOperationResultLoaderReturn {
	loadOperationHistory: (
		operationKeyStr: string,
		firstOperationDateTime: string,
		seriesConfigs: SeriesConfig[],
		length: number,
	) => Promise<void>;
}

/**
 * Operation historical data loading
 *
 * Responsibilities:
 * - Load operation historical data
 * - Batch process multiple operation series
 * - Data transformation and merging
 */
export const useOperationResultLoader = ({
	strategyId,
	chartConfig,
}: UseOperationResultLoaderProps): UseOperationResultLoaderReturn => {
	const { getOperationSeriesRef } = useBacktestChartStore(chartConfig.id);

	const loadOperationHistory = useCallback(
		async (
			operationKeyStr: string,
			firstOperationDateTime: string,
			seriesConfigs: SeriesConfig[],
			length: number,
		) => {
			try {
				const data = await getStrategyDataApi({
					strategyId,
					keyStr: operationKeyStr,
					datetime: firstOperationDateTime,
					limit: length,
				});

				const operationData = data as Record<string, number | Date>[];
				if (!operationData || !Array.isArray(operationData)) {
					return;
				}

				// Remove the last data point (to avoid duplicate slice calculations)
				const trimmedData = operationData.slice(0, -1);
				if (trimmedData.length === 0) {
					return;
				}

				const partialOperationData: Record<string, SingleValueData[]> = {};

				// Optimization: Pre-build data structure to avoid repeated array expansion
				trimmedData.forEach((item) => {
					Object.entries(item).forEach(([outputKey, value]) => {
						// Skip datetime field, only process operation values, and filter out data where value is 0 or null
						if (outputKey !== "datetime" && value !== 0 && value !== null) {
							if (!partialOperationData[outputKey]) {
								partialOperationData[outputKey] = [];
							}
							partialOperationData[outputKey].push({
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
					const operationSeriesRef = getOperationSeriesRef(
						operationKeyStr,
						seriesConfig.outputSeriesKey,
					);
					if (operationSeriesRef) {
						const originalData = operationSeriesRef.data() as SingleValueData[];
						const partialData =
							partialOperationData[seriesConfig.outputSeriesKey];
						if (partialData && partialData.length > 0) {
							const newData = [...partialData, ...originalData];
							operationSeriesRef.setData(newData);
						}
					}
				});
			} catch (error) {
				console.error(
					`Error loading historical data for operation ${operationKeyStr}:`,
					error,
				);
			}
		},
		[strategyId, getOperationSeriesRef],
	);

	return { loadOperationHistory };
};

export type { UseOperationResultLoaderProps, UseOperationResultLoaderReturn };
