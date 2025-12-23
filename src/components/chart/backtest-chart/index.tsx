import type { IChartApi } from "lightweight-charts";
import { ArrowRightToLine } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useBacktestChart } from "@/components/chart/backtest-chart/hooks";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { useBacktestChartStore } from "./backtest-chart-store";
import { chartOptions } from "./chart-config";
import ChartDebugPanel from "./debug/chart-debug-panel";
import { KlineLegend } from "./kline-legend";
import MainChartIndicatorLegend from "./indicator-legend/main-chart-indicator-legend";
import MainChartOperationLegend from "./operation-legend/main-chart-operation-legend";
import { SubchartIndicatorLegend } from "./indicator-legend/subchart-indicator-legend";
import { SubchartOperationLegend } from "./operation-legend/subchart-operation-legend";

// Check if in development mode
const isDev = import.meta.env.DEV;

interface BacktestChartProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
}

const BacktestChart = ({ strategyId, chartConfig }: BacktestChartProps) => {
	// Chart container reference
	const chartContainerRef = useRef<HTMLDivElement>(null);

	// Chart API reference for debug panel
	const chartApiRef = useRef<IChartApi | null>(null);

	// Use backtest chart hooks
	const { klineLegendData } = useBacktestChart({
		strategyId,
		chartConfig,
		chartContainerRef,
		chartOptions,
	});

	// Get chart API reference - use stable reference
	const { getChartRef, getVisibleLogicalRange, getKlineSeriesRef } =
		useBacktestChartStore(chartConfig.id, chartConfig);

	// Use useCallback to stabilize function reference
	const updateChartApiRef = useCallback(() => {
		const chartApi = getChartRef();
		if (chartApi && chartApiRef.current !== chartApi) {
			chartApiRef.current = chartApi;
		}
	}, [getChartRef]);

	// Update chartApiRef
	useEffect(() => {
		updateChartApiRef();
	}, [updateChartApiRef]);

	const visibleLogicalRange = getVisibleLogicalRange();
	const klineSeriesRef = getKlineSeriesRef();
	const klineDataLength = klineSeriesRef?.data().length ?? 0;

	const showJumpToLatest =
		!!visibleLogicalRange &&
		Number.isFinite(visibleLogicalRange.to) &&
		klineDataLength > 0 &&
		visibleLogicalRange.to < klineDataLength - 1;

	const handleJumpToLatest = useCallback(() => {
		const chart = getChartRef();
		if (!chart) {
			return;
		}
		const timeScale = chart.timeScale();
		timeScale.scrollToRealTime();
		timeScale.fitContent();
	}, [getChartRef]);

	return (
		<div className="relative w-full h-full">
			{/* Chart container div */}
			<div
				ref={chartContainerRef}
				id="chart-container"
				className="w-full h-full px-2"
			/>

			{showJumpToLatest && (
				<Button
					variant="ghost"
					size="icon"
					onClick={handleJumpToLatest}
					className="absolute top-0 right-26 z-20 h-8 w-8"
					title="Jump to latest kline"
				>
					<ArrowRightToLine className="h-4 w-4" />
				</Button>
			)}

			{/* Kline legend */}
			<KlineLegend klineSeriesData={klineLegendData} chartId={chartConfig.id} />

			{/* Main chart indicator legends */}
			{chartConfig.indicatorChartConfigs
				.filter(
					(indicatorConfig) =>
						indicatorConfig.isInMainChart && !indicatorConfig.isDelete,
				)
				.map((indicatorConfig, index) => (
					<MainChartIndicatorLegend
						key={indicatorConfig.indicatorKeyStr}
						chartId={chartConfig.id}
						indicatorKeyStr={indicatorConfig.indicatorKeyStr}
						index={index}
					/>
				))}

			{/* Main chart operation legends */}
			{(chartConfig.operationChartConfigs || [])
				.filter(
					(operationConfig) =>
						operationConfig.isInMainChart && !operationConfig.isDelete,
				)
				.map((operationConfig, index) => (
					<MainChartOperationLegend
						key={operationConfig.operationKeyStr}
						chartId={chartConfig.id}
						operationKeyStr={operationConfig.operationKeyStr}
						index={index}
						indicatorCount={
							chartConfig.indicatorChartConfigs.filter(
								(config) => config.isInMainChart && !config.isDelete,
							).length
						}
					/>
				))}

			{/* Subchart indicator legends - use Portal to render to corresponding Pane */}
			{chartConfig.indicatorChartConfigs
				.filter((config) => !config.isInMainChart && !config.isDelete)
				.map((indicatorConfig) => {
					return (
						<SubchartIndicatorLegend
							key={indicatorConfig.indicatorKeyStr}
							chartId={chartConfig.id}
							indicatorKeyStr={indicatorConfig.indicatorKeyStr}
						/>
					);
				})}

			{/* Subchart operation legends - use Portal to render to corresponding Pane */}
			{(chartConfig.operationChartConfigs || [])
				.filter((config) => !config.isInMainChart && !config.isDelete)
				.map((operationConfig) => {
					return (
						<SubchartOperationLegend
							key={operationConfig.operationKeyStr}
							chartId={chartConfig.id}
							operationKeyStr={operationConfig.operationKeyStr}
						/>
					);
				})}

			{/* Debug panel - only visible in development mode */}
			{isDev && (
				<ChartDebugPanel
					chartConfig={chartConfig}
					chartApiRef={chartApiRef}
				/>
			)}
		</div>
	);
};

export default BacktestChart;
