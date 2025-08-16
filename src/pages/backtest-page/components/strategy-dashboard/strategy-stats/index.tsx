import type React from "react";
import BacktestStatsChart from "@/components/chart/backtest-stats-chart";
import type { BacktestStrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import { defaultBacktestStrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";

interface StrategyStatsProps {
	strategyId: number;
	chartConfig?: BacktestStrategyStatsChartConfig;
}

const StrategyStats: React.FC<StrategyStatsProps> = ({
	strategyId,
	chartConfig,
}) => {
	// 使用传入的配置或默认配置
	const statsChartConfig: BacktestStrategyStatsChartConfig = chartConfig || {
		...defaultBacktestStrategyStatsChartConfig,
		strategyId: strategyId,
	};

	return (
		<div className="h-full w-full">
			<BacktestStatsChart
				strategyId={strategyId}
				chartConfig={statsChartConfig}
			/>
		</div>
	);
};

export default StrategyStats;
