import React from "react";
import AccountSelector from "@/components/flow/account-selector";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useBacktestConfig } from "@/hooks/node-config/variable-node";
import type { VariableConfig } from "@/types/node/variable-node";
import {
	BacktestDataSource,
	type SelectedAccount,
	TradeMode,
} from "@/types/strategy";
import VariableSetting from "../components/variable-setting";

const VariableNodeBacktestSettingPanel: React.FC<SettingProps> = ({ id }) => {
	// ✅ 使用新版本 hook 管理回测配置
	const {
		backtestConfig,
		setDefaultBacktestConfig,
		updateSelectedAccount,
		updateVariableConfigs,
	} = useBacktestConfig({ id });

	// 获取开始节点数据
	const { getStartNodeData } = useStrategyWorkflow();
	const startNodeData = getStartNodeData();
	const accountList =
		startNodeData?.backtestConfig?.exchangeModeConfig?.selectedAccounts || [];

	// 初始化默认配置
	React.useEffect(() => {
		if (!backtestConfig) {
			setDefaultBacktestConfig();
		}
	}, [backtestConfig, setDefaultBacktestConfig]);

	const handleAccountChange = (selectedAccount: SelectedAccount | null) => {
		if (selectedAccount) {
			updateSelectedAccount(selectedAccount);
		}
	};

	const handleVariableConfigsChange = (variableConfigs: VariableConfig[]) => {
		updateVariableConfigs(variableConfigs);
	};

	// 获取当前选中的账户
	const selectedAccount =
		backtestConfig?.dataSource === BacktestDataSource.EXCHANGE
			? backtestConfig?.exchangeModeConfig?.selectedAccount || null
			: null;

	return (
		<div className="h-full overflow-y-auto bg-white">
			<div className="flex flex-col gap-2">
				<AccountSelector
					label="数据来源账户"
					tradeMode={TradeMode.BACKTEST}
					selectedAccount={selectedAccount}
					onAccountChange={handleAccountChange}
					accountList={accountList}
				/>
				<div className="m-2">
					<VariableSetting
						id={id}
						tradeMode={TradeMode.BACKTEST}
						variableConfigs={backtestConfig?.variableConfigs || []}
						onVariableConfigsChange={handleVariableConfigsChange}
					/>
				</div>
			</div>
		</div>
	);
};

export default VariableNodeBacktestSettingPanel;
