import { useEffect, useState } from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { useBacktestConfig } from "@/hooks/node-config/position-node";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type { PositionOperationConfig } from "@/types/node/position-management-node";
import type { SelectedAccount } from "@/types/strategy";
import OperationSetting from "../components/operation-setting";
import OptAccountSelector from "../components/opt-account-selector";

const PositionNodeBacktestSettingPanel: React.FC<SettingProps> = ({
	id,
}) => {
	// 获取开始节点数据
	const { getStartNodeData } = useStrategyWorkflow();
	const startNodeData = getStartNodeData();
	const accountList = startNodeData?.backtestConfig?.exchangeModeConfig?.selectedAccounts || [];

	// ✅ 使用新版本 hook 管理回测配置
	const { backtestConfig, updateSelectedAccount, updatePositionOperations } =
		useBacktestConfig({ id });

	// 当前选中的账户
	const [selectedAccount, setSelectedAccount] =
		useState<SelectedAccount | null>(backtestConfig?.selectedAccount || null);

	// 当前的操作配置 - 从backtestConfig中获取，保持同步
	const [operationConfigs, setOperationConfigs] = useState<
		PositionOperationConfig[]
	>(backtestConfig?.positionOperations || []);

	// 当backtestConfig变化时，同步更新本地状态
	useEffect(() => {
		if (backtestConfig) {
			setSelectedAccount(backtestConfig.selectedAccount || null);
			setOperationConfigs(backtestConfig.positionOperations || []);
		}
	}, [backtestConfig]);

	// 处理账户选择变更
	const handleAccountChange = (account: SelectedAccount | null) => {
		setSelectedAccount(account);
		updateSelectedAccount(account);
	};

	// 处理操作配置变更
	const handleOperationConfigsChange = (configs: PositionOperationConfig[]) => {
		setOperationConfigs(configs);
		updatePositionOperations(configs);
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-col items-start justify-start gap-2">
				<OptAccountSelector
					accountList={accountList}
					selectedAccount={selectedAccount}
					onAccountChange={handleAccountChange}
				/>
			</div>

			<div className="p-2">
				<OperationSetting
					accountId={selectedAccount?.id}
					nodeId={id}
					operationConfigs={operationConfigs}
					onOperationConfigsChange={handleOperationConfigsChange}
				/>
			</div>
		</div>
	);
};

export default PositionNodeBacktestSettingPanel;
