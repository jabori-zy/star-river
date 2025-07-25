import React from "react";
import { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import AccountSelector from "@/components/flow/account-selector";
import {
	TradeMode,
	BacktestDataSource,
	SelectedAccount,
} from "@/types/strategy";
import VariableSetting from "../components/variable-setting";
import { useUpdateBacktestConfig } from "@/hooks/node/variable-node";
import {
	VariableNodeBacktestConfig,
	VariableConfig,
} from "@/types/node/variable-node";

const VariableNodeBacktestSettingPanel: React.FC<SettingProps> = ({
	id,
	data,
}) => {
	const {
		config,
		setDefaultBacktestConfig,
		updateSelectedAccount,
		updateVariableConfigs,
	} = useUpdateBacktestConfig({
		id,
		initialConfig: data?.backtestConfig as
			| VariableNodeBacktestConfig
			| undefined,
	});

	// 初始化默认配置
	React.useEffect(() => {
		if (!config) {
			setDefaultBacktestConfig();
		}
	}, [config, setDefaultBacktestConfig]);

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
		config?.dataSource === BacktestDataSource.EXCHANGE
			? config?.exchangeModeConfig?.selectedAccount || null
			: null;

	return (
		<div className="flex flex-col gap-2">
			<AccountSelector
				label="数据来源账户"
				tradeMode={TradeMode.BACKTEST}
				selectedAccount={selectedAccount}
				onAccountChange={handleAccountChange}
			/>
			<VariableSetting
				id={id}
				variableConfigs={config?.variableConfigs || []}
				onVariableConfigsChange={handleVariableConfigsChange}
			/>
		</div>
	);
};

export default VariableNodeBacktestSettingPanel;
