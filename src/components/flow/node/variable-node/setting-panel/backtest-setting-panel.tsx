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
import { useTranslation } from "react-i18next";
	
const VariableNodeBacktestSettingPanel: React.FC<SettingProps> = ({ id }) => {
	const { t } = useTranslation();
	// Use new version hook to manage backtest configuration
	const {
		backtestConfig,
		setDefaultBacktestConfig,
		updateSelectedAccount,
		updateVariableConfigs,
	} = useBacktestConfig({ id });

	// Get start node data
	const { getStartNodeData } = useStrategyWorkflow();
	const startNodeData = getStartNodeData();
	const accountList =
		startNodeData?.backtestConfig?.exchangeModeConfig?.selectedAccounts || [];

	// Initialize default configuration
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

	// Get currently selected account
	const selectedAccount =
		backtestConfig?.dataSource === BacktestDataSource.EXCHANGE
			? backtestConfig?.exchangeModeConfig?.selectedAccount || null
			: null;

	return (
		<div className="h-full overflow-y-auto bg-white">
			<div className="flex flex-col gap-2">
				<AccountSelector
					label={t("variableNode.account")}
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
