import type React from "react";
import { useRef, useImperativeHandle, forwardRef } from "react";

import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import BacktestInfoTabs, { type BacktestInfoTabsRef } from "./backtest-info-tab";

interface StrategyDashboardProps {
	strategyId: number;
	isRunning: boolean;
	onPlay: () => void;
	onPlayOne: () => void;
	onPause: () => void;
	onStop: () => void;
	activeTab?: string;
	onTabChange?: (value: string) => void;
	onCollapsePanel?: () => void;
	isDashboardExpanded?: boolean;
}

export interface StrategyDashboardRef {
	clearOrderRecords: () => void;
	clearPositionRecords: () => void;
}

const StrategyDashboard = forwardRef<StrategyDashboardRef, StrategyDashboardProps>(({
	strategyId,
	isRunning,
	onPlay,
	onPlayOne,
	onPause,
	onStop,
	activeTab,
	onTabChange,
	onCollapsePanel,
	isDashboardExpanded,
}, ref) => {
	const backtestInfoTabsRef = useRef<BacktestInfoTabsRef>(null);

	// 暴露清空订单记录的方法
	useImperativeHandle(ref, () => ({
		clearOrderRecords: () => {
			backtestInfoTabsRef.current?.clearOrderRecords();
		},
		clearPositionRecords: () => {
			backtestInfoTabsRef.current?.clearPositionRecords();
		}
	}), []);

	// 使用store中的状态和方法
	const { chartConfig, isSaving, updateLayout, addChart, saveChartConfig } = useBacktestChartConfigStore();
	return (
		<div className="flex flex-col h-full pb-4">
				<BacktestInfoTabs 
					ref={backtestInfoTabsRef}
					strategyId={strategyId}
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
					onCollapsePanel={onCollapsePanel}
					isDashboardExpanded={isDashboardExpanded}
				/>
		</div>
	);
});

StrategyDashboard.displayName = 'StrategyDashboard';

export default StrategyDashboard;
