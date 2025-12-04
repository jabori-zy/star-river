import { useEffect } from "react";
import BacktestStatsChart from "@/components/chart/backtest-stats-chart";
import { useBacktestStatsChartStore } from "@/components/chart/backtest-stats-chart/backtest-stats-chart-store";
import { useBacktestStatsChartConfigStore } from "@/store/use-backtest-stats-chart-config-store";
import StatsSelector from "./stats-selector";

interface StrategyStatsProps {
	strategyId: number;
}

const StrategyStats = ({ strategyId }: StrategyStatsProps) => {
	const { getChartConfig } = useBacktestStatsChartConfigStore();

	const chartConfig = getChartConfig();
	const { clearAllData } = useBacktestStatsChartStore(
		strategyId,
		chartConfig ?? undefined,
	);

	// 组件卸载时清空所有状态数据
	useEffect(() => {
		return () => {
			clearAllData();
		};
	}, [clearAllData]);

	return (
		<div className="flex flex-col h-full">
			<div className="flex justify-start mb-2">
				<StatsSelector />
			</div>
			<div className="h-full w-full bg-gray-100 py-2 rounded-lg border border-gray-200">
				{chartConfig && (
					<BacktestStatsChart
						strategyId={strategyId}
						chartConfig={chartConfig}
					/>
				)}
			</div>
		</div>
	);
};

export default StrategyStats;
