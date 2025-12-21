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
	OperationParentGroupScalarValueConfig,
	OperationInputConfig,
	OperationGroup,
	OperationOutputConfig,
} from "@/types/node/group/operation-group";
import { useUpdateOpGroupConfig } from "./use-update-op-group-config";

// ============ Types ============

type UpdateSeriesConfigFn = (
	configId: number,
	updates: Partial<OperationInputSeriesConfig>,
) => void;

type UpdateScalarConfigFn = (
	configId: number,
	updates: Partial<OperationInputScalarConfig>,
) => void;

type UpdateParentGroupScalarValueConfigFn = (
	configId: number,
	updates: Partial<OperationParentGroupScalarValueConfig>,
) => void;

// ============ Helper Functions ============

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
 * Find matching upstream Group output config by configId
 */
function findUpstreamGroupOutputConfig(
	upstreamOutputConfigs: OperationOutputConfig[],
	configId: number,
): OperationOutputConfig | undefined {
	return upstreamOutputConfigs.find((config) => config.configId === configId);
}

// ============ Clear From Fields ============

/**
 * Get empty "from" fields for Series config
 */
function getEmptySeriesFromFields(
	seriesConfig: OperationInputSeriesConfig,
): Partial<OperationInputSeriesConfig> {
	return {
		fromNodeId: "",
		fromNodeName: "",
		fromNodeType: seriesConfig.fromNodeType,
		fromHandleId: "",
		fromSeriesConfigId: 0,
		fromSeriesName: "",
		fromSeriesDisplayName: "",
	};
}

/**
 * Get empty "from" fields for Scalar config
 */
function getEmptyScalarFromFields(
	scalarConfig: OperationInputScalarConfig,
): Partial<OperationInputScalarConfig> {
	return {
		fromNodeId: "",
		fromNodeName: "",
		fromNodeType: scalarConfig.fromNodeType,
		fromHandleId: "",
		fromScalarConfigId: 0,
		fromScalarName: "",
		fromScalarDisplayName: "",
	};
}

/**
 * Get empty "from" fields for ParentGroupScalarValue config
 */
function getEmptyParentGroupScalarValueFromFields(
	config: OperationParentGroupScalarValueConfig,
): Partial<OperationParentGroupScalarValueConfig> {
	return {
		fromNodeId: "",
		fromNodeName: "",
		fromNodeType: config.fromNodeType,
		fromHandleId: "",
		fromScalarConfigId: 0,
		fromScalarDisplayName: "",
		fromScalarValue: 0,
	};
}

// ============ Sync from Outer Nodes (Kline, Indicator, Variable) ============

/**
 * Sync Series config from Kline node
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromSeriesConfigId is 0)
 * 2. If Symbol is deleted, clear the "from" fields
 */
function syncSeriesFromKlineNode(
	klineNodeData: KlineNodeData,
	seriesConfig: OperationInputSeriesConfig,
	updateSeriesConfigById: UpdateSeriesConfigFn,
): void {
	if (!seriesConfig.fromSeriesConfigId || seriesConfig.fromSeriesConfigId === 0) {
		return;
	}

	const klineSymbols =
		klineNodeData.backtestConfig?.exchangeModeConfig?.selectedSymbols ?? [];

	const matchingSymbol = klineSymbols.find(
		(sym) => sym.configId === seriesConfig.fromSeriesConfigId,
	);

	if (!matchingSymbol) {
		updateSeriesConfigById(seriesConfig.configId, getEmptySeriesFromFields(seriesConfig));
	}
}

/**
 * Sync Series config from Indicator node
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromSeriesConfigId is 0)
 * 2. If indicator is deleted, clear the "from" fields
 */
function syncSeriesFromIndicatorNode(
	indicatorNodeData: IndicatorNodeData,
	seriesConfig: OperationInputSeriesConfig,
	updateSeriesConfigById: UpdateSeriesConfigFn,
): void {
	if (!seriesConfig.fromSeriesConfigId || seriesConfig.fromSeriesConfigId === 0) {
		return;
	}

	const selectedIndicators =
		indicatorNodeData.backtestConfig?.exchangeModeConfig?.selectedIndicators ?? [];

	const matchingIndicator = selectedIndicators.find(
		(indicator) => indicator.configId === seriesConfig.fromSeriesConfigId,
	);

	if (!matchingIndicator) {
		updateSeriesConfigById(seriesConfig.configId, getEmptySeriesFromFields(seriesConfig));
	}
}

/**
 * Sync Scalar config from Variable node
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromScalarConfigId is 0)
 * 2. If variable is deleted, clear the "from" fields
 */
function syncScalarFromVariableNode(
	variableNodeData: VariableNodeData,
	scalarConfig: OperationInputScalarConfig,
	updateScalarConfigById: UpdateScalarConfigFn,
): void {
	if (!scalarConfig.fromScalarConfigId || scalarConfig.fromScalarConfigId === 0) {
		return;
	}

	const variableConfigs =
		variableNodeData.backtestConfig?.variableConfigs ?? [];

	const matchingVariable = variableConfigs.find(
		(variable) => variable.configId === scalarConfig.fromScalarConfigId,
	);

	if (!matchingVariable) {
		updateScalarConfigById(scalarConfig.configId, getEmptyScalarFromFields(scalarConfig));
	}
}

// ============ Sync from Parent Group (source: "ParentGroup") ============

/**
 * Sync Series config from parent Group
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromSeriesConfigId is 0)
 * 2. If parent config is deleted or type changed, clear the "from" fields
 * 3. If display name changes, update the config
 */
function syncSeriesFromParentGroup(
	seriesConfig: OperationInputSeriesConfig,
	parentInputConfigs: OperationInputConfig[],
	updateSeriesConfigById: UpdateSeriesConfigFn,
): void {
	if (!seriesConfig.fromSeriesConfigId || seriesConfig.fromSeriesConfigId === 0) {
		return;
	}

	const matchingConfig = findParentGroupInputConfig(
		parentInputConfigs,
		seriesConfig.fromSeriesConfigId,
	);

	if (!matchingConfig || matchingConfig.type !== "Series") {
		updateSeriesConfigById(seriesConfig.configId, getEmptySeriesFromFields(seriesConfig));
		return;
	}

	if (seriesConfig.fromSeriesDisplayName !== matchingConfig.inputName) {
		updateSeriesConfigById(seriesConfig.configId, {
			fromSeriesDisplayName: matchingConfig.inputName,
			fromSeriesName: matchingConfig.inputName,
			inputName: matchingConfig.inputName,
		});
	}
}

/**
 * Sync Scalar config from parent Group
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromScalarConfigId is 0)
 * 2. If parent config is deleted or type changed, clear the "from" fields
 * 3. If display name changes, update the config
 */
function syncScalarFromParentGroup(
	scalarConfig: OperationInputScalarConfig,
	parentInputConfigs: OperationInputConfig[],
	updateScalarConfigById: UpdateScalarConfigFn,
): void {
	if (!scalarConfig.fromScalarConfigId || scalarConfig.fromScalarConfigId === 0) {
		return;
	}

	const matchingConfig = findParentGroupInputConfig(
		parentInputConfigs,
		scalarConfig.fromScalarConfigId,
	);

	if (!matchingConfig || matchingConfig.type !== "Scalar") {
		updateScalarConfigById(scalarConfig.configId, getEmptyScalarFromFields(scalarConfig));
		return;
	}

	if (scalarConfig.fromScalarDisplayName !== matchingConfig.inputName) {
		updateScalarConfigById(scalarConfig.configId, {
			fromScalarDisplayName: matchingConfig.inputName,
			inputName: matchingConfig.inputName,
			fromScalarName: matchingConfig.fromScalarName,
		});
	}
}

/**
 * Sync ParentGroupScalarValue config from parent Group
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromScalarConfigId is 0)
 * 2. If parent config is deleted or type changed, clear the "from" fields
 * 3. If display name or value changes, update the config
 */
function syncParentGroupScalarValueFromParentGroup(
	groupScalarConfig: OperationParentGroupScalarValueConfig,
	parentInputConfigs: OperationInputConfig[],
	updateParentGroupScalarValueConfigById: UpdateParentGroupScalarValueConfigFn,
): void {
	if (!groupScalarConfig.fromScalarConfigId || groupScalarConfig.fromScalarConfigId === 0) {
		return;
	}

	const matchingConfig = findParentGroupInputConfig(
		parentInputConfigs,
		groupScalarConfig.fromScalarConfigId,
	);

	if (!matchingConfig || matchingConfig.type !== "CustomScalarValue") {
		updateParentGroupScalarValueConfigById(
			groupScalarConfig.configId,
			getEmptyParentGroupScalarValueFromFields(groupScalarConfig),
		);
		return;
	}

	const scalarValue = matchingConfig.source === null
		? matchingConfig.scalarValue
		: matchingConfig.fromScalarValue;

	const needsUpdate =
		groupScalarConfig.fromScalarDisplayName !== matchingConfig.inputName ||
		groupScalarConfig.fromScalarValue !== scalarValue;

	if (needsUpdate) {
		updateParentGroupScalarValueConfigById(groupScalarConfig.configId, {
			fromScalarDisplayName: matchingConfig.inputName,
			inputName: matchingConfig.inputName,
			fromScalarValue: scalarValue,
		});
	}
}

// ============ Sync from Child OperationGroup (source: "ChildGroup") ============

/**
 * Sync Series config from upstream (child) OperationGroup
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromSeriesConfigId is 0)
 * 2. If output config is deleted or type changed, clear the "from" fields
 * 3. If display name changes, update the config
 */
function syncSeriesFromChildGroup(
	seriesConfig: OperationInputSeriesConfig,
	upstreamOutputConfigs: OperationOutputConfig[],
	updateSeriesConfigById: UpdateSeriesConfigFn,
): void {
	if (!seriesConfig.fromSeriesConfigId || seriesConfig.fromSeriesConfigId === 0) {
		return;
	}

	const matchingConfig = findUpstreamGroupOutputConfig(
		upstreamOutputConfigs,
		seriesConfig.fromSeriesConfigId,
	);

	if (!matchingConfig || matchingConfig.type !== "Series") {
		updateSeriesConfigById(seriesConfig.configId, getEmptySeriesFromFields(seriesConfig));
		return;
	}

	if (seriesConfig.fromSeriesDisplayName !== matchingConfig.outputName) {
		updateSeriesConfigById(seriesConfig.configId, {
			fromSeriesDisplayName: matchingConfig.outputName,
			fromSeriesName: matchingConfig.outputName,
		});
	}
}

/**
 * Sync Scalar config from upstream (child) OperationGroup
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromScalarConfigId is 0)
 * 2. If output config is deleted or type changed, clear the "from" fields
 * 3. If display name changes, update the config
 */
function syncScalarFromChildGroup(
	scalarConfig: OperationInputScalarConfig,
	upstreamOutputConfigs: OperationOutputConfig[],
	updateScalarConfigById: UpdateScalarConfigFn,
): void {
	if (!scalarConfig.fromScalarConfigId || scalarConfig.fromScalarConfigId === 0) {
		return;
	}

	const matchingConfig = findUpstreamGroupOutputConfig(
		upstreamOutputConfigs,
		scalarConfig.fromScalarConfigId,
	);

	if (!matchingConfig || matchingConfig.type !== "Scalar") {
		updateScalarConfigById(scalarConfig.configId, getEmptyScalarFromFields(scalarConfig));
		return;
	}

	if (scalarConfig.fromScalarDisplayName !== matchingConfig.outputName) {
		updateScalarConfigById(scalarConfig.configId, {
			fromScalarDisplayName: matchingConfig.outputName,
			fromScalarName: matchingConfig.outputName,
		});
	}
}

// ============ Context Interfaces ============

interface SyncContext {
	currentNodeData: OperationGroupData;
	connectedSourceNodeIds: Set<string>;
	updateSeriesConfigById: UpdateSeriesConfigFn;
}

interface SyncFromOuterNodesContext extends SyncContext {
	sourceNodes: Array<{ id: string; type?: string; data: unknown }>;
	updateScalarOuterNodeConfigById: UpdateScalarConfigFn;
}

interface SyncFromParentGroupContext extends SyncContext {
	parentGroupData: OperationGroupData | undefined;
	parentNodeId: string | undefined;
	updateScalarParentGroupConfigById: UpdateScalarConfigFn;
	updateParentGroupScalarValueConfigById: UpdateParentGroupScalarValueConfigFn;
}

interface SyncFromChildGroupsContext extends SyncContext {
	upstreamOperationGroupsData: Array<{ id: string; data: unknown }>;
	updateScalarChildGroupConfigById: UpdateScalarConfigFn;
}

// ============ Sync Methods ============

/**
 * Sync inputs from outer nodes (Kline, Indicator, Variable)
 * These are nodes with source: "OuterNode"
 */
function syncFromOuterNodes(ctx: SyncFromOuterNodesContext): void {
	const {
		currentNodeData,
		sourceNodes,
		connectedSourceNodeIds,
		updateSeriesConfigById,
		updateScalarOuterNodeConfigById,
	} = ctx;

	// Filter Series configs from outer nodes (source=OuterNode)
	const seriesFromOuterNodes =
		currentNodeData.inputConfigs?.filter(
			(config): config is OperationInputSeriesConfig =>
				config.type === "Series" && config.source === "OuterNode",
		) ?? [];

	// Filter Scalar configs from outer nodes (source=OuterNode)
	const scalarFromOuterNodes =
		currentNodeData.inputConfigs?.filter(
			(config): config is OperationInputScalarConfig =>
				config.type === "Scalar" && config.source === "OuterNode",
		) ?? [];

	// Process Series configs
	for (const seriesConfig of seriesFromOuterNodes) {
		if (!seriesConfig.fromNodeId) continue;

		// Check if source node is still connected
		if (!connectedSourceNodeIds.has(seriesConfig.fromNodeId)) {
			updateSeriesConfigById(seriesConfig.configId, getEmptySeriesFromFields(seriesConfig));
			continue;
		}

		const sourceNode = sourceNodes.find((node) => node?.id === seriesConfig.fromNodeId);
		if (!sourceNode) continue;

		// Sync node name if changed
		const sourceNodeName = (sourceNode.data as { nodeName?: string })?.nodeName ?? "";
		if (seriesConfig.fromNodeName !== sourceNodeName && sourceNodeName !== "") {
			updateSeriesConfigById(seriesConfig.configId, { fromNodeName: sourceNodeName });
		}

		// Process by node type
		if (isKlineNode(sourceNode as StrategyFlowNode)) {
			syncSeriesFromKlineNode(
				sourceNode.data as KlineNodeData,
				seriesConfig,
				updateSeriesConfigById,
			);
		} else if (isIndicatorNode(sourceNode as StrategyFlowNode)) {
			syncSeriesFromIndicatorNode(
				sourceNode.data as IndicatorNodeData,
				seriesConfig,
				updateSeriesConfigById,
			);
		}
	}

	// Process Scalar configs
	for (const scalarConfig of scalarFromOuterNodes) {
		if (!scalarConfig.fromNodeId) continue;

		// Check if source node is still connected
		if (!connectedSourceNodeIds.has(scalarConfig.fromNodeId)) {
			updateScalarOuterNodeConfigById(scalarConfig.configId, getEmptyScalarFromFields(scalarConfig));
			continue;
		}

		const sourceNode = sourceNodes.find((node) => node?.id === scalarConfig.fromNodeId);
		if (!sourceNode) continue;

		// Sync node name if changed
		const sourceNodeName = (sourceNode.data as { nodeName?: string })?.nodeName ?? "";
		if (scalarConfig.fromNodeName !== sourceNodeName && sourceNodeName !== "") {
			updateScalarOuterNodeConfigById(scalarConfig.configId, { fromNodeName: sourceNodeName });
		}

		// Process Variable nodes
		if (sourceNode.type === NodeType.VariableNode) {
			syncScalarFromVariableNode(
				sourceNode.data as VariableNodeData,
				scalarConfig,
				updateScalarOuterNodeConfigById,
			);
		}
	}
}

/**
 * Sync inputs from parent Group (via OperationStartNode)
 * These are configs with source: "ParentGroup"
 */
function syncFromParentGroup(ctx: SyncFromParentGroupContext): void {
	const {
		currentNodeData,
		parentGroupData,
		parentNodeId,
		updateSeriesConfigById,
		updateScalarParentGroupConfigById,
		updateParentGroupScalarValueConfigById,
	} = ctx;

	if (!parentGroupData?.inputConfigs || !parentNodeId) {
		return;
	}

	const parentInputConfigs = parentGroupData.inputConfigs;
	const parentNodeName = parentGroupData.nodeName ?? "";

	// Filter Series configs from parent Group (source="ParentGroup")
	const seriesFromParentGroup =
		currentNodeData.inputConfigs?.filter(
			(config): config is OperationInputSeriesConfig =>
				config.type === "Series" && config.source === "ParentGroup",
		) ?? [];

	// Filter Scalar configs from parent Group (source="ParentGroup")
	const scalarFromParentGroup =
		currentNodeData.inputConfigs?.filter(
			(config): config is OperationInputScalarConfig =>
				config.type === "Scalar" && config.source === "ParentGroup",
		) ?? [];

	// Filter ParentGroupScalarValue configs from parent Group (source="ParentGroup")
	const parentGroupScalarConfigs =
		currentNodeData.inputConfigs?.filter(
			(config): config is OperationParentGroupScalarValueConfig =>
				config.type === "CustomScalarValue" && config.source === "ParentGroup",
		) ?? [];

	// Process Series configs
	for (const seriesConfig of seriesFromParentGroup) {
		if (seriesConfig.fromNodeName !== parentNodeName && parentNodeName !== "") {
			updateSeriesConfigById(seriesConfig.configId, { fromNodeName: parentNodeName });
		}
		syncSeriesFromParentGroup(seriesConfig, parentInputConfigs, updateSeriesConfigById);
	}

	// Process Scalar configs
	for (const scalarConfig of scalarFromParentGroup) {
		if (scalarConfig.fromNodeName !== parentNodeName && parentNodeName !== "") {
			updateScalarParentGroupConfigById(scalarConfig.configId, { fromNodeName: parentNodeName });
		}
		syncScalarFromParentGroup(scalarConfig, parentInputConfigs, updateScalarParentGroupConfigById);
	}

	// Process ParentGroupScalarValue configs
	for (const groupScalarConfig of parentGroupScalarConfigs) {
		if (groupScalarConfig.fromNodeName !== parentNodeName && parentNodeName !== "") {
			updateParentGroupScalarValueConfigById(groupScalarConfig.configId, { fromNodeName: parentNodeName });
		}
		syncParentGroupScalarValueFromParentGroup(
			groupScalarConfig,
			parentInputConfigs,
			updateParentGroupScalarValueConfigById,
		);
	}
}

/**
 * Sync inputs from upstream (child) OperationGroups
 * These are configs with source: "ChildGroup"
 */
function syncFromChildGroups(ctx: SyncFromChildGroupsContext): void {
	const {
		currentNodeData,
		upstreamOperationGroupsData,
		connectedSourceNodeIds,
		updateSeriesConfigById,
		updateScalarChildGroupConfigById,
	} = ctx;

	// Filter configs from child OperationGroups (source="ChildGroup")
	const seriesFromChildGroups =
		currentNodeData.inputConfigs?.filter(
			(config): config is OperationInputSeriesConfig =>
				config.type === "Series" && config.source === "ChildGroup",
		) ?? [];

	const scalarFromChildGroups =
		currentNodeData.inputConfigs?.filter(
			(config): config is OperationInputScalarConfig =>
				config.type === "Scalar" && config.source === "ChildGroup",
		) ?? [];

	// Build maps for source group data
	const sourceOutputConfigsMap = new Map<string, OperationOutputConfig[]>();
	const sourceNodeNameMap = new Map<string, string>();
	for (const sourceGroup of upstreamOperationGroupsData) {
		if (sourceGroup?.data) {
			const groupData = sourceGroup.data as OperationGroupData;
			sourceOutputConfigsMap.set(sourceGroup.id, groupData.outputConfigs ?? []);
			sourceNodeNameMap.set(sourceGroup.id, groupData.nodeName ?? "");
		}
	}

	// Process Series configs (inputConfigs)
	for (const seriesConfig of seriesFromChildGroups) {
		if (!seriesConfig.fromNodeId) continue;

		// Check if source group is still connected
		if (!connectedSourceNodeIds.has(seriesConfig.fromNodeId)) {
			updateSeriesConfigById(seriesConfig.configId, getEmptySeriesFromFields(seriesConfig));
			continue;
		}

		// Sync node name if changed
		const sourceNodeName = sourceNodeNameMap.get(seriesConfig.fromNodeId);
		if (sourceNodeName !== undefined && seriesConfig.fromNodeName !== sourceNodeName && sourceNodeName !== "") {
			updateSeriesConfigById(seriesConfig.configId, { fromNodeName: sourceNodeName });
		}

		const upstreamOutputConfigs = sourceOutputConfigsMap.get(seriesConfig.fromNodeId);
		if (upstreamOutputConfigs) {
			syncSeriesFromChildGroup(seriesConfig, upstreamOutputConfigs, updateSeriesConfigById);
		}
	}

	// Process Scalar configs (inputConfigs)
	for (const scalarConfig of scalarFromChildGroups) {
		if (!scalarConfig.fromNodeId) continue;

		// Check if source group is still connected
		if (!connectedSourceNodeIds.has(scalarConfig.fromNodeId)) {
			updateScalarChildGroupConfigById(scalarConfig.configId, getEmptyScalarFromFields(scalarConfig));
			continue;
		}

		// Sync node name if changed
		const sourceNodeName = sourceNodeNameMap.get(scalarConfig.fromNodeId);
		if (sourceNodeName !== undefined && scalarConfig.fromNodeName !== sourceNodeName && sourceNodeName !== "") {
			updateScalarChildGroupConfigById(scalarConfig.configId, { fromNodeName: sourceNodeName });
		}

		const upstreamOutputConfigs = sourceOutputConfigsMap.get(scalarConfig.fromNodeId);
		if (upstreamOutputConfigs) {
			syncScalarFromChildGroup(scalarConfig, upstreamOutputConfigs, updateScalarChildGroupConfigById);
		}
	}
}

// ============ Main Hook ============

/**
 * Sync OperationGroup inputs and outputs with source nodes
 *
 * This hook monitors and syncs:
 * 1. Outer nodes (Kline, Indicator, Variable) - source: "OuterNode"
 * 2. Parent Group's inputConfigs (via OperationStartNode) - source: "ParentGroup"
 * 3. Upstream (child) OperationGroup's outputConfigs - source: "ChildGroup"
 * 4. Nested child OperationGroup's outputName -> parent's outputConfigs (sourceSeriesName/sourceScalarName)
 *
 * @param id - OperationGroup node ID
 * @param currentNodeData - Current node data
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
		updateScalarOuterNodeConfigById,
		updateScalarParentGroupConfigById,
		updateScalarChildGroupConfigById,
		updateParentGroupScalarValueConfigById,
		updateOutputConfigById,
	} = useUpdateOpGroupConfig({ id });

	// Get current Group's input connections
	const connections = useNodeConnections({ id, handleType: "target" });

	// Get all connected source nodes data
	const sourceNodes = useNodesData<StrategyFlowNode>(
		connections.map((conn) => conn.source),
	);

	// Find parent Group node ID
	const parentNodeId = useMemo(() => {
		const currentNode = getNodes().find((node) => node.id === id);
		return currentNode?.parentId;
	}, [getNodes, id]);

	// Get parent Group's data using useNodesData for reactivity
	const parentNodesData = useNodesData<OperationGroup>(
		parentNodeId ? [parentNodeId] : [],
	);
	const parentGroupData = parentNodesData[0]?.data;

	// Get all connected upstream OperationGroup IDs (peer groups connected via edges)
	const upstreamOperationGroupIds = useMemo(() => {
		return connections
			.map((conn) => conn.source)
			.filter((sourceId) => {
				const sourceNode = getNodes().find((n) => n.id === sourceId);
				return sourceNode?.type === NodeType.OperationGroup;
			});
	}, [connections, getNodes]);

	// Get upstream OperationGroups' data using useNodesData for reactivity
	const upstreamOperationGroupsData = useNodesData<OperationGroup>(upstreamOperationGroupIds);

	// Find EndNode ID within this group (similar to panel.tsx)
	const childEndNodeId = useMemo(() => {
		return getNodes().find(
			(node) => node.parentId === id && node.type === NodeType.OperationEndNode,
		)?.id ?? "";
	}, [getNodes, id]);

	// Get EndNode's incoming connections to find nested child groups
	const endNodeConnections = useNodeConnections({
		id: childEndNodeId || id,
		handleType: "target",
	});

	// Get nested child OperationGroup IDs from EndNode connections
	const nestedChildGroupIds = useMemo(() => {
		if (!childEndNodeId) return [];
		return endNodeConnections
			.map((conn) => conn.source)
			.filter((sourceId) => {
				const sourceNode = getNodes().find((n) => n.id === sourceId);
				return sourceNode?.type === NodeType.OperationGroup;
			});
	}, [childEndNodeId, endNodeConnections, getNodes]);

	// Get nested child OperationGroups' data using useNodesData for reactivity
	const nestedChildGroupsData = useNodesData<OperationGroup>(nestedChildGroupIds);

	// Get current connected source node IDs for checking edge disconnection
	const connectedSourceNodeIds = useMemo(() => {
		return new Set(connections.map((conn) => conn.source));
	}, [connections]);

	// Sync effect for outer nodes (Kline, Indicator, Variable)
	// biome-ignore lint/correctness/useExhaustiveDependencies: currentNodeData changes should trigger sync
	useEffect(() => {
		syncFromOuterNodes({
			currentNodeData,
			sourceNodes,
			connectedSourceNodeIds,
			updateSeriesConfigById,
			updateScalarOuterNodeConfigById,
		});
	}, [sourceNodes, connectedSourceNodeIds, updateSeriesConfigById, updateScalarOuterNodeConfigById]);

	// Sync effect for parent Group's inputConfigs
	// biome-ignore lint/correctness/useExhaustiveDependencies: currentNodeData changes should trigger sync
	useEffect(() => {
		syncFromParentGroup({
			currentNodeData,
			parentGroupData,
			parentNodeId,
			connectedSourceNodeIds,
			updateSeriesConfigById,
			updateScalarParentGroupConfigById,
			updateParentGroupScalarValueConfigById,
		});
	}, [parentGroupData?.inputConfigs, parentGroupData?.nodeName, parentNodeId, updateSeriesConfigById, updateScalarParentGroupConfigById, updateParentGroupScalarValueConfigById]);

	// Sync effect for upstream (child) OperationGroups (connected via edges)
	// biome-ignore lint/correctness/useExhaustiveDependencies: currentNodeData changes should trigger sync
	useEffect(() => {
		syncFromChildGroups({
			currentNodeData,
			upstreamOperationGroupsData,
			connectedSourceNodeIds,
			updateSeriesConfigById,
			updateScalarChildGroupConfigById,
		});
	}, [upstreamOperationGroupsData, connectedSourceNodeIds, updateSeriesConfigById, updateScalarChildGroupConfigById]);

	// Sync effect for nested child OperationGroups (connected to EndNode)
	// When nested child group's outputName changes, update parent's outputConfigs
	// biome-ignore lint/correctness/useExhaustiveDependencies: currentNodeData changes should trigger sync
	useEffect(() => {
		const currentOutputConfigs = currentNodeData.outputConfigs ?? [];
		if (currentOutputConfigs.length === 0 || nestedChildGroupsData.length === 0) {
			return;
		}

		// Build map of nested child group output configs
		const childOutputConfigsMap = new Map<string, OperationOutputConfig[]>();
		const childNodeNameMap = new Map<string, string>();
		for (const childGroup of nestedChildGroupsData) {
			if (childGroup?.data) {
				const groupData = childGroup.data as OperationGroupData;
				childOutputConfigsMap.set(childGroup.id, groupData.outputConfigs ?? []);
				childNodeNameMap.set(childGroup.id, groupData.nodeName ?? "");
			}
		}

		// Sync outputConfigs that reference nested child groups
		for (const outputConfig of currentOutputConfigs) {
			const sourceNodeId = outputConfig.sourceNodeId;
			if (!sourceNodeId) continue;

			// Check if source is a nested child OperationGroup
			const childGroupOutputConfigs = childOutputConfigsMap.get(sourceNodeId);
			if (!childGroupOutputConfigs) continue;

			// Find matching output config in child group by sourceOutputConfigId
			const matchingChildOutput = childGroupOutputConfigs.find(
				(config) => config.configId === outputConfig.sourceOutputConfigId,
			);

			if (!matchingChildOutput) continue;

			// Sync sourceSeriesName or sourceScalarName based on type
			if (outputConfig.type === "Series" && matchingChildOutput.type === "Series") {
				if (outputConfig.sourceSeriesName !== matchingChildOutput.outputName) {
					updateOutputConfigById(outputConfig.configId, {
						sourceSeriesName: matchingChildOutput.outputName,
					});
				}
			} else if (outputConfig.type === "Scalar" && matchingChildOutput.type === "Scalar") {
				if (outputConfig.sourceScalarName !== matchingChildOutput.outputName) {
					updateOutputConfigById(outputConfig.configId, {
						sourceScalarName: matchingChildOutput.outputName,
					});
				}
			}

			// Sync sourceNodeName if changed
			const childNodeName = childNodeNameMap.get(sourceNodeId);
			if (childNodeName !== undefined && outputConfig.sourceNodeName !== childNodeName && childNodeName !== "") {
				updateOutputConfigById(outputConfig.configId, {
					sourceNodeName: childNodeName,
				});
			}
		}
	}, [nestedChildGroupsData, updateOutputConfigById]);
};
