import type {
	CandlestickData,
	ChartOptions,
	DeepPartial,
	IChartApi,
	SingleValueData,
} from "lightweight-charts";
import {
	CandlestickSeries,
	createChart,
} from "lightweight-charts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart-new/backtest-chart-store";
import { get_play_index } from "@/service/strategy-control/backtest-strategy-control";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { IndicatorChartConfig } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { type KlineLegendData, useKlineLegend } from "./use-kline-legend";
import { addChartSeries } from "./utils/add-chart-series";

interface UseBacktestChartProps {
	strategyId: number;
	chartId: number;
	chartContainerRef: React.RefObject<HTMLDivElement | null>;
	chartOptions: DeepPartial<ChartOptions>;
}

interface UseBacktestChartReturn {
	chartConfig: BacktestChartConfig;
	klineLegendData: KlineLegendData | null; // K线图例数据
	klineData: Record<string, CandlestickData[]>;
	indicatorData: Record<string, Record<string, SingleValueData[]>>;
	getChartRef: () => IChartApi | null;
}

export const useBacktestChart = ({
	strategyId,
	chartId,
	chartContainerRef,
	chartOptions,
}: UseBacktestChartProps): UseBacktestChartReturn => {
	const resizeObserver = useRef<ResizeObserver>(null);

	// 图表数据和ref管理
	const {
		chartConfig,
		klineData,
		indicatorData,
		initChartData,
		initIndicatorData,
		setChartRef,
		getChartRef,
		setKlineSeriesRef,
		getKlineSeriesRef,
		setIndicatorSeriesRef,
		getIndicatorSeriesRef,
		initObserverSubscriptions,
		setSubChartPaneRef,
		syncChartConfig,
		getIsDataInitialized,
		getSubChartPaneRef,
		removeIndicatorSeriesRef,
		removeSubChartPaneRef,
	} = useBacktestChartStore(chartId);

	// 使用状态追踪初始化状态，而不是 ref
	const [isInitialized, setIsInitialized] = useState(false);
	// 追踪数据是否已在图表中设置
	const [isChartDataSet, setIsChartDataSet] = useState(false);

	// 监听全局配置变化并同步到本地store
	const { chartConfig: globalBacktestConfig, getChartConfig } =
		useBacktestChartConfigStore();

	const globalChartConfig = useMemo(() => {
		return getChartConfig(chartId);
	}, [getChartConfig, chartId, globalBacktestConfig]);

	// 使用ref来跟踪是否是第一次接收到globalChartConfig
	const isFirstGlobalConfigLoad = useRef(true);

	useEffect(() => {
		// 当全局配置发生变化时，同步到本地store
		if (globalChartConfig) {
			syncChartConfig();
		}
	}, [globalChartConfig, syncChartConfig]);

	const { legendData, onCrosshairMove } = useKlineLegend({
		chartId,
		klineKeyStr: chartConfig.klineChartConfig.klineKeyStr,
	});

	// 获取播放索引并初始化数据
	const playIndex = useRef(0);

	// 更改series配置
	const changeSeriesConfig = useCallback(() => {
		// 切换蜡烛图可见性
		const klineSeries = getKlineSeriesRef(
			chartConfig.klineChartConfig.klineKeyStr,
		);
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
		chartConfig.klineChartConfig.klineKeyStr,
		chartConfig.klineChartConfig.visible,
	]);

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
					removeIndicatorSeriesRef(config.indicatorKeyStr);
				}
				// 如果是子图指标，则removePane
				else if (!config.isInMainChart && config.isDelete) {
					const subChartPane = getSubChartPaneRef(config.indicatorKeyStr);
					if (subChartPane) {
						chart.removePane(subChartPane.paneIndex());
						// 删除store中的paneApi
						removeSubChartPaneRef(config.indicatorKeyStr);
					}
				}
			});
		}
	}, [
		getChartRef,
		chartConfig.indicatorChartConfigs,
		getIndicatorSeriesRef,
		getSubChartPaneRef,
		removeIndicatorSeriesRef,
		removeSubChartPaneRef,
	]);

	// 添加series
	const addSeries = useCallback(async () => {
		const chart = getChartRef();
		if (chart) {
			// 检查哪些指标需要初始化数据
			const indicatorsNeedingData = chartConfig.indicatorChartConfigs.filter(
				(config) => {
					// 检查指标是否存在且未被删除，并且store中没有数据
					return !config.isDelete && !indicatorData[config.indicatorKeyStr];
				},
			);

			// 并行初始化所有需要数据的指标
			if (indicatorsNeedingData.length > 0) {
				await Promise.all(
					indicatorsNeedingData.map((config) =>
						initIndicatorData(config.indicatorKeyStr, playIndex.current),
					),
				);
			}

			chartConfig.indicatorChartConfigs.forEach((config) => {
				// 如果指标是主图指标，并且没有被删除，并且store中没有seriesRef，则添加series
				if (config.isInMainChart && !config.isDelete) {
					config.seriesConfigs.forEach((seriesConfig) => {
						const seriesApi = getIndicatorSeriesRef(
							config.indicatorKeyStr,
							seriesConfig.indicatorValueKey,
						);
						if (!seriesApi) {
							const newSeries = addChartSeries(chart, config, seriesConfig);
							if (newSeries) {
								setIndicatorSeriesRef(
									config.indicatorKeyStr,
									seriesConfig.indicatorValueKey,
									newSeries,
								);

								// 为新创建的系列设置数据
								const indicatorDataForSeries =
									indicatorData[config.indicatorKeyStr];
								if (indicatorDataForSeries) {
									const seriesData =
										indicatorDataForSeries[seriesConfig.indicatorValueKey];
									if (seriesData && seriesData.length > 0) {
										newSeries.setData(seriesData);
									}
								}
							}
						}
					});
				}
				// 如果指标是子图指标，并且没有被删除，并且store中没有paneRef，则添加pane
				else if (!config.isInMainChart && !config.isDelete) {
					const subChartPane = getSubChartPaneRef(config.indicatorKeyStr);
					if (!subChartPane) {
						const newPane = chart.addPane(false);
						setSubChartPaneRef(config.indicatorKeyStr, newPane);
						// 创建子图指标
						config.seriesConfigs.forEach((seriesConfig) => {
							const subChartIndicatorSeries = addChartSeries(
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
							const subChartIndicatorData =
								indicatorData[config.indicatorKeyStr];
							if (subChartIndicatorData) {
								const seriesData =
									subChartIndicatorData[seriesConfig.indicatorValueKey];
								if (seriesData && seriesData.length > 0) {
									subChartIndicatorSeries.setData(seriesData);
								}
							}
						});
					}
				}
			});
		}
	}, [
		chartConfig.indicatorChartConfigs,
		getChartRef,
		getIndicatorSeriesRef,
		setIndicatorSeriesRef,
		indicatorData,
		initIndicatorData,
	]);

	// 创建指标系列
	const createIndicatorSeries = useCallback(
		(chart: IChartApi, indicatorChartConfigs: IndicatorChartConfig[]) => {
			indicatorChartConfigs.forEach((config) => {
				if (config.isInMainChart) {
					config.seriesConfigs.forEach((seriesConfig) => {
						const mainChartIndicatorSeries = addChartSeries(
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
					}, 100);

					// 创建子图指标
					config.seriesConfigs.forEach((seriesConfig) => {
						const subChartIndicatorSeries = addChartSeries(
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
		[setIndicatorSeriesRef, setSubChartPaneRef],
	);

	useEffect(() => {
		if (globalChartConfig) {
			// 跳过第一次加载（初始化时），只在后续配置变化时重新创建
			if (isFirstGlobalConfigLoad.current) {
				isFirstGlobalConfigLoad.current = false;
				return;
			}

			// 添加series (异步操作)
			addSeries().catch((error) => {
				console.error("添加series时出错:", error);
			});

			// 修改series配置
			changeSeriesConfig();

			// 删除指标系列
			deleteSeries();
		}
	}, [globalChartConfig, addSeries, changeSeriesConfig, deleteSeries]);

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
				console.warn(`图表${chartId}的容器不在DOM中，等待重新挂载`);
				return;
			}

			// 创建新的LightweightCharts实例
			const chart = createChart(chartContainerRef.current, chartOptions);
			
			// 将图表实例保存到store中
			setChartRef(chart);

			// 获取当前配置
			const currentConfig = chartConfig;

			// 创建K线系列
			const candleSeries = chart.addSeries(CandlestickSeries);
			candleSeries.applyOptions({
				visible: currentConfig.klineChartConfig.visible ?? true,
			});
			setKlineSeriesRef(
				currentConfig.klineChartConfig.klineKeyStr,
				candleSeries,
			);

			// 创建指标系列
			createIndicatorSeries(chart, currentConfig.indicatorChartConfigs);

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
		chartId,
		setChartRef,
		setKlineSeriesRef,
		initObserverSubscriptions,
		getChartRef,
		createIndicatorSeries,
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
				setIsChartDataSet(false);
			}
		}
	}, [chartId, getChartRef, chartContainerRef, setChartRef]);

	// 图表系列初始化
	useEffect(() => {
		if (!isInitialized) {
			get_play_index(strategyId).then((index) => {
				playIndex.current = index;
				initChartData(playIndex.current).then(() => {
					initializeBacktestChart();
				});
			});
		}
	}, [strategyId, initChartData, initializeBacktestChart, isInitialized]);

	// 图表数据初始化 - 在图表创建后且数据可用时设置数据
	useEffect(() => {
		// 只在图表已初始化、数据已准备好、但数据还未在图表中设置时执行
		if (
			isInitialized &&
			getChartRef() &&
			getIsDataInitialized() &&
			!isChartDataSet
		) {
			// 初始化k线数据
			const klineSeries = getKlineSeriesRef(
				chartConfig.klineChartConfig.klineKeyStr,
			);
			if (klineSeries) {
				const klineDataArray = klineData[
					chartConfig.klineChartConfig.klineKeyStr
				] as CandlestickData[];
				if (klineDataArray && klineDataArray.length > 0) {
					klineSeries.setData(klineDataArray);
				}
			}

			// 初始化指标数据
			chartConfig.indicatorChartConfigs.forEach((config) => {
				config.seriesConfigs.forEach((seriesConfig) => {
					const indicatorSeriesRef = getIndicatorSeriesRef(
						config.indicatorKeyStr,
						seriesConfig.indicatorValueKey,
					);
					if (indicatorSeriesRef) {
						const indicatorDataArray = indicatorData[config.indicatorKeyStr];
						if (indicatorDataArray) {
							const indicatorSeriesDataArray = indicatorDataArray[
								seriesConfig.indicatorValueKey
							] as SingleValueData[];
							if (
								indicatorSeriesDataArray &&
								indicatorSeriesDataArray.length > 0
							) {
								indicatorSeriesRef.setData(indicatorSeriesDataArray);
							}
						}
					}
				});
			});

			// 标记数据已在图表中设置
			setIsChartDataSet(true);
		}
	}, [
		isInitialized,
		getIsDataInitialized,
		isChartDataSet,
		chartConfig,
		klineData,
		indicatorData,
		getChartRef,
		getKlineSeriesRef,
		getIndicatorSeriesRef,
	]);

	// 初始化指标数据

	// 处理图表 resize
	useEffect(() => {
		resizeObserver.current = new ResizeObserver((entries) => {
			const { width, height } = entries[0].contentRect;
			const chart = getChartRef();
			chart?.applyOptions({ width, height });
			// setTimeout(() => {
			//     chart?.timeScale().fitContent();
			// }, 0);
		});

		if (chartContainerRef.current) {
			resizeObserver.current.observe(chartContainerRef.current);
		}

		return () => resizeObserver.current?.disconnect();
	}, [getChartRef, chartContainerRef]);

	return {
		chartConfig,
		klineData,
		indicatorData,
		klineLegendData: legendData || null,
		getChartRef,
	};
};
