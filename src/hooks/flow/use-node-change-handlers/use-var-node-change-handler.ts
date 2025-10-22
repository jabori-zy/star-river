import type { Edge, Node } from "@xyflow/react";
import { getOutgoers } from "@xyflow/react";
import { useCallback } from "react";
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
import { useCustomSysVariableName } from "@/store/use-custom-sys-variable-name";

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

	// 更新指定 VariableNode 的下游 If/Else 节点
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

	// 同步系统变量自定义名称
	const syncSystemVariableNames = useCallback(
		(nodes: Node[], changedVarNodeId: string, edges: Edge[]): { 
			updatedNodes: Node[]; 
			affectedNodeIds: string[] 
		} => {
			const changedNode = nodes.find((n) => n.id === changedVarNodeId);
			if (!changedNode || changedNode.type !== NodeType.VariableNode) {
				return { updatedNodes: nodes, affectedNodeIds: [] };
			}

			// 收集变更节点中所有系统变量的自定义名称映射
			const systemVarNameMap = new Map<string, string>();
			const changedNodeData = changedNode.data as VariableNodeData;

			// 从各个配置中提取系统变量的自定义名称
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

			// 如果没有需要同步的系统变量，直接返回
			if (systemVarNameMap.size === 0) {
				return { updatedNodes: nodes, affectedNodeIds: [] };
			}

			// 收集所有被更新的 VariableNode ID
			const affectedNodeIds: string[] = [];

			// 遍历所有 VariableNode 并更新
			const syncedNodes = nodes.map((node) => {
				if (
					node.type !== NodeType.VariableNode ||
					node.id === changedVarNodeId
				) {
					return node;
				}

				const nodeData = node.data as VariableNodeData;
				let hasUpdate = false;

				// 更新 backtestConfig
				const updatedBacktestConfig = updateConfigWithSystemVarNames(
					nodeData.backtestConfig?.variableConfigs,
					systemVarNameMap,
				);
				if (updatedBacktestConfig.hasUpdate) {
					hasUpdate = true;
				}

				// 更新 liveConfig
				const updatedLiveConfig = updateConfigWithSystemVarNames(
					nodeData.liveConfig?.variableConfigs,
					systemVarNameMap,
				);
				if (updatedLiveConfig.hasUpdate) {
					hasUpdate = true;
				}

				// 更新 simulateConfig
				const updatedSimulateConfig = updateConfigWithSystemVarNames(
					nodeData.simulateConfig?.variableConfigs,
					systemVarNameMap,
				);
				if (updatedSimulateConfig.hasUpdate) {
					hasUpdate = true;
				}

				// 如果有更新，返回新的节点数据并记录节点 ID
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

			// 对于所有被更新的 VariableNode，同步更新其连接的 If/Else 节点
			let finalNodes = syncedNodes;
			for (const affectedNodeId of affectedNodeIds) {
				finalNodes = updateDownstreamIfElseNodes(affectedNodeId, finalNodes, edges);
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

			// 同步系统变量自定义名称到其他节点，并更新它们的下游 If/Else 节点
			const { updatedNodes: syncedNodes, affectedNodeIds } = syncSystemVariableNames(
				updatedNodes, 
				varNodeId, 
				edges
			);
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
			const rightVariable = isVariable(condition.right) ? condition.right : null;
			// 左变量是否需要清空或更新
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
			// 右变量是否需要清空或更新
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
					!varNodeVariableConfigsIds.includes(
						leftVariable?.varConfigId || 0,
					);
				const shouldClearRight =
					rightVariable?.nodeId === varNodeId &&
					!varNodeVariableConfigsIds.includes(
						rightVariable?.varConfigId || 0,
					);

				const nextLeft = shouldClearLeft
					? null
					: updateVariable(
							leftVariable,
							varNodeId,
							varNodeVariableConfigs,
						);

				const nextRight = (() => {
					if (shouldClearRight) {
						return createEmptyRightVariable(
							rightVariable?.varType || null,
						);
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
 * 检查变量是否需要清空
 * @param variable 要检查的变量
 * @param klineNodeId K线节点ID
 * @param klineNodeSymbolIds K线节点有效的symbol配置ID列表
 * @returns 是否需要清空该变量
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
 * 检查变量是否需要更新。如果变量配置ID在变量节点有效的变量配置ID列表中，则需要更新该变量。
 * @param variable 要检查的变量
 * @param varNodeId 变量节点ID
 * @param varNodeVariableConfigsIds 变量节点有效的变量配置ID列表
 * @returns 是否需要更新该变量
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
 * 更新变量的 variable 字段，如果变量属于指定的变量节点且配置存在
 * @param variable 要更新的变量
 * @param varNodeId 变量节点ID
 * @param varNodeVariableConfigs 变量节点的配置列表
 * @returns 更新后的变量或原变量
 */
const updateVariable = (
	variable: Variable | null,
	varNodeId: string,
	varNodeVariableConfigs: VariableConfig[],
): Variable | null => {
	if (!variable || variable.nodeId !== varNodeId || !variable.varConfigId) {
		return variable;
	}

	// 查找对应的变量配置
	const matchingConfig = varNodeVariableConfigs.find(
		(config) => config.configId === variable.varConfigId,
	);

	if (!matchingConfig) {
		return variable;
	}

	// 更新变量的 variable 字段
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
 * 更新配置列表中的系统变量自定义名称
 * @param configs 配置列表
 * @param systemVarNameMap 系统变量名称映射
 * @returns 更新后的配置列表和是否有更新的标志
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
		// 只更新 GET 操作的系统变量
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
