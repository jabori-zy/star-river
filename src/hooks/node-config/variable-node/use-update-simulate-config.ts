import { useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import type {
	VariableConfig,
	VariableNodeSimulateConfig,
} from "@/types/node/variable-node";
import type { SelectedAccount } from "@/types/strategy";

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

	// 监听 config 变化，同步到 ReactFlow
	useEffect(() => {
		if (config) {
			updateNodeData(id, {
				simulateConfig: config,
			});
		}
	}, [config, id, updateNodeData]);

	// 通用的更新函数
	const updateConfig = useCallback(
		(
			updater: (
				prev: VariableNodeSimulateConfig | undefined,
			) => VariableNodeSimulateConfig,
		) => {
			setConfig((prevConfig) => updater(prevConfig));
		},
		[],
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
