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

// 新开始节点回测模式设置面板
export const StartNodeBacktestSettingPanel: React.FC<SettingProps> = ({
	id,
}) => {
	// ✅ 使用 useNodesData 订阅节点数据变化，确保 UI 实时更新
	const { getNodeData } = useStrategyWorkflow();
	const startNodeData = getNodeData(id) as StartNodeData;
	// 使用自定义 hook 管理回测配置
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

	// 从节点数据读取所有需要的配置（实时响应更新）
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
					setDataSource={() => {}} // 不再需要本地状态设置
					updateDataSource={updateDataSource}
				/>
				{/* 根据数据源切换不同的组件 */}
				{dataSource === BacktestDataSource.EXCHANGE && (
					<div className="space-y-4">
						<AccountSelector
							selectedAccounts={selectedAccounts}
							setSelectedAccounts={() => {}} // 不再需要本地状态设置
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
					setInitialBalance={() => {}} // 不再需要本地状态设置
					updateInitialBalance={updateInitialBalance}
					leverage={leverage}
					setLeverage={() => {}} // 不再需要本地状态设置
					updateLeverage={updateLeverage}
					feeRate={feeRate}
					setFeeRate={() => {}} // 不再需要本地状态设置
					updateFeeRate={updateFeeRate}
					playSpeed={playSpeed}
					setPlaySpeed={() => {}} // 不再需要本地状态设置
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
