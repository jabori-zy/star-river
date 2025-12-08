import type { IChartApi } from "lightweight-charts";
import { useCallback, useEffect, useRef } from "react";
import { useBacktestStatsChart } from "@/hooks/chart/backtest-stats-chart";
import { useBacktestStatsChartConfigStore } from "@/store/use-backtest-stats-chart-config-store";
import type { BacktestStrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import { useBacktestStatsChartStore } from "./backtest-stats-chart-store";
import { chartOptions } from "./chart-config";
import { ChartLegend } from "./chart-legend";

interface BacktestStatsChartProps {
	strategyId: number;
	chartConfig: BacktestStrategyStatsChartConfig;
}

const BacktestStatsChart = ({
	strategyId,
	chartConfig,
}: BacktestStatsChartProps) => {
	// Chart container reference
	const chartContainerRef = useRef<HTMLDivElement | null>(null);

	// Chart API reference
	const chartApiRef = useRef<IChartApi | null>(null);

	// Statistics chart configuration store
	const { setChartConfig } = useBacktestStatsChartConfigStore();

	// Initialize configuration store
	useEffect(() => {
		setChartConfig(chartConfig);
	}, [chartConfig, setChartConfig]);

	// Use backtest stats chart hooks
	useBacktestStatsChart({
		strategyId,
		chartConfig,
		chartContainerRef,
		chartOptions,
	});

	// Get chart API reference
	const { getChartRef } = useBacktestStatsChartStore(strategyId, chartConfig);

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

	return (
		<div className="relative w-full h-full">
			{/* Chart container div */}
			<div
				ref={chartContainerRef}
				id="stats-chart-container"
				className="w-full h-full px-2"
			/>

			{/* Subchart statistics legend - rendered to corresponding Pane using Portal */}
			{chartConfig.statsChartConfigs
				// .slice(1) // Skip the first config (main chart), all subcharts start from the second
				.map((statsConfig) => (
					<ChartLegend
						key={statsConfig.seriesConfigs.statsName}
						strategyId={strategyId}
						statsChartConfig={statsConfig}
					/>
				))}
		</div>
	);
};

export default BacktestStatsChart;
