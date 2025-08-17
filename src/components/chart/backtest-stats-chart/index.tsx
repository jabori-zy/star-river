import type { IChartApi } from "lightweight-charts";
import { useCallback, useEffect, useRef } from "react";
import { useBacktestStatsChart } from "@/hooks/chart/backtest-stats-chart";
import type { BacktestStrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import { useBacktestStatsChartStore } from "./backtest-stats-chart-store";
import { chartOptions } from "./chart-config";
import { useBacktestStatsChartConfigStore } from "@/store/use-backtest-stats-chart-config-store";
import { ChartLegend } from "./chart-legend";

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

	// 统计图表配置store
	const { setChartConfig } = useBacktestStatsChartConfigStore();

	// 初始化配置store
	useEffect(() => {
		setChartConfig(chartConfig);
	}, [chartConfig, setChartConfig]);

	// 使用 backtest stats chart hooks
	useBacktestStatsChart({
		strategyId,
		chartConfig,
		chartContainerRef,
		chartOptions,
	});

	// 获取图表API引用
	const { getChartRef } = useBacktestStatsChartStore(
		strategyId,
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

			{/* 子图统计图例 - 使用 Portal 方式渲染到对应的 Pane 中 */}
			{chartConfig.statsChartConfigs
				// .slice(1) // 跳过第一个配置（主图），从第二个开始都是子图
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
