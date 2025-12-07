import type { LogicalRange } from "lightweight-charts";
import { useEffect } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { getDateTimeFromChartTimestamp } from "@/components/chart/backtest-chart/utls";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { useIndicatorDataLoader } from "./use-indicator-data-loader";
import { useKlineDataLoader } from "./use-kline-data-loader";

interface UseVisibleRangeHandlerProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
	isInitialized: boolean;
}

/**
 * Visible range handling and lazy loading coordination
 *
 * Responsibilities:
 * - Monitor visible range changes
 * - Virtual scroll detection (triggers when logicalRange.from >= 30)
 * - Debouncing and loading state management
 * - Coordinate K-line and indicator data loading
 */
export const useVisibleRangeHandler = ({
	strategyId,
	chartConfig,
	isInitialized,
}: UseVisibleRangeHandlerProps): void => {
	const {
		getChartRef,
		getKlineSeriesRef,
		getIndicatorSeriesRef,
		getKlineKeyStr,
		setVisibleLogicalRange,
	} = useBacktestChartStore(chartConfig.id);

	const { loadKlineHistory } = useKlineDataLoader({
		strategyId,
		chartId: chartConfig.id,
	});
	const { loadIndicatorHistory } = useIndicatorDataLoader({
		strategyId,
		chartConfig,
	});

	// Subscribe to chart's visible logical range changes
	useEffect(() => {
		const chart = getChartRef();
		if (!chart || !isInitialized) {
			return;
		}

		// Use ref to track if loading is in progress, to prevent duplicate requests
		const loadingRef = { current: false };

		const handleVisibleRangeChange = (logicalRange: LogicalRange | null) => {
			if (!logicalRange || loadingRef.current) {
				return;
			}

			// console.log("visibleRangeChange", logicalRange);
			setVisibleLogicalRange(logicalRange);

			// Only load more data when approaching the boundary
			if (logicalRange.from >= 30) {
				return;
			}

			// Set loading flag to prevent duplicate requests
			loadingRef.current = true;

			// Get current klineSeries (from the latest ref)
			const currentKlineSeries = getKlineSeriesRef();
			if (currentKlineSeries) {
				const klineData = currentKlineSeries.data();
				const firstKline = klineData[0];
				const firstKlineDateTime = firstKline
					? getDateTimeFromChartTimestamp(firstKline.time as number)
					: null;

				if (firstKlineDateTime) {
					console.log("firstKlineDateTime:", firstKlineDateTime);
					// Get klineKeyStr, return early if it doesn't exist
					const klineKeyStr = getKlineKeyStr();
					if (!klineKeyStr) {
						loadingRef.current = false;
						return;
					}

					// Get 100 K-lines before the first K-line
					loadKlineHistory(firstKlineDateTime, klineKeyStr)
						.catch((error) => {
							console.error("Error loading K-line historical data:", error);
						})
						.finally(() => {
							// Reset loading flag
							loadingRef.current = false;
						});
				}
			}

			// Handle indicator data
			const indicatorsNeedingData = chartConfig.indicatorChartConfigs.filter(
				(config) => !config.isDelete,
			);

			if (indicatorsNeedingData.length > 0) {
				indicatorsNeedingData.forEach((config) => {
					// Use find instead of forEach + return to more efficiently get the first timestamp
					let firstIndicatorDateTime = "";

					for (const seriesConfig of config.seriesConfigs) {
						const indicatorSeriesRef = getIndicatorSeriesRef(
							config.indicatorKeyStr,
							seriesConfig.indicatorValueKey,
						);
						if (indicatorSeriesRef) {
							const firstData = indicatorSeriesRef.data()[0];
							if (firstData) {
								const firstDataTime = getDateTimeFromChartTimestamp(
									firstData.time as number,
								);
								if (firstDataTime) {
									firstIndicatorDateTime = firstDataTime;
									break; // Exit immediately after finding the first valid time
								}
							}
						}
					}

					if (firstIndicatorDateTime) {
						// Get 100 data points before the indicator
						loadIndicatorHistory(
							config.indicatorKeyStr,
							firstIndicatorDateTime,
							config.seriesConfigs,
						).catch((error) => {
							console.error(
								`Error loading historical data for indicator ${config.indicatorKeyStr}:`,
								error,
							);
						});
					}
				});
			}
		};

		// Subscribe to visible range changes
		chart
			.timeScale()
			.subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

		// Cleanup function: Unsubscribe
		return () => {
			chart
				.timeScale()
				.unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
		};
	}, [
		isInitialized,
		chartConfig.indicatorChartConfigs,
		getChartRef,
		getKlineSeriesRef,
		getIndicatorSeriesRef,
		getKlineKeyStr,
		setVisibleLogicalRange,
		loadKlineHistory,
		loadIndicatorHistory,
	]);
};

export type { UseVisibleRangeHandlerProps };
