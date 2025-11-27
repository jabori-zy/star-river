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
 * 指标系列管理
 *
 * 职责：
 * - 动态添加指标系列到图表
 * - 删除指标系列
 * - Pane索引更新逻辑（关键修复）
 * - 批量数据初始化
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

	// 添加series
	const addSeries = useCallback(async () => {
		const chart = getChartRef();
		if (chart) {
			// 为了简化逻辑，将所有指标数据都初始化
			const indicatorsNeedingData = chartConfig.indicatorChartConfigs.filter(
				(config) => {
					// 检查指标是否存在且未被删除，并且store中没有seriesRef
					return !config.isDelete;
				},
			);
			// console.log("indicatorsNeedingData", indicatorsNeedingData);
			// 并行初始化所有需要数据的指标
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
					console.error("初始化指标数据时出错:", error);
				}
			}

			// 等待所有指标数据初始化完成后，再处理series创建和数据设置
			chartConfig.indicatorChartConfigs.forEach((config) => {
				// 如果指标是主图指标，并且没有被删除，并且store中没有seriesRef，则添加series
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
					// 订阅指标数据流
					subscribe(config.indicatorKeyStr);
				}
				// 如果指标是子图指标，并且没有被删除，并且store中没有paneRef，则添加pane
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
						// 创建子图指标
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
						// 订阅指标数据流
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

	// 删除指标系列
	const deleteSeries = useCallback(() => {
		const chart = getChartRef();
		if (chart) {
			chartConfig.indicatorChartConfigs.forEach((config) => {
				// 如果是主图指标，则removeSeries
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
					// 删除store中的seriesRef
					deleteIndicatorSeriesRef(config.indicatorKeyStr);
				}
				// 如果是子图指标，则removePane
				else if (!config.isInMainChart && config.isDelete) {
					const subChartPane = getSubChartPaneRef(config.indicatorKeyStr);
					if (subChartPane) {
						const removedPaneIndex = subChartPane.paneIndex();

						// 获取所有当前的子图配置，用于后续更新paneRef
						const allSubChartConfigs = chartConfig.indicatorChartConfigs.filter(
							(c) => !c.isInMainChart,
						);

						chart.removePane(removedPaneIndex);

						// 🔑 关键修复：更新所有受影响的paneRef
						// 当删除一个pane后，后续pane的索引会自动减1，需要更新对应的paneRef
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
									// 重新获取更新后的pane引用
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

						// 🔑 增加pane版本号，强制所有legend组件重新渲染
						incrementPaneVersion();
					}
					// 删除store中的paneApi
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
