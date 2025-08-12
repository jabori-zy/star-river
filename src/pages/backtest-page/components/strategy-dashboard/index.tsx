import type React from "react";

import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import BacktestInfoTabs from "./backtest-info-tab";

interface StrategyDashboardProps {
	isRunning: boolean;
	onPlay: () => void;
	onPlayOne: () => void;
	onPause: () => void;
	onStop: () => void;
	activeTab?: string;
	onTabChange?: (value: string) => void;
	onCollapseDashboard?: () => void;
	isDashboardExpanded?: boolean;
}

const StrategyDashboard: React.FC<StrategyDashboardProps> = ({
	isRunning,
	onPlay,
	onPlayOne,
	onPause,
	onStop,
	activeTab,
	onTabChange,
	onCollapseDashboard,
	isDashboardExpanded,
}) => {
	// 使用store中的状态和方法
	const { chartConfig, isSaving, updateLayout, addChart, saveChartConfig } = useBacktestChartConfigStore();
	return (
		<div className="flex flex-col">
				<BacktestInfoTabs 
					isRunning={isRunning} 
					onPause={onPause} 
					onPlay={onPlay} 
					onPlayOne={onPlayOne} 
					onStop={onStop} 
					addChart={addChart} 
					chartConfig={chartConfig} 
					saveChartConfig={saveChartConfig} 
					isSaving={isSaving} 
					updateLayout={updateLayout}
					activeTab={activeTab}
					onTabChange={onTabChange}
					onCollapseDashboard={onCollapseDashboard}
					isDashboardExpanded={isDashboardExpanded}
				/>
		</div>
	);
};

export default StrategyDashboard;
