import { useEffect, useState } from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { useUpdateLiveConfig } from "@/hooks/node-config/position-management-node/use-update-live-config";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";
import type {
	PositionManagementNodeData,
	PositionOperationConfig,
} from "@/types/node/position-management-node";
import type { SelectedAccount } from "@/types/strategy";
import OperationSetting from "../components/operation-setting";
import OptAccountSelector from "../components/opt-account-selector";

const PositionManagementNodeLiveSettingPanel: React.FC<SettingProps> = ({
	id,
	data,
}) => {
	// 开始节点的实盘配置
	const { liveConfig: startNodeLiveConfig } = useStartNodeDataStore();

	// 获取节点数据
	const positionNodeData = data as PositionManagementNodeData;

	// 使用hooks管理节点数据更新
	const { config, updateSelectedAccount, updatePositionOperations } =
		useUpdateLiveConfig({ id, initialConfig: positionNodeData?.liveConfig });

	// 可选的账户列表
	const [accountList, setAccountList] = useState<SelectedAccount[]>(
		startNodeLiveConfig?.selectedAccounts || [],
	);
	// 当前选中的账户
	const [selectedAccount, setSelectedAccount] =
		useState<SelectedAccount | null>(config?.selectedAccount || null);

	// 当前的操作配置 - 从config中获取，保持同步
	const [operationConfigs, setOperationConfigs] = useState<
		PositionOperationConfig[]
	>(config?.positionOperations || []);

	// 当开始节点的实盘配置变化时，更新可选的账户列表
	useEffect(() => {
		setAccountList(startNodeLiveConfig?.selectedAccounts || []);
	}, [startNodeLiveConfig]);

	// 当config变化时，同步更新本地状态
	useEffect(() => {
		if (config) {
			setSelectedAccount(config.selectedAccount || null);
			setOperationConfigs(config.positionOperations || []);
		}
	}, [config]);

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
					nodeId={id}
					operationConfigs={operationConfigs}
					onOperationConfigsChange={handleOperationConfigsChange}
				/>
			</div>
		</div>
	);
};

export default PositionManagementNodeLiveSettingPanel;
