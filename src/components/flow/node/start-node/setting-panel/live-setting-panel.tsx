import type React from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { useLiveConfig } from "@/hooks/node-config/start-node/use-update-live-config";
import { useStartNodeDataStore } from "@/store/node/use-start-node-data-store";
import type { StartNodeData } from "@/types/node/start-node";
import AccountSelector from "../components/account-selector";
import VariableEditor from "../components/variable-editor";

// 新开始节点实时模式设置面板
export const StartNodeLiveSettingPanel: React.FC<SettingProps> = ({
	id,
	data,
}) => {
	// 将data转换为StartNodeData类型
	const startNodeData = data as StartNodeData;

	// 从全局状态获取数据
	const { liveConfig: globalLiveConfig } = useStartNodeDataStore();

	// 使用自定义 hook 管理实时配置
	const { updateSelectedAccounts, updateVariables } = useLiveConfig({
		initialConfig: startNodeData.liveConfig || undefined,
		nodeId: id,
	});

	return (
		<div className="p-4 space-y-4">
			<AccountSelector
				selectedAccounts={globalLiveConfig?.selectedAccounts || []}
				setSelectedAccounts={() => {}} // 不再需要本地状态设置
				updateSelectedAccounts={updateSelectedAccounts}
			/>

			<VariableEditor
				variables={globalLiveConfig?.customVariables || []}
				onVariablesChange={updateVariables}
			/>
		</div>
	);
};

export default StartNodeLiveSettingPanel;
