import type React from "react";
import BacktestStatsChart from "@/components/chart/backtest-stats-chart";
import { useBacktestStatsChartConfigStore } from "@/store/use-backtest-stats-chart-config-store";
import StatsSelector from "./stats-selector";

interface StrategyStatsProps {
	strategyId: number;
}


const StrategyStats: React.FC<StrategyStatsProps> = ({
	strategyId
}) => {
	const { getChartConfig } = useBacktestStatsChartConfigStore();

	const chartConfig = getChartConfig();



	return (
		<div className="flex flex-col h-full">
			<div className="flex justify-start mb-2">
				<StatsSelector />
			</div>
			<div className="h-full w-full bg-gray-100 py-2 rounded-lg">
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
