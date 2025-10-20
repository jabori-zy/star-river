import type { Edge, Node } from "@xyflow/react";
import { getOutgoers } from "@xyflow/react";
import { useCallback } from "react";
import { NodeType } from "@/types/node";
import type { IfElseNodeData, Variable } from "@/types/node/if-else-node";
import type {
	VariableConfig,
	VariableNodeData,
} from "@/types/node/variable-node";
import { createEmptyRightVariable } from "./utils";

export const useVarNodeChangeHandler = () => {
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
			return hasChanged ? updatedNodes : nodes;
		},
		[handleBacktestConfigChanged],
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
			const rightVariable = condition.right;
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
				const shouldClearLeft =
					condition.left?.nodeId === varNodeId &&
					!varNodeVariableConfigsIds.includes(
						condition.left?.varConfigId || 0,
					);
				const shouldClearRight =
					condition.right?.nodeId === varNodeId &&
					!varNodeVariableConfigsIds.includes(
						condition.right?.varConfigId || 0,
					);

				return {
					...condition,
					left: shouldClearLeft
						? null
						: updateVariable(
								condition.left,
								varNodeId,
								varNodeVariableConfigs,
							),
					right: shouldClearRight
						? createEmptyRightVariable(condition.right?.varType || null)
						: updateVariable(
								condition.right,
								varNodeId,
								varNodeVariableConfigs,
							),
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
