import { useCallback, useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import {
	VariableNodeSimulateConfig,
	VariableConfig,
} from "@/types/node/variable-node";
import { SelectedAccount } from "@/types/strategy";

interface UseUpdateSimulateConfigProps {
	id: string;
	initialConfig?: VariableNodeSimulateConfig;
}

export const useUpdateSimulateConfig = ({
	id,
	initialConfig,
}: UseUpdateSimulateConfigProps) => {
	const { updateNodeData, getNode } = useReactFlow();

	// 统一的状态管理
	const [config, setConfig] = useState<VariableNodeSimulateConfig | undefined>(
		initialConfig,
	);

	// 同步节点数据到本地状态
	useEffect(() => {
		const node = getNode(id);
		if (node?.data?.simulateConfig) {
			setConfig(node.data.simulateConfig as VariableNodeSimulateConfig);
		}
	}, [id, getNode]);

	// 通用的更新函数
	const updateConfig = useCallback(
		(
			updater: (
				prev: VariableNodeSimulateConfig | undefined,
			) => VariableNodeSimulateConfig,
		) => {
			// 获取最新的节点数据，而不是依赖可能过时的state
			const currentNode = getNode(id);
			const currentConfig = currentNode?.data?.simulateConfig as
				| VariableNodeSimulateConfig
				| undefined;

			const newConfig = updater(currentConfig);

			// 更新节点数据
			updateNodeData(id, {
				simulateConfig: newConfig,
			});

			// 更新本地状态
			setConfig(newConfig);
		},
		[id, updateNodeData, getNode],
	);

	// 默认配置值
	const getDefaultConfig = useCallback(
		(prev?: VariableNodeSimulateConfig): VariableNodeSimulateConfig => ({
			selectedAccount: prev?.selectedAccount || null,
			variableConfigs: prev?.variableConfigs || [],
			...prev,
		}),
		[],
	);

	// 通用的字段更新方法
	const updateField = useCallback(
		<K extends keyof VariableNodeSimulateConfig>(
			field: K,
			value: VariableNodeSimulateConfig[K],
		) => {
			updateConfig((prev) => ({
				...prev,
				selectedAccount: prev?.selectedAccount || null,
				variableConfigs: prev?.variableConfigs || [],
				[field]: value,
			}));
		},
		[updateConfig],
	);

	// 设置默认模拟配置
	const setDefaultSimulateConfig = useCallback(() => {
		updateConfig((prev) => getDefaultConfig(prev));
	}, [updateConfig, getDefaultConfig]);

	// 更新账户选择
	const updateSelectedAccount = useCallback(
		(selectedAccount: SelectedAccount | null) => {
			updateField("selectedAccount", selectedAccount);
		},
		[updateField],
	);

	// 更新变量配置列表
	const updateVariableConfigs = useCallback(
		(variableConfigs: VariableConfig[]) => {
			updateField("variableConfigs", variableConfigs);
		},
		[updateField],
	);

	// 添加变量配置
	const addVariableConfig = useCallback(
		(variableConfig: Omit<VariableConfig, "configId">) => {
			updateConfig((prev) => {
				const currentConfigs = prev?.variableConfigs || [];
				const newId =
					Math.max(0, ...currentConfigs.map((config) => config.configId)) + 1;
				const newConfig = { ...variableConfig, configId: newId };

				return {
					...prev,
					selectedAccount: prev?.selectedAccount || null,
					variableConfigs: [...currentConfigs, newConfig],
				};
			});
		},
		[updateConfig],
	);

	// 更新指定变量配置
	const updateVariableConfig = useCallback(
		(index: number, variableConfig: VariableConfig) => {
			updateConfig((prev) => {
				const currentConfigs = prev?.variableConfigs || [];
				const updatedConfigs = [...currentConfigs];
				updatedConfigs[index] = variableConfig;

				return {
					...prev,
					selectedAccount: prev?.selectedAccount || null,
					variableConfigs: updatedConfigs,
				};
			});
		},
		[updateConfig],
	);

	// 删除变量配置
	const removeVariableConfig = useCallback(
		(index: number) => {
			updateConfig((prev) => {
				const currentConfigs = prev?.variableConfigs || [];
				const updatedConfigs = currentConfigs.filter((_, i) => i !== index);

				return {
					...prev,
					selectedAccount: prev?.selectedAccount || null,
					variableConfigs: updatedConfigs,
				};
			});
		},
		[updateConfig],
	);

	// 根据ID删除变量配置
	const removeVariableConfigById = useCallback(
		(configId: number) => {
			updateConfig((prev) => {
				const currentConfigs = prev?.variableConfigs || [];
				const updatedConfigs = currentConfigs.filter(
					(config) => config.configId !== configId,
				);

				return {
					...prev,
					selectedAccount: prev?.selectedAccount || null,
					variableConfigs: updatedConfigs,
				};
			});
		},
		[updateConfig],
	);

	return {
		// 状态
		config,

		// 基础配置方法
		setDefaultSimulateConfig,
		updateSelectedAccount,
		updateVariableConfigs,

		// 变量配置管理方法
		addVariableConfig,
		updateVariableConfig,
		removeVariableConfig,
		removeVariableConfigById,
	};
};
