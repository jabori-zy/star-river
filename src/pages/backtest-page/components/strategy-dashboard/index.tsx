import type React from "react";

import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import BacktestInfoTabs from "./backtest-info-tab";

interface StrategyDashboardProps {
	isRunning: boolean;
	onPlay: () => void;
	onPlayOne: () => void;
	onPause: () => void;
	onStop: () => void;
}

const StrategyDashboard: React.FC<StrategyDashboardProps> = ({
	isRunning,
	onPlay,
	onPlayOne,
	onPause,
	onStop,
}) => {
	// 使用store中的状态和方法
	const { chartConfig, isSaving, updateLayout, addChart, saveChartConfig } = useBacktestChartConfigStore();
	return (
		<div className="flex items-center w-full ">
			{/* 左侧信息面板tab */}
			<div className="flex-1">
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
				/>
			</div>
		</div>
	);
};

export default StrategyDashboard;
