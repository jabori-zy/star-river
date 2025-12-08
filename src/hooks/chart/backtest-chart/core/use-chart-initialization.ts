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
import type { IndicatorChartConfig } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
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
		getOrderPriceLine: getLimitOrderPriceLine,
		initObserverSubscriptions,
		addSubChartPaneHtmlElementRef,
	} = useBacktestChartStore(chartConfig.id, chartConfig);

	/**
	 * Initialize backtest chart instance
	 *
	 * Critical fix: Resolves issue where the first chart becomes blank when adding multiple charts
	 *
	 * Root cause:
	 * - When adding new charts, React re-renders causing existing chart's DOM containers to be recreated
	 * - But old chart instances still exist and reference invalidated DOM containers
	 * - This causes existing charts to fail re-initialization properly
	 *
	 * Solution:
	 * 1. Check if existing chart instance exists to avoid duplicate initialization
	 * 2. Ensure container DOM element truly exists in the document
	 * 3. Work with container reference monitoring mechanism to cleanup old instances when container becomes invalid
	 */
	const initializeBacktestChart = useCallback(() => {
		// Get existing chart instance reference
		const existingChart = getChartRef();

		// Only initialize if container exists and there's no existing chart instance
		// This is the critical fix: avoid re-initializing when chart instance already exists
		if (chartContainerRef.current && !existingChart) {
			// Ensure container element truly exists in the DOM
			// Prevent attempting to initialize chart during DOM reflow
			if (!document.contains(chartContainerRef.current)) {
				return;
			}

			// Create new LightweightCharts instance
			const chart = createChart(chartContainerRef.current, chartOptions);

			// Save chart instance to store
			setChartRef(chart);

			// Create candlestick series
			const candleSeries = addKlineSeries(chart, chartConfig.klineChartConfig);
			candleSeries.subscribeDataChanged(onSeriesDataUpdate);
			setKlineKeyStr(chartConfig.klineChartConfig.klineKeyStr);
			setKlineSeriesRef(candleSeries);

			// Create order marker series
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

			// Create order price lines
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

			// Create indicator series
			createIndicatorSeries(chart, chartConfig.indicatorChartConfigs);

			// 🔑 Only add crosshair event listener for K-line legend
			chart.subscribeCrosshairMove(onCrosshairMove);

			// Initialize observer subscriptions
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

	// Create indicator series
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
				// Create subchart indicators
				else {
					// Create subchart Pane
					const subChartPane = chart.addPane(false);
					setSubChartPaneRef(config.indicatorKeyStr, subChartPane);

					// Use setTimeout to delay getting HTML element because pane is not fully instantiated yet
					setTimeout(() => {
						const htmlElement = subChartPane.getHTMLElement();
						if (htmlElement) {
							addSubChartPaneHtmlElementRef(
								config.indicatorKeyStr,
								htmlElement,
							);
						}
					}, 100);

					// Create subchart indicators
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
