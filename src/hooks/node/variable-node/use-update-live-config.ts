import { useCallback, useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import {
	VariableNodeLiveConfig,
	VariableConfig,
} from "@/types/node/variable-node";
import { SelectedAccount } from "@/types/strategy";

interface UseUpdateLiveConfigProps {
	id: string;
	initialConfig?: VariableNodeLiveConfig;
}

export const useUpdateLiveConfig = ({
	id,
	initialConfig,
}: UseUpdateLiveConfigProps) => {
	const { updateNodeData, getNode } = useReactFlow();

	// 统一的状态管理
	const [config, setConfig] = useState<VariableNodeLiveConfig | undefined>(
		initialConfig,
	);

	// 同步节点数据到本地状态
	useEffect(() => {
		const node = getNode(id);
		if (node?.data?.liveConfig) {
			setConfig(node.data.liveConfig as VariableNodeLiveConfig);
		}
	}, [id, getNode]);

	// 通用的更新函数
	const updateConfig = useCallback(
		(
			updater: (
				prev: VariableNodeLiveConfig | undefined,
			) => VariableNodeLiveConfig,
		) => {
			// 获取最新的节点数据，而不是依赖可能过时的state
			const currentNode = getNode(id);
			const currentConfig = currentNode?.data?.liveConfig as
				| VariableNodeLiveConfig
				| undefined;

			const newConfig = updater(currentConfig);

			// 更新节点数据
			updateNodeData(id, {
				liveConfig: newConfig,
			});

			// 更新本地状态
			setConfig(newConfig);
		},
		[id, updateNodeData, getNode],
	);

	// 默认配置值
	const getDefaultConfig = useCallback(
		(prev?: VariableNodeLiveConfig): VariableNodeLiveConfig => ({
			selectedAccount: prev?.selectedAccount || null,
			variableConfigs: prev?.variableConfigs || [],
			...prev,
		}),
		[],
	);

	// 通用的字段更新方法
	const updateField = useCallback(
		<K extends keyof VariableNodeLiveConfig>(
			field: K,
			value: VariableNodeLiveConfig[K],
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

	// 设置默认实盘配置
	const setDefaultLiveConfig = useCallback(() => {
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
		setDefaultLiveConfig,
		updateSelectedAccount,
		updateVariableConfigs,

		// 变量配置管理方法
		addVariableConfig,
		updateVariableConfig,
		removeVariableConfig,
		removeVariableConfigById,
	};
};
