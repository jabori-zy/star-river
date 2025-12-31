import type { CandlestickData, UTCTimestamp } from "lightweight-charts";
import { useCallback } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { getChartAlignedUtcTimestamp } from "@/components/chart/backtest-chart/utls";
import { getStrategyDataApi } from "@/service/backtest-strategy/get-strategy-data";
import type { Kline } from "@/types/kline";

interface UseKlineDataLoaderProps {
	strategyId: number;
	chartId: number;
}

interface UseKlineDataLoaderReturn {
	loadKlineHistory: (
		firstKlineDateTime: string,
		klineKeyStr: string,
		length: number,
	) => Promise<void>;
}

/**
 * K-line historical data loading
 *
 * Responsibilities:
 * - Load K-line historical data
 * - Data transformation and merging
 * - Delayed updates to avoid infinite triggering
 */
export const useKlineDataLoader = ({
	strategyId,
	chartId,
}: UseKlineDataLoaderProps): UseKlineDataLoaderReturn => {
	const { getKlineSeriesRef } = useBacktestChartStore(chartId);

	const loadKlineHistory = useCallback(
		async (firstKlineDateTime: string, klineKeyStr: string, length: number) => {
			try {
				const data = await getStrategyDataApi({
					strategyId,
					keyStr: klineKeyStr,
					datetime: firstKlineDateTime,
					limit: length,
				});

				const klinedata = data as Kline[];
				// Remove the last K-line (to avoid duplicate slice calculations)
				const trimmedData = klinedata.slice(0, -1);

				// If data length is 0, do not process
				if (trimmedData.length === 0) {
					return;
				}

				const partialKlineData: CandlestickData[] = trimmedData.map(
					(kline) => ({
						time: getChartAlignedUtcTimestamp(kline.datetime) as UTCTimestamp,
						open: kline.open,
						high: kline.high,
						low: kline.low,
						close: kline.close,
					}),
				);

				// Add delay to avoid infinite triggering of visible range change events
				setTimeout(() => {
					// Re-fetch the latest klineSeries to ensure using the latest reference
					const latestKlineSeries = getKlineSeriesRef();
					if (latestKlineSeries) {
						const newData = [...partialKlineData, ...latestKlineSeries.data()];
						latestKlineSeries.setData(newData as CandlestickData[]);
					}
				}, 250);
			} catch (error) {
				console.error("Error loading K-line historical data:", error);
			}
		},
		[strategyId, getKlineSeriesRef],
	);

	return { loadKlineHistory };
};

export type { UseKlineDataLoaderProps, UseKlineDataLoaderReturn };
