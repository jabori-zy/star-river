import type { IChartApi } from "lightweight-charts";
import { useCallback, useEffect, useRef } from "react";
import { useBacktestStatsChart, useStatsLegend, useSubchartStatsLegend } from "@/hooks/chart/backtest-stats-chart";
import type { BacktestStrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import { useBacktestStatsChartStore } from "./backtest-stats-chart-store";
import { chartOptions } from "./chart-config";
import { StatsLegend } from "./stats-legend";
import { useBacktestStatsChartConfigStore } from "@/store/use-backtest-stats-chart-config-store";

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

	// 为子图创建legend（基于配置中的第二个统计项，因为第一个在主图）
	const visibleStatsConfigs = chartConfig.statsChartConfigs.filter(config => config.visible);
	const subchartConfig = visibleStatsConfigs[1]; // 第二个配置用于子图
	
	// 子图legend hook（只有当存在第二个配置时才使用）
	useSubchartStatsLegend({
		strategyId,
		statsChartConfig: subchartConfig || visibleStatsConfigs[0], // 如果没有第二个配置，使用第一个作为fallback
	});

	// 主图legend数据（第一个可见的统计配置）
	const mainStatsConfig = visibleStatsConfigs[0];

	const { statsLegendData: mainStatsLegendData, onCrosshairMove } = useStatsLegend({
		strategyId,
		statsChartConfig: mainStatsConfig || chartConfig.statsChartConfigs[0],
	});

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

	// 订阅图表的鼠标移动事件，确保主图legend数据能够更新
	useEffect(() => {
		const chart = getChartRef();
		if (!chart || !onCrosshairMove) return;

		// 订阅鼠标移动事件
		chart.subscribeCrosshairMove(onCrosshairMove);

		// 清理函数：取消订阅
		return () => {
			chart.unsubscribeCrosshairMove(onCrosshairMove);
		};
	}, [getChartRef, onCrosshairMove]);

	return (
		<div className="relative w-full h-full">
			{/* 图表容器div */}
			<div
				ref={chartContainerRef}
				id="stats-chart-container"
				className="w-full h-full px-2"
			/>

			<StatsLegend
				statsLegendData={mainStatsLegendData}
			/>

			
		</div>
	);
};

export default BacktestStatsChart;
