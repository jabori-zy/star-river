import type { ChartOptions, DeepPartial, IChartApi } from "lightweight-charts";
import { createChart } from "lightweight-charts";
import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBacktestStatsChartStore } from "@/components/chart/backtest-stats-chart/backtest-stats-chart-store";
import { get_play_index } from "@/service/backtest-strategy/backtest-strategy-control";
import type { BacktestStrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import { addStatsSeries } from "./utils";
import { getStrategyDatetimeApi } from "@/service/backtest-strategy/strategy-datetime";

interface UseBacktestStatsChartParams {
	strategyId: number;
	chartConfig: BacktestStrategyStatsChartConfig;
	chartContainerRef: RefObject<HTMLDivElement | null>;
	chartOptions: DeepPartial<ChartOptions>;
}

export const useBacktestStatsChart = ({
	strategyId,
	chartConfig,
	chartContainerRef,
	chartOptions,
}: UseBacktestStatsChartParams) => {
	const [isInitialized, setIsInitialized] = useState(false);
	const resizeObserver = useRef<ResizeObserver>(null);
	// Whether data has been set in the chart
	const [isChartDataSet, setIsChartDataSet] = useState(false);

	// Whether this is the first load
	const isFirstChartConfigLoad = useRef(true);

	const {
		setChartRef,
		getChartRef,
		setStatsPaneRef,
		deleteStatsPaneRef,
		getStatsPaneRef,
		addStatsPaneHtmlElementRef,
		setStatsSeriesRef,
		initObserverSubscriptions,
		initChartData,
		getIsDataInitialized,
		getStatsSeriesRef,
		deleteStatsSeriesRef,
		getStatsData,
		incrementPaneVersion,
	} = useBacktestStatsChartStore(strategyId, chartConfig);

	// Change series configuration
	const changeSeriesConfig = useCallback(() => {
		chartConfig.statsChartConfigs.forEach((statsChartConfig) => {
			if (!statsChartConfig.isDelete) {
				const statsName = statsChartConfig.seriesConfigs.statsName;
				const statsSeriesRef = getStatsSeriesRef(statsName);
				if (statsSeriesRef) {
					statsSeriesRef.applyOptions({
						visible: statsChartConfig.visible,
						color: statsChartConfig.seriesConfigs.color,
					});
				}
			}
		});
	}, [chartConfig.statsChartConfigs, getStatsSeriesRef]);

	const createStatsPane = useCallback(
		(chart: IChartApi) => {
			chartConfig.statsChartConfigs.forEach((statsChartConfig) => {
				// If chart is visible, create pane

				const statsName = statsChartConfig.seriesConfigs.statsName;
				// Check if chart has series
				const mainPane = chart.panes()[0];
				// Add main chart pane to reference
				setStatsPaneRef(statsName, mainPane);
				const mainChartSeries = mainPane.getSeries();

				// If equals 0, create series in main chart
				if (mainChartSeries.length === 0) {
					const series = addStatsSeries(
						mainPane,
						statsChartConfig,
					);
					if (series) {
						setStatsSeriesRef(statsName, series);
					}
				} else {
					//1. Create pane
					const pane = chart.addPane(false);
					pane.setStretchFactor(2);
					//2. Set pane
					setStatsPaneRef(statsName, pane);

					//3. Use setTimeout to delay getting HTML element because pane is not fully instantiated yet
					setTimeout(() => {
						const htmlElement = pane.getHTMLElement();
						if (htmlElement) {
							addStatsPaneHtmlElementRef(statsName, htmlElement);
						}
					}, 100);

					//4. Create series
					// First series is created in the main chart
					const series = addStatsSeries(
						pane,
						statsChartConfig,
					);
					if (series) {
						setStatsSeriesRef(statsName, series);
					}
				}
			});
		},
		[
			setStatsPaneRef,
			addStatsPaneHtmlElementRef,
			setStatsSeriesRef,
			chartConfig.statsChartConfigs,
		],
	);

	// Delete series
	const deleteSeries = useCallback(() => {
		const chart = getChartRef();
		if (chart) {
			chartConfig.statsChartConfigs.forEach((statsChartConfig) => {
				if (statsChartConfig.isDelete) {
					const statsName = statsChartConfig.seriesConfigs.statsName;
					// Series reference to be deleted
					const removeSeriesRef = getStatsSeriesRef(statsName);

					if (removeSeriesRef) {
						// Pane reference where the series is located
						const removePane = removeSeriesRef.getPane();
						if (removePane) {
							const removePaneIndex = removePane.paneIndex();
							chart.removePane(removePaneIndex);
							deleteStatsPaneRef(statsName); // Delete pane reference from store
							deleteStatsSeriesRef(statsName); // Delete series reference from store

							chartConfig.statsChartConfigs.forEach((statsChartConfig) => {
								const statsName = statsChartConfig.seriesConfigs.statsName;
								const seriesRef = getStatsSeriesRef(statsName);
								if (seriesRef) {
									const newPane = seriesRef.getPane();
									if (newPane) {
										const newHtmlElement = newPane.getHTMLElement();
										if (newHtmlElement) {
											addStatsPaneHtmlElementRef(statsName, newHtmlElement);
										}
										setStatsPaneRef(statsName, newPane);
										incrementPaneVersion();
									}
								}
							});
						}
					}
				}
			});
		}
	}, [
		getChartRef,
		addStatsPaneHtmlElementRef,
		deleteStatsPaneRef,
		setStatsPaneRef,
		deleteStatsSeriesRef,
		getStatsSeriesRef,
		chartConfig.statsChartConfigs,
		incrementPaneVersion,
	]);

	const addSeries = useCallback(() => {
		const chart = getChartRef();
		if (chart) {
			const statsChartConfigs = chartConfig.statsChartConfigs.filter(
				(statsChartConfig) => !statsChartConfig.isDelete,
			);

			statsChartConfigs.forEach((statsChartConfig) => {
				const statsName = statsChartConfig.seriesConfigs.statsName;
				const paneRef = getStatsPaneRef(statsName);
				if (!paneRef) {
					const pane = chart.addPane(false);
					pane.setStretchFactor(2);
					setStatsPaneRef(statsName, pane);
					setTimeout(() => {
						const htmlElement = pane.getHTMLElement();
						if (htmlElement) {
							addStatsPaneHtmlElementRef(statsName, htmlElement);
						}
					}, 10);
					const series = addStatsSeries(
						pane,
						statsChartConfig,
					);
					if (series) {
						setStatsSeriesRef(statsName, series);

						// Set data
						const statsData = getStatsData(statsName);
						if (statsData) {
							series.setData(statsData);
						}
					}
				}
			});
		}
	}, [
		chartConfig.statsChartConfigs,
		getStatsPaneRef,
		addStatsPaneHtmlElementRef,
		setStatsPaneRef,
		setStatsSeriesRef,
		getChartRef,
		getStatsData,
	]);

	const initializeBacktestStatsChart = useCallback(() => {
		const existingChart = getChartRef();
		if (chartContainerRef.current && !existingChart) {
			// Ensure container element truly exists in the DOM
			// Prevent attempting to initialize chart during DOM reflow
			if (!document.contains(chartContainerRef.current)) {
				return;
			}

			// Create new LightweightCharts instance
			const chart = createChart(chartContainerRef.current, chartOptions);
			setChartRef(chart);

			// Create statistics chart
			createStatsPane(chart);

			// Initialize Observer subscription
			// Initialize observer subscription
			setTimeout(() => {
				initObserverSubscriptions();
				// Mark as initialized
				setIsInitialized(true);
			}, 100);
		}
	}, [
		chartContainerRef,
		chartOptions,
		setChartRef,
		getChartRef,
		createStatsPane,
		initObserverSubscriptions,
	]);

	/**
	 * Container reference validity monitoring
	 *
	 * Critical fix: Automatically detect and repair chart container reference loss
	 *
	 * Trigger scenarios:
	 * - When adding new charts, React re-renders causing existing chart's DOM containers to be recreated
	 * - ResizablePanel layout changes cause DOM structure adjustments
	 * - Any other operations that cause DOM reflow
	 *
	 * Detection logic:
	 * 1. Get chart instance and current container reference
	 * 2. Get the DOM element actually bound to the chart via chart.chartElement()
	 * 3. Compare whether the actually bound DOM element is still a child of the current container
	 *
	 * Repair process:
	 * 1. Destroy old chart instance (chart.remove())
	 * 2. Clear chart reference in store (setChartRef(null))
	 * 3. Reset initialization state to trigger complete re-initialization flow
	 */
	useEffect(() => {
		const chart = getChartRef();
		if (chart && chartContainerRef.current) {
			// Get the DOM container element actually bound to the chart
			const container = chart.chartElement();

			// Check if chart is still correctly bound to current container
			// If container doesn't exist or its parent element is not the current container, reference is lost
			if (!container || container.parentElement !== chartContainerRef.current) {
				// Step 1: Destroy old chart instance, release resources
				chart.remove();

				// Step 2: Clear chart reference in store, ensure subsequent initialization can proceed normally
				setChartRef(null);

				// Step 3: Reset initialization state, trigger complete re-initialization flow
				// This will cause useEffect to re-run initChartData and initializeBacktestChart
				setIsInitialized(false);
				setIsChartDataSet(false);
			}
		}
	}, [getChartRef, chartContainerRef, setChartRef]);

	// Chart series initialization
	useEffect(() => {


		const initialize = async () => {
			const playIndexValue = await get_play_index(strategyId);
			const datetime = await (await getStrategyDatetimeApi(strategyId)).strategyDatetime;
			await initChartData(datetime, playIndexValue, strategyId);
			initializeBacktestStatsChart();
		};

		if (!isInitialized) {
			initialize();
		}
	}, [strategyId, initChartData, initializeBacktestStatsChart, isInitialized]);

	// Chart data initialization - Set data when chart is created and data is available
	useEffect(() => {
		// If chart is initialized, data is ready, and data is not set, then set data
		if (
			isInitialized &&
			getChartRef() &&
			getIsDataInitialized() &&
			!isChartDataSet
		) {
			chartConfig.statsChartConfigs.forEach((statsChartConfig) => {
				const statsName = statsChartConfig.seriesConfigs.statsName;
				const statsSeriesRef = getStatsSeriesRef(statsName);
				if (statsSeriesRef) {
					statsSeriesRef.setData(getStatsData(statsName));
				}
			});

			setIsChartDataSet(true);
		}
	}, [
		isInitialized,
		getChartRef,
		getIsDataInitialized,
		isChartDataSet,
		chartConfig,
		getStatsSeriesRef,
		getStatsData,
	]);

	// Handle series configuration changes
	useEffect(() => {
		if (chartConfig) {
			// Skip first load (during initialization), only recreate on subsequent config changes
			if (isFirstChartConfigLoad.current) {
				isFirstChartConfigLoad.current = false;
				return;
			}
			changeSeriesConfig();
			addSeries();
			deleteSeries();
		}
	}, [chartConfig, changeSeriesConfig, deleteSeries, addSeries]);

	// Handle chart resize
	useEffect(() => {
		resizeObserver.current = new ResizeObserver((entries) => {
			const { width, height } = entries[0].contentRect;
			const chart = getChartRef();
			chart?.resize(width, height - 0.5);
			// chart?.applyOptions({ width: width, height: height-0.5 });
			// setTimeout(() => {
			//     chart?.timeScale().fitContent();
			// }, 0);
		});

		if (chartContainerRef.current) {
			resizeObserver.current.observe(chartContainerRef.current);
		}

		return () => resizeObserver.current?.disconnect();
	}, [getChartRef, chartContainerRef]);

	return {};
};
