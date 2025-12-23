import type {
	ChartOptions,
	DataChangedScope,
	DeepPartial,
	MouseEventParams,
} from "lightweight-charts";
import { createChart, createSeriesMarkers } from "lightweight-charts";
import { useCallback } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { get_play_index } from "@/service/backtest-strategy/backtest-strategy-control";
import { getStrategyDatetimeApi } from "@/service/backtest-strategy/strategy-datetime";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import {
	addIndicatorSeries,
	addKlineSeries,
	addOperationSeries,
} from "../utils/add-chart-series";

interface UseKlineSeriesManagerProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
	chartContainerRef: React.RefObject<HTMLDivElement | null>;
	chartOptions: DeepPartial<ChartOptions>;
	onCrosshairMove: (param: MouseEventParams) => void;
	onSeriesDataUpdate: (scope: DataChangedScope) => void;
}

interface UseKlineSeriesManagerReturn {
	changeKline: () => Promise<void>;
}

/**
 * K-line series management
 *
 * Responsibilities:
 * - K-line period switching
 * - Data re-initialization
 * - Subscription management
 * - Order marker and price line restoration
 * - Time axis reset
 */
export const useKlineSeriesManager = ({
	strategyId,
	chartConfig,
	chartContainerRef,
	chartOptions,
	onCrosshairMove,
	onSeriesDataUpdate,
}: UseKlineSeriesManagerProps): UseKlineSeriesManagerReturn => {
	const {
		getKlineKeyStr,
		setKlineKeyStr,
		getChartRef,
		setChartRef,
		getKlineSeriesRef,
		setKlineSeriesRef,
		deleteKlineSeriesRef,
		deleteOrderMarkerSeriesRef,
		initKlineData,
		cleanupSubscriptions,
		subscribe,
		getOrderMarkers,
		getPositionPriceLine,
		getOrderPriceLine: getLimitOrderPriceLine,
		setOrderMarkerSeriesRef,
		incrementPaneVersion,
		initObserverSubscriptions,
		// Indicator series refs
		setIndicatorSeriesRef,
		setIndicatorSubChartPaneRef,
		addIndicatorSubChartPaneHtmlElementRef,
		// Operation series refs
		setOperationSeriesRef,
		setOperationSubChartPaneRef,
		addOperationSubChartPaneHtmlElementRef,
	} = useBacktestChartStore(chartConfig.id);

	const changeKline = useCallback(async () => {
		const nextKlineKey = chartConfig.klineChartConfig.klineKeyStr;
		const currentKlineKey = getKlineKeyStr();
		// If K-line keys don't match, switch K-line
		if (currentKlineKey !== nextKlineKey) {
			try {
				// Clear existing subscriptions to ensure indicator subscriptions are removed
				cleanupSubscriptions();
				// Reset K-line key
				setKlineKeyStr(nextKlineKey);
				// Fetch data first
				const playIndexValue = await get_play_index(strategyId);
				const strategyDatetime = (await getStrategyDatetimeApi(strategyId))
					.strategyDatetime;
				await initKlineData(strategyDatetime, playIndexValue, strategyId);

				// Get old chart reference
				const oldChart = getChartRef();
				if (oldChart && chartContainerRef.current) {
					const klineSeries = getKlineSeriesRef();
					if (klineSeries) {
						klineSeries.unsubscribeDataChanged(onSeriesDataUpdate);
						oldChart.removeSeries(klineSeries);
						// Delete klineSeriesRef from store
						deleteKlineSeriesRef();
						deleteOrderMarkerSeriesRef();
					}

					// Unsubscribe crosshair move event from old chart
					oldChart.unsubscribeCrosshairMove(onCrosshairMove);

					// Destroy old chart instance
					oldChart.remove();
					// Clear chart ref in store
					setChartRef(null);

					// Create new chart instance
					const newChart = createChart(chartContainerRef.current, chartOptions);
					setChartRef(newChart);

					// Create new klineSeries on new chart
					const newKlineSeries = addKlineSeries(
						newChart,
						chartConfig.klineChartConfig,
					);
					if (newKlineSeries) {
						newKlineSeries.subscribeDataChanged(onSeriesDataUpdate);
						setKlineSeriesRef(newKlineSeries);

						// Restore order markers and price lines
						const currentOrderMarkers = getOrderMarkers();
						const orderMarkerSeries = createSeriesMarkers(
							newKlineSeries,
							currentOrderMarkers.length > 0 ? currentOrderMarkers : [],
						);
						setOrderMarkerSeriesRef(orderMarkerSeries);

						const positionPriceLine = getPositionPriceLine();
						if (positionPriceLine.length > 0) {
							positionPriceLine.forEach((priceLine) => {
								newKlineSeries.createPriceLine(priceLine);
							});
						}

						const limitOrderPriceLine = getLimitOrderPriceLine();
						if (limitOrderPriceLine.length > 0) {
							limitOrderPriceLine.forEach((priceLine) => {
								newKlineSeries.createPriceLine(priceLine);
							});
						}
					}

					// Recreate indicator series on new chart (only non-deleted ones)
					chartConfig.indicatorChartConfigs.forEach((config) => {
						if (config.isDelete) return;

						if (config.isInMainChart) {
							// Main chart indicators
							config.seriesConfigs.forEach((seriesConfig) => {
								const indicatorSeries = addIndicatorSeries(
									newChart,
									config,
									seriesConfig,
								);
								if (indicatorSeries) {
									setIndicatorSeriesRef(
										config.indicatorKeyStr,
										seriesConfig.indicatorValueKey,
										indicatorSeries,
									);
								}
							});
						} else {
							// Subchart indicators - create new pane
							const subChartPane = newChart.addPane(false);
							setIndicatorSubChartPaneRef(config.indicatorKeyStr, subChartPane);

							setTimeout(() => {
								const htmlElement = subChartPane.getHTMLElement();
								if (htmlElement) {
									addIndicatorSubChartPaneHtmlElementRef(
										config.indicatorKeyStr,
										htmlElement,
									);
								}
							}, 10);

							config.seriesConfigs.forEach((seriesConfig) => {
								const indicatorSeries = addIndicatorSeries(
									subChartPane,
									config,
									seriesConfig,
								);
								if (indicatorSeries) {
									setIndicatorSeriesRef(
										config.indicatorKeyStr,
										seriesConfig.indicatorValueKey,
										indicatorSeries,
									);
								}
							});
						}
					});

					// Recreate operation series on new chart (only non-deleted ones)
					(chartConfig.operationChartConfigs || []).forEach((config) => {
						if (config.isDelete) return;

						if (config.isInMainChart) {
							// Main chart operations
							config.seriesConfigs.forEach((seriesConfig) => {
								const operationSeries = addOperationSeries(
									newChart,
									config,
									seriesConfig,
								);
								if (operationSeries) {
									setOperationSeriesRef(
										config.operationKeyStr,
										seriesConfig.outputSeriesKey,
										operationSeries,
									);
								}
							});
						} else {
							// Subchart operations - create new pane
							const subChartPane = newChart.addPane(false);
							setOperationSubChartPaneRef(config.operationKeyStr, subChartPane);

							setTimeout(() => {
								const htmlElement = subChartPane.getHTMLElement();
								if (htmlElement) {
									addOperationSubChartPaneHtmlElementRef(
										config.operationKeyStr,
										htmlElement,
									);
								}
							}, 10);

							config.seriesConfigs.forEach((seriesConfig) => {
								const operationSeries = addOperationSeries(
									subChartPane,
									config,
									seriesConfig,
								);
								if (operationSeries) {
									setOperationSeriesRef(
										config.operationKeyStr,
										seriesConfig.outputSeriesKey,
										operationSeries,
									);
								}
							});
						}
					});

					// Subscribe crosshair move event on new chart
					newChart.subscribeCrosshairMove(onCrosshairMove);

					// Reset time axis
					const timeScale = newChart.timeScale();
					timeScale.resetTimeScale();
					requestAnimationFrame(() => {
						timeScale.fitContent();
					});

					// Re-initialize observer subscriptions
					setTimeout(() => {
						initObserverSubscriptions();
					}, 100);
				}

				// Re-subscribe to the latest K-line data stream
				subscribe(nextKlineKey);
				// Increment pane version to force legend components to re-render
				incrementPaneVersion();
			} catch (error) {
				console.error("Error switching K-line:", error);
			}
		}
	}, [
		strategyId,
		chartConfig,
		chartContainerRef,
		chartOptions,
		initKlineData,
		setKlineSeriesRef,
		getKlineKeyStr,
		setKlineKeyStr,
		getChartRef,
		setChartRef,
		getKlineSeriesRef,
		deleteKlineSeriesRef,
		deleteOrderMarkerSeriesRef,
		getOrderMarkers,
		getPositionPriceLine,
		getLimitOrderPriceLine,
		setOrderMarkerSeriesRef,
		onCrosshairMove,
		onSeriesDataUpdate,
		cleanupSubscriptions,
		subscribe,
		incrementPaneVersion,
		initObserverSubscriptions,
		setIndicatorSeriesRef,
		setIndicatorSubChartPaneRef,
		addIndicatorSubChartPaneHtmlElementRef,
		setOperationSeriesRef,
		setOperationSubChartPaneRef,
		addOperationSubChartPaneHtmlElementRef,
	]);

	return { changeKline };
};

export type { UseKlineSeriesManagerProps, UseKlineSeriesManagerReturn };
