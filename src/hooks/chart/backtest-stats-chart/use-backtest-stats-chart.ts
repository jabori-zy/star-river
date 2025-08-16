import type { ChartOptions, DeepPartial, IChartApi } from "lightweight-charts";
import { createChart } from "lightweight-charts";
import {RefObject, useCallback, useState} from "react";
import { useEffect, useRef } from "react";
import { useBacktestStatsChartStore } from "@/components/chart/backtest-stats-chart/backtest-stats-chart-store";
import type { BacktestStrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import { defaultBacktestStrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import { addStatsSeries } from "./utils";

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

	const {
		setChartRef,
		getChartRef,
		setStatsPaneRef,
		addStatsPaneHtmlElementRef,
		setStatsSeriesRef,
		initObserverSubscriptions,
		cleanupSubscriptions,
		resetData,
	} = useBacktestStatsChartStore(strategyId, chartConfig);


	const createStatsPane = useCallback((chart: IChartApi) => {
		
		defaultBacktestStrategyStatsChartConfig.statsChartConfigs.forEach((statsChartConfig) => {
			// 如果图表可见，则创建pane
			if (statsChartConfig.visible) {
				const statsName = statsChartConfig.seriesConfigs.statsName
				// 判断chart中是否有series
				const mainPane = chart.panes()[0];
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
				
				
			}
		});
		
	}, [setStatsPaneRef, addStatsPaneHtmlElementRef, setStatsSeriesRef]);




	const initializeBacktestStatsChart = useCallback(() => {
		const existingChart = getChartRef();
		if (chartContainerRef.current && !existingChart) {
			const chart = createChart(chartContainerRef.current, chartOptions);
			setChartRef(chart);

			// 创建统计图表
			createStatsPane(chart);

			// 初始化Observer订阅
			initObserverSubscriptions();
		}
	}, [chartContainerRef, chartOptions, setChartRef, getChartRef, createStatsPane, initObserverSubscriptions]);


	

	
	// 图表系列初始化
	useEffect(() => {
		if (!isInitialized) {
			initializeBacktestStatsChart();
		}
	}, [initializeBacktestStatsChart, isInitialized]);


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
