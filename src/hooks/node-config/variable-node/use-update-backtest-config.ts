import { useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import type {
	VariableConfig,
	VariableNodeBacktestConfig,
	VariableNodeBacktestExchangeModeConfig,
} from "@/types/node/variable-node";
import {
	ensureTriggerConfigForVariableConfig,
	ensureTriggerConfigForVariableConfigs,
} from "@/types/node/variable-node";
import { BacktestDataSource, type SelectedAccount } from "@/types/strategy";

interface UseUpdateBacktestConfigProps {
	id: string;
	initialConfig?: VariableNodeBacktestConfig;
}

export const useUpdateBacktestConfig = ({
	id,
	initialConfig,
}: UseUpdateBacktestConfigProps) => {
	const { updateNodeData } = useReactFlow();

	// 统一的状态管理
	const [config, setConfig] = useState<VariableNodeBacktestConfig | undefined>(
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
				backtestConfig: config,
			});
		}
	}, [config, id, updateNodeData]);

	// 通用的更新函数
	const updateConfig = useCallback(
		(
			updater: (
				prev: VariableNodeBacktestConfig | undefined,
			) => VariableNodeBacktestConfig,
		) => {
			setConfig((prevConfig) => updater(prevConfig));
		},
		[],
	);

	// 默认配置值
	const getDefaultConfig = useCallback(
		(prev?: VariableNodeBacktestConfig): VariableNodeBacktestConfig => ({
			dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
			exchangeModeConfig: prev?.exchangeModeConfig || undefined,
			variableConfigs: ensureTriggerConfigForVariableConfigs(
				prev?.variableConfigs,
			),
			...prev,
		}),
		[],
	);

	// 通用的字段更新方法
	const updateField = useCallback(
		<K extends keyof VariableNodeBacktestConfig>(
			field: K,
			value: VariableNodeBacktestConfig[K],
		) => {
			const normalizedValue =
				field === "variableConfigs"
					? (ensureTriggerConfigForVariableConfigs(
							value as VariableConfig[],
					  ) as VariableNodeBacktestConfig[K])
					: value;

			updateConfig((prev) => ({
				...prev,
				dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
				exchangeModeConfig: prev?.exchangeModeConfig || undefined,
				variableConfigs: ensureTriggerConfigForVariableConfigs(
					prev?.variableConfigs,
				),
				[field]: normalizedValue,
			}));
		},
		[updateConfig],
	);

	// 设置默认回测配置
	const setDefaultBacktestConfig = useCallback(() => {
		updateConfig((prev) => getDefaultConfig(prev));
	}, [updateConfig, getDefaultConfig]);

	// 更新数据源
	const updateDataSource = useCallback(
		(dataSource: BacktestDataSource) => {
			updateField("dataSource", dataSource);
		},
		[updateField],
	);

	// 更新交易所模式配置
	const updateExchangeModeConfig = useCallback(
		(
			exchangeModeConfig: VariableNodeBacktestExchangeModeConfig | undefined,
		) => {
			updateField("exchangeModeConfig", exchangeModeConfig);
		},
		[updateField],
	);

	// 更新交易所模式的选中账户
	const updateSelectedAccount = useCallback(
		(selectedAccount: SelectedAccount) => {
			updateConfig((prev) => ({
				...prev,
				dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
				variableConfigs: prev?.variableConfigs || [],
				exchangeModeConfig: {
					selectedAccount,
				},
			}));
		},
		[updateConfig],
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
					dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
					exchangeModeConfig: prev?.exchangeModeConfig || undefined,
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
					dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
					exchangeModeConfig: prev?.exchangeModeConfig || undefined,
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
					dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
					exchangeModeConfig: prev?.exchangeModeConfig || undefined,
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
					dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
					exchangeModeConfig: prev?.exchangeModeConfig || undefined,
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
		setDefaultBacktestConfig,
		updateDataSource,
		updateExchangeModeConfig,
		updateSelectedAccount,
		updateVariableConfigs,

		// 变量配置管理方法
		addVariableConfig,
		updateVariableConfig,
		removeVariableConfig,
		removeVariableConfigById,
	};
};
