import { useCallback, useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import {
	PositionLiveConfig,
	PositionOperationConfig,
} from "@/types/node/position-management-node";
import { SelectedAccount } from "@/types/strategy";

interface UseUpdateLiveConfigProps {
	id: string;
	initialConfig?: PositionLiveConfig;
}

export const useUpdateLiveConfig = ({
	id,
	initialConfig,
}: UseUpdateLiveConfigProps) => {
	const { updateNodeData, getNode } = useReactFlow();

	// 统一的状态管理
	const [config, setConfig] = useState<PositionLiveConfig | undefined>(
		initialConfig,
	);

	// 同步节点数据到本地状态
	useEffect(() => {
		const node = getNode(id);
		if (node?.data?.liveConfig) {
			setConfig(node.data.liveConfig as PositionLiveConfig);
		}
	}, [id, getNode]);

	// 通用的更新函数
	const updateConfig = useCallback(
		(updater: (prev: PositionLiveConfig | undefined) => PositionLiveConfig) => {
			// 获取最新的节点数据，而不是依赖可能过时的state
			const currentNode = getNode(id);
			const currentConfig = currentNode?.data?.liveConfig as
				| PositionLiveConfig
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
		(prev?: PositionLiveConfig): PositionLiveConfig => ({
			selectedAccount: prev?.selectedAccount || null,
			positionOperations: prev?.positionOperations || [],
			...prev,
		}),
		[],
	);

	// 通用的字段更新方法
	const updateField = useCallback(
		<K extends keyof PositionLiveConfig>(
			field: K,
			value: PositionLiveConfig[K],
		) => {
			updateConfig((prev) => ({
				...prev,
				selectedAccount: prev?.selectedAccount || null,
				positionOperations: prev?.positionOperations || [],
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

	// 更新操作配置列表
	const updatePositionOperations = useCallback(
		(positionOperations: PositionOperationConfig[]) => {
			updateField("positionOperations", positionOperations);
		},
		[updateField],
	);

	// 添加操作配置
	const addPositionOperation = useCallback(
		(operationConfig: PositionOperationConfig) => {
			updateConfig((prev) => {
				const currentOperations = prev?.positionOperations || [];
				const newId =
					Math.max(
						0,
						...currentOperations.map((op) => op.positionOperationId),
					) + 1;
				const newOperation = { ...operationConfig, positionOperationId: newId };

				return {
					...prev,
					selectedAccount: prev?.selectedAccount || null,
					positionOperations: [...currentOperations, newOperation],
				};
			});
		},
		[updateConfig],
	);

	// 更新指定操作配置
	const updatePositionOperation = useCallback(
		(index: number, operationConfig: PositionOperationConfig) => {
			updateConfig((prev) => {
				const currentOperations = prev?.positionOperations || [];
				const updatedOperations = [...currentOperations];
				updatedOperations[index] = operationConfig;

				return {
					...prev,
					selectedAccount: prev?.selectedAccount || null,
					positionOperations: updatedOperations,
				};
			});
		},
		[updateConfig],
	);

	// 删除操作配置
	const removePositionOperation = useCallback(
		(index: number) => {
			updateConfig((prev) => {
				const currentOperations = prev?.positionOperations || [];
				const updatedOperations = currentOperations.filter(
					(_, i) => i !== index,
				);

				return {
					...prev,
					selectedAccount: prev?.selectedAccount || null,
					positionOperations: updatedOperations,
				};
			});
		},
		[updateConfig],
	);

	// 根据ID删除操作配置
	const removePositionOperationById = useCallback(
		(operationId: number) => {
			updateConfig((prev) => {
				const currentOperations = prev?.positionOperations || [];
				const updatedOperations = currentOperations.filter(
					(op) => op.positionOperationId !== operationId,
				);

				return {
					...prev,
					selectedAccount: prev?.selectedAccount || null,
					positionOperations: updatedOperations,
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
		updatePositionOperations,

		// 操作配置管理方法
		addPositionOperation,
		updatePositionOperation,
		removePositionOperation,
		removePositionOperationById,
	};
};
