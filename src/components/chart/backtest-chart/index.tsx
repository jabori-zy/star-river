import type { IChartApi } from "lightweight-charts";
import { useCallback, useEffect, useRef } from "react";
import { useBacktestChart } from "@/hooks/chart";
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
	const { getChartRef } = useBacktestChartStore(chartConfig.id, chartConfig);

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

	return (
		<div className="relative w-full h-full">
			{/* 图表容器div */}
			<div
				ref={chartContainerRef}
				id="chart-container"
				className="w-full h-full px-2"
			/>

			{/* K线图例 */}
			<KlineLegend
				klineSeriesData={klineLegendData}
				chartId={chartConfig.id}
			/>

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
