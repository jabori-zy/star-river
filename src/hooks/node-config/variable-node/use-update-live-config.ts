import { useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import type {
	VariableConfig,
	VariableNodeLiveConfig,
} from "@/types/node/variable-node";
import {
	ensureTriggerConfigForVariableConfig,
	ensureTriggerConfigForVariableConfigs,
} from "@/types/node/variable-node";
import type { SelectedAccount } from "@/types/strategy";

interface UseUpdateLiveConfigProps {
	id: string;
	initialConfig?: VariableNodeLiveConfig;
}

export const useUpdateLiveConfig = ({
	id,
	initialConfig,
}: UseUpdateLiveConfigProps) => {
	const { updateNodeData } = useReactFlow();

	// 统一的状态管理
	const [config, setConfig] = useState<VariableNodeLiveConfig | undefined>(
		initialConfig
			? {
					...initialConfig,
					variableConfigs: ensureTriggerConfigForVariableConfigs(
						initialConfig.variableConfigs,
					),
				}
			: initialConfig,
	);

	// 监听 config 变化，同步到 ReactFlow
	useEffect(() => {
		if (config) {
			updateNodeData(id, {
				liveConfig: config,
			});
		}
	}, [config, id, updateNodeData]);

	// 通用的更新函数
	const updateConfig = useCallback(
		(
			updater: (
				prev: VariableNodeLiveConfig | undefined,
			) => VariableNodeLiveConfig,
		) => {
			setConfig((prevConfig) => updater(prevConfig));
		},
		[],
	);

	// 默认配置值
	const getDefaultConfig = useCallback(
		(prev?: VariableNodeLiveConfig): VariableNodeLiveConfig => ({
			selectedAccount: prev?.selectedAccount || null,
			variableConfigs: ensureTriggerConfigForVariableConfigs(
				prev?.variableConfigs,
			),
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
			const normalizedValue =
				field === "variableConfigs"
					? (ensureTriggerConfigForVariableConfigs(
							value as VariableConfig[],
					  ) as VariableNodeLiveConfig[K])
					: value;

			updateConfig((prev) => ({
				...prev,
				selectedAccount: prev?.selectedAccount || null,
				variableConfigs: ensureTriggerConfigForVariableConfigs(
					prev?.variableConfigs,
				),
				[field]: normalizedValue,
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
			updateField(
				"variableConfigs",
				ensureTriggerConfigForVariableConfigs(variableConfigs),
			);
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
				const newConfig = ensureTriggerConfigForVariableConfig({
					...variableConfig,
					configId: newId,
				} as VariableConfig);

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
				updatedConfigs[index] =
					ensureTriggerConfigForVariableConfig(variableConfig);

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
