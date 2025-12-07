import type React from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useBacktestConfig } from "@/hooks/node-config/start-node/use-update-backtest-config";
import type { StartNodeData } from "@/types/node/start-node";
import { BacktestDataSource } from "@/types/strategy";
import AccountSelector from "../components/account-selector";
import BacktestStrategySetting from "../components/backtest-strategy-setting";
import DataSourceSelector from "../components/data-source-selector";
import TimeRangeSelector from "../components/time-range-selector";
import VariableEditor from "../components/variable-editor";

// New start node backtest mode settings panel
export const StartNodeBacktestSettingPanel: React.FC<SettingProps> = ({
	id,
}) => {
	// ✅ Use useNodesData to subscribe to node data changes, ensure UI updates in real-time
	const { getNodeData } = useStrategyWorkflow();
	const startNodeData = getNodeData(id) as StartNodeData;
	// Use custom hook to manage backtest config
	const {
		updateInitialBalance,
		updateLeverage,
		updateFeeRate,
		updatePlaySpeed,
		updateDataSource,
		updateBacktestAccounts,
		updateTimeRange,
		updateBacktestVariables,
	} = useBacktestConfig({ id });

	// Read all required config from node data (responds to updates in real-time)
	const backtestConfig = startNodeData?.backtestConfig;
	const dataSource = backtestConfig?.dataSource || BacktestDataSource.EXCHANGE;
	const selectedAccounts =
		backtestConfig?.exchangeModeConfig?.selectedAccounts || [];
	const timeRange = backtestConfig?.exchangeModeConfig?.timeRange || {
		startDate: "",
		endDate: "",
	};
	const initialBalance = backtestConfig?.initialBalance || 10000;
	const leverage = backtestConfig?.leverage || 5;
	const feeRate = backtestConfig?.feeRate || 0.001;
	const playSpeed = backtestConfig?.playSpeed || 20;

	return (
		<div className="h-full overflow-y-auto bg-white">
			<div className="flex flex-col gap-4 p-4">
				<DataSourceSelector
					dataSource={dataSource}
					setDataSource={() => {}} // No longer need local state setting
					updateDataSource={updateDataSource}
				/>
				{/* Switch components based on data source */}
				{dataSource === BacktestDataSource.EXCHANGE && (
					<div className="space-y-4">
						<AccountSelector
							selectedAccounts={selectedAccounts}
							setSelectedAccounts={() => {}} // No longer need local state setting
							updateSelectedAccounts={updateBacktestAccounts}
						/>
						<TimeRangeSelector
							timeRange={timeRange}
							setTimeRange={updateTimeRange}
						/>
					</div>
				)}
				<BacktestStrategySetting
					initialBalance={initialBalance}
					setInitialBalance={() => {}} // No longer need local state setting
					updateInitialBalance={updateInitialBalance}
					leverage={leverage}
					setLeverage={() => {}} // No longer need local state setting
					updateLeverage={updateLeverage}
					feeRate={feeRate}
					setFeeRate={() => {}} // No longer need local state setting
					updateFeeRate={updateFeeRate}
					playSpeed={playSpeed}
					setPlaySpeed={() => {}} // No longer need local state setting
					updatePlaySpeed={updatePlaySpeed}
				/>

				<VariableEditor
					variables={backtestConfig?.customVariables || []}
					onVariablesChange={updateBacktestVariables}
				/>
			</div>
		</div>
	);
};

export default StartNodeBacktestSettingPanel;
