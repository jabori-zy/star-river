import { useReactFlow } from "@xyflow/react";
import type React from "react";
import { useCallback, useState } from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import type { StartNodeData } from "@/types/node/start-node";
import type {
	SelectedAccount,
	StrategySimulateConfig,
	StrategyVariable,
} from "@/types/strategy";
import AccountSelector from "../components/account-selector";
import VariableEditor from "../components/variable-editor";

// 新开始节点模拟模式设置面板
export const StartNodeSimulationSettingPanel: React.FC<SettingProps> = ({
	id,
	data,
}) => {
	// 将data转换为StartNodeData类型
	const startNodeData = data as StartNodeData;

	// 获取ReactFlow实例以更新节点数据
	const { setNodes, updateNodeData } = useReactFlow();

	// 模拟模式配置
	const [simulateConfig, setSimulateConfig] = useState<
		StrategySimulateConfig | undefined
	>(startNodeData.simulateConfig as StrategySimulateConfig);
	// 已选择账户列表
	const [selectedAccounts, setSelectedAccounts] = useState<SelectedAccount[]>(
		simulateConfig?.simulateAccounts || [],
	);
	// 变量列表
	const [variables, setVariables] = useState<StrategyVariable[]>(
		simulateConfig?.variables || [],
	);

	// 更新已选择账户
	const handleUpdateSelectedAccounts = useCallback(
		(accounts: SelectedAccount[]) => {
			console.log("更新模拟账户数据:", accounts);

			// 更新本地状态
			setSelectedAccounts(accounts);

			// 创建新的配置对象
			const newSimulateConfig: StrategySimulateConfig = {
				...simulateConfig,
				simulateAccounts: accounts,
				variables: variables, // 保持变量不变
			};

			setSimulateConfig(newSimulateConfig);

			// 使用ReactFlow的方法更新节点数据
			updateNodeData(id, {
				simulateConfig: newSimulateConfig,
			});
			setNodes((nodes) =>
				nodes.map((node) =>
					node.id === id
						? {
								...node,
								data: {
									...node.data,
									simulateConfig: newSimulateConfig,
								},
							}
						: node,
				),
			);

			console.log("模拟节点数据已更新，节点ID:", id);
		},
		[id, simulateConfig, variables, setNodes, updateNodeData],
	);

	// 更新变量列表
	const handleVariablesChange = useCallback(
		(newVariables: StrategyVariable[]) => {
			console.log("更新模拟变量数据:", newVariables);

			// 更新本地状态
			setVariables(newVariables);

			// 创建新的配置对象
			const newSimulateConfig: StrategySimulateConfig = {
				...simulateConfig,
				simulateAccounts: selectedAccounts,
				variables: newVariables,
			};

			setSimulateConfig(newSimulateConfig);

			// 使用ReactFlow的方法更新节点数据
			updateNodeData(id, {
				simulateConfig: newSimulateConfig,
			});
			setNodes((nodes) =>
				nodes.map((node) =>
					node.id === id
						? {
								...node,
								data: {
									...node.data,
									simulateConfig: newSimulateConfig,
								},
							}
						: node,
				),
			);

			console.log("模拟变量数据已更新，节点ID:", id);
		},
		[id, simulateConfig, selectedAccounts, setNodes, updateNodeData],
	);

	return (
		<div className="p-4 space-y-4">
			<AccountSelector
				selectedAccounts={selectedAccounts}
				setSelectedAccounts={setSelectedAccounts}
				updateSelectedAccounts={handleUpdateSelectedAccounts}
			/>

			<VariableEditor
				variables={variables}
				onVariablesChange={handleVariablesChange}
			/>
		</div>
	);
};

export default StartNodeSimulationSettingPanel;
