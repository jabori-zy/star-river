import {
	type Edge,
	getOutgoers,
	type Node,
} from "@xyflow/react";
import type { KlineNodeData } from "@/types/node/kline-node";
import type { StartNodeData } from "@/types/node/start-node";
import type { SelectedAccount, TimeRange } from "@/types/strategy";
import { NodeType } from "@/types/node/index";



// 处理startNode变化的逻辑
export const handleStartNodeChange = (
	oldNode: Node,
	newNode: Node,
	nodes: Node[],
	edges: Edge[],
): Node[] => {
	const startNodeId = newNode.id;
	const oldStartData = oldNode.data as StartNodeData;
	const newStartData = newNode.data as StartNodeData;

	// 检查回测配置中的时间范围是否发生变化
	const oldTimeRange =
		oldStartData?.backtestConfig?.exchangeModeConfig?.timeRange;
	const newTimeRange =
		newStartData?.backtestConfig?.exchangeModeConfig?.timeRange;

	// 检查数据源列表是否发生变化
	const oldDataSources =
		oldStartData?.backtestConfig?.exchangeModeConfig?.selectedAccounts;
	const newDataSources =
		newStartData?.backtestConfig?.exchangeModeConfig?.selectedAccounts;

	let updatedNodes = nodes;
	let hasChanges = false;

	// 处理时间范围变化
	if (hasTimeRangeChanged(oldTimeRange, newTimeRange) && newTimeRange) {
		console.log("StartNode timeRange changed:", {
			oldTimeRange,
			newTimeRange,
		});
		updatedNodes = updateConnectedKlineNodes(
			startNodeId,
			newTimeRange,
			updatedNodes,
			edges,
		);
		hasChanges = true;
	}

	// 处理数据源列表变化
	if (hasDataSourceListChanged(oldDataSources, newDataSources)) {
		console.log("StartNode data sources changed:", {
			oldDataSources,
			newDataSources,
		});
		updatedNodes = cleanupInvalidDataSources(
			startNodeId,
			newDataSources || [],
			updatedNodes,
			edges,
		);
		hasChanges = true;
	}

	return hasChanges ? updatedNodes : nodes;
};



// 检查时间范围是否发生变化
export const hasTimeRangeChanged = (
	oldTimeRange?: TimeRange,
	newTimeRange?: TimeRange,
): boolean => {
	if (!oldTimeRange && !newTimeRange) return false;
	if (!oldTimeRange || !newTimeRange) return true;
	return (
		oldTimeRange.startDate !== newTimeRange.startDate ||
		oldTimeRange.endDate !== newTimeRange.endDate
	);
};

// 检查数据源列表是否发生变化
export const hasDataSourceListChanged = (
	oldSources?: SelectedAccount[],
	newSources?: SelectedAccount[],
): boolean => {
	if (!oldSources && !newSources) return false;
	if (!oldSources || !newSources) return true;
	if (oldSources.length !== newSources.length) return true;

	// 检查每个数据源是否还存在
	return (
		oldSources.some(
			(oldSource) =>
				!newSources.some((newSource) => newSource.id === oldSource.id),
		) ||
		newSources.some(
			(newSource) =>
				!oldSources.some((oldSource) => oldSource.id === newSource.id),
		)
	);
};

// 检查kline节点的数据源是否仍然有效
export const isDataSourceValid = (
	klineDataSource?: SelectedAccount,
	availableSources?: SelectedAccount[],
): boolean => {
	if (!klineDataSource || !availableSources) return false;
	return availableSources.some((source) => source.id === klineDataSource.id);
};

// 更新连接的K线节点的时间范围
export const updateConnectedKlineNodes = (
	startNodeId: string,
	newTimeRange: TimeRange,
	nodes: Node[],
	edges: Edge[],
): Node[] => {
	// 使用 getOutgoers 获取连接到 startNode 的所有节点
	const startNode = nodes.find((node) => node.id === startNodeId);
	if (!startNode) return nodes;

	const connectedKlineNodes = getOutgoers(startNode, nodes, edges).filter((node) => node.type === NodeType.KlineNode);

	if (connectedKlineNodes.length === 0) return nodes;

	console.log(
		"Updating connected klineNodes timeRange:",
		connectedKlineNodes.map((n) => n.id),
	);

	// 更新这些klineNode的timeRange
	return nodes.map((node) => {
		const isConnectedKlineNode = connectedKlineNodes.some(
			(kn) => kn.id === node.id,
		);
		if (isConnectedKlineNode && node.type === "klineNode") {
			const klineData = node.data as KlineNodeData;
			return {
				...node,
				data: {
					...klineData,
					backtestConfig: {
						...klineData.backtestConfig,
						exchangeModeConfig: {
							...klineData.backtestConfig?.exchangeModeConfig,
							timeRange: newTimeRange,
						},
					},
				},
			};
		}
		return node;
	});
};

// 清理连接的K线节点中无效的数据源配置
export const cleanupInvalidDataSources = (
	startNodeId: string,
	availableDataSources: SelectedAccount[],
	nodes: Node[],
	edges: Edge[],
): Node[] => {
	// 使用 getOutgoers 获取连接到 startNode 的所有节点
	const startNode = nodes.find((node) => node.id === startNodeId);
	if (!startNode) return nodes;

	const connectedKlineNodes = getOutgoers(startNode, nodes, edges).filter((node) => node.type === NodeType.KlineNode);

	if (connectedKlineNodes.length === 0) return nodes;

	console.log(
		"Checking data source validity for klineNodes:",
		connectedKlineNodes.map((n) => n.id),
	);

	// 检查并清理无效的数据源配置
	return nodes.map((node) => {
		const isConnectedKlineNode = connectedKlineNodes.some(
			(kn) => kn.id === node.id,
		);
		if (isConnectedKlineNode && node.type === "klineNode") {
			const klineData = node.data as KlineNodeData;
			const currentDataSource =
				klineData.backtestConfig?.exchangeModeConfig?.selectedAccount;

			// 检查当前数据源是否仍然有效
			if (
				currentDataSource &&
				!isDataSourceValid(currentDataSource, availableDataSources)
			) {
				console.log(
					`Clearing invalid data source for klineNode ${node.id}:`,
					currentDataSource,
				);

				return {
					...node,
					data: {
						...klineData,
						backtestConfig: {
							...klineData.backtestConfig,
							exchangeModeConfig: {
								...klineData.backtestConfig?.exchangeModeConfig,
								selectedAccount: undefined, // 清空无效的数据源
								selectedSymbols: [], // 同时清空交易品种配置
							},
						},
					},
				};
			}
		}
		return node;
	});
};