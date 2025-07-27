import React from "react";
import AccountSelector from "@/components/flow/account-selector";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { useUpdateLiveConfig } from "@/hooks/node/variable-node";
import type {
	VariableConfig,
	VariableNodeLiveConfig,
} from "@/types/node/variable-node";
import { type SelectedAccount, TradeMode } from "@/types/strategy";
import VariableSetting from "../components/variable-setting";

const VariableNodeLiveSettingPanel: React.FC<SettingProps> = ({ id, data }) => {
	const {
		config,
		setDefaultLiveConfig,
		updateSelectedAccount,
		updateVariableConfigs,
	} = useUpdateLiveConfig({
		id,
		initialConfig: data?.liveConfig as VariableNodeLiveConfig | undefined,
	});

	// 初始化默认配置
	React.useEffect(() => {
		if (!config) {
			setDefaultLiveConfig();
		}
	}, [config, setDefaultLiveConfig]);

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
				label="实盘账户"
				tradeMode={TradeMode.LIVE}
				selectedAccount={config?.selectedAccount || null}
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

export default VariableNodeLiveSettingPanel;
