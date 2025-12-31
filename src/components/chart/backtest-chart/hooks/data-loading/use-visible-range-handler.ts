import type { LogicalRange } from "lightweight-charts";
import { useEffect } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { getDateTimeFromChartTimestamp } from "@/components/chart/backtest-chart/utls";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { useIndicatorDataLoader } from "./use-indicator-data-loader";
import { useKlineDataLoader } from "./use-kline-data-loader";
import { useOperationResultLoader } from "./use-operation-result-loader";

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
		getOperationSeriesRef,
		getKlineKeyStr,
		setVisibleLogicalRange,
		getVisibleLogicalRange,
	} = useBacktestChartStore(chartConfig.id);

	const { loadKlineHistory } = useKlineDataLoader({
		strategyId,
		chartId: chartConfig.id,
	});
	const { loadIndicatorHistory } = useIndicatorDataLoader({
		strategyId,
		chartConfig,
	});
	const { loadOperationHistory } = useOperationResultLoader({
		strategyId,
		chartConfig,
	});

	// Subscribe to chart's visible logical range changes
	useEffect(() => {
		const chart = getChartRef();
		if (!chart || !isInitialized) {
			return;
		}

		// Handle visible range change - only update store
		const handleVisibleRangeChange = (logicalRange: LogicalRange | null) => {
			if (!logicalRange) {
				return;
			}
			setVisibleLogicalRange(logicalRange);
		};

		// Infinite load kline history data
		const infiniteLoadKlineHistory = (logicalRange: LogicalRange) => {
			// Get current klineSeries
			const currentKlineSeries = getKlineSeriesRef();
			if (!currentKlineSeries) {
				return;
			}

			const klineData = currentKlineSeries.data();
			const firstKline = klineData[0];
			const firstKlineDateTime = firstKline
				? getDateTimeFromChartTimestamp(firstKline.time as number)
				: null;

			if (!firstKlineDateTime) {
				return;
			}

			// Get klineKeyStr
			const klineKeyStr = getKlineKeyStr();
			if (!klineKeyStr) {
				return;
			}

			// Calculate length: abs(from) + 100
			const length = Math.ceil(Math.abs(logicalRange.from)) + 100;
			// Load kline history data
			loadKlineHistory(firstKlineDateTime, klineKeyStr, length).catch((error) => {
				console.error("Error loading K-line historical data:", error);
			});
		};

		// Handle mouse up - check if need to load history data
		const handleMouseUp = () => {
			// Get current visible logical range from store
			const logicalRange = getVisibleLogicalRange();
			if (!logicalRange) {
				return;
			}

			// Only load more data when approaching the left boundary
			if (logicalRange.from >= 30) {
				return;
			}

			// Load kline history
			infiniteLoadKlineHistory(logicalRange);

			// Load indicator history
			infiniteLoadIndicatorHistory(logicalRange);

			// Load operation history
			infiniteLoadOperationHistory(logicalRange);
		};

		// Infinite load indicator history data
		const infiniteLoadIndicatorHistory = (logicalRange: LogicalRange) => {
			const indicatorsNeedingData = chartConfig.indicatorChartConfigs.filter(
				(config) => !config.isDelete,
			);

			if (indicatorsNeedingData.length === 0) {
				return;
			}

			// Calculate length: abs(from) + 100
			const length = Math.ceil(Math.abs(logicalRange.from)) + 100;

			indicatorsNeedingData.forEach((config) => {
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
								break;
							}
						}
					}
				}

				if (firstIndicatorDateTime) {
					loadIndicatorHistory(
						config.indicatorKeyStr,
						firstIndicatorDateTime,
						config.seriesConfigs,
						length,
					).catch((error) => {
						console.error(
							`Error loading historical data for indicator ${config.indicatorKeyStr}:`,
							error,
						);
					});
				}
			});
		};

		// Infinite load operation history data
		const infiniteLoadOperationHistory = (logicalRange: LogicalRange) => {
			const operationsNeedingData = chartConfig.operationChartConfigs.filter(
				(config) => !config.isDelete,
			);

			if (operationsNeedingData.length === 0) {
				return;
			}

			// Calculate length: abs(from) + 100
			const length = Math.ceil(Math.abs(logicalRange.from)) + 100;

			operationsNeedingData.forEach((config) => {
				let firstOperationDateTime = "";

				for (const seriesConfig of config.seriesConfigs) {
					const operationSeriesRef = getOperationSeriesRef(
						config.operationKeyStr,
						seriesConfig.outputSeriesKey,
					);
					if (operationSeriesRef) {
						const firstData = operationSeriesRef.data()[0];
						if (firstData) {
							const firstDataTime = getDateTimeFromChartTimestamp(
								firstData.time as number,
							);
							if (firstDataTime) {
								firstOperationDateTime = firstDataTime;
								break;
							}
						}
					}
				}

				if (firstOperationDateTime) {
					loadOperationHistory(
						config.operationKeyStr,
						firstOperationDateTime,
						config.seriesConfigs,
						length,
					).catch((error) => {
						console.error(
							`Error loading historical data for operation ${config.operationKeyStr}:`,
							error,
						);
					});
				}
			});
		};

		// Subscribe to visible range changes
		chart
			.timeScale()
			.subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

		// Track if dragging started from chart element
		let isDragging = false;
		const chartElement = chart.chartElement();

		const handleMouseDown = () => {
			isDragging = true;
		};

		const handleDocumentMouseUp = () => {
			if (isDragging) {
				isDragging = false;
				handleMouseUp();
			}
		};

		// Listen mousedown on chart element, mouseup on document
		chartElement.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mouseup", handleDocumentMouseUp);

		// Cleanup function: Unsubscribe
		return () => {
			chart
				.timeScale()
				.unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
			chartElement.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mouseup", handleDocumentMouseUp);
		};
	}, [
		isInitialized,
		chartConfig.indicatorChartConfigs,
		chartConfig.operationChartConfigs,
		getChartRef,
		getKlineSeriesRef,
		getIndicatorSeriesRef,
		getOperationSeriesRef,
		getKlineKeyStr,
		setVisibleLogicalRange,
		getVisibleLogicalRange,
		loadKlineHistory,
		loadIndicatorHistory,
		loadOperationHistory,
	]);
};

export type { UseVisibleRangeHandlerProps };
