import type {
	CandlestickData,
	ChartOptions,
	DataChangedScope,
	DeepPartial,
	IChartApi,
	MouseEventParams,
} from "lightweight-charts";
import { createChart, createSeriesMarkers } from "lightweight-charts";
import { useCallback } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorChartConfig } from "@/types/chart";
import { addIndicatorSeries, addKlineSeries } from "../utils/add-chart-series";

interface UseChartInitializationProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
	chartContainerRef: React.RefObject<HTMLDivElement | null>;
	chartOptions: DeepPartial<ChartOptions>;
	onCrosshairMove: (param: MouseEventParams) => void;
	onSeriesDataUpdate: (scope: DataChangedScope) => void;
}

interface UseChartInitializationReturn {
	initializeBacktestChart: () => void;
	createIndicatorSeries: (
		chart: IChartApi,
		configs: IndicatorChartConfig[],
	) => void;
}

export const useChartInitialization = ({
	strategyId,
	chartConfig,
	chartContainerRef,
	chartOptions,
	onCrosshairMove,
	onSeriesDataUpdate,
}: UseChartInitializationProps): UseChartInitializationReturn => {
	const {
		setChartRef,
		getChartRef,
		setKlineKeyStr,
		setKlineSeriesRef,
		setIndicatorSeriesRef,
		setSubChartPaneRef,
		setOrderMarkerSeriesRef,
		getOrderMarkers,
		getPositionPriceLine,
		getLimitOrderPriceLine,
		initObserverSubscriptions,
		addSubChartPaneHtmlElementRef,
	} = useBacktestChartStore(chartConfig.id, chartConfig);

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
				const orderMarkerSeries = createSeriesMarkers(
					candleSeries,
					orderMarkers,
				);
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
			}, 100);
		}
	}, [
		chartOptions,
		chartContainerRef,
		onCrosshairMove,
		onSeriesDataUpdate,
		chartConfig,
		setChartRef,
		setKlineKeyStr,
		setKlineSeriesRef,
		initObserverSubscriptions,
		getChartRef,
		setOrderMarkerSeriesRef,
		getOrderMarkers,
		getPositionPriceLine,
		getLimitOrderPriceLine,
		setIndicatorSeriesRef,
		setSubChartPaneRef,
		addSubChartPaneHtmlElementRef,
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
							addSubChartPaneHtmlElementRef(
								config.indicatorKeyStr,
								htmlElement,
							);
						}
					}, 100);

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

	return { initializeBacktestChart, createIndicatorSeries };
};

export type { UseChartInitializationProps, UseChartInitializationReturn };
