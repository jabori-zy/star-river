import type React from "react";
import BacktestStatsChart from "@/components/chart/backtest-stats-chart";
import type { BacktestStrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import { defaultBacktestStrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import { useBacktestStatsChartConfigStore } from "@/store/use-backtest-stats-chart-config-store";

interface StrategyStatsProps {
	strategyId: number;
}

const StrategyStats: React.FC<StrategyStatsProps> = ({
	strategyId
}) => {
	// 使用传入的配置或默认配置


	const { getChartConfig } = useBacktestStatsChartConfigStore();

	const chartConfig = getChartConfig();



	return (
		<div className="h-full w-full bg-gray-100 py-2 rounded-lg">
			{chartConfig && (
				<BacktestStatsChart
					strategyId={strategyId}
					chartConfig={chartConfig}
				/>
			)}
		</div>
	);
};

export default StrategyStats;
