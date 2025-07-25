import { useCallback, useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import {
	VariableNodeBacktestConfig,
	VariableConfig,
	VariableNodeBacktestExchangeModeConfig,
} from "@/types/node/variable-node";
import { SelectedAccount, BacktestDataSource } from "@/types/strategy";

interface UseUpdateBacktestConfigProps {
	id: string;
	initialConfig?: VariableNodeBacktestConfig;
}

export const useUpdateBacktestConfig = ({
	id,
	initialConfig,
}: UseUpdateBacktestConfigProps) => {
	const { updateNodeData, getNode } = useReactFlow();

	// 统一的状态管理
	const [config, setConfig] = useState<VariableNodeBacktestConfig | undefined>(
		initialConfig,
	);

	// 同步节点数据到本地状态
	useEffect(() => {
		const node = getNode(id);
		if (node?.data?.backtestConfig) {
			setConfig(node.data.backtestConfig as VariableNodeBacktestConfig);
		}
	}, [id, getNode]);

	// 通用的更新函数
	const updateConfig = useCallback(
		(
			updater: (
				prev: VariableNodeBacktestConfig | undefined,
			) => VariableNodeBacktestConfig,
		) => {
			// 获取最新的节点数据，而不是依赖可能过时的state
			const currentNode = getNode(id);
			const currentConfig = currentNode?.data?.backtestConfig as
				| VariableNodeBacktestConfig
				| undefined;

			const newConfig = updater(currentConfig);

			// 更新节点数据
			updateNodeData(id, {
				backtestConfig: newConfig,
			});

			// 更新本地状态
			setConfig(newConfig);
		},
		[id, updateNodeData, getNode],
	);

	// 默认配置值
	const getDefaultConfig = useCallback(
		(prev?: VariableNodeBacktestConfig): VariableNodeBacktestConfig => ({
			dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
			exchangeModeConfig: prev?.exchangeModeConfig || undefined,
			variableConfigs: prev?.variableConfigs || [],
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
			updateConfig((prev) => ({
				...prev,
				dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
				exchangeModeConfig: prev?.exchangeModeConfig || undefined,
				variableConfigs: prev?.variableConfigs || [],
				[field]: value,
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
				updatedConfigs[index] = variableConfig;

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
