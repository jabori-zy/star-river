import type React from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { useBacktestConfig } from "@/hooks/node-config/start-node/use-update-backtest-config";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";
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
	data,
}) => {
	// 将data转换为StartNodeData类型
	const startNodeData = data as StartNodeData;

	// 从全局状态获取数据
	const { backtestConfig: globalBacktestConfig } = useStartNodeDataStore();

	// 使用自定义 hook 管理回测配置
	const {
		updateInitialBalance,
		updateLeverage,
		updateFeeRate,
		updatePlaySpeed,
		updateDataSource,
		updateSelectedAccounts,
		updateTimeRange,
		updateVariables,
	} = useBacktestConfig({
		initialConfig: startNodeData.backtestConfig || undefined,
		nodeId: id,
	});

	// 从全局状态获取所有需要的数据
	const dataSource =
		globalBacktestConfig?.dataSource || BacktestDataSource.EXCHANGE;
	const selectedAccounts =
		globalBacktestConfig?.exchangeModeConfig?.selectedAccounts || [];
	const timeRange = globalBacktestConfig?.exchangeModeConfig?.timeRange || {
		startDate: "",
		endDate: "",
	};
	const initialBalance = globalBacktestConfig?.initialBalance || 10000;
	const leverage = globalBacktestConfig?.leverage || 1;
	const feeRate = globalBacktestConfig?.feeRate || 0.001;
	const playSpeed = globalBacktestConfig?.playSpeed || 1;

	return (
		<div className="p-4 space-y-4">
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
						updateSelectedAccounts={updateSelectedAccounts}
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
				variables={globalBacktestConfig?.variables || []}
				onVariablesChange={updateVariables}
			/>
		</div>
	);
};

export default StartNodeBacktestSettingPanel;
