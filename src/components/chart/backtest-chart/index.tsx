import type { IChartApi } from "lightweight-charts";
import { ArrowRightToLine } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useBacktestChart } from "@/hooks/chart/backtest-chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { useBacktestChartStore } from "./backtest-chart-store";
import { chartOptions } from "./chart-config";
// import IndicatorDebugPanel from "./debug/indicator-debug-panel";
import { KlineLegend } from "./kline-legend";
import MainChartIndicatorLegend from "./main-chart-indicator-legend";
import { SubchartIndicatorLegend } from "./subchart-indicator-legend";

interface BacktestChartProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
}

const BacktestChart = ({ strategyId, chartConfig }: BacktestChartProps) => {
	// 图表容器的引用
	const chartContainerRef = useRef<HTMLDivElement>(null);

	// 图表API引用，用于调试面板
	const chartApiRef = useRef<IChartApi | null>(null);

	// 使用 backtest chart hooks
	const { klineLegendData } = useBacktestChart({
		strategyId,
		chartConfig,
		chartContainerRef,
		chartOptions,
	});

	// 获取图表API引用 - 使用稳定的引用
	const { getChartRef, getVisibleLogicalRange, getKlineSeriesRef } =
		useBacktestChartStore(chartConfig.id, chartConfig);

	// 使用 useCallback 稳定函数引用
	const updateChartApiRef = useCallback(() => {
		const chartApi = getChartRef();
		if (chartApi && chartApiRef.current !== chartApi) {
			chartApiRef.current = chartApi;
		}
	}, [getChartRef]);

	// 更新chartApiRef
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
			{/* 图表容器div */}
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
					title="跳转至最新K线"
				>
					<ArrowRightToLine className="h-4 w-4" />
				</Button>
			)}

			{/* K线图例 */}
			<KlineLegend klineSeriesData={klineLegendData} chartId={chartConfig.id} />

			{/* 主图指标图例 */}
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

			{/* 子图指标图例 - 使用 Portal 方式渲染到对应的 Pane 中 */}
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

			{/* 调试面板
			<IndicatorDebugPanel
				chartConfig={chartConfig}
				chartApiRef={chartApiRef}
			/> */}
		</div>
	);
};

export default BacktestChart;
