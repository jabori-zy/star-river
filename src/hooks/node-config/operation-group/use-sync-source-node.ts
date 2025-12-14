import { useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import type { StrategyFlowNode } from "@/types/node";
import { isKlineNode, isIndicatorNode, NodeType } from "@/types/node/index";
import type { KlineNodeData } from "@/types/node/kline-node";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
import type { VariableNodeData } from "@/types/node/variable-node/variable-config-types";
import type {
	OperationGroupData,
	OperationInputSeriesConfig,
	OperationInputScalarConfig,
	OperationInputGroupScalarValueConfig,
	OperationInputConfig,
	OperationGroup,
	OperationOutputConfig,
} from "@/types/node/group/operation-group";
import { useUpdateOpGroupConfig } from "./use-update-op-group-config";

/**
 * Sync Series config from Kline node
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromSeriesConfigId is 0, meaning user hasn't selected a variable yet)
 * 2. If Kline node's Symbol is deleted, remove the corresponding Series config
 * 3. If Symbol's symbol/interval changes, update Series config's display name
 *
 * @param klineNodeData - Kline node data
 * @param seriesConfig - Series config to sync
 * @param updateSeriesConfigById - Callback to update Series config
 */
function syncSeriesFromKlineNode(
	klineNodeData: KlineNodeData,
	seriesConfig: OperationInputSeriesConfig,
	updateSeriesConfigById: (
		configId: number,
		updates: Partial<OperationInputSeriesConfig>,
	) => void,
) {
	// Skip incomplete configs - user hasn't selected a variable yet
	if (!seriesConfig.fromSeriesConfigId || seriesConfig.fromSeriesConfigId === 0) {
		return;
	}

	// Get Kline node's symbol configurations
	const klineSymbols =
		klineNodeData.backtestConfig?.exchangeModeConfig?.selectedSymbols ?? [];

	// Find matching symbol by configId
	const matchingSymbol = klineSymbols.find(
		(sym) => sym.configId === seriesConfig.fromSeriesConfigId,
	);

	if (!matchingSymbol) {
		// Symbol has been deleted, clear the "from" fields but keep the config
		updateSeriesConfigById(seriesConfig.configId, {
			fromNodeId: "",
			fromNodeName: "",
			fromNodeType: seriesConfig.fromNodeType, // keep the type for UI
			fromHandleId: "",
			fromSeriesConfigId: 0,
			fromSeriesName: "",
			fromSeriesDisplayName: "",
		});
		return;
	}

	// Check if symbol or interval changed, update display name
	// if (seriesConfig.fromSeriesDisplayName !== matchingSymbol.symbol) {
	// 	updateSeriesConfigById(seriesConfig.configId, {
	// 		fromSeriesDisplayName: matchingSymbol.symbol,
	// 	});
	// }
}

/**
 * Sync Series config from Indicator node
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromSeriesConfigId is 0, meaning user hasn't selected a variable yet)
 * 2. If Indicator node's selected indicator is deleted, clear the "from" fields
 *
 * @param indicatorNodeData - Indicator node data
 * @param seriesConfig - Series config to sync
 * @param updateSeriesConfigById - Callback to update Series config
 */
function syncSeriesFromIndicatorNode(
	indicatorNodeData: IndicatorNodeData,
	seriesConfig: OperationInputSeriesConfig,
	updateSeriesConfigById: (
		configId: number,
		updates: Partial<OperationInputSeriesConfig>,
	) => void,
) {
	// Skip incomplete configs - user hasn't selected a variable yet
	if (!seriesConfig.fromSeriesConfigId || seriesConfig.fromSeriesConfigId === 0) {
		return;
	}

	// Get Indicator node's selected indicators
	const selectedIndicators =
		indicatorNodeData.backtestConfig?.exchangeModeConfig?.selectedIndicators ?? [];

	// Find matching indicator by configId
	const matchingIndicator = selectedIndicators.find(
		(indicator) => indicator.configId === seriesConfig.fromSeriesConfigId,
	);

	if (!matchingIndicator) {
		// Indicator has been deleted, clear the "from" fields but keep the config
		updateSeriesConfigById(seriesConfig.configId, {
			fromNodeId: "",
			fromNodeName: "",
			fromNodeType: seriesConfig.fromNodeType, // keep the type for UI
			fromHandleId: "",
			fromSeriesConfigId: 0,
			fromSeriesName: "",
			fromSeriesDisplayName: "",
		});
		return;
	}

	// Indicator exists, no need to update display name for now
}

/**
 * Sync Scalar config from Variable node
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromScalarConfigId is 0, meaning user hasn't selected a variable yet)
 * 2. If Variable node's variable config is deleted, clear the "from" fields
 *
 * @param variableNodeData - Variable node data
 * @param scalarConfig - Scalar config to sync
 * @param updateScalarConfigById - Callback to update Scalar config
 */
function syncScalarFromVariableNode(
	variableNodeData: VariableNodeData,
	scalarConfig: OperationInputScalarConfig,
	updateScalarConfigById: (
		configId: number,
		updates: Partial<OperationInputScalarConfig>,
	) => void,
) {
	// Skip incomplete configs - user hasn't selected a variable yet
	if (!scalarConfig.fromScalarConfigId || scalarConfig.fromScalarConfigId === 0) {
		return;
	}

	// Get Variable node's variable configurations
	const variableConfigs =
		variableNodeData.backtestConfig?.variableConfigs ?? [];

	// Find matching variable by configId
	const matchingVariable = variableConfigs.find(
		(variable) => variable.configId === scalarConfig.fromScalarConfigId,
	);

	if (!matchingVariable) {
		// Variable has been deleted, clear the "from" fields but keep the config
		updateScalarConfigById(scalarConfig.configId, {
			fromNodeId: "",
			fromNodeName: "",
			fromNodeType: scalarConfig.fromNodeType, // keep the type for UI
			fromHandleId: "",
			fromScalarConfigId: 0,
			fromScalarName: "",
			fromScalarDisplayName: "",
		});
		return;
	}

	// Variable exists, no need to update display name for now
}

// ============ Sync from Parent Group ============

/**
 * Find matching parent Group input config by configId
 */
function findParentGroupInputConfig(
	parentInputConfigs: OperationInputConfig[],
	configId: number,
): OperationInputConfig | undefined {
	return parentInputConfigs.find((config) => config.configId === configId);
}

/**
 * Sync Series config from parent Group (source: "Group")
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromSeriesConfigId is 0)
 * 2. If parent Group's input config is deleted, clear the "from" fields
 * 3. If parent config's display name changes, update the Series config
 */
function syncSeriesFromParentGroup(
	seriesConfig: OperationInputSeriesConfig,
	parentInputConfigs: OperationInputConfig[],
	updateSeriesConfigById: (
		configId: number,
		updates: Partial<OperationInputSeriesConfig>,
	) => void,
) {
	// Skip incomplete configs
	if (!seriesConfig.fromSeriesConfigId || seriesConfig.fromSeriesConfigId === 0) {
		return;
	}

	const matchingConfig = findParentGroupInputConfig(
		parentInputConfigs,
		seriesConfig.fromSeriesConfigId,
	);

	if (!matchingConfig) {
		// Parent config has been deleted, clear the "from" fields
		updateSeriesConfigById(seriesConfig.configId, {
			fromNodeId: "",
			fromNodeName: "",
			fromNodeType: seriesConfig.fromNodeType,
			fromHandleId: "",
			fromSeriesConfigId: 0,
			fromSeriesName: "",
			fromSeriesDisplayName: "",
		});
		return;
	}

	// Check type compatibility
	if (matchingConfig.type !== "Series") {
		// Type changed, clear the "from" fields
		updateSeriesConfigById(seriesConfig.configId, {
			fromNodeId: "",
			fromNodeName: "",
			fromNodeType: seriesConfig.fromNodeType,
			fromHandleId: "",
			fromSeriesConfigId: 0,
			fromSeriesName: "",
			fromSeriesDisplayName: "",
		});
		return;
	}

	// Update display name if changed
	if (seriesConfig.fromSeriesDisplayName !== matchingConfig.seriesDisplayName) {
		updateSeriesConfigById(seriesConfig.configId, {
			fromSeriesDisplayName: matchingConfig.seriesDisplayName,
			fromSeriesName: matchingConfig.seriesDisplayName,
			seriesDisplayName: matchingConfig.seriesDisplayName,
		});
	}
}

/**
 * Sync Scalar config from parent Group (source: "Group")
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromScalarConfigId is 0)
 * 2. If parent Group's input config is deleted, clear the "from" fields
 * 3. If parent config's display name changes, update the Scalar config
 */
function syncScalarFromParentGroup(
	scalarConfig: OperationInputScalarConfig,
	parentInputConfigs: OperationInputConfig[],
	updateScalarGroupConfigById: (
		configId: number,
		updates: Partial<OperationInputScalarConfig>,
	) => void,
) {
	// Skip incomplete configs
	if (!scalarConfig.fromScalarConfigId || scalarConfig.fromScalarConfigId === 0) {
		return;
	}

	const matchingConfig = findParentGroupInputConfig(
		parentInputConfigs,
		scalarConfig.fromScalarConfigId,
	);

	if (!matchingConfig) {
		// Parent config has been deleted, clear the "from" fields
		updateScalarGroupConfigById(scalarConfig.configId, {
			fromNodeId: "",
			fromNodeName: "",
			fromNodeType: scalarConfig.fromNodeType,
			fromHandleId: "",
			fromScalarConfigId: 0,
			fromScalarName: "",
			fromScalarDisplayName: "",
		});
		return;
	}

	// Check type compatibility
	if (matchingConfig.type !== "Scalar") {
		// Type changed, clear the "from" fields
		updateScalarGroupConfigById(scalarConfig.configId, {
			fromNodeId: "",
			fromNodeName: "",
			fromNodeType: scalarConfig.fromNodeType,
			fromHandleId: "",
			fromScalarConfigId: 0,
			fromScalarName: "",
			fromScalarDisplayName: "",
		});
		return;
	}

	// Update display name if changed
	if (scalarConfig.fromScalarDisplayName !== matchingConfig.scalarDisplayName) {
		updateScalarGroupConfigById(scalarConfig.configId, {
			fromScalarDisplayName: matchingConfig.scalarDisplayName,
			scalarDisplayName: matchingConfig.scalarDisplayName,
			fromScalarName: matchingConfig.fromScalarName,
		});
	}
}

/**
 * Sync GroupScalarValue config from parent Group (source: "Group")
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromScalarConfigId is 0)
 * 2. If parent Group's input config is deleted, clear the "from" fields
 * 3. If parent config's display name or value changes, update the config
 */
function syncGroupScalarValueFromParentGroup(
	groupScalarConfig: OperationInputGroupScalarValueConfig,
	parentInputConfigs: OperationInputConfig[],
	updateGroupScalarValueConfigById: (
		configId: number,
		updates: Partial<OperationInputGroupScalarValueConfig>,
	) => void,
) {
	// Skip incomplete configs
	if (!groupScalarConfig.fromScalarConfigId || groupScalarConfig.fromScalarConfigId === 0) {
		return;
	}

	const matchingConfig = findParentGroupInputConfig(
		parentInputConfigs,
		groupScalarConfig.fromScalarConfigId,
	);

	if (!matchingConfig) {
		// Parent config has been deleted, clear the "from" fields
		updateGroupScalarValueConfigById(groupScalarConfig.configId, {
			fromNodeId: "",
			fromNodeName: "",
			fromNodeType: groupScalarConfig.fromNodeType,
			fromHandleId: "",
			fromScalarConfigId: 0,
			fromScalarDisplayName: "",
			fromScalarValue: 0,
		});
		return;
	}

	// Check type compatibility - parent should be CustomScalarValue
	if (matchingConfig.type !== "CustomScalarValue") {
		// Type changed, clear the "from" fields
		updateGroupScalarValueConfigById(groupScalarConfig.configId, {
			fromNodeId: "",
			fromNodeName: "",
			fromNodeType: groupScalarConfig.fromNodeType,
			fromHandleId: "",
			fromScalarConfigId: 0,
			fromScalarDisplayName: "",
			fromScalarValue: 0,
		});
		return;
	}

	// Get the scalar value from parent config
	const scalarValue = matchingConfig.source === null
		? matchingConfig.scalarValue
		: matchingConfig.fromScalarValue;

	// Check if update is needed
	const needsUpdate =
		groupScalarConfig.fromScalarDisplayName !== matchingConfig.scalarDisplayName ||
		groupScalarConfig.fromScalarValue !== scalarValue;

	if (needsUpdate) {
		updateGroupScalarValueConfigById(groupScalarConfig.configId, {
			fromScalarDisplayName: matchingConfig.scalarDisplayName,
			scalarDisplayName: matchingConfig.scalarDisplayName,
			fromScalarValue: scalarValue,
		});
	}
}

// ============ Sync from Upstream OperationGroup ============

/**
 * Find matching upstream Group output config by configId
 */
function findUpstreamGroupOutputConfig(
	upstreamOutputConfigs: OperationOutputConfig[],
	configId: number,
): OperationOutputConfig | undefined {
	return upstreamOutputConfigs.find((config) => config.configId === configId);
}

/**
 * Sync Series config from upstream OperationGroup (source: "Node", fromNodeType: OperationGroup)
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromSeriesConfigId is 0)
 * 2. If upstream Group's output config is deleted, clear the "from" fields
 * 3. If upstream config's display name changes, update the Series config
 */
function syncSeriesFromUpstreamGroup(
	seriesConfig: OperationInputSeriesConfig,
	upstreamOutputConfigs: OperationOutputConfig[],
	updateSeriesConfigById: (
		configId: number,
		updates: Partial<OperationInputSeriesConfig>,
	) => void,
) {
	// Skip incomplete configs
	if (!seriesConfig.fromSeriesConfigId || seriesConfig.fromSeriesConfigId === 0) {
		return;
	}

	const matchingConfig = findUpstreamGroupOutputConfig(
		upstreamOutputConfigs,
		seriesConfig.fromSeriesConfigId,
	);

	if (!matchingConfig) {
		// Upstream config has been deleted, clear the "from" fields
		updateSeriesConfigById(seriesConfig.configId, {
			fromNodeId: "",
			fromNodeName: "",
			fromNodeType: seriesConfig.fromNodeType,
			fromHandleId: "",
			fromSeriesConfigId: 0,
			fromSeriesName: "",
			fromSeriesDisplayName: "",
		});
		return;
	}

	// Check type compatibility
	if (matchingConfig.type !== "Series") {
		// Type changed, clear the "from" fields
		updateSeriesConfigById(seriesConfig.configId, {
			fromNodeId: "",
			fromNodeName: "",
			fromNodeType: seriesConfig.fromNodeType,
			fromHandleId: "",
			fromSeriesConfigId: 0,
			fromSeriesName: "",
			fromSeriesDisplayName: "",
		});
		return;
	}

	// Update "from" fields if changed (do NOT update seriesDisplayName - that's owned by this node)
	if (seriesConfig.fromSeriesDisplayName !== matchingConfig.seriesDisplayName) {
		updateSeriesConfigById(seriesConfig.configId, {
			fromSeriesDisplayName: matchingConfig.seriesDisplayName,
			fromSeriesName: matchingConfig.seriesDisplayName,
		});
	}
}

/**
 * Sync Scalar config from upstream OperationGroup (source: "Node", fromNodeType: OperationGroup)
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromScalarConfigId is 0)
 * 2. If upstream Group's output config is deleted, clear the "from" fields
 * 3. If upstream config's display name changes, update the Scalar config
 */
function syncScalarFromUpstreamGroup(
	scalarConfig: OperationInputScalarConfig,
	upstreamOutputConfigs: OperationOutputConfig[],
	updateScalarNodeConfigById: (
		configId: number,
		updates: Partial<OperationInputScalarConfig>,
	) => void,
) {
	// Skip incomplete configs
	if (!scalarConfig.fromScalarConfigId || scalarConfig.fromScalarConfigId === 0) {
		return;
	}

	const matchingConfig = findUpstreamGroupOutputConfig(
		upstreamOutputConfigs,
		scalarConfig.fromScalarConfigId,
	);

	if (!matchingConfig) {
		// Upstream config has been deleted, clear the "from" fields
		updateScalarNodeConfigById(scalarConfig.configId, {
			fromNodeId: "",
			fromNodeName: "",
			fromNodeType: scalarConfig.fromNodeType,
			fromHandleId: "",
			fromScalarConfigId: 0,
			fromScalarName: "",
			fromScalarDisplayName: "",
		});
		return;
	}

	// Check type compatibility
	if (matchingConfig.type !== "Scalar") {
		// Type changed, clear the "from" fields
		updateScalarNodeConfigById(scalarConfig.configId, {
			fromNodeId: "",
			fromNodeName: "",
			fromNodeType: scalarConfig.fromNodeType,
			fromHandleId: "",
			fromScalarConfigId: 0,
			fromScalarName: "",
			fromScalarDisplayName: "",
		});
		return;
	}

	// Update "from" fields if changed (do NOT update scalarDisplayName - that's owned by this node)
	if (scalarConfig.fromScalarDisplayName !== matchingConfig.scalarDisplayName) {
		updateScalarNodeConfigById(scalarConfig.configId, {
			fromScalarDisplayName: matchingConfig.scalarDisplayName,
			fromScalarName: matchingConfig.scalarDisplayName,
		});
	}
}

/**
 * Sync OperationGroup with source Kline node's Symbol configuration
 *
 * Responsibilities:
 * 1. Listen to source node connection changes
 * 2. Monitor Kline node's Symbol configuration changes
 * 3. Sync/clear Series configs when Kline Symbol changes
 *
 * Note: This effect only runs when sourceNodes change, not when currentNodeData changes.
 * This prevents the sync logic from running when the user is editing the current node
 * (e.g., adding a new empty config).
 *
 * @param id - OperationGroup node ID
 * @param currentNodeData - Current node data (passed from external to avoid duplicate fetching)
 */
export const useSyncSourceNode = ({
	id,
	currentNodeData,
}: {
	id: string;
	currentNodeData: OperationGroupData;
}) => {
	const { getNodes } = useReactFlow();
	const {
		updateSeriesConfigById,
		updateScalarNodeConfigById,
		updateScalarGroupConfigById,
		updateGroupScalarValueConfigById,
	} = useUpdateOpGroupConfig({ id });

	// 1. Get current Group's input connections
	const connections = useNodeConnections({ id, handleType: "target" });

	// 2. Get all connected source nodes data
	const sourceNodes = useNodesData<StrategyFlowNode>(
		connections.map((conn) => conn.source),
	);

	// 3. Find parent Group node (if this is a child Group)
	const parentNodeId = useMemo(() => {
		const currentNode = getNodes().find((node) => node.id === id);
		return currentNode?.parentId;
	}, [getNodes, id]);

	// 4. Get parent Group's data using useNodesData for reactivity
	const parentNodesData = useNodesData<OperationGroup>(
		parentNodeId ? [parentNodeId] : [],
	);
	const parentGroupData = parentNodesData[0]?.data;

	// 5. Get all connected upstream OperationGroup IDs (peer groups, not parent)
	const upstreamOperationGroupIds = useMemo(() => {
		return connections
			.map((conn) => conn.source)
			.filter((sourceId) => {
				const sourceNode = getNodes().find((n) => n.id === sourceId);
				return sourceNode?.type === NodeType.OperationGroup;
			});
	}, [connections, getNodes]);

	// 6. Get upstream OperationGroups' data using useNodesData for reactivity
	const upstreamOperationGroupsData = useNodesData<OperationGroup>(upstreamOperationGroupIds);

	// Get current connected source node IDs for checking edge disconnection
	const connectedSourceNodeIds = useMemo(() => {
		return new Set(connections.map((conn) => conn.source));
	}, [connections]);

	// useEffect to listen source node and connection changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: currentNodeData is intentionally omitted to prevent infinite loops. This effect should only run when sourceNodes or connections change.
	useEffect(() => {
		// Filter Series configs from upstream nodes (source=Node, excluding OperationGroup which is handled separately)
		const seriesFromNodes =
			currentNodeData.inputConfigs?.filter(
				(config): config is OperationInputSeriesConfig =>
					config.type === "Series" &&
					config.source === "Node" &&
					config.fromNodeType !== NodeType.OperationGroup,
			) ?? [];

		// Filter Scalar configs from upstream nodes (source=Node, excluding OperationGroup which is handled separately)
		const scalarFromNodes =
			currentNodeData.inputConfigs?.filter(
				(config): config is OperationInputScalarConfig =>
					config.type === "Scalar" &&
					config.source === "Node" &&
					config.fromNodeType !== NodeType.OperationGroup,
			) ?? [];

		// Process Series configs
		for (const seriesConfig of seriesFromNodes) {
			// Skip incomplete configs - user hasn't selected a variable yet
			if (!seriesConfig.fromNodeId) {
				continue;
			}

			// Check if source node is still connected (edge not deleted)
			if (!connectedSourceNodeIds.has(seriesConfig.fromNodeId)) {
				// Edge has been deleted, clear the "from" fields
				updateSeriesConfigById(seriesConfig.configId, {
					fromNodeId: "",
					fromNodeName: "",
					fromNodeType: seriesConfig.fromNodeType,
					fromHandleId: "",
					fromSeriesConfigId: 0,
					fromSeriesName: "",
					fromSeriesDisplayName: "",
				});
				continue;
			}

			// Find corresponding source node
			const sourceNode = sourceNodes.find(
				(node) => node?.id === seriesConfig.fromNodeId,
			);

			if (!sourceNode) {
				// Source node data not available yet, skip
				continue;
			}

			// Process Kline nodes
			if (isKlineNode(sourceNode)) {
				syncSeriesFromKlineNode(
					sourceNode.data as KlineNodeData,
					seriesConfig,
					updateSeriesConfigById,
				);
			}

			// Process Indicator nodes
			if (isIndicatorNode(sourceNode)) {
				syncSeriesFromIndicatorNode(
					sourceNode.data as IndicatorNodeData,
					seriesConfig,
					updateSeriesConfigById,
				);
			}
		}

		// Process Scalar configs
		for (const scalarConfig of scalarFromNodes) {
			// Skip incomplete configs - user hasn't selected a variable yet
			if (!scalarConfig.fromNodeId) {
				continue;
			}

			// Check if source node is still connected (edge not deleted)
			if (!connectedSourceNodeIds.has(scalarConfig.fromNodeId)) {
				// Edge has been deleted, clear the "from" fields
				updateScalarNodeConfigById(scalarConfig.configId, {
					fromNodeId: "",
					fromNodeName: "",
					fromNodeType: scalarConfig.fromNodeType,
					fromHandleId: "",
					fromScalarConfigId: 0,
					fromScalarName: "",
					fromScalarDisplayName: "",
				});
				continue;
			}

			// Find corresponding source node
			const sourceNode = sourceNodes.find(
				(node) => node?.id === scalarConfig.fromNodeId,
			);

			if (!sourceNode) {
				// Source node data not available yet, skip
				continue;
			}

			// Process Variable nodes
			if (sourceNode.type === NodeType.VariableNode) {
				syncScalarFromVariableNode(
					sourceNode.data as VariableNodeData,
					scalarConfig,
					updateScalarNodeConfigById,
				);
			}
		}
	}, [sourceNodes, connectedSourceNodeIds, id, updateSeriesConfigById, updateScalarNodeConfigById]);

	// 5. useEffect to listen parent Group's inputConfigs changes (for child Groups with source="Group")
	// biome-ignore lint/correctness/useExhaustiveDependencies: currentNodeData is intentionally omitted to prevent infinite loops. This effect should only run when parentGroupData changes.
	useEffect(() => {
		// Skip if no parent Group
		if (!parentGroupData?.inputConfigs || !parentNodeId) {
			return;
		}

		const parentInputConfigs = parentGroupData.inputConfigs;

		// Filter Series configs from parent Group (source="Group")
		const seriesFromGroup =
			currentNodeData.inputConfigs?.filter(
				(config): config is OperationInputSeriesConfig =>
					config.type === "Series" && config.source === "Group",
			) ?? [];

		// Filter Scalar configs from parent Group (source="Group")
		const scalarFromGroup =
			currentNodeData.inputConfigs?.filter(
				(config): config is OperationInputScalarConfig =>
					config.type === "Scalar" && config.source === "Group",
			) ?? [];

		// Filter GroupScalarValue configs from parent Group (source="Group")
		const groupScalarFromGroup =
			currentNodeData.inputConfigs?.filter(
				(config): config is OperationInputGroupScalarValueConfig =>
					config.type === "CustomScalarValue" && config.source === "Group",
			) ?? [];

		// Process Series configs from parent Group
		for (const seriesConfig of seriesFromGroup) {
			syncSeriesFromParentGroup(
				seriesConfig,
				parentInputConfigs,
				updateSeriesConfigById,
			);
		}

		// Process Scalar configs from parent Group
		for (const scalarConfig of scalarFromGroup) {
			syncScalarFromParentGroup(
				scalarConfig,
				parentInputConfigs,
				updateScalarGroupConfigById,
			);
		}

		// Process GroupScalarValue configs from parent Group
		for (const groupScalarConfig of groupScalarFromGroup) {
			syncGroupScalarValueFromParentGroup(
				groupScalarConfig,
				parentInputConfigs,
				updateGroupScalarValueConfigById,
			);
		}
	}, [parentGroupData?.inputConfigs, parentNodeId, id, updateSeriesConfigById, updateScalarGroupConfigById, updateGroupScalarValueConfigById]);

	// useEffect to listen upstream OperationGroup's outputConfigs changes (peer groups)
	// biome-ignore lint/correctness/useExhaustiveDependencies: currentNodeData is intentionally omitted to prevent infinite loops
	useEffect(() => {
		// Filter configs that come from upstream OperationGroups (source="Node", fromNodeType=OperationGroup)
		const seriesFromUpstreamGroups =
			currentNodeData.inputConfigs?.filter(
				(config): config is OperationInputSeriesConfig =>
					config.type === "Series" &&
					config.source === "Node" &&
					config.fromNodeType === NodeType.OperationGroup,
			) ?? [];

		const scalarFromUpstreamGroups =
			currentNodeData.inputConfigs?.filter(
				(config): config is OperationInputScalarConfig =>
					config.type === "Scalar" &&
					config.source === "Node" &&
					config.fromNodeType === NodeType.OperationGroup,
			) ?? [];

		// Build a map of source group ID -> outputConfigs
		const sourceOutputConfigsMap = new Map<string, OperationOutputConfig[]>();
		for (const sourceGroup of upstreamOperationGroupsData) {
			if (sourceGroup?.data) {
				const groupData = sourceGroup.data;
				sourceOutputConfigsMap.set(sourceGroup.id, groupData.outputConfigs ?? []);
			}
		}

		// Process Series configs from upstream OperationGroups
		for (const seriesConfig of seriesFromUpstreamGroups) {
			// Skip incomplete configs
			if (!seriesConfig.fromNodeId) {
				continue;
			}

			// Check if source OperationGroup is still connected (edge not deleted)
			if (!connectedSourceNodeIds.has(seriesConfig.fromNodeId)) {
				// Edge has been deleted, clear the "from" fields
				updateSeriesConfigById(seriesConfig.configId, {
					fromNodeId: "",
					fromNodeName: "",
					fromNodeType: seriesConfig.fromNodeType,
					fromHandleId: "",
					fromSeriesConfigId: 0,
					fromSeriesName: "",
					fromSeriesDisplayName: "",
				});
				continue;
			}

			const upstreamOutputConfigs = sourceOutputConfigsMap.get(seriesConfig.fromNodeId);
			if (upstreamOutputConfigs) {
				syncSeriesFromUpstreamGroup(
					seriesConfig,
					upstreamOutputConfigs,
					updateSeriesConfigById,
				);
			}
		}

		// Process Scalar configs from upstream OperationGroups
		for (const scalarConfig of scalarFromUpstreamGroups) {
			// Skip incomplete configs
			if (!scalarConfig.fromNodeId) {
				continue;
			}

			// Check if source OperationGroup is still connected (edge not deleted)
			if (!connectedSourceNodeIds.has(scalarConfig.fromNodeId)) {
				// Edge has been deleted, clear the "from" fields
				updateScalarNodeConfigById(scalarConfig.configId, {
					fromNodeId: "",
					fromNodeName: "",
					fromNodeType: scalarConfig.fromNodeType,
					fromHandleId: "",
					fromScalarConfigId: 0,
					fromScalarName: "",
					fromScalarDisplayName: "",
				});
				continue;
			}

			const upstreamOutputConfigs = sourceOutputConfigsMap.get(scalarConfig.fromNodeId);
			if (upstreamOutputConfigs) {
				syncScalarFromUpstreamGroup(
					scalarConfig,
					upstreamOutputConfigs,
					updateScalarNodeConfigById,
				);
			}
		}
	}, [upstreamOperationGroupsData, connectedSourceNodeIds, id, updateSeriesConfigById, updateScalarNodeConfigById]);
};
