import { useCallback } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { get_play_index } from "@/service/backtest-strategy/backtest-strategy-control";
import { getStrategyDatetimeApi } from "@/service/backtest-strategy/strategy-datetime";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { addIndicatorSeries } from "../utils/add-chart-series";

interface UseIndicatorSeriesManagerProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
}

interface UseIndicatorSeriesManagerReturn {
	addSeries: () => Promise<void>;
	deleteSeries: () => void;
}

/**
 * Indicator series management
 *
 * Responsibilities:
 * - Dynamically add indicator series to chart
 * - Delete indicator series
 * - Pane index update logic (critical fix)
 * - Batch data initialization
 */
export const useIndicatorSeriesManager = ({
	strategyId,
	chartConfig,
}: UseIndicatorSeriesManagerProps): UseIndicatorSeriesManagerReturn => {
	const {
		getChartRef,
		getIndicatorSeriesRef,
		setIndicatorSeriesRef,
		deleteIndicatorSeriesRef,
		getSubChartPaneRef,
		setSubChartPaneRef,
		deleteSubChartPaneRef,
		incrementPaneVersion,
		addSubChartPaneHtmlElementRef,
		initIndicatorData,
		subscribe,
	} = useBacktestChartStore(chartConfig.id);

	// Add series
	const addSeries = useCallback(async () => {
		const chart = getChartRef();
		if (chart) {
			// To simplify logic, initialize all indicator data
			const indicatorsNeedingData = chartConfig.indicatorChartConfigs.filter(
				(config) => {
					// Check if indicator exists and is not deleted, and there is no seriesRef in store
					return !config.isDelete;
				},
			);
			// console.log("indicatorsNeedingData", indicatorsNeedingData);
			// Initialize all indicators needing data in parallel
			if (indicatorsNeedingData.length > 0) {
				try {
					const playIndexValue = await get_play_index(strategyId);
					const strategyDatetime = (await getStrategyDatetimeApi(strategyId))
						.strategyDatetime;
					await Promise.all(
						indicatorsNeedingData.map((config) =>
							initIndicatorData(
								strategyId,
								config.indicatorKeyStr,
								strategyDatetime,
								playIndexValue,
							),
						),
					);
				} catch (error) {
					console.error("Error initializing indicator data:", error);
				}
			}

			// After all indicator data initialization is complete, process series creation and data setup
			chartConfig.indicatorChartConfigs.forEach((config) => {
				// If indicator is a main chart indicator, not deleted, and there's no seriesRef in store, add series
				if (config.isInMainChart && !config.isDelete) {
					config.seriesConfigs.forEach((seriesConfig) => {
						const seriesApi = getIndicatorSeriesRef(
							config.indicatorKeyStr,
							seriesConfig.indicatorValueKey,
						);
						if (!seriesApi) {
							const newSeries = addIndicatorSeries(chart, config, seriesConfig);
							if (newSeries) {
								setIndicatorSeriesRef(
									config.indicatorKeyStr,
									seriesConfig.indicatorValueKey,
									newSeries,
								);
							}
						}
					});
					// Subscribe to indicator data stream
					subscribe(config.indicatorKeyStr);
				}
				// If indicator is a subchart indicator, not deleted, and there's no paneRef in store, add pane
				else if (!config.isInMainChart && !config.isDelete) {
					const subChartPane = getSubChartPaneRef(config.indicatorKeyStr);
					if (!subChartPane) {
						const newPane = chart.addPane(false);
						setSubChartPaneRef(config.indicatorKeyStr, newPane);
						setTimeout(() => {
							const htmlElement = newPane.getHTMLElement();
							if (htmlElement) {
								addSubChartPaneHtmlElementRef(
									config.indicatorKeyStr,
									htmlElement,
								);
							}
						}, 10);
						// Create subchart indicators
						config.seriesConfigs.forEach((seriesConfig) => {
							const subChartIndicatorSeries = addIndicatorSeries(
								newPane,
								config,
								seriesConfig,
							);
							if (subChartIndicatorSeries) {
								setIndicatorSeriesRef(
									config.indicatorKeyStr,
									seriesConfig.indicatorValueKey,
									subChartIndicatorSeries,
								);
							}
						});
						// Subscribe to indicator data stream
						subscribe(config.indicatorKeyStr);
					}
				}
			});
		}
	}, [
		strategyId,
		chartConfig,
		getChartRef,
		getSubChartPaneRef,
		getIndicatorSeriesRef,
		setIndicatorSeriesRef,
		initIndicatorData,
		setSubChartPaneRef,
		subscribe,
		addSubChartPaneHtmlElementRef,
	]);

	// Delete indicator series
	const deleteSeries = useCallback(() => {
		const chart = getChartRef();
		if (chart) {
			chartConfig.indicatorChartConfigs.forEach((config) => {
				// If it's a main chart indicator, remove series
				if (config.isInMainChart && config.isDelete) {
					config.seriesConfigs.forEach((seriesConfig) => {
						const seriesApi = getIndicatorSeriesRef(
							config.indicatorKeyStr,
							seriesConfig.indicatorValueKey,
						);
						if (seriesApi) {
							chart.removeSeries(seriesApi);
						}
					});
					// Delete seriesRef from store
					deleteIndicatorSeriesRef(config.indicatorKeyStr);
				}
				// If it's a subchart indicator, remove pane
				else if (!config.isInMainChart && config.isDelete) {
					const subChartPane = getSubChartPaneRef(config.indicatorKeyStr);
					if (subChartPane) {
						const removedPaneIndex = subChartPane.paneIndex();

						// Get all current subchart configurations for subsequent paneRef updates
						const allSubChartConfigs = chartConfig.indicatorChartConfigs.filter(
							(c) => !c.isInMainChart,
						);

						chart.removePane(removedPaneIndex);

						// 🔑 Critical fix: Update all affected paneRefs
						// After removing a pane, subsequent pane indices automatically decrease by 1, requiring paneRef updates
						const updatedPanes = chart.panes();
						allSubChartConfigs.forEach((subConfig) => {
							if (subConfig.indicatorKeyStr !== config.indicatorKeyStr) {
								const currentPaneRef = getSubChartPaneRef(
									subConfig.indicatorKeyStr,
								);
								if (
									currentPaneRef &&
									currentPaneRef.paneIndex() >= removedPaneIndex
								) {
									// Re-fetch the updated pane reference
									const newPaneIndex = currentPaneRef.paneIndex();
									const newPane = updatedPanes[newPaneIndex];
									if (newPane) {
										const newHtmlElement = newPane.getHTMLElement();
										if (newHtmlElement) {
											addSubChartPaneHtmlElementRef(
												subConfig.indicatorKeyStr,
												newHtmlElement,
											);
										}
										setSubChartPaneRef(subConfig.indicatorKeyStr, newPane);
									}
								}
							}
						});

						// 🔑 Increment pane version number to force all legend components to re-render
						incrementPaneVersion();
					}
					// Delete paneApi from store
					deleteSubChartPaneRef(config.indicatorKeyStr);
				}
			});
		}
	}, [
		getChartRef,
		chartConfig.indicatorChartConfigs,
		getIndicatorSeriesRef,
		getSubChartPaneRef,
		deleteIndicatorSeriesRef,
		deleteSubChartPaneRef,
		setSubChartPaneRef,
		incrementPaneVersion,
		addSubChartPaneHtmlElementRef,
	]);

	return { addSeries, deleteSeries };
};

export type { UseIndicatorSeriesManagerProps, UseIndicatorSeriesManagerReturn };
