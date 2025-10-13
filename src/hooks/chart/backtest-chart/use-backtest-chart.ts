import type {
	ChartOptions,
	DeepPartial,
	IChartApi,
	CandlestickData,
	SingleValueData,
	UTCTimestamp,
} from "lightweight-charts";
import {
	createSeriesMarkers,
	createChart,
} from "lightweight-charts";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { get_play_index } from "@/service/backtest-strategy/backtest-strategy-control";
import type { IndicatorChartConfig } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { type KlineLegendData, useKlineLegend } from "./use-kline-legend";
import { addIndicatorSeries, addKlineSeries } from "./utils/add-chart-series";
import { getChartAlignedUtcTimestamp, getDateTimeFromChartTimestamp } from "@/components/chart/backtest-chart/utls";
import { getPartialChartData } from "@/service/backtest-strategy/chart";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";

interface UseBacktestChartProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
	chartContainerRef: React.RefObject<HTMLDivElement | null>;
	chartOptions: DeepPartial<ChartOptions>;
}

interface UseBacktestChartReturn {
	klineLegendData: KlineLegendData | null; // K线图例数据
	getChartRef: () => IChartApi | null;
}

export const useBacktestChart = ({
	strategyId,
	chartConfig,
	chartContainerRef,
	chartOptions,
}: UseBacktestChartProps): UseBacktestChartReturn => {
	
	// console.log("chartConfig", chartConfig.id, chartConfig);
	const resizeObserver = useRef<ResizeObserver>(null);

	// 图表数据和ref管理
	const {
		// chartConfig,
		// indicatorSeriesRef,
		// klineData,
		// indicatorData,
		initChartData,
		// getKlineData,
		getOrderMarkers,
		getPositionPriceLine,
		getLimitOrderPriceLine,
		initKlineData,
		initIndicatorData,
		setChartRef,
		getChartRef,
		setKlineSeriesRef,
		getKlineSeriesRef,
		setIndicatorSeriesRef,
		getIndicatorSeriesRef,
		initObserverSubscriptions,
		subscribe,
		cleanupSubscriptions,
		setChartConfig,
		setSubChartPaneRef,
		getSubChartPaneRef,
		deleteIndicatorSeriesRef,
		deleteSubChartPaneRef,
		// getIndicatorData,
		getKlineKeyStr,
		setKlineKeyStr,
		deleteKlineSeriesRef,
		incrementPaneVersion,
		setOrderMarkerSeriesRef,
		addSubChartPaneHtmlElementRef,
		setVisibleLogicalRangeFrom, // 设置可见逻辑范围逻辑起始点
	} = useBacktestChartStore(chartConfig.id, chartConfig);

	// 使用状态追踪初始化状态，而不是 ref
	const [isInitialized, setIsInitialized] = useState(false);
	// // 数据是否已在图表中设置
	// const [isChartDataSet, setIsChartDataSet] = useState(false);

	// 是否是第一次加载
	const isFirstChartConfigLoad = useRef(true);

	const { klineLegendData, onCrosshairMove, onSeriesDataUpdate } = useKlineLegend({chartId: chartConfig.id,});

	// 同步最新的图表配置到store，避免使用过期的配置
	useEffect(() => {
		setChartConfig(chartConfig);
	}, [chartConfig, setChartConfig]);

	// 更改series配置
	const changeSeriesConfig = useCallback(() => {
		// 切换蜡烛图可见性
		const klineSeries = getKlineSeriesRef();
		if (klineSeries) {
			klineSeries.applyOptions({
				visible: chartConfig.klineChartConfig.visible,
			});
		}
		// 根据indicatorChartConfig，获取seriesApi
		chartConfig.indicatorChartConfigs.forEach((config) => {
			config.seriesConfigs.forEach((seriesConfig) => {
				const seriesApi = getIndicatorSeriesRef(
					config.indicatorKeyStr,
					seriesConfig.indicatorValueKey,
				);
				if (seriesApi) {
					seriesApi.applyOptions({
						visible: config.visible,
						color: seriesConfig.color,
					});
				}
			});
		});
	}, [
		getIndicatorSeriesRef,
		chartConfig.indicatorChartConfigs,
		getKlineSeriesRef,
		chartConfig.klineChartConfig.visible,
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
					// 取消订阅指标数据流
					// unsubscribe(config.indicatorKeyStr);
				}
				// 如果是子图指标，则removePane
				else if (!config.isInMainChart && config.isDelete) {
					const subChartPane = getSubChartPaneRef(config.indicatorKeyStr);
					if (subChartPane) {
						const removedPaneIndex = subChartPane.paneIndex();

						// 获取所有当前的子图配置，用于后续更新paneRef
						const allSubChartConfigs = chartConfig.indicatorChartConfigs.filter(c => !c.isInMainChart);

						chart.removePane(removedPaneIndex);

						// 🔑 关键修复：更新所有受影响的paneRef
						// 当删除一个pane后，后续pane的索引会自动减1，需要更新对应的paneRef
						const updatedPanes = chart.panes();
						allSubChartConfigs.forEach((subConfig) => {
							if (subConfig.indicatorKeyStr !== config.indicatorKeyStr) {
								const currentPaneRef = getSubChartPaneRef(subConfig.indicatorKeyStr);
								if (currentPaneRef && currentPaneRef.paneIndex() >= removedPaneIndex) {
									// 重新获取更新后的pane引用
									const newPaneIndex = currentPaneRef.paneIndex();
									const newPane = updatedPanes[newPaneIndex];
									if (newPane) {
										const newHtmlElement = newPane.getHTMLElement();
										if (newHtmlElement) {
											addSubChartPaneHtmlElementRef(subConfig.indicatorKeyStr, newHtmlElement);
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
					// 取消订阅指标数据流
					// unsubscribe(config.indicatorKeyStr);
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
		// unsubscribe,
	]);

	const changeKline = useCallback(async () => {
		const nextKlineKey = chartConfig.klineChartConfig.klineKeyStr;
		const currentKlineKey = getKlineKeyStr();
		// 如果k线key不一致，则切换k线
		if (currentKlineKey !== nextKlineKey) {
			try {
				// 清空现有订阅，确保指标订阅被移除
				cleanupSubscriptions();
				// 重置k线key
				setKlineKeyStr(nextKlineKey);
				// 先获取数据
				const playIndexValue = await get_play_index(strategyId);
				await initKlineData(playIndexValue, strategyId);

				// 从图表移除当前的klineSeries
				const chart = getChartRef();
				if (chart) {
					const klineSeries = getKlineSeriesRef();
					if (klineSeries) {
						klineSeries.unsubscribeDataChanged(onSeriesDataUpdate);
						chart.removeSeries(klineSeries);
						// 从store中删除klineSeriesRef
						deleteKlineSeriesRef();
					}

					// 创建新的klineSeries
					const newKlineSeries = addKlineSeries(chart, chartConfig.klineChartConfig);
					if (newKlineSeries) {
						newKlineSeries.subscribeDataChanged(onSeriesDataUpdate);
						setKlineSeriesRef(newKlineSeries);
					}
				}
				// 重新订阅最新k线的数据流
				subscribe(nextKlineKey);
			} catch (error) {
				console.error("切换K线时出错:", error);
			}
		}
	}, [
		strategyId,
		chartConfig.klineChartConfig,
		initKlineData,
		setKlineSeriesRef,
		getKlineKeyStr,
		setKlineKeyStr,
		getChartRef,
		getKlineSeriesRef,
		deleteKlineSeriesRef,
		onSeriesDataUpdate,
		cleanupSubscriptions,
		subscribe,
	]);

	// 添加series
	const addSeries = useCallback(async () => {
		const chart = getChartRef();
		if (chart) {
			// 为了简化逻辑，将所有指标数据都初始化
			const indicatorsNeedingData = chartConfig.indicatorChartConfigs.filter(
				(config) => {
					// 检查指标是否存在且未被删除，并且store中没有seriesRef
					return !config.isDelete
				},
			);
			// console.log("indicatorsNeedingData", indicatorsNeedingData);
			// 并行初始化所有需要数据的指标
			if (indicatorsNeedingData.length > 0) {
				try {
					const playIndexValue = await get_play_index(strategyId);
					await Promise.all(
						indicatorsNeedingData.map((config) =>
							initIndicatorData(strategyId, config.indicatorKeyStr, playIndexValue)
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
						const seriesApi = getIndicatorSeriesRef(config.indicatorKeyStr,seriesConfig.indicatorValueKey);
						if (!seriesApi) {
							const newSeries = addIndicatorSeries(chart, config, seriesConfig);
							if (newSeries) {
								setIndicatorSeriesRef(
									config.indicatorKeyStr,
									seriesConfig.indicatorValueKey,
									newSeries,
								);

								// 为新创建的系列设置数据 - 现在Promise.all已经完成，数据应该已就绪
								// const indicatorDataForSeries = getIndicatorData(config.indicatorKeyStr);
								// // console.log("indicatorDataForSeries", indicatorDataForSeries);	
								// if (indicatorDataForSeries) {
								// 	const seriesData = indicatorDataForSeries[seriesConfig.indicatorValueKey];
								// 	if (seriesData && seriesData.length > 0) {
								// 		newSeries.setData(seriesData);
								// 	}
								// } else {
								// 	console.warn(`No indicator data found for ${config.indicatorKeyStr} after initialization`);
								// }
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
								addSubChartPaneHtmlElementRef(config.indicatorKeyStr, htmlElement);
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
							// 为新创建的系列设置数据
							// const subChartIndicatorData = getIndicatorData(config.indicatorKeyStr);
							// if (subChartIndicatorData) {
							// 	const seriesData = subChartIndicatorData[seriesConfig.indicatorValueKey];
							// 	if (seriesData && seriesData.length > 0) {
							// 		subChartIndicatorSeries.setData(seriesData);
							// 	}
							// }
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
		// getIndicatorData,
		subscribe,
		addSubChartPaneHtmlElementRef
	]);

	// 创建指标系列
	const createIndicatorSeries = useCallback(
		(chart: IChartApi, indicatorChartConfigs: IndicatorChartConfig[]) => {
			indicatorChartConfigs.forEach((config) => {
				if (config.isDelete) {
					return;
				}
				if (config.isInMainChart) {
					config.seriesConfigs.forEach((seriesConfig) => {
						const mainChartIndicatorSeries = addIndicatorSeries(
							chart,
							config,
							seriesConfig,
						);
						if (mainChartIndicatorSeries) {
							setIndicatorSeriesRef(
								config.indicatorKeyStr,
								seriesConfig.indicatorValueKey,
								mainChartIndicatorSeries,
							);
						}
					});
				}
				// 创建子图指标
				else {
					// 创建子图 Pane
					const subChartPane = chart.addPane(false);
					setSubChartPaneRef(config.indicatorKeyStr, subChartPane);

					// 使用 setTimeout 延迟获取 HTML 元素，因为 pane 还没有完全实例化
					setTimeout(() => {
						const htmlElement = subChartPane.getHTMLElement();
						if (htmlElement) {
							addSubChartPaneHtmlElementRef(config.indicatorKeyStr, htmlElement);
						}
					}, 50);

					// 创建子图指标
					config.seriesConfigs.forEach((seriesConfig) => {
						const subChartIndicatorSeries = addIndicatorSeries(
							subChartPane,
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
				}
			});
		},
		[setIndicatorSeriesRef, setSubChartPaneRef, addSubChartPaneHtmlElementRef],
	);


	// 图表配置发生变化
	useEffect(() => {
		if (chartConfig) {
			// 跳过第一次加载（初始化时），只在后续配置变化时重新创建
			if (isFirstChartConfigLoad.current) {
				isFirstChartConfigLoad.current = false;
				return;
			}
			// 切换k线
			changeKline();

			// 添加series (异步操作)
			addSeries().catch((error) => {
				console.error("添加series时出错:", error);
			});

			// 修改series配置
			changeSeriesConfig();

			// 删除指标系列
			deleteSeries();
		}
	}, [chartConfig, addSeries, changeSeriesConfig, deleteSeries, changeKline]);

	/**
	 * 初始化回测图表实例
	 * 
	 * 关键修复：解决多图表添加时第一个图表变空白的问题
	 * 
	 * 问题原因：
	 * - 当添加新图表时，React重新渲染导致现有图表的DOM容器被重新创建
	 * - 但旧的图表实例仍然存在且引用着已失效的DOM容器
	 * - 导致已存在的图表无法正确重新初始化
	 * 
	 * 解决方案：
	 * 1. 检查现有图表实例是否存在，避免重复初始化
	 * 2. 确保容器DOM元素真正存在于文档中
	 * 3. 配合容器引用监控机制，在容器失效时清理旧实例
	 */
	const initializeBacktestChart = useCallback(() => {
		
		// 获取现有的图表实例引用
		const existingChart = getChartRef();
		
		// 只有在容器存在且没有现有图表实例时才进行初始化
		// 这是关键修复：避免在图表实例已存在时重复初始化
		if (chartContainerRef.current && !existingChart) {
			
			// 确保容器元素真正存在于DOM中
			// 防止在DOM重排过程中尝试初始化图表
			if (!document.contains(chartContainerRef.current)) {
				return;
			}

			// 创建新的LightweightCharts实例
			const chart = createChart(chartContainerRef.current, chartOptions);
			
			// 将图表实例保存到store中
			setChartRef(chart);

			// 创建K线系列
			const candleSeries = addKlineSeries(chart, chartConfig.klineChartConfig);
			candleSeries.subscribeDataChanged(onSeriesDataUpdate);
			setKlineKeyStr(chartConfig.klineChartConfig.klineKeyStr);
			setKlineSeriesRef(candleSeries);

			// 创建订单标记系列
			const orderMarkers = getOrderMarkers();
			if (orderMarkers.length > 0) {
				const orderMarkerSeries = createSeriesMarkers(candleSeries, orderMarkers);
				setOrderMarkerSeriesRef(orderMarkerSeries);
			} else {
				const orderMarkerSeries = createSeriesMarkers(candleSeries, []);
				setOrderMarkerSeriesRef(orderMarkerSeries);
			}

			// 创建订单价格线
			const positionPriceLine = getPositionPriceLine();
			if (positionPriceLine.length > 0) {
				positionPriceLine.forEach((priceLine) => {
					candleSeries.createPriceLine(priceLine);
				});
			}
			const limitOrderPriceLine = getLimitOrderPriceLine();
			if (limitOrderPriceLine.length > 0) {
				limitOrderPriceLine.forEach((priceLine) => {
					candleSeries.createPriceLine(priceLine);
				});
			}



			// 创建指标系列
			createIndicatorSeries(chart, chartConfig.indicatorChartConfigs);

			// 🔑 只为 K线 legend 添加 crosshair 事件监听
			chart.subscribeCrosshairMove(onCrosshairMove);

			// 初始化 observer 订阅
			setTimeout(() => {
				initObserverSubscriptions();
				// 标记为已初始化
				setIsInitialized(true);
			}, 100);
		}
	}, [
		chartOptions,
		chartContainerRef,
		onCrosshairMove,
		chartConfig,
		setChartRef,
		setKlineKeyStr,
		setKlineSeriesRef,
		initObserverSubscriptions,
		getChartRef,
		createIndicatorSeries,
		setOrderMarkerSeriesRef,
		getOrderMarkers,
		getPositionPriceLine,
		getLimitOrderPriceLine,
	]);

	/**
	 * 容器引用有效性监控
	 * 
	 * 关键修复：自动检测并修复图表容器引用丢失问题
	 * 
	 * 触发场景：
	 * - 添加新图表时React重新渲染，导致现有图表的DOM容器被重新创建
	 * - ResizablePanel布局变化导致DOM结构调整
	 * - 其他任何导致DOM重排的操作
	 * 
	 * 检测逻辑：
	 * 1. 获取图表实例和当前容器引用
	 * 2. 通过chart.chartElement()获取图表实际绑定的DOM元素
	 * 3. 比较实际绑定的DOM元素是否仍然是当前容器的子元素
	 * 
	 * 修复流程：
	 * 1. 销毁旧的图表实例（chart.remove()）
	 * 2. 清空store中的图表引用（setChartRef(null)）
	 * 3. 重置初始化状态，触发完整的重新初始化流程
	 */
	useEffect(() => {
		const chart = getChartRef();
		if (chart && chartContainerRef.current) {
			// 获取图表实际绑定的DOM容器元素
			const container = chart.chartElement();
			
			// 检查图表是否仍然正确绑定到当前的容器
			// 如果container不存在或者其父元素不是当前容器，说明引用已丢失
			if (!container || container.parentElement !== chartContainerRef.current) {
				
				// 步骤1: 销毁旧的图表实例，释放资源
				chart.remove();
				
				// 步骤2: 清空store中的图表引用，确保后续初始化能够正常进行
				setChartRef(null);
				
				// 步骤3: 重置初始化状态，触发完整的重新初始化流程
				// 这会导致useEffect重新运行initChartData和initializeBacktestChart
				setIsInitialized(false);
				// setIsChartDataSet(false);
			}
		}
	}, [getChartRef, chartContainerRef, setChartRef]);

	// 图表系列初始化
	useEffect(() => {
		if (isInitialized) {
			return;
		}

		let isCancelled = false;

		const initialize = async () => {
			try {
				const playIndexValue = await get_play_index(strategyId);
				if (isCancelled) {
					return;
				}
				await initChartData(playIndexValue, strategyId);
				if (isCancelled) {
					return;
				}
				initializeBacktestChart();
			} catch (error) {
				console.error("初始化回测图表时出错:", error);
			}
		};

		initialize();

		return () => {
			isCancelled = true;
		};
	}, [strategyId, initChartData, initializeBacktestChart, isInitialized]);

	// 图表数据初始化 - 在图表创建后且数据可用时设置数据
	// useEffect(() => {
	// 	// 只在图表已初始化、数据已准备好、但数据还未在图表中设置时执行
	// 	if (
	// 		isInitialized &&
	// 		getChartRef() &&
	// 		getIsDataInitialized() &&
	// 		!isChartDataSet
	// 	) {
	// 		// 初始化k线数据
	// 		const klineSeries = getKlineSeriesRef();
	// 		if (klineSeries) {			
	// 			if (getKlineData() && getKlineData().length > 0) {
	// 				klineSeries.setData(getKlineData());
	// 			}
	// 		}

	// 		// 初始化指标数据
	// 		chartConfig.indicatorChartConfigs.forEach((config) => {
	// 			config.seriesConfigs.forEach((seriesConfig) => {
	// 				const indicatorSeriesRef = getIndicatorSeriesRef(
	// 					config.indicatorKeyStr,
	// 					seriesConfig.indicatorValueKey,
	// 				);
	// 				if (indicatorSeriesRef) {
	// 					const indicatorDataArray = getIndicatorData(config.indicatorKeyStr);
	// 					if (indicatorDataArray) {
	// 						const indicatorSeriesDataArray = indicatorDataArray[
	// 							seriesConfig.indicatorValueKey
	// 						] as SingleValueData[];
	// 						if (
	// 							indicatorSeriesDataArray &&
	// 							indicatorSeriesDataArray.length > 0
	// 						) {
	// 							indicatorSeriesRef.setData(indicatorSeriesDataArray);
	// 						}
	// 					}
	// 				}
	// 			});
	// 		});

	// 		// 标记数据已在图表中设置
	// 		setIsChartDataSet(true);
	// 	}
	// }, [
	// 	isInitialized,
	// 	getIsDataInitialized,
	// 	isChartDataSet,
	// 	chartConfig,
	// 	// klineData,
	// 	// indicatorData,
	// 	getChartRef,
	// 	getKlineSeriesRef,
	// 	getIndicatorSeriesRef,
	// 	getKlineData,
	// 	getIndicatorData,
	// ]);


	// 处理图表 resize
	useEffect(() => {
		resizeObserver.current = new ResizeObserver((entries) => {
			const { width, height } = entries[0].contentRect;
			const chart = getChartRef();
			chart?.resize(width, height-0.5);
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
	
	// 订阅图表的可见逻辑范围变化
	useEffect(() => {
		const chart = getChartRef();
		if (!chart || !isInitialized) {
			return;
		}

		// 使用ref追踪是否正在加载，防止重复请求
		const loadingRef = { current: false };

		const handleVisibleRangeChange = (logicalRange: { from: number; to: number } | null) => {
			if (!logicalRange || loadingRef.current) {
				return;
			}

			setVisibleLogicalRangeFrom(logicalRange.from);

			// 只有在接近边界时才加载更多数据
			if (logicalRange.from >= 30) {
				return;
			}

			// 设置加载标志，防止重复请求
			loadingRef.current = true;

			// 获取当前的 klineSeries（从最新的 ref 中获取）
			const currentKlineSeries = getKlineSeriesRef();
			if (currentKlineSeries) {
				const klineData = currentKlineSeries.data();
				const firstKline = klineData[0];
				const firstKlineDateTime = firstKline ? getDateTimeFromChartTimestamp(firstKline.time as number) : null;

				if (firstKlineDateTime) {
					// 获取第一根k线前的100根k线
					getPartialChartData(strategyId, firstKlineDateTime, 100, getKlineKeyStr()!).then((data) => {
						// 剔除最后1根k线（避免重复计算slice）
						const trimmedData = data.slice(0, -1);

						// 如果数据长度为0，则不进行处理
						if (trimmedData.length === 0) {
							return;
						}

						const partialKlineData: CandlestickData[] = trimmedData.map((kline) => ({
							time: getChartAlignedUtcTimestamp(kline.datetime) as UTCTimestamp,
							open: kline.open,
							high: kline.high,
							low: kline.low,
							close: kline.close,
						}));

						// 重新获取最新的 klineSeries，确保使用最新的引用
						const latestKlineSeries = getKlineSeriesRef();
						if (latestKlineSeries) {
							const newData = [...partialKlineData, ...latestKlineSeries.data()];
							latestKlineSeries.setData(newData as CandlestickData[]);
						}
					}).catch((error) => {
						console.error("加载K线历史数据时出错:", error);
					}).finally(() => {
						// 重置加载标志
						loadingRef.current = false;
					});
				}
			}

			// 处理指标数据
			const indicatorsNeedingData = chartConfig.indicatorChartConfigs.filter(
				(config) => !config.isDelete
			);

			if (indicatorsNeedingData.length > 0) {
				indicatorsNeedingData.forEach((config) => {
					// 使用 find 代替 forEach + return，更高效地获取第一个时间戳
					let firstIndicatorDateTime = "";

					for (const seriesConfig of config.seriesConfigs) {
						const indicatorSeriesRef = getIndicatorSeriesRef(config.indicatorKeyStr, seriesConfig.indicatorValueKey);
						if (indicatorSeriesRef) {
							const firstData = indicatorSeriesRef.data()[0];
							if (firstData) {
								const firstDataTime = getDateTimeFromChartTimestamp(firstData.time as number);
								if (firstDataTime) {
									firstIndicatorDateTime = firstDataTime;
									break; // 找到第一个有效时间后立即退出
								}
							}
						}
					}

					if (firstIndicatorDateTime) {
						// 获取指标的前100根数据
						getPartialChartData(strategyId, firstIndicatorDateTime, 100, config.indicatorKeyStr).then((data) => {
							if (!data || !Array.isArray(data)) {
								return;
							}

							// 剔除最后1根数据（避免重复计算slice）
							const trimmedData = data.slice(0, -1);
							if (trimmedData.length === 0) {
								return;
							}

							const partialIndicatorData: Record<keyof IndicatorValueConfig, SingleValueData[]> = {};

							// 优化：预先构建数据结构，避免重复扩展数组
							trimmedData.forEach((item) => {
								Object.entries(item).forEach(([indicatorValueField, value]) => {
									// 跳过datetime字段，只处理指标值，并过滤value为0的数据和value为空的数据
									if (indicatorValueField !== "datetime" && value !== 0 && value !== null) {
										const key = indicatorValueField as keyof IndicatorValueConfig;
										if (!partialIndicatorData[key]) {
											partialIndicatorData[key] = [];
										}
										partialIndicatorData[key].push({
											time: getChartAlignedUtcTimestamp(item.datetime as unknown as string) as UTCTimestamp,
											value: value as number,
										} as SingleValueData);
									}
								});
							});

							// 更新各个系列的数据
							config.seriesConfigs.forEach((seriesConfig) => {
								const indicatorSeriesRef = getIndicatorSeriesRef(config.indicatorKeyStr, seriesConfig.indicatorValueKey);
								if (indicatorSeriesRef) {
									const originalData = indicatorSeriesRef.data() as SingleValueData[];
									const partialData = partialIndicatorData[seriesConfig.indicatorValueKey as keyof IndicatorValueConfig];
									if (partialData && partialData.length > 0) {
										const newData = [...partialData, ...originalData];
										indicatorSeriesRef.setData(newData);
									}
								}
							});
						}).catch((error) => {
							console.error(`加载指标 ${config.indicatorKeyStr} 历史数据时出错:`, error);
						});
					}
				});
			}
		};

		// 订阅可见范围变化
		chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

		// 清理函数：取消订阅
		return () => {
			chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
		};
	}, [
		isInitialized,
		strategyId,
		chartConfig.indicatorChartConfigs,
		getChartRef,
		getKlineSeriesRef,
		getIndicatorSeriesRef,
		getKlineKeyStr,
		setVisibleLogicalRangeFrom,
	]);

	return {
		// klineData,
		// indicatorData,
		klineLegendData,
		getChartRef,
	};
};
