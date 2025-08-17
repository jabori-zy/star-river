import type { ChartOptions, DeepPartial, IChartApi } from "lightweight-charts";
import { createChart } from "lightweight-charts";
import { useCallback, useState} from "react";
import type {RefObject} from "react";
import { useEffect, useRef } from "react";
import { useBacktestStatsChartStore } from "@/components/chart/backtest-stats-chart/backtest-stats-chart-store";
import type { BacktestStrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import { addStatsSeries } from "./utils";
import { get_play_index } from "@/service/backtest-strategy/backtest-strategy-control";

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
	// 获取播放索引并初始化数据
	const playIndex = useRef(0);
	// 数据是否已在图表中设置
	const [isChartDataSet, setIsChartDataSet] = useState(false);

	// 是否是第一次加载
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


	// 更改series配置
	const changeSeriesConfig = useCallback(() => {

		chartConfig.statsChartConfigs.forEach((statsChartConfig) => {
			if (!statsChartConfig.isDelete) {
				const statsName = statsChartConfig.seriesConfigs.statsName
				const statsSeriesRef = getStatsSeriesRef(statsName);
				if (statsSeriesRef) {
					statsSeriesRef.applyOptions({
						visible: statsChartConfig.visible,
						color: statsChartConfig.seriesConfigs.color,
					});
				}
			}
		});



	},[chartConfig.statsChartConfigs, getStatsSeriesRef])


	const createStatsPane = useCallback((chart: IChartApi) => {
		
		chartConfig.statsChartConfigs.forEach((statsChartConfig) => {
			// 如果图表可见，则创建pane
			
			const statsName = statsChartConfig.seriesConfigs.statsName
			// 判断chart中是否有series
			const mainPane = chart.panes()[0];
			// 将主图的pane添加到引用中
			setStatsPaneRef(statsName, mainPane);
			const mainChartSeries = mainPane.getSeries();
			
			// 如果等于0， 则将series创建到主图中
			if (mainChartSeries.length === 0) {
				const series = addStatsSeries(mainPane, statsChartConfig, statsChartConfig.seriesConfigs);
				if (series) {
					setStatsSeriesRef(statsName, series);
				}
			}
			else{

			
				//1. 创建pane
				const pane = chart.addPane(false);
				pane.setStretchFactor(2);
				//2. 设置pane
				setStatsPaneRef(statsName, pane);

				//3. 使用 setTimeout 延迟获取 HTML 元素，因为 pane 还没有完全实例化
				setTimeout(() => {
					const htmlElement = pane.getHTMLElement();
					if (htmlElement) {
						addStatsPaneHtmlElementRef(statsName, htmlElement);
					}
				}, 100);

				//4. 创建series
				// 第一个series创建到主图中
				const series = addStatsSeries( pane, statsChartConfig, statsChartConfig.seriesConfigs);
				if (series) {
					setStatsSeriesRef(statsName, series);
				}
				
			}
				
			
		});
		
	}, [setStatsPaneRef, addStatsPaneHtmlElementRef, setStatsSeriesRef, chartConfig.statsChartConfigs]);


	// 删除series
	const deleteSeries = useCallback(() => {
		const chart = getChartRef();
		if (chart) {
			chartConfig.statsChartConfigs.forEach((statsChartConfig) => {
				if (statsChartConfig.isDelete) {
					const statsName = statsChartConfig.seriesConfigs.statsName
					// 待删除的series引用
					const removeSeriesRef = getStatsSeriesRef(statsName);

					if (removeSeriesRef) {
						// series所在的pane引用
						const removePane = removeSeriesRef.getPane();
						if (removePane) {
							const removePaneIndex = removePane.paneIndex();
							chart.removePane(removePaneIndex);
							deleteStatsPaneRef(statsName); // 删除store中的pane引用
							deleteStatsSeriesRef(statsName); // 删除store中的series引用

							
							chartConfig.statsChartConfigs.forEach((statsChartConfig) => {
								const statsName = statsChartConfig.seriesConfigs.statsName
								const seriesRef = getStatsSeriesRef(statsName);
								if (seriesRef) {
									const newPane = seriesRef.getPane()
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
	},[
		getChartRef, 
		addStatsPaneHtmlElementRef, 
		deleteStatsPaneRef, 
		setStatsPaneRef, 
		deleteStatsSeriesRef, 
		getStatsSeriesRef, 
		chartConfig.statsChartConfigs, 
		incrementPaneVersion,
	])


	const addSeries = useCallback(() => {
		const chart = getChartRef();
		if (chart) {
			const statsChartConfigs = chartConfig.statsChartConfigs.filter((statsChartConfig) => !statsChartConfig.isDelete);

			statsChartConfigs.forEach((statsChartConfig) => {
				const statsName = statsChartConfig.seriesConfigs.statsName
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
					const series = addStatsSeries(pane, statsChartConfig, statsChartConfig.seriesConfigs);
					if (series) {
						setStatsSeriesRef(statsName, series);

						// 设置数据
						const statsData = getStatsData(statsName);
						if (statsData) {
							series.setData(statsData);
						}
					}
				}
				
				
			});
		}
	
	},[
		chartConfig.statsChartConfigs, 
		getStatsPaneRef, 
		addStatsPaneHtmlElementRef, 
		setStatsPaneRef, 
		setStatsSeriesRef, 
		getChartRef,
		getStatsData])




	const initializeBacktestStatsChart = useCallback(() => {
		const existingChart = getChartRef();
		if (chartContainerRef.current && !existingChart) {

			// 确保容器元素真正存在于DOM中
			// 防止在DOM重排过程中尝试初始化图表
			if (!document.contains(chartContainerRef.current)) {
				return;
			}

			// 创建新的LightweightCharts实例
			const chart = createChart(chartContainerRef.current, chartOptions);
			setChartRef(chart);

			// 创建统计图表
			createStatsPane(chart);

			// 初始化Observer订阅
			// 初始化 observer 订阅
			setTimeout(() => {
				initObserverSubscriptions();
				// 标记为已初始化
				setIsInitialized(true);
			}, 100);
		}
	}, [chartContainerRef, chartOptions, setChartRef, getChartRef, createStatsPane, initObserverSubscriptions]);

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
	}, [getChartRef, chartContainerRef, setChartRef]);
	

	
	// 图表系列初始化
	useEffect(() => {
		if (!isInitialized) {
			get_play_index(strategyId).then((index) => {
				playIndex.current = index;
				initChartData(playIndex.current, strategyId).then(() => {
					initializeBacktestStatsChart();
				});
			});
		}
		
	}, [strategyId, initChartData, initializeBacktestStatsChart, isInitialized]);

	// 图表数据初始化 - 在图表创建后且数据可用时设置数据
	useEffect(() => {
		// 如果图表已初始化，且数据已准备好，并且数据未设置，则设置数据
		if (isInitialized && getChartRef() && getIsDataInitialized() && !isChartDataSet) {
			chartConfig.statsChartConfigs.forEach((statsChartConfig) => {
				const statsName = statsChartConfig.seriesConfigs.statsName
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
		getStatsData]);



	// 处理series配置变化
	useEffect(() => {
		if (chartConfig) {
			// 跳过第一次加载（初始化时），只在后续配置变化时重新创建
			if (isFirstChartConfigLoad.current) {
				isFirstChartConfigLoad.current = false;
				return;
			}
			changeSeriesConfig();
			addSeries();
			deleteSeries();	
			
		}
	}, [chartConfig, changeSeriesConfig, deleteSeries, addSeries])


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

	return {};
};
