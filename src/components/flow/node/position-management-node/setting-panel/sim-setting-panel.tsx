import { useEffect, useState } from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { useUpdateSimulateConfig } from "@/hooks/node/position-management-node/use-update-simulate-config";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";
import type {
	PositionManagementNodeData,
	PositionOperationConfig,
} from "@/types/node/position-management-node";
import type { SelectedAccount } from "@/types/strategy";
import OperationSetting from "../components/operation-setting";
import OptAccountSelector from "../components/opt-account-selector";

const PositionManagementNodeSimSettingPanel: React.FC<SettingProps> = ({
	id,
	data,
}) => {
	// 开始节点的实盘配置 - 由于store中可能没有模拟配置，我们暂时使用空数组
	const { liveConfig: startNodeLiveConfig } = useStartNodeDataStore();

	// 获取节点数据
	const positionNodeData = data as PositionManagementNodeData;

	// 使用hooks管理节点数据更新
	const { config, updateSelectedAccount, updatePositionOperations } =
		useUpdateSimulateConfig({
			id,
			initialConfig: positionNodeData?.simulateConfig,
		});

	// 可选的账户列表 - 模拟模式可能需要从其他地方获取账户列表
	// 这里暂时使用空数组，后续需要根据实际需求调整
	const [accountList, setAccountList] = useState<SelectedAccount[]>([]);
	// 当前选中的账户
	const [selectedAccount, setSelectedAccount] =
		useState<SelectedAccount | null>(config?.selectedAccount || null);

	// 当前的操作配置 - 从config中获取，保持同步
	const [operationConfigs, setOperationConfigs] = useState<
		PositionOperationConfig[]
	>(config?.positionOperations || []);

	// 当开始节点的配置变化时，更新可选的账户列表
	// 这里暂时为空，需要根据实际的模拟账户获取逻辑调整
	useEffect(() => {
		// TODO: 从适当的地方获取模拟账户列表
		setAccountList([]);
	}, []);

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
					operationConfigs={operationConfigs}
					onOperationConfigsChange={handleOperationConfigsChange}
				/>
			</div>
		</div>
	);
};

export default PositionManagementNodeSimSettingPanel;
