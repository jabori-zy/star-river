import { forwardRef, useImperativeHandle, useRef } from "react";

import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import BacktestInfoTabs, {
	type BacktestInfoTabsRef,
} from "./backtest-info-tab";

interface StrategyDashboardProps {
	strategyId: number;
	onStop: () => void;
	activeTab?: string;
	onTabChange?: (value: string) => void;
	onCollapsePanel?: () => void;
	isDashboardExpanded?: boolean;
}

export interface StrategyDashboardRef {
	clearOrderRecords: () => void;
	clearPositionRecords: () => void;
	clearTransactionRecords: () => void;
	clearRunningLogs: () => void;
	clearVariableEvents: () => void;
	clearPerformanceData: () => void;
	clearOperationResults: () => void;
}

const StrategyDashboard = forwardRef<
	StrategyDashboardRef,
	StrategyDashboardProps
>(
	(
		{
			strategyId,
			onStop,
			activeTab,
			onTabChange,
			onCollapsePanel,
			isDashboardExpanded,
		},
		ref,
	) => {
		const backtestInfoTabsRef = useRef<BacktestInfoTabsRef>(null);

		// Expose methods for clearing order records
		useImperativeHandle(
			ref,
			() => ({
				clearOrderRecords: () => {
					backtestInfoTabsRef.current?.clearOrderRecords();
				},
				clearPositionRecords: () => {
					backtestInfoTabsRef.current?.clearPositionRecords();
				},
				clearTransactionRecords: () => {
					backtestInfoTabsRef.current?.clearTransactionRecords();
				},
				clearRunningLogs: () => {
					backtestInfoTabsRef.current?.clearRunningLogs();
				},
				clearVariableEvents: () => {
					backtestInfoTabsRef.current?.clearVariableEvents();
				},
				clearPerformanceData: () => {
					backtestInfoTabsRef.current?.clearPerformanceData();
				},
				clearOperationResults: () => {
					backtestInfoTabsRef.current?.clearOperationResults();
				},
			}),
			[],
		);

		// Use states and methods from store
		const { chartConfig, isSaving, updateLayout, addChart, saveChartConfig } =
			useBacktestChartConfigStore();
		return (
			<div className="flex flex-col h-full pb-4">
				<BacktestInfoTabs
					ref={backtestInfoTabsRef}
					strategyId={strategyId}
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
	},
);

StrategyDashboard.displayName = "StrategyDashboard";

export default StrategyDashboard;
