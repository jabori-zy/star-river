import React from "react";
import AccountSelector from "@/components/flow/account-selector";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { useUpdateSimulateConfig } from "@/hooks/node-config/variable-node";
import type {
	VariableConfig,
	VariableNodeSimulateConfig,
} from "@/types/node/variable-node";
import { type SelectedAccount, TradeMode } from "@/types/strategy";
import VariableSetting from "../components/variable-setting";

const VariableNodeSimSettingPanel: React.FC<SettingProps> = ({ id, data }) => {
	const {
		config,
		setDefaultSimulateConfig,
		updateSelectedAccount,
		updateVariableConfigs,
	} = useUpdateSimulateConfig({
		id,
		initialConfig: data?.simulateConfig as
			| VariableNodeSimulateConfig
			| undefined,
	});

	// 初始化默认配置
	React.useEffect(() => {
		if (!config) {
			setDefaultSimulateConfig();
		}
	}, [config, setDefaultSimulateConfig]);

	const handleAccountChange = (selectedAccount: SelectedAccount | null) => {
		if (selectedAccount) {
			updateSelectedAccount(selectedAccount);
		}
	};

	const handleVariableConfigsChange = (variableConfigs: VariableConfig[]) => {
		updateVariableConfigs(variableConfigs);
	};

	return (
		<div className="flex flex-col gap-2">
			<AccountSelector
				label="模拟账户"
				tradeMode={TradeMode.SIMULATE}
				selectedAccount={config?.selectedAccount || null}
				onAccountChange={handleAccountChange}
			/>
			<VariableSetting
				variableConfigs={config?.variableConfigs || []}
				onVariableConfigsChange={handleVariableConfigsChange}
			/>
		</div>
	);
};

export default VariableNodeSimSettingPanel;
