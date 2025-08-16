import type { IChartApi } from "lightweight-charts";
import { useCallback, useEffect, useRef } from "react";
import { useBacktestStatsChart } from "@/hooks/chart/backtest-stats-chart";
import type { BacktestStrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import { useBacktestStatsChartStore } from "./backtest-stats-chart-store";
import { chartOptions } from "./chart-config";

interface BacktestStatsChartProps {
	strategyId: number;
	chartConfig: BacktestStrategyStatsChartConfig;
}

const BacktestStatsChart = ({
	strategyId,
	chartConfig,
}: BacktestStatsChartProps) => {
	// 图表容器的引用
	const chartContainerRef = useRef<HTMLDivElement | null>(null);

	// 图表API引用
	const chartApiRef = useRef<IChartApi | null>(null);

	// 使用 backtest stats chart hooks
	useBacktestStatsChart({
		strategyId,
		chartConfig,
		chartContainerRef,
		chartOptions,
	});

	// 获取图表API引用
	const { getChartRef } = useBacktestStatsChartStore(
		chartConfig.strategyId,
		chartConfig,
	);

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
				id="stats-chart-container"
				className="w-full h-full px-2"
			/>
		</div>
	);
};

export default BacktestStatsChart;
