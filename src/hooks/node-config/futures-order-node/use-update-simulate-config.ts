import { useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import type { FuturesOrderNodeSimulateConfig } from "@/types/node/futures-order-node";
import type { FuturesOrderConfig } from "@/types/order";
import type { SelectedAccount } from "@/types/strategy";

interface UseUpdateSimulateConfigProps {
	id: string;
	initialConfig?: FuturesOrderNodeSimulateConfig;
}

export const useUpdateSimulateConfig = ({
	id,
	initialConfig,
}: UseUpdateSimulateConfigProps) => {
	const { updateNodeData, getNode } = useReactFlow();

	// 统一的状态管理
	const [config, setConfig] = useState<
		FuturesOrderNodeSimulateConfig | undefined
	>(initialConfig);

	// 同步节点数据到本地状态
	useEffect(() => {
		const node = getNode(id);
		if (node?.data?.simulateConfig) {
			setConfig(node.data.simulateConfig as FuturesOrderNodeSimulateConfig);
		}
	}, [id, getNode]);

	// 通用的更新函数
	const updateConfig = useCallback(
		(
			updater: (
				prev: FuturesOrderNodeSimulateConfig | undefined,
			) => FuturesOrderNodeSimulateConfig,
		) => {
			// 获取最新的节点数据，而不是依赖可能过时的state
			const currentNode = getNode(id);
			const currentConfig = currentNode?.data?.simulateConfig as
				| FuturesOrderNodeSimulateConfig
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
		(
			prev?: FuturesOrderNodeSimulateConfig,
		): FuturesOrderNodeSimulateConfig => ({
			futuresOrderConfigs: prev?.futuresOrderConfigs || [],
			selectedSimulateAccount: prev?.selectedSimulateAccount,
			...prev,
		}),
		[],
	);

	// 通用的字段更新方法
	const updateField = useCallback(
		<K extends keyof FuturesOrderNodeSimulateConfig>(
			field: K,
			value: FuturesOrderNodeSimulateConfig[K],
		) => {
			updateConfig((prev) => ({
				...prev,
				futuresOrderConfigs: prev?.futuresOrderConfigs || [],
				[field]: value,
			}));
		},
		[updateConfig],
	);

	// 设置默认模拟配置
	const setDefaultSimulateConfig = useCallback(() => {
		updateConfig((prev) => getDefaultConfig(prev));
	}, [updateConfig, getDefaultConfig]);

	// 更新选中的模拟账户
	const updateSelectedSimulateAccount = useCallback(
		(selectedSimulateAccount: SelectedAccount) => {
			updateField("selectedSimulateAccount", selectedSimulateAccount);
		},
		[updateField],
	);

	// 更新订单配置列表
	const updateFuturesOrderConfigs = useCallback(
		(futuresOrderConfigs: FuturesOrderConfig[]) => {
			updateField("futuresOrderConfigs", futuresOrderConfigs);
		},
		[updateField],
	);

	// 添加订单配置
	const addFuturesOrderConfig = useCallback(
		(orderConfig: FuturesOrderConfig) => {
			updateConfig((prev) => {
				const currentConfigs = prev?.futuresOrderConfigs || [];
				return {
					...prev,
					futuresOrderConfigs: [...currentConfigs, orderConfig],
				};
			});
		},
		[updateConfig],
	);

	// 更新指定订单配置
	const updateFuturesOrderConfig = useCallback(
		(index: number, orderConfig: FuturesOrderConfig) => {
			updateConfig((prev) => {
				const currentConfigs = prev?.futuresOrderConfigs || [];
				const updatedConfigs = [...currentConfigs];
				updatedConfigs[index] = orderConfig;

				return {
					...prev,
					futuresOrderConfigs: updatedConfigs,
				};
			});
		},
		[updateConfig],
	);

	// 删除订单配置
	const removeFuturesOrderConfig = useCallback(
		(index: number) => {
			updateConfig((prev) => {
				const currentConfigs = prev?.futuresOrderConfigs || [];
				const updatedConfigs = currentConfigs
					.filter((_, i) => i !== index)
					.map((order, newIndex) => ({
						...order,
						id: newIndex + 1, // 重新分配id，保持连续性
					}));

				return {
					...prev,
					futuresOrderConfigs: updatedConfigs,
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
		updateSelectedSimulateAccount,
		updateFuturesOrderConfigs,

		// 订单配置管理方法
		addFuturesOrderConfig,
		updateFuturesOrderConfig,
		removeFuturesOrderConfig,
	};
};
