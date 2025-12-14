import { useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { NodeType } from "@/types/node/index";
import type {
	OperationNodeData,
	OperationInputConfig,
	InputConfig,
	OutputConfig,
} from "@/types/node/operation-node";
import type {
	InputSeriesConfig,
	InputScalarConfig,
	InputGroupScalarValueConfig,
} from "@/types/operation";
import {
	isSeriesInput,
	isScalarInput,
	isGroupScalarValueInput,
} from "@/types/operation";
import type {
	OperationGroup,
	OperationGroupData,
	OperationInputConfig as GroupInputConfig,
	OperationOutputConfig as GroupOutputConfig,
} from "@/types/node/group/operation-group";
import type { StrategyFlowNode } from "@/types/node";

// ============ Helper Functions ============

/**
 * Find matching Group input config by configId
 */
function findGroupInputConfig(
	groupInputConfigs: GroupInputConfig[],
	configId: number,
): GroupInputConfig | undefined {
	return groupInputConfigs.find((config) => config.configId === configId);
}

// ============ Sync from OperationStartNode (parent Group) ============

/**
 * Sync Series input from parent Group (via OperationStartNode)
 */
function syncSeriesInputFromGroup(
	seriesInput: InputSeriesConfig,
	groupInputConfigs: GroupInputConfig[],
): InputSeriesConfig | null {
	// Skip incomplete configs
	if (!seriesInput.fromSeriesConfigId || seriesInput.fromSeriesConfigId === 0) {
		return seriesInput;
	}

	const matchingConfig = findGroupInputConfig(
		groupInputConfigs,
		seriesInput.fromSeriesConfigId,
	);

	if (!matchingConfig) {
		return null;
	}

	if (matchingConfig.type !== "Series") {
		return null;
	}

	if (seriesInput.fromSeriesDisplayName !== matchingConfig.inputName) {
		return {
			...seriesInput,
			fromSeriesDisplayName: matchingConfig.inputName,
		};
	}

	return seriesInput;
}

/**
 * Sync Scalar input from parent Group (via OperationStartNode)
 */
function syncScalarInputFromGroup(
	scalarInput: InputScalarConfig,
	groupInputConfigs: GroupInputConfig[],
): InputScalarConfig | null {
	if (!scalarInput.fromScalarConfigId || scalarInput.fromScalarConfigId === 0) {
		return scalarInput;
	}

	const matchingConfig = findGroupInputConfig(
		groupInputConfigs,
		scalarInput.fromScalarConfigId,
	);

	if (!matchingConfig) {
		return null;
	}

	if (matchingConfig.type !== "Scalar") {
		return null;
	}

	if (scalarInput.fromScalarDisplayName !== matchingConfig.inputName) {
		return {
			...scalarInput,
			fromScalarDisplayName: matchingConfig.inputName,
			fromScalarName: matchingConfig.fromScalarName,
		};
	}

	return scalarInput;
}

/**
 * Sync GroupScalarValue input from parent Group (via OperationStartNode)
 */
function syncGroupScalarValueInputFromGroup(
	groupScalarInput: InputGroupScalarValueConfig,
	groupInputConfigs: GroupInputConfig[],
): InputGroupScalarValueConfig | null {
	if (!groupScalarInput.fromScalarConfigId || groupScalarInput.fromScalarConfigId === 0) {
		return groupScalarInput;
	}

	const matchingConfig = findGroupInputConfig(
		groupInputConfigs,
		groupScalarInput.fromScalarConfigId,
	);

	if (!matchingConfig) {
		return null;
	}

	if (matchingConfig.type !== "CustomScalarValue") {
		return null;
	}

	const scalarValue = matchingConfig.source === null
		? matchingConfig.scalarValue
		: matchingConfig.fromScalarValue;

	const needsUpdate =
		groupScalarInput.fromScalarDisplayName !== matchingConfig.inputName ||
		groupScalarInput.fromScalarValue !== scalarValue;

	if (needsUpdate) {
		return {
			...groupScalarInput,
			fromScalarDisplayName: matchingConfig.inputName,
			fromScalarValue: scalarValue,
		};
	}

	return groupScalarInput;
}

// ============ Sync from OperationNode ============

/**
 * Sync Series input from upstream OperationNode
 *
 * Sync rules:
 * 1. If source node's outputConfig is deleted or changed to Scalar, clear the input
 * 2. If display name changes, update the input config
 */
function syncSeriesInputFromOperationNode(
	seriesInput: InputSeriesConfig,
	sourceOutputConfig: OutputConfig | null,
): InputSeriesConfig | null {
	if (!sourceOutputConfig) {
		// Output config deleted
		return null;
	}

	if (sourceOutputConfig.type !== "Series") {
		// Type changed from Series to Scalar
		return null;
	}

	// Check if display name changed
	if (seriesInput.fromSeriesDisplayName !== sourceOutputConfig.outputName) {
		return {
			...seriesInput,
			fromSeriesDisplayName: sourceOutputConfig.outputName,
			fromSeriesName: sourceOutputConfig.outputName,
		};
	}

	return seriesInput;
}

/**
 * Sync Scalar input from upstream OperationNode
 *
 * Sync rules:
 * 1. If source node's outputConfig is deleted or changed to Series, clear the input
 * 2. If display name changes, update the input config
 */
function syncScalarInputFromOperationNode(
	scalarInput: InputScalarConfig,
	sourceOutputConfig: OutputConfig | null,
): InputScalarConfig | null {
	if (!sourceOutputConfig) {
		// Output config deleted
		return null;
	}

	if (sourceOutputConfig.type !== "Scalar") {
		// Type changed from Scalar to Series
		return null;
	}

	// Check if display name changed
	if (scalarInput.fromScalarDisplayName !== sourceOutputConfig.outputName) {
		return {
			...scalarInput,
			fromScalarDisplayName: sourceOutputConfig.outputName,
			fromScalarName: sourceOutputConfig.outputName,
		};
	}

	return scalarInput;
}

// ============ Sync from OperationGroup ============

/**
 * Find matching Group output config by configId
 */
function findGroupOutputConfig(
	groupOutputConfigs: GroupOutputConfig[],
	configId: number,
): GroupOutputConfig | undefined {
	return groupOutputConfigs.find((config) => config.configId === configId);
}

/**
 * Sync Series input from upstream OperationGroup
 *
 * Sync rules:
 * 1. If source group's output config is deleted or changed to Scalar, clear the input
 * 2. If display name changes, update the input config
 */
function syncSeriesInputFromOperationGroup(
	seriesInput: InputSeriesConfig,
	groupOutputConfigs: GroupOutputConfig[],
): InputSeriesConfig | null {
	// Skip incomplete configs
	if (!seriesInput.fromSeriesConfigId || seriesInput.fromSeriesConfigId === 0) {
		return seriesInput;
	}

	const matchingConfig = findGroupOutputConfig(
		groupOutputConfigs,
		seriesInput.fromSeriesConfigId,
	);

	if (!matchingConfig) {
		// Output config deleted
		return null;
	}

	if (matchingConfig.type !== "Series") {
		// Type changed from Series to Scalar
		return null;
	}

	// Check if display name changed
	if (seriesInput.fromSeriesDisplayName !== matchingConfig.outputName) {
		return {
			...seriesInput,
			fromSeriesDisplayName: matchingConfig.outputName,
			fromSeriesName: matchingConfig.outputName,
		};
	}

	return seriesInput;
}

/**
 * Sync Scalar input from upstream OperationGroup
 *
 * Sync rules:
 * 1. If source group's output config is deleted or changed to Series, clear the input
 * 2. If display name changes, update the input config
 */
function syncScalarInputFromOperationGroup(
	scalarInput: InputScalarConfig,
	groupOutputConfigs: GroupOutputConfig[],
): InputScalarConfig | null {
	// Skip incomplete configs
	if (!scalarInput.fromScalarConfigId || scalarInput.fromScalarConfigId === 0) {
		return scalarInput;
	}

	const matchingConfig = findGroupOutputConfig(
		groupOutputConfigs,
		scalarInput.fromScalarConfigId,
	);

	if (!matchingConfig) {
		// Output config deleted
		return null;
	}

	if (matchingConfig.type !== "Scalar") {
		// Type changed from Scalar to Series
		return null;
	}

	// Check if display name changed
	if (scalarInput.fromScalarDisplayName !== matchingConfig.outputName) {
		return {
			...scalarInput,
			fromScalarDisplayName: matchingConfig.outputName,
			fromScalarName: matchingConfig.outputName,
		};
	}

	return scalarInput;
}

// ============ Clear Input From Fields ============

/**
 * Clear Series input's "from" fields when edge is disconnected
 */
function clearSeriesInputFromFields(seriesInput: InputSeriesConfig): InputSeriesConfig {
	return {
		...seriesInput,
		fromNodeId: "",
		fromNodeName: "",
		fromHandleId: "",
		fromSeriesConfigId: 0,
		fromSeriesName: "",
		fromSeriesDisplayName: "",
	};
}

/**
 * Clear Scalar input's "from" fields when edge is disconnected
 */
function clearScalarInputFromFields(scalarInput: InputScalarConfig): InputScalarConfig {
	return {
		...scalarInput,
		fromNodeId: "",
		fromNodeName: "",
		fromHandleId: "",
		fromScalarConfigId: 0,
		fromScalarName: "",
		fromScalarDisplayName: "",
	};
}

/**
 * Clear GroupScalarValue input's "from" fields when edge is disconnected
 */
function clearGroupScalarValueInputFromFields(
	groupScalarInput: InputGroupScalarValueConfig,
): InputGroupScalarValueConfig {
	return {
		...groupScalarInput,
		fromNodeId: "",
		fromNodeName: "",
		fromHandleId: "",
		fromScalarConfigId: 0,
		fromScalarDisplayName: "",
		fromScalarValue: 0,
	};
}

// ============ Process Single Input ============

/**
 * Process a single input from OperationStartNode and return the synced version
 */
function processInputFromStartNode(
	input: InputConfig | null,
	groupInputConfigs: GroupInputConfig[],
	startNodeId: string,
): InputConfig | null {
	if (!input) return null;

	// InputScalarValueConfig (source: null) is self-defined, no need to sync
	if ("scalarValue" in input && input.source === null) {
		return input;
	}

	// Only sync inputs from OperationStartNode
	if ("fromNodeId" in input && input.fromNodeId !== startNodeId) {
		return input;
	}

	if (isSeriesInput(input)) {
		return syncSeriesInputFromGroup(input, groupInputConfigs);
	}

	if (isScalarInput(input)) {
		return syncScalarInputFromGroup(input, groupInputConfigs);
	}

	if (isGroupScalarValueInput(input)) {
		return syncGroupScalarValueInputFromGroup(input, groupInputConfigs);
	}

	return input;
}

/**
 * Process a single input from OperationNode and return the synced version
 */
function processInputFromOperationNode(
	input: InputConfig | null,
	sourceNodeId: string,
	sourceOutputConfig: OutputConfig | null,
): InputConfig | null {
	if (!input) return null;

	// InputScalarValueConfig (source: null) is self-defined, no need to sync
	if ("scalarValue" in input && input.source === null) {
		return input;
	}

	// Only sync inputs from this specific OperationNode
	if (!("fromNodeId" in input) || input.fromNodeId !== sourceNodeId) {
		return input;
	}

	if (isSeriesInput(input)) {
		return syncSeriesInputFromOperationNode(input, sourceOutputConfig);
	}

	if (isScalarInput(input)) {
		return syncScalarInputFromOperationNode(input, sourceOutputConfig);
	}

	// GroupScalarValueInput cannot come from OperationNode
	return input;
}

/**
 * Process a single input from OperationGroup and return the synced version
 */
function processInputFromOperationGroup(
	input: InputConfig | null,
	sourceNodeId: string,
	groupOutputConfigs: GroupOutputConfig[],
): InputConfig | null {
	if (!input) return null;

	// InputScalarValueConfig (source: null) is self-defined, no need to sync
	if ("scalarValue" in input && input.source === null) {
		return input;
	}

	// Only sync inputs from this specific OperationGroup
	if (!("fromNodeId" in input) || input.fromNodeId !== sourceNodeId) {
		return input;
	}

	if (isSeriesInput(input)) {
		return syncSeriesInputFromOperationGroup(input, groupOutputConfigs);
	}

	if (isScalarInput(input)) {
		return syncScalarInputFromOperationGroup(input, groupOutputConfigs);
	}

	// GroupScalarValueInput cannot come from OperationGroup
	return input;
}

// ============ Main Hook ============

/**
 * Sync OperationNode inputs with source nodes
 *
 * This hook monitors:
 * 1. Parent OperationGroup's inputConfigs (via OperationStartNode)
 * 2. Upstream OperationNode's outputConfig
 * 3. Upstream OperationGroup's outputConfigs (child groups)
 *
 * And syncs the current node's inputConfig when:
 * - A source config is deleted
 * - A source config's display name changes
 * - A source config's type changes (Series <-> Scalar)
 * - A source config's value changes (for CustomScalarValue)
 *
 * @param id - OperationNode ID
 */
export const useSyncSourceNode = ({ id }: { id: string }) => {
	const { updateNodeData, getNodes } = useReactFlow();
	const { getNodeData } = useStrategyWorkflow();

	// Get current node data
	const nodeData = getNodeData(id) as OperationNodeData | undefined;

	// Find parent Group node
	const parentNodeId = useMemo(() => {
		const currentNode = getNodes().find((node) => node.id === id);
		return currentNode?.parentId;
	}, [getNodes, id]);

	// Get parent Group's data using useNodesData for reactivity
	const parentNodesData = useNodesData<OperationGroup>(
		parentNodeId ? [parentNodeId] : [],
	);
	const parentGroupData = parentNodesData[0]?.data;

	// Find OperationStartNode ID within the Group
	const startNodeId = useMemo(() => {
		if (!parentNodeId) return null;
		const startNode = getNodes().find(
			(node) =>
				node.parentId === parentNodeId &&
				node.type === NodeType.OperationStartNode,
		);
		return startNode?.id ?? null;
	}, [getNodes, parentNodeId]);

	// Get upstream connections
	const connections = useNodeConnections({ id, handleType: "target" });

	// Get current connected source node IDs for checking edge disconnection
	const connectedSourceNodeIds = useMemo(() => {
		return new Set(connections.map((conn) => conn.source));
	}, [connections]);

	// Get all connected source OperationNodes data
	const sourceOperationNodeIds = useMemo(() => {
		return connections
			.map((conn) => conn.source)
			.filter((sourceId) => {
				const sourceNode = getNodes().find((n) => n.id === sourceId);
				return sourceNode?.type === NodeType.OperationNode;
			});
	}, [connections, getNodes]);

	const sourceOperationNodesData = useNodesData<StrategyFlowNode>(sourceOperationNodeIds);

	// Get all connected source OperationGroups data
	const sourceOperationGroupIds = useMemo(() => {
		return connections
			.map((conn) => conn.source)
			.filter((sourceId) => {
				const sourceNode = getNodes().find((n) => n.id === sourceId);
				return sourceNode?.type === NodeType.OperationGroup;
			});
	}, [connections, getNodes]);

	const sourceOperationGroupsData = useNodesData<OperationGroup>(sourceOperationGroupIds);

	// Sync effect for parent Group's inputConfigs and StartNode disconnection
	// biome-ignore lint/correctness/useExhaustiveDependencies: nodeData is intentionally omitted to prevent infinite loops
	useEffect(() => {
		if (!nodeData?.inputConfig) {
			return;
		}

		const groupInputConfigs = parentGroupData?.inputConfigs ?? [];
		const currentInputConfig = nodeData.inputConfig;
		let hasChanges = false;
		let newInputConfig: OperationInputConfig | null = null;

		// Helper to process input from StartNode with disconnection check
		const processFromStartNodeWithDisconnectionCheck = (
			input: InputConfig | null,
		): InputConfig | null => {
			if (!input) return null;

			// InputScalarValueConfig (source: null) is self-defined, no need to sync
			if ("scalarValue" in input && input.source === null) {
				return input;
			}

			// Check if input is from OperationStartNode (source: "Group")
			if ("source" in input && input.source === "Group" && "fromNodeId" in input && input.fromNodeId) {
				// Check if StartNode is still connected
				if (!startNodeId || !connectedSourceNodeIds.has(input.fromNodeId)) {
					// StartNode disconnected, clear the "from" fields but keep the config
					if (isSeriesInput(input)) {
						return clearSeriesInputFromFields(input);
					}
					if (isScalarInput(input)) {
						return clearScalarInputFromFields(input);
					}
					if (isGroupScalarValueInput(input)) {
						return clearGroupScalarValueInputFromFields(input);
					}
				}

				// StartNode is connected, process normally
				if (startNodeId) {
					return processInputFromStartNode(input, groupInputConfigs, startNodeId);
				}
			}

			return input;
		};

		if (currentInputConfig.type === "Unary") {
			const syncedInput = processFromStartNodeWithDisconnectionCheck(currentInputConfig.input);

			if (syncedInput !== currentInputConfig.input) {
				hasChanges = true;
				if (syncedInput && isSeriesInput(syncedInput)) {
					newInputConfig = { type: "Unary", input: syncedInput };
				} else {
					newInputConfig = null;
				}
			}
		} else if (currentInputConfig.type === "Binary") {
			const syncedInput1 = processFromStartNodeWithDisconnectionCheck(currentInputConfig.input1);
			const syncedInput2 = processFromStartNodeWithDisconnectionCheck(currentInputConfig.input2);

			if (
				syncedInput1 !== currentInputConfig.input1 ||
				syncedInput2 !== currentInputConfig.input2
			) {
				hasChanges = true;
				newInputConfig = {
					type: "Binary",
					input1: syncedInput1,
					input2: syncedInput2,
				};
			}
		} else if (currentInputConfig.type === "Nary") {
			const syncedInputs = currentInputConfig.inputs.map((input) => {
				const synced = processFromStartNodeWithDisconnectionCheck(input);
				return synced && isSeriesInput(synced) ? synced : null;
			});

			const filteredInputs = syncedInputs.filter(
				(input): input is InputSeriesConfig => input !== null,
			);

			if (
				filteredInputs.length !== currentInputConfig.inputs.length ||
				filteredInputs.some(
					(input, index) => input !== currentInputConfig.inputs[index],
				)
			) {
				hasChanges = true;
				newInputConfig = { type: "Nary", inputs: filteredInputs };
			}
		}

		if (hasChanges) {
			updateNodeData(id, { inputConfig: newInputConfig });
		}
	}, [parentGroupData?.inputConfigs, startNodeId, connectedSourceNodeIds, id, updateNodeData]);

	// Sync effect for upstream OperationNode's outputConfig and edge disconnection
	// biome-ignore lint/correctness/useExhaustiveDependencies: nodeData is intentionally omitted to prevent infinite loops
	useEffect(() => {
		if (!nodeData?.inputConfig) {
			return;
		}

		// Build a map of source node ID -> outputConfig
		const sourceOutputConfigMap = new Map<string, OutputConfig | null>();
		for (const sourceNode of sourceOperationNodesData) {
			if (sourceNode?.data) {
				const opNodeData = sourceNode.data as OperationNodeData;
				sourceOutputConfigMap.set(sourceNode.id, opNodeData.outputConfig ?? null);
			}
		}

		const currentInputConfig = nodeData.inputConfig;
		let hasChanges = false;
		let newInputConfig: OperationInputConfig | null = null;

		// Helper to process input from any source OperationNode
		const processFromOperationNodes = (input: InputConfig | null): InputConfig | null => {
			if (!input) return null;

			// InputScalarValueConfig (source: null) is self-defined
			if ("scalarValue" in input && input.source === null) {
				return input;
			}

			// Check if input is from one of the source OperationNodes
			if ("fromNodeId" in input && "fromNodeType" in input) {
				if (input.fromNodeType === NodeType.OperationNode && input.fromNodeId) {
					// Check if source node is still connected (edge not deleted)
					if (!connectedSourceNodeIds.has(input.fromNodeId)) {
						// Edge has been deleted, clear the "from" fields but keep the config
						if (isSeriesInput(input)) {
							return clearSeriesInputFromFields(input);
						}
						if (isScalarInput(input)) {
							return clearScalarInputFromFields(input);
						}
					}

					const sourceOutputConfig = sourceOutputConfigMap.get(input.fromNodeId);
					// Only process if we have this source node's data
					if (sourceOutputConfigMap.has(input.fromNodeId)) {
						return processInputFromOperationNode(input, input.fromNodeId, sourceOutputConfig ?? null);
					}
				}
			}

			return input;
		};

		if (currentInputConfig.type === "Unary") {
			const syncedInput = processFromOperationNodes(currentInputConfig.input);

			if (syncedInput !== currentInputConfig.input) {
				hasChanges = true;
				if (syncedInput && isSeriesInput(syncedInput)) {
					newInputConfig = { type: "Unary", input: syncedInput };
				} else {
					newInputConfig = null;
				}
			}
		} else if (currentInputConfig.type === "Binary") {
			const syncedInput1 = processFromOperationNodes(currentInputConfig.input1);
			const syncedInput2 = processFromOperationNodes(currentInputConfig.input2);

			if (
				syncedInput1 !== currentInputConfig.input1 ||
				syncedInput2 !== currentInputConfig.input2
			) {
				hasChanges = true;
				newInputConfig = {
					type: "Binary",
					input1: syncedInput1,
					input2: syncedInput2,
				};
			}
		} else if (currentInputConfig.type === "Nary") {
			const syncedInputs = currentInputConfig.inputs.map((input) => {
				const synced = processFromOperationNodes(input);
				return synced && isSeriesInput(synced) ? synced : null;
			});

			const filteredInputs = syncedInputs.filter(
				(input): input is InputSeriesConfig => input !== null,
			);

			if (
				filteredInputs.length !== currentInputConfig.inputs.length ||
				filteredInputs.some(
					(input, index) => input !== currentInputConfig.inputs[index],
				)
			) {
				hasChanges = true;
				newInputConfig = { type: "Nary", inputs: filteredInputs };
			}
		}

		if (hasChanges) {
			updateNodeData(id, { inputConfig: newInputConfig });
		}
	}, [sourceOperationNodesData, connectedSourceNodeIds, id, updateNodeData]);

	// Sync effect for upstream OperationGroup's outputConfigs and edge disconnection
	// biome-ignore lint/correctness/useExhaustiveDependencies: nodeData is intentionally omitted to prevent infinite loops
	useEffect(() => {
		if (!nodeData?.inputConfig) {
			return;
		}

		// Build a map of source group ID -> outputConfigs
		const sourceOutputConfigsMap = new Map<string, GroupOutputConfig[]>();
		for (const sourceGroup of sourceOperationGroupsData) {
			if (sourceGroup?.data) {
				const groupData = sourceGroup.data as OperationGroupData;
				sourceOutputConfigsMap.set(sourceGroup.id, groupData.outputConfigs ?? []);
			}
		}

		const currentInputConfig = nodeData.inputConfig;
		let hasChanges = false;
		let newInputConfig: OperationInputConfig | null = null;

		// Helper to process input from any source OperationGroup
		const processFromOperationGroups = (input: InputConfig | null): InputConfig | null => {
			if (!input) return null;

			// InputScalarValueConfig (source: null) is self-defined
			if ("scalarValue" in input && input.source === null) {
				return input;
			}

			// Check if input is from one of the source OperationGroups
			if ("fromNodeId" in input && "fromNodeType" in input) {
				if (input.fromNodeType === NodeType.OperationGroup && input.fromNodeId) {
					// Check if source group is still connected (edge not deleted)
					if (!connectedSourceNodeIds.has(input.fromNodeId)) {
						// Edge has been deleted, clear the "from" fields but keep the config
						if (isSeriesInput(input)) {
							return clearSeriesInputFromFields(input);
						}
						if (isScalarInput(input)) {
							return clearScalarInputFromFields(input);
						}
					}

					const sourceOutputConfigs = sourceOutputConfigsMap.get(input.fromNodeId);
					// Only process if we have this source group's data
					if (sourceOutputConfigsMap.has(input.fromNodeId)) {
						return processInputFromOperationGroup(input, input.fromNodeId, sourceOutputConfigs ?? []);
					}
				}
			}

			return input;
		};

		if (currentInputConfig.type === "Unary") {
			const syncedInput = processFromOperationGroups(currentInputConfig.input);

			if (syncedInput !== currentInputConfig.input) {
				hasChanges = true;
				if (syncedInput && isSeriesInput(syncedInput)) {
					newInputConfig = { type: "Unary", input: syncedInput };
				} else {
					newInputConfig = null;
				}
			}
		} else if (currentInputConfig.type === "Binary") {
			const syncedInput1 = processFromOperationGroups(currentInputConfig.input1);
			const syncedInput2 = processFromOperationGroups(currentInputConfig.input2);

			if (
				syncedInput1 !== currentInputConfig.input1 ||
				syncedInput2 !== currentInputConfig.input2
			) {
				hasChanges = true;
				newInputConfig = {
					type: "Binary",
					input1: syncedInput1,
					input2: syncedInput2,
				};
			}
		} else if (currentInputConfig.type === "Nary") {
			const syncedInputs = currentInputConfig.inputs.map((input) => {
				const synced = processFromOperationGroups(input);
				return synced && isSeriesInput(synced) ? synced : null;
			});

			const filteredInputs = syncedInputs.filter(
				(input): input is InputSeriesConfig => input !== null,
			);

			if (
				filteredInputs.length !== currentInputConfig.inputs.length ||
				filteredInputs.some(
					(input, index) => input !== currentInputConfig.inputs[index],
				)
			) {
				hasChanges = true;
				newInputConfig = { type: "Nary", inputs: filteredInputs };
			}
		}

		if (hasChanges) {
			updateNodeData(id, { inputConfig: newInputConfig });
		}
	}, [sourceOperationGroupsData, connectedSourceNodeIds, id, updateNodeData]);
};
