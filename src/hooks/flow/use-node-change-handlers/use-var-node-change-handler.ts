import type { Edge, Node } from "@xyflow/react";
import { getOutgoers } from "@xyflow/react";
import { useCallback } from "react";
import { useCustomSysVariableName } from "@/store/use-custom-sys-variable-name";
import { NodeType } from "@/types/node";
import type {
	Constant,
	IfElseNodeData,
	Variable,
} from "@/types/node/if-else-node";
import type {
	VariableConfig,
	VariableNodeData,
} from "@/types/node/variable-node";
import { createEmptyRightVariable } from "./utils";

export const useVarNodeChangeHandler = () => {
	const { getCustomName } = useCustomSysVariableName();

	const handleBacktestConfigChanged = useCallback(
		(varNodeId: string, nodes: Node[], edges: Edge[]): Node[] => {
			const varNode = nodes.find((node) => node.id === varNodeId);
			if (!varNode) return nodes;
			const varNodeData = varNode.data as VariableNodeData;
			const connectedNodes = getOutgoers(varNode, nodes, edges);
			const connectedIfElseNodes = connectedNodes.filter(
				(node) => node.type === NodeType.IfElseNode,
			);
			if (connectedIfElseNodes.length === 0) return nodes;

			const varNodeVariableConfigs =
				varNodeData.backtestConfig?.variableConfigs || [];
			const varNodeVariableConfigsIds = varNodeVariableConfigs.map(
				(variableConfig) => variableConfig.configId,
			);

			return nodes.map((node) => {
				const isConnectedIfElseNode = connectedIfElseNodes.some(
					(ifElseNode) => ifElseNode.id === node.id,
				);
				if (isConnectedIfElseNode && node.type === NodeType.IfElseNode) {
					const updatedNode = updateIfElseNode(
						node,
						varNode,
						varNodeVariableConfigsIds,
					);
					return updatedNode || node;
				}
				return node;
			});
		},
		[],
	);

	// Update downstream If/Else nodes for specified VariableNode
	const updateDownstreamIfElseNodes = useCallback(
		(varNodeId: string, nodes: Node[], edges: Edge[]): Node[] => {
			const varNode = nodes.find((node) => node.id === varNodeId);
			if (!varNode) return nodes;

			const varNodeData = varNode.data as VariableNodeData;
			const connectedNodes = getOutgoers(varNode, nodes, edges);
			const connectedIfElseNodes = connectedNodes.filter(
				(node) => node.type === NodeType.IfElseNode,
			);

			if (connectedIfElseNodes.length === 0) return nodes;

			const varNodeVariableConfigs =
				varNodeData.backtestConfig?.variableConfigs || [];
			const varNodeVariableConfigsIds = varNodeVariableConfigs.map(
				(variableConfig) => variableConfig.configId,
			);

			return nodes.map((node) => {
				const isConnectedIfElseNode = connectedIfElseNodes.some(
					(ifElseNode) => ifElseNode.id === node.id,
				);
				if (isConnectedIfElseNode && node.type === NodeType.IfElseNode) {
					const updatedNode = updateIfElseNode(
						node,
						varNode,
						varNodeVariableConfigsIds,
					);
					return updatedNode || node;
				}
				return node;
			});
		},
		[],
	);

	// Sync system variable custom names
	const syncSystemVariableNames = useCallback(
		(
			nodes: Node[],
			changedVarNodeId: string,
			edges: Edge[],
		): {
			updatedNodes: Node[];
			affectedNodeIds: string[];
		} => {
			const changedNode = nodes.find((n) => n.id === changedVarNodeId);
			if (!changedNode || changedNode.type !== NodeType.VariableNode) {
				return { updatedNodes: nodes, affectedNodeIds: [] };
			}

			// Collect custom name mappings for all system variables in the changed node
			const systemVarNameMap = new Map<string, string>();
			const changedNodeData = changedNode.data as VariableNodeData;

			// Extract custom names of system variables from each config
			const configs = [
				...(changedNodeData.backtestConfig?.variableConfigs || []),
				...(changedNodeData.liveConfig?.variableConfigs || []),
				...(changedNodeData.simulateConfig?.variableConfigs || []),
			];

			for (const config of configs) {
				if (config.varOperation === "get" && config.varType === "system") {
					const customName = getCustomName(config.varName);
					if (customName) {
						systemVarNameMap.set(config.varName, customName);
					}
				}
			}

			// If no system variables need to be synced, return directly
			if (systemVarNameMap.size === 0) {
				return { updatedNodes: nodes, affectedNodeIds: [] };
			}

			// Collect all updated VariableNode IDs
			const affectedNodeIds: string[] = [];

			// Iterate through all VariableNodes and update
			const syncedNodes = nodes.map((node) => {
				if (
					node.type !== NodeType.VariableNode ||
					node.id === changedVarNodeId
				) {
					return node;
				}

				const nodeData = node.data as VariableNodeData;
				let hasUpdate = false;

				// Update backtestConfig
				const updatedBacktestConfig = updateConfigWithSystemVarNames(
					nodeData.backtestConfig?.variableConfigs,
					systemVarNameMap,
				);
				if (updatedBacktestConfig.hasUpdate) {
					hasUpdate = true;
				}

				// Update liveConfig
				const updatedLiveConfig = updateConfigWithSystemVarNames(
					nodeData.liveConfig?.variableConfigs,
					systemVarNameMap,
				);
				if (updatedLiveConfig.hasUpdate) {
					hasUpdate = true;
				}

				// Update simulateConfig
				const updatedSimulateConfig = updateConfigWithSystemVarNames(
					nodeData.simulateConfig?.variableConfigs,
					systemVarNameMap,
				);
				if (updatedSimulateConfig.hasUpdate) {
					hasUpdate = true;
				}

				// If updated, return new node data and record node ID
				if (hasUpdate) {
					affectedNodeIds.push(node.id);
					return {
						...node,
						data: {
							...nodeData,
							...(nodeData.backtestConfig && {
								backtestConfig: {
									...nodeData.backtestConfig,
									variableConfigs: updatedBacktestConfig.configs,
								},
							}),
							...(nodeData.liveConfig && {
								liveConfig: {
									...nodeData.liveConfig,
									variableConfigs: updatedLiveConfig.configs,
								},
							}),
							...(nodeData.simulateConfig && {
								simulateConfig: {
									...nodeData.simulateConfig,
									variableConfigs: updatedSimulateConfig.configs,
								},
							}),
						},
					};
				}

				return node;
			});

			// For all updated VariableNodes, sync update their connected If/Else nodes
			let finalNodes = syncedNodes;
			for (const affectedNodeId of affectedNodeIds) {
				finalNodes = updateDownstreamIfElseNodes(
					affectedNodeId,
					finalNodes,
					edges,
				);
			}

			return { updatedNodes: finalNodes, affectedNodeIds };
		},
		[getCustomName, updateDownstreamIfElseNodes],
	);

	const handleVarNodeChange = useCallback(
		(oldNode: Node, newNode: Node, nodes: Node[], edges: Edge[]): Node[] => {
			const varNodeId = newNode.id;
			const oldVarData = oldNode.data as VariableNodeData;
			const newVarData = newNode.data as VariableNodeData;

			let updatedNodes = nodes;
			let hasChanged = false;

			if (oldVarData.backtestConfig !== newVarData.backtestConfig) {
				if (newVarData.backtestConfig) {
					updatedNodes = handleBacktestConfigChanged(
						varNodeId,
						updatedNodes,
						edges,
					);
					hasChanged = true;
				}
			}

			// Sync system variable custom names to other nodes and update their downstream If/Else nodes
			const { updatedNodes: syncedNodes, affectedNodeIds } =
				syncSystemVariableNames(updatedNodes, varNodeId, edges);
			if (syncedNodes !== updatedNodes || affectedNodeIds.length > 0) {
				hasChanged = true;
				updatedNodes = syncedNodes;
			}

			return hasChanged ? updatedNodes : nodes;
		},
		[handleBacktestConfigChanged, syncSystemVariableNames],
	);

	return {
		handleVarNodeChange,
	};
};

const updateIfElseNode = (
	node: Node,
	varNode: Node,
	varNodeVariableConfigsIds: number[],
): Node | null => {
	const varNodeId = varNode.id;
	const varNodeData = varNode.data as VariableNodeData;
	const varNodeVariableConfigs =
		varNodeData.backtestConfig?.variableConfigs || [];
	const ifElseNodeData = node.data as IfElseNodeData;
	if (!ifElseNodeData.backtestConfig) return null;

	const cases = ifElseNodeData.backtestConfig.cases;
	let needsUpdate = false;
	for (const caseItem of cases) {
		for (const condition of caseItem.conditions) {
			const leftVariable = condition.left;
			const rightVariable = isVariable(condition.right)
				? condition.right
				: null;
			// Check if left variable needs to be cleared or updated
			if (
				shouldClearVariable(
					leftVariable,
					varNodeId,
					varNodeVariableConfigsIds,
				) ||
				shouldUpdateVariable(leftVariable, varNodeId, varNodeVariableConfigsIds)
			) {
				needsUpdate = true;
				break;
			}
			// Check if right variable needs to be cleared or updated
			if (
				shouldClearVariable(
					rightVariable,
					varNodeId,
					varNodeVariableConfigsIds,
				) ||
				shouldUpdateVariable(
					rightVariable,
					varNodeId,
					varNodeVariableConfigsIds,
				)
			) {
				needsUpdate = true;
				break;
			}
		}
		if (needsUpdate) break;
	}
	if (needsUpdate) {
		const updatedCases = cases.map((caseItem) => ({
			...caseItem,
			conditions: caseItem.conditions.map((condition) => {
				const leftVariable = condition.left;
				const rightVariable = isVariable(condition.right)
					? condition.right
					: null;

				const shouldClearLeft =
					leftVariable?.nodeId === varNodeId &&
					!varNodeVariableConfigsIds.includes(leftVariable?.varConfigId || 0);
				const shouldClearRight =
					rightVariable?.nodeId === varNodeId &&
					!varNodeVariableConfigsIds.includes(rightVariable?.varConfigId || 0);

				const nextLeft = shouldClearLeft
					? null
					: updateVariable(leftVariable, varNodeId, varNodeVariableConfigs);

				const nextRight = (() => {
					if (shouldClearRight) {
						return createEmptyRightVariable(rightVariable?.varType || null);
					}
					if (rightVariable) {
						return updateVariable(
							rightVariable,
							varNodeId,
							varNodeVariableConfigs,
						);
					}
					return condition.right;
				})();

				return {
					...condition,
					left: nextLeft,
					right: nextRight,
				};
			}),
		}));
		return {
			...node,
			data: {
				...ifElseNodeData,
				backtestConfig: {
					...ifElseNodeData.backtestConfig,
					cases: updatedCases,
				},
			},
		};
	}
	return null;
};

/**
 * Check if variable needs to be cleared
 * @param variable Variable to check
 * @param klineNodeId Kline node ID
 * @param klineNodeSymbolIds Valid symbol config ID list of kline node
 * @returns Whether the variable needs to be cleared
 */
const shouldClearVariable = (
	variable: Variable | null,
	varNodeId: string,
	varNodeVariableConfigsIds: number[],
): boolean => {
	if (!variable || variable.nodeId !== varNodeId) {
		return false;
	}
	return !varNodeVariableConfigsIds.includes(variable.varConfigId || 0);
};

/**
 * Check if variable needs to be updated. If the variable's config ID is in the valid variable config ID list of the variable node, the variable needs to be updated.
 * @param variable Variable to check
 * @param varNodeId Variable node ID
 * @param varNodeVariableConfigsIds Valid variable config ID list of variable node
 * @returns Whether the variable needs to be updated
 */
const shouldUpdateVariable = (
	variable: Variable | null,
	varNodeId: string,
	varNodeVariableConfigsIds: number[],
): boolean => {
	if (!variable || variable.nodeId !== varNodeId) {
		return false;
	}
	return varNodeVariableConfigsIds.includes(variable.varConfigId || 0);
};

/**
 * Update the variable field of a variable if it belongs to the specified variable node and the config exists
 * @param variable Variable to update
 * @param varNodeId Variable node ID
 * @param varNodeVariableConfigs Variable node's config list
 * @returns Updated variable or original variable
 */
const updateVariable = (
	variable: Variable | null,
	varNodeId: string,
	varNodeVariableConfigs: VariableConfig[],
): Variable | null => {
	if (!variable || variable.nodeId !== varNodeId || !variable.varConfigId) {
		return variable;
	}

	// Find the corresponding variable config
	const matchingConfig = varNodeVariableConfigs.find(
		(config) => config.configId === variable.varConfigId,
	);

	if (!matchingConfig) {
		return variable;
	}

	// Update the variable's variable field
	return {
		...variable,
		varName: matchingConfig.varName,
		varDisplayName: matchingConfig.varDisplayName,
		varValueType: matchingConfig.varValueType,
	};
};

const isVariable = (
	variable: Variable | Constant | null,
): variable is Variable => {
	if (!variable) {
		return false;
	}
	return "nodeId" in variable;
};

/**
 * Update custom names of system variables in the config list
 * @param configs Config list
 * @param systemVarNameMap System variable name mapping
 * @returns Updated config list and a flag indicating if there was an update
 */
const updateConfigWithSystemVarNames = (
	configs: VariableConfig[] | undefined,
	systemVarNameMap: Map<string, string>,
): { configs: VariableConfig[]; hasUpdate: boolean } => {
	if (!configs || configs.length === 0) {
		return { configs: configs || [], hasUpdate: false };
	}

	let hasUpdate = false;
	const updatedConfigs = configs.map((config) => {
		// Only update system variables with GET operation
		if (config.varOperation === "get" && config.varType === "system") {
			const customName = systemVarNameMap.get(config.varName);
			if (customName && customName !== config.varDisplayName) {
				hasUpdate = true;
				return {
					...config,
					varDisplayName: customName,
				};
			}
		}
		return config;
	});

	return { configs: updatedConfigs, hasUpdate };
};
