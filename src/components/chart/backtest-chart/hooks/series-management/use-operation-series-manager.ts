import { useCallback } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { addOperationSeries } from "../utils/add-chart-series";

interface UseOperationSeriesManagerProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
}

interface UseOperationSeriesManagerReturn {
	addSeries: () => Promise<void>;
	deleteSeries: () => void;
}

/**
 * Operation series management
 *
 * Responsibilities:
 * - Dynamically add operation series to chart
 * - Delete operation series
 * - Pane index update logic (critical fix)
 * - Batch data initialization
 */
export const useOperationSeriesManager = ({
	chartConfig,
}: UseOperationSeriesManagerProps): UseOperationSeriesManagerReturn => {
	const {
		getChartRef,
		getOperationSeriesRef,
		setOperationSeriesRef,
		deleteOperationSeriesRef,
		getOperationSubChartPaneRef,
		setOperationSubChartPaneRef,
		deleteOperationSubChartPaneRef,
		incrementPaneVersion,
		addOperationSubChartPaneHtmlElementRef,
		subscribe,
	} = useBacktestChartStore(chartConfig.id);

	// Add series
	const addSeries = useCallback(async () => {
		const chart = getChartRef();
		if (chart) {
			// After all operation data initialization is complete, process series creation and data setup
			chartConfig.operationChartConfigs.forEach((config) => {
				// If operation is a main chart operation, not deleted, and there's no seriesRef in store, add series
				if (config.isInMainChart && !config.isDelete) {
					config.seriesConfigs.forEach((seriesConfig) => {
						const seriesApi = getOperationSeriesRef(
							config.operationKeyStr,
							seriesConfig.outputSeriesKey,
						);
						if (!seriesApi) {
							const newSeries = addOperationSeries(chart, config, seriesConfig);
							if (newSeries) {
								setOperationSeriesRef(
									config.operationKeyStr,
									seriesConfig.outputSeriesKey,
									newSeries,
								);
							}
						}
					});
					// Subscribe to operation data stream
					subscribe(config.operationKeyStr);
				}
				// If operation is a subchart operation, not deleted, and there's no paneRef in store, add pane
				else if (!config.isInMainChart && !config.isDelete) {
					const subChartPane = getOperationSubChartPaneRef(config.operationKeyStr);
					if (!subChartPane) {
						const newPane = chart.addPane(false);
						setOperationSubChartPaneRef(config.operationKeyStr, newPane);
						setTimeout(() => {
							const htmlElement = newPane.getHTMLElement();
							if (htmlElement) {
								addOperationSubChartPaneHtmlElementRef(
									config.operationKeyStr,
									htmlElement,
								);
							}
						}, 10);
						// Create subchart operations
						config.seriesConfigs.forEach((seriesConfig) => {
							const subChartOperationSeries = addOperationSeries(
								newPane,
								config,
								seriesConfig,
							);
							if (subChartOperationSeries) {
								setOperationSeriesRef(
									config.operationKeyStr,
									seriesConfig.outputSeriesKey,
									subChartOperationSeries,
								);
							}
						});
						// Subscribe to operation data stream
						subscribe(config.operationKeyStr);
					}
				}
			});
		}
	}, [
		chartConfig,
		getChartRef,
		getOperationSubChartPaneRef,
		getOperationSeriesRef,
		setOperationSeriesRef,
		setOperationSubChartPaneRef,
		subscribe,
		addOperationSubChartPaneHtmlElementRef,
	]);

	// Delete operation series
	const deleteSeries = useCallback(() => {
		const chart = getChartRef();
		if (chart) {
			chartConfig.operationChartConfigs.forEach((config) => {
				// If it's a main chart operation, remove series
				if (config.isInMainChart && config.isDelete) {
					config.seriesConfigs.forEach((seriesConfig) => {
						const seriesApi = getOperationSeriesRef(
							config.operationKeyStr,
							seriesConfig.outputSeriesKey,
						);
						if (seriesApi) {
							chart.removeSeries(seriesApi);
						}
					});
					// Delete seriesRef from store
					deleteOperationSeriesRef(config.operationKeyStr);
				}
				// If it's a subchart operation, remove pane
				else if (!config.isInMainChart && config.isDelete) {
					const subChartPane = getOperationSubChartPaneRef(config.operationKeyStr);
					if (subChartPane) {
						const removedPaneIndex = subChartPane.paneIndex();

						// Get all current subchart configurations for subsequent paneRef updates
						const allSubChartConfigs = chartConfig.operationChartConfigs.filter(
							(c) => !c.isInMainChart,
						);

						chart.removePane(removedPaneIndex);

						// 🔑 Critical fix: Update all affected paneRefs
						// After removing a pane, subsequent pane indices automatically decrease by 1, requiring paneRef updates
						const updatedPanes = chart.panes();
						allSubChartConfigs.forEach((subConfig) => {
							if (subConfig.operationKeyStr !== config.operationKeyStr) {
								const currentPaneRef = getOperationSubChartPaneRef(
									subConfig.operationKeyStr,
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
											addOperationSubChartPaneHtmlElementRef(
												subConfig.operationKeyStr,
												newHtmlElement,
											);
										}
										setOperationSubChartPaneRef(subConfig.operationKeyStr, newPane);
									}
								}
							}
						});

						// 🔑 Increment pane version number to force all legend components to re-render
						incrementPaneVersion();
					}
					// Delete paneApi from store
					deleteOperationSubChartPaneRef(config.operationKeyStr);
					// 🔑 Also delete seriesRef from store (series are destroyed when pane is removed)
					deleteOperationSeriesRef(config.operationKeyStr);
				}
			});
		}
	}, [
		getChartRef,
		chartConfig.operationChartConfigs,
		getOperationSeriesRef,
		getOperationSubChartPaneRef,
		deleteOperationSeriesRef,
		deleteOperationSubChartPaneRef,
		setOperationSubChartPaneRef,
		incrementPaneVersion,
		addOperationSubChartPaneHtmlElementRef,
	]);

	return { addSeries, deleteSeries };
};

export type { UseOperationSeriesManagerProps, UseOperationSeriesManagerReturn };
