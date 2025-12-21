import { useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { NodeType } from "@/types/node/index";
import type {
	OperationNodeData,
	OperationInputConfig,
	InputConfig,
	OutputConfig,
	InputSeriesConfig,
	InputScalarConfig,
	InputParentGroupScalarValueConfig,
} from "@/types/node/operation-node";
import {
	isSeriesInput,
	isScalarInput,
	isParentGroupScalarValueInput,
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
 * Find matching parent Group input config by configId
 */
function findParentGroupInputConfig(
	parentInputConfigs: GroupInputConfig[],
	configId: number,
): GroupInputConfig | undefined {
	return parentInputConfigs.find((config) => config.configId === configId);
}

/**
 * Find matching child Group output config by configId
 */
function findChildGroupOutputConfig(
	childOutputConfigs: GroupOutputConfig[],
	configId: number,
): GroupOutputConfig | undefined {
	return childOutputConfigs.find((config) => config.configId === configId);
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
 * Clear ParentGroupScalarValue input's "from" fields when edge is disconnected
 */
function clearParentGroupScalarValueInputFromFields(
	config: InputParentGroupScalarValueConfig,
): InputParentGroupScalarValueConfig {
	return {
		...config,
		fromNodeId: "",
		fromNodeName: "",
		fromHandleId: "",
		fromScalarConfigId: 0,
		fromScalarDisplayName: "",
		fromScalarValue: 0,
	};
}

// ============ Sync from Parent Group (source: "ParentGroup") ============

/**
 * Sync Series input from parent Group (via OperationStartNode)
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromSeriesConfigId is 0)
 * 2. If parent config is deleted or type changed, return null to clear
 * 3. If display name changes, update the input config
 */
function syncSeriesInputFromParentGroup(
	seriesInput: InputSeriesConfig,
	parentInputConfigs: GroupInputConfig[],
	parentNodeName?: string,
): InputSeriesConfig | null {
	// Skip incomplete configs
	if (!seriesInput.fromSeriesConfigId || seriesInput.fromSeriesConfigId === 0) {
		// Still check if node name needs sync
		if (parentNodeName && seriesInput.fromNodeName !== parentNodeName) {
			return { ...seriesInput, fromNodeName: parentNodeName };
		}
		return seriesInput;
	}

	const matchingConfig = findParentGroupInputConfig(
		parentInputConfigs,
		seriesInput.fromSeriesConfigId,
	);

	if (!matchingConfig) {
		return null;
	}

	if (matchingConfig.type !== "Series") {
		return null;
	}

	const needsUpdate =
		seriesInput.fromSeriesDisplayName !== matchingConfig.inputName ||
		(parentNodeName && seriesInput.fromNodeName !== parentNodeName);

	if (needsUpdate) {
		return {
			...seriesInput,
			fromSeriesDisplayName: matchingConfig.inputName,
			...(parentNodeName && { fromNodeName: parentNodeName }),
		};
	}

	return seriesInput;
}

/**
 * Sync Scalar input from parent Group (via OperationStartNode)
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromScalarConfigId is 0)
 * 2. If parent config is deleted or type changed, return null to clear
 * 3. If display name changes, update the input config
 */
function syncScalarInputFromParentGroup(
	scalarInput: InputScalarConfig,
	parentInputConfigs: GroupInputConfig[],
	parentNodeName?: string,
): InputScalarConfig | null {
	if (!scalarInput.fromScalarConfigId || scalarInput.fromScalarConfigId === 0) {
		// Still check if node name needs sync
		if (parentNodeName && scalarInput.fromNodeName !== parentNodeName) {
			return { ...scalarInput, fromNodeName: parentNodeName };
		}
		return scalarInput;
	}

	const matchingConfig = findParentGroupInputConfig(
		parentInputConfigs,
		scalarInput.fromScalarConfigId,
	);

	if (!matchingConfig) {
		return null;
	}

	if (matchingConfig.type !== "Scalar") {
		return null;
	}

	const needsUpdate =
		scalarInput.fromScalarDisplayName !== matchingConfig.inputName ||
		(parentNodeName && scalarInput.fromNodeName !== parentNodeName);

	if (needsUpdate) {
		return {
			...scalarInput,
			fromScalarDisplayName: matchingConfig.inputName,
			fromScalarName: matchingConfig.fromScalarName,
			...(parentNodeName && { fromNodeName: parentNodeName }),
		};
	}

	return scalarInput;
}

/**
 * Sync ParentGroupScalarValue input from parent Group (via OperationStartNode)
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromScalarConfigId is 0)
 * 2. If parent config is deleted or type changed, return null to clear
 * 3. If display name or value changes, update the input config
 */
function syncParentGroupScalarValueInputFromParentGroup(
	config: InputParentGroupScalarValueConfig,
	parentInputConfigs: GroupInputConfig[],
	parentNodeName?: string,
): InputParentGroupScalarValueConfig | null {
	if (!config.fromScalarConfigId || config.fromScalarConfigId === 0) {
		// Still check if node name needs sync
		if (parentNodeName && config.fromNodeName !== parentNodeName) {
			return { ...config, fromNodeName: parentNodeName };
		}
		return config;
	}

	const matchingConfig = findParentGroupInputConfig(
		parentInputConfigs,
		config.fromScalarConfigId,
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
		config.fromScalarDisplayName !== matchingConfig.inputName ||
		config.fromScalarValue !== scalarValue ||
		(parentNodeName && config.fromNodeName !== parentNodeName);

	if (needsUpdate) {
		return {
			...config,
			fromScalarDisplayName: matchingConfig.inputName,
			fromScalarValue: scalarValue,
			...(parentNodeName && { fromNodeName: parentNodeName }),
		};
	}

	return config;
}

// ============ Sync from OperationNode (source: "OperationNode") ============

/**
 * Sync Series input from upstream OperationNode
 *
 * Sync rules:
 * 1. If source node's outputConfig is deleted or changed to Scalar, return null
 * 2. If display name changes, update the input config
 * 3. If source node name changes, update fromNodeName
 */
function syncSeriesInputFromOperationNode(
	seriesInput: InputSeriesConfig,
	sourceOutputConfig: OutputConfig | null,
	sourceNodeName?: string,
): InputSeriesConfig | null {
	if (!sourceOutputConfig) {
		// Output config deleted
		return null;
	}

	if (sourceOutputConfig.type !== "Series") {
		// Type changed from Series to Scalar
		return null;
	}

	// Check if display name or node name changed
	const needsUpdate =
		seriesInput.fromSeriesDisplayName !== sourceOutputConfig.outputName ||
		(sourceNodeName && seriesInput.fromNodeName !== sourceNodeName);

	if (needsUpdate) {
		return {
			...seriesInput,
			fromSeriesDisplayName: sourceOutputConfig.outputName,
			fromSeriesName: sourceOutputConfig.outputName,
			...(sourceNodeName && { fromNodeName: sourceNodeName }),
		};
	}

	return seriesInput;
}

/**
 * Sync Scalar input from upstream OperationNode
 *
 * Sync rules:
 * 1. If source node's outputConfig is deleted or changed to Series, return null
 * 2. If display name changes, update the input config
 * 3. If source node name changes, update fromNodeName
 */
function syncScalarInputFromOperationNode(
	scalarInput: InputScalarConfig,
	sourceOutputConfig: OutputConfig | null,
	sourceNodeName?: string,
): InputScalarConfig | null {
	if (!sourceOutputConfig) {
		// Output config deleted
		return null;
	}

	if (sourceOutputConfig.type !== "Scalar") {
		// Type changed from Scalar to Series
		return null;
	}

	// Check if display name or node name changed
	const needsUpdate =
		scalarInput.fromScalarDisplayName !== sourceOutputConfig.outputName ||
		(sourceNodeName && scalarInput.fromNodeName !== sourceNodeName);

	if (needsUpdate) {
		return {
			...scalarInput,
			fromScalarDisplayName: sourceOutputConfig.outputName,
			fromScalarName: sourceOutputConfig.outputName,
			...(sourceNodeName && { fromNodeName: sourceNodeName }),
		};
	}

	return scalarInput;
}

// ============ Sync from Child OperationGroup (source: "ChildGroup") ============

/**
 * Sync Series input from child OperationGroup
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromSeriesConfigId is 0)
 * 2. If output config is deleted or type changed, return null to clear
 * 3. If display name changes, update the input config
 */
function syncSeriesInputFromChildGroup(
	seriesInput: InputSeriesConfig,
	childOutputConfigs: GroupOutputConfig[],
	sourceNodeName?: string,
): InputSeriesConfig | null {
	// Skip incomplete configs
	if (!seriesInput.fromSeriesConfigId || seriesInput.fromSeriesConfigId === 0) {
		// Still check if node name needs sync
		if (sourceNodeName && seriesInput.fromNodeName !== sourceNodeName) {
			return { ...seriesInput, fromNodeName: sourceNodeName };
		}
		return seriesInput;
	}

	const matchingConfig = findChildGroupOutputConfig(
		childOutputConfigs,
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

	// Check if display name or node name changed
	const needsUpdate =
		seriesInput.fromSeriesDisplayName !== matchingConfig.outputName ||
		(sourceNodeName && seriesInput.fromNodeName !== sourceNodeName);

	if (needsUpdate) {
		return {
			...seriesInput,
			fromSeriesDisplayName: matchingConfig.outputName,
			fromSeriesName: matchingConfig.outputName,
			...(sourceNodeName && { fromNodeName: sourceNodeName }),
		};
	}

	return seriesInput;
}

/**
 * Sync Scalar input from child OperationGroup
 *
 * Sync rules:
 * 1. Skip incomplete configs (fromScalarConfigId is 0)
 * 2. If output config is deleted or type changed, return null to clear
 * 3. If display name changes, update the input config
 */
function syncScalarInputFromChildGroup(
	scalarInput: InputScalarConfig,
	childOutputConfigs: GroupOutputConfig[],
	sourceNodeName?: string,
): InputScalarConfig | null {
	// Skip incomplete configs
	if (!scalarInput.fromScalarConfigId || scalarInput.fromScalarConfigId === 0) {
		// Still check if node name needs sync
		if (sourceNodeName && scalarInput.fromNodeName !== sourceNodeName) {
			return { ...scalarInput, fromNodeName: sourceNodeName };
		}
		return scalarInput;
	}

	const matchingConfig = findChildGroupOutputConfig(
		childOutputConfigs,
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

	// Check if display name or node name changed
	const needsUpdate =
		scalarInput.fromScalarDisplayName !== matchingConfig.outputName ||
		(sourceNodeName && scalarInput.fromNodeName !== sourceNodeName);

	if (needsUpdate) {
		return {
			...scalarInput,
			fromScalarDisplayName: matchingConfig.outputName,
			fromScalarName: matchingConfig.outputName,
			...(sourceNodeName && { fromNodeName: sourceNodeName }),
		};
	}

	return scalarInput;
}

// ============ Process Single Input ============

/**
 * Process a single input from parent Group (via OperationStartNode)
 * Note: fromNodeId stores parent Group ID, not StartNode ID
 */
function processInputFromParentGroup(
	input: InputConfig | null,
	parentInputConfigs: GroupInputConfig[],
	parentNodeId: string,
	parentNodeName?: string,
): InputConfig | null {
	if (!input) return null;

	// InputScalarValueConfig (source: null) is self-defined, no need to sync
	if ("scalarValue" in input && input.source === null) {
		return input;
	}

	// Only sync inputs from parent Group (fromNodeId stores parent Group ID)
	if ("fromNodeId" in input && input.fromNodeId !== parentNodeId) {
		return input;
	}

	if (isSeriesInput(input)) {
		return syncSeriesInputFromParentGroup(input, parentInputConfigs, parentNodeName);
	}

	if (isScalarInput(input)) {
		return syncScalarInputFromParentGroup(input, parentInputConfigs, parentNodeName);
	}

	if (isParentGroupScalarValueInput(input)) {
		return syncParentGroupScalarValueInputFromParentGroup(input, parentInputConfigs, parentNodeName);
	}

	return input;
}

/**
 * Process a single input from OperationNode
 */
function processInputFromOperationNode(
	input: InputConfig | null,
	sourceNodeId: string,
	sourceOutputConfig: OutputConfig | null,
	sourceNodeName?: string,
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
		return syncSeriesInputFromOperationNode(input, sourceOutputConfig, sourceNodeName);
	}

	if (isScalarInput(input)) {
		return syncScalarInputFromOperationNode(input, sourceOutputConfig, sourceNodeName);
	}

	// ParentGroupScalarValueInput cannot come from OperationNode
	return input;
}

/**
 * Process a single input from child OperationGroup
 */
function processInputFromChildGroup(
	input: InputConfig | null,
	sourceNodeId: string,
	childOutputConfigs: GroupOutputConfig[],
	sourceNodeName?: string,
): InputConfig | null {
	if (!input) return null;

	// InputScalarValueConfig (source: null) is self-defined, no need to sync
	if ("scalarValue" in input && input.source === null) {
		return input;
	}

	// Only sync inputs from this specific child OperationGroup
	if (!("fromNodeId" in input) || input.fromNodeId !== sourceNodeId) {
		return input;
	}

	if (isSeriesInput(input)) {
		return syncSeriesInputFromChildGroup(input, childOutputConfigs, sourceNodeName);
	}

	if (isScalarInput(input)) {
		return syncScalarInputFromChildGroup(input, childOutputConfigs, sourceNodeName);
	}

	// ParentGroupScalarValueInput cannot come from child OperationGroup
	return input;
}

// ============ Context Interfaces ============

interface SyncContext {
	nodeData: OperationNodeData | undefined;
	connectedSourceNodeIds: Set<string>;
	updateNodeData: (id: string, data: Partial<OperationNodeData>) => void;
	id: string;
}

interface SyncFromParentGroupContext extends SyncContext {
	parentGroupData: OperationGroupData | undefined;
	startNodeId: string | null;
	parentNodeId: string | undefined;
}

interface SyncFromOperationNodeContext extends SyncContext {
	sourceOperationNodesData: Array<{ id: string; data: unknown }>;
}

interface SyncFromChildGroupContext extends SyncContext {
	sourceChildGroupsData: Array<{ id: string; data: unknown }>;
}

// ============ Sync Methods ============

/**
 * Sync inputs from parent Group (via OperationStartNode)
 * These are inputs with source: "ParentGroup"
 */
function syncFromParentGroup(ctx: SyncFromParentGroupContext): void {
	const {
		nodeData,
		parentGroupData,
		startNodeId,
		parentNodeId,
		connectedSourceNodeIds,
		updateNodeData,
		id,
	} = ctx;

	// Skip sync if parentGroupData is temporarily undefined (during re-renders/saves)
	// This prevents incorrectly clearing inputConfig when parent data is not yet available
	if (!nodeData?.inputConfig || !parentGroupData) {
		return;
	}

	const parentInputConfigs = parentGroupData.inputConfigs ?? [];
	const parentNodeName = parentGroupData?.nodeName ?? "";
	const currentInputConfig = nodeData.inputConfig;
	let hasChanges = false;
	let newInputConfig: OperationInputConfig | null = null;

	// Helper to process input from parent Group (via StartNode) with disconnection check
	const processFromParentGroupWithDisconnectionCheck = (
		input: InputConfig | null,
	): InputConfig | null => {
		if (!input) return null;

		// InputScalarValueConfig (source: null) is self-defined, no need to sync
		if ("scalarValue" in input && input.source === null) {
			return input;
		}

		// Check if input is from parent Group (source === "ParentGroup")
		if (
			"fromNodeId" in input &&
			"source" in input &&
			input.source === "ParentGroup" &&
			input.fromNodeId === parentNodeId
		) {
			// Check if StartNode is still connected (StartNode is the actual edge source)
			if (!startNodeId || !connectedSourceNodeIds.has(startNodeId)) {
				// StartNode disconnected, clear the "from" fields but keep the config
				if (isSeriesInput(input)) {
					return clearSeriesInputFromFields(input);
				}
				if (isScalarInput(input)) {
					return clearScalarInputFromFields(input);
				}
				if (isParentGroupScalarValueInput(input)) {
					return clearParentGroupScalarValueInputFromFields(input);
				}
			}

			// StartNode is connected, process normally - pass parentNodeId since fromNodeId stores Group ID
			if (startNodeId && parentNodeId) {
				return processInputFromParentGroup(input, parentInputConfigs, parentNodeId, parentNodeName);
			}
		}

		return input;
	};

	if (currentInputConfig.type === "Unary") {
		const syncedInput = processFromParentGroupWithDisconnectionCheck(currentInputConfig.input);

		if (syncedInput !== currentInputConfig.input) {
			hasChanges = true;
			if (syncedInput && isSeriesInput(syncedInput)) {
				newInputConfig = { type: "Unary", input: syncedInput };
			} else {
				newInputConfig = null;
			}
		}
	} else if (currentInputConfig.type === "Binary") {
		const syncedInput1 = processFromParentGroupWithDisconnectionCheck(currentInputConfig.input1);
		const syncedInput2 = processFromParentGroupWithDisconnectionCheck(currentInputConfig.input2);

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
			const synced = processFromParentGroupWithDisconnectionCheck(input);
			return synced && isSeriesInput(synced) ? synced : null;
		});

		const filteredInputs = syncedInputs.filter((input): input is InputSeriesConfig => input !== null);

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
}

/**
 * Sync inputs from upstream OperationNode
 * These are inputs with source: "OperationNode"
 */
function syncFromSourceOperationNode(ctx: SyncFromOperationNodeContext): void {
	const {
		nodeData,
		sourceOperationNodesData,
		connectedSourceNodeIds,
		updateNodeData,
		id,
	} = ctx;

	if (!nodeData?.inputConfig) {
		return;
	}

	// Build maps for source node data
	const sourceOutputConfigMap = new Map<string, OutputConfig | null>();
	const sourceNodeNameMap = new Map<string, string>();
	for (const sourceNode of sourceOperationNodesData) {
		if (sourceNode?.data) {
			const opNodeData = sourceNode.data as OperationNodeData;
			sourceOutputConfigMap.set(sourceNode.id, opNodeData.outputConfig ?? null);
			sourceNodeNameMap.set(sourceNode.id, opNodeData.nodeName ?? "");
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

		// Check if input is from one of the source OperationNodes (source === "OperationNode")
		if ("fromNodeId" in input && "source" in input) {
			if (input.source === "OperationNode" && input.fromNodeId) {
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
				const sourceNodeName = sourceNodeNameMap.get(input.fromNodeId);
				// Only process if we have this source node's data
				if (sourceOutputConfigMap.has(input.fromNodeId)) {
					return processInputFromOperationNode(input, input.fromNodeId, sourceOutputConfig ?? null, sourceNodeName);
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
}

/**
 * Sync inputs from child OperationGroup
 * These are inputs with source: "ChildGroup"
 */
function syncFromChildGroup(ctx: SyncFromChildGroupContext): void {
	const {
		nodeData,
		sourceChildGroupsData,
		connectedSourceNodeIds,
		updateNodeData,
		id,
	} = ctx;

	if (!nodeData?.inputConfig) {
		return;
	}

	// Build maps for source group data
	const sourceOutputConfigsMap = new Map<string, GroupOutputConfig[]>();
	const sourceNodeNameMap = new Map<string, string>();
	for (const sourceGroup of sourceChildGroupsData) {
		if (sourceGroup?.data) {
			const groupData = sourceGroup.data as OperationGroupData;
			sourceOutputConfigsMap.set(sourceGroup.id, groupData.outputConfigs ?? []);
			sourceNodeNameMap.set(sourceGroup.id, groupData.nodeName ?? "");
		}
	}

	const currentInputConfig = nodeData.inputConfig;
	let hasChanges = false;
	let newInputConfig: OperationInputConfig | null = null;

	// Helper to process input from any source child OperationGroup
	const processFromChildGroups = (input: InputConfig | null): InputConfig | null => {
		if (!input) return null;

		// InputScalarValueConfig (source: null) is self-defined
		if ("scalarValue" in input && input.source === null) {
			return input;
		}

		// Check if input is from one of the source child OperationGroups (source === "ChildGroup")
		if ("fromNodeId" in input && "source" in input) {
			if (input.source === "ChildGroup" && input.fromNodeId) {
				// Skip inputs NOT from our tracked child OperationGroups
				if (!sourceOutputConfigsMap.has(input.fromNodeId)) {
					return input;
				}

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
				const sourceNodeName = sourceNodeNameMap.get(input.fromNodeId);
				return processInputFromChildGroup(input, input.fromNodeId, sourceOutputConfigs ?? [], sourceNodeName);
			}
		}

		return input;
	};

	if (currentInputConfig.type === "Unary") {
		const syncedInput = processFromChildGroups(currentInputConfig.input);

		if (syncedInput !== currentInputConfig.input) {
			hasChanges = true;
			if (syncedInput && isSeriesInput(syncedInput)) {
				newInputConfig = { type: "Unary", input: syncedInput };
			} else {
				newInputConfig = null;
			}
		}
	} else if (currentInputConfig.type === "Binary") {
		const syncedInput1 = processFromChildGroups(currentInputConfig.input1);
		const syncedInput2 = processFromChildGroups(currentInputConfig.input2);

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
			const synced = processFromChildGroups(input);
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
}

// ============ Main Hook ============

/**
 * Sync OperationNode inputs with source nodes
 *
 * This hook monitors:
 * 1. Parent OperationGroup's inputConfigs (via OperationStartNode) - source: "ParentGroup"
 * 2. Upstream OperationNode's outputConfig - source: "OperationNode"
 * 3. Child OperationGroup's outputConfigs - source: "ChildGroup"
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

	// Get all connected source child OperationGroups data
	const sourceChildGroupIds = useMemo(() => {
		return connections
			.map((conn) => conn.source)
			.filter((sourceId) => {
				const sourceNode = getNodes().find((n) => n.id === sourceId);
				return sourceNode?.type === NodeType.OperationGroup;
			});
	}, [connections, getNodes]);

	const sourceChildGroupsData = useNodesData<OperationGroup>(sourceChildGroupIds);

	// Sync effect for parent Group's inputConfigs and StartNode disconnection
	// biome-ignore lint/correctness/useExhaustiveDependencies: nodeData is intentionally omitted to prevent infinite loops
	useEffect(() => {
		syncFromParentGroup({
			nodeData,
			parentGroupData,
			startNodeId,
			parentNodeId,
			connectedSourceNodeIds,
			updateNodeData,
			id,
		});
	}, [parentGroupData?.inputConfigs, parentGroupData?.nodeName, startNodeId, connectedSourceNodeIds, id, updateNodeData]);

	// Sync effect for upstream OperationNode's outputConfig and edge disconnection
	// biome-ignore lint/correctness/useExhaustiveDependencies: nodeData is intentionally omitted to prevent infinite loops
	useEffect(() => {
		syncFromSourceOperationNode({
			nodeData,
			sourceOperationNodesData,
			connectedSourceNodeIds,
			updateNodeData,
			id,
		});
	}, [sourceOperationNodesData, connectedSourceNodeIds, id, updateNodeData]);

	// Sync effect for child OperationGroup's outputConfigs and edge disconnection
	// biome-ignore lint/correctness/useExhaustiveDependencies: nodeData is intentionally omitted to prevent infinite loops
	useEffect(() => {
		syncFromChildGroup({
			nodeData,
			sourceChildGroupsData,
			connectedSourceNodeIds,
			updateNodeData,
			id,
		});
	}, [sourceChildGroupsData, connectedSourceNodeIds, id, updateNodeData]);
};
