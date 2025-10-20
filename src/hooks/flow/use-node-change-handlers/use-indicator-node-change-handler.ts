import type { Edge, Node } from "@xyflow/react";
import { getOutgoers } from "@xyflow/react";
import { useCallback } from "react";
import { NodeType } from "@/types/node";
import type { IfElseNodeData, Variable } from "@/types/node/if-else-node";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
import { createEmptyRightVariable } from "./utils";

export const useIndicatorNodeChangeHandler = () => {
	const handleBacktestConfigChanged = useCallback(
		(indicatorNodeId: string, nodes: Node[], edges: Edge[]): Node[] => {
			const indicatorNode = nodes.find((node) => node.id === indicatorNodeId);
			if (!indicatorNode) return nodes;
			const indicatorNodeData = indicatorNode.data as IndicatorNodeData;
			const connectedNodes = getOutgoers(indicatorNode, nodes, edges);

			const connectedIfElseNodes = connectedNodes.filter(
				(node) => node.type === NodeType.IfElseNode,
			);

			if (connectedIfElseNodes.length === 0) return nodes;

			const indicatorNodeSelectedIndicators =
				indicatorNodeData.backtestConfig?.exchangeModeConfig
					?.selectedIndicators || [];
			const indicatorNodeSelectedIndicatorsIds =
				indicatorNodeSelectedIndicators.map((indicator) => indicator.configId);
			return nodes.map((node) => {
				const isConnectedIfElseNode = connectedIfElseNodes.some(
					(ifElseNode) => ifElseNode.id === node.id,
				);
				if (isConnectedIfElseNode && node.type === NodeType.IfElseNode) {
					const updatedNode = updateIfElseNode(
						node,
						indicatorNode,
						indicatorNodeSelectedIndicatorsIds,
					);
					return updatedNode || node;
				}
				return node;
			});
		},
		[],
	);

	const handleIndicatorNodeChange = useCallback(
		(oldNode: Node, newNode: Node, nodes: Node[], edges: Edge[]): Node[] => {
			const indicatorNodeId = newNode.id;
			const oldIndicatorData = oldNode.data as IndicatorNodeData;
			const newIndicatorData = newNode.data as IndicatorNodeData;

			// 定义输出的结果，默认是原来的节点
			let updatedNodes = nodes;
			let hasChanged = false; // 是否发生变化

			if (oldIndicatorData.backtestConfig !== newIndicatorData.backtestConfig) {
				if (newIndicatorData.backtestConfig) {
					updatedNodes = handleBacktestConfigChanged(
						indicatorNodeId,
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
		handleIndicatorNodeChange,
	};
};

const updateIfElseNode = (
	node: Node,
	indicatorNode: Node,
	indicatorNodeSelectedIndicatorsIds: number[],
): Node | null => {
	const indicatorNodeId = indicatorNode.id;
	const ifElseNodeData = node.data as IfElseNodeData;
	if (!ifElseNodeData.backtestConfig) return null;

	const cases = ifElseNodeData.backtestConfig.cases;
	let needsUpdate = false;

	for (const caseItem of cases) {
		for (const condition of caseItem.conditions) {
			const leftVariable = condition.left;
			const rightVariable = condition.right;

			// 如果左边量的variableConfigId不在indicatorNodeSelectedIndicatorsIds中, 则需要清空
			if (
				shouldClearVariable(
					leftVariable,
					indicatorNodeId,
					indicatorNodeSelectedIndicatorsIds,
				)
			) {
				needsUpdate = true;
				break;
			}

			// 如果右边量的variableConfigId不在indicatorNodeSelectedIndicatorsIds中, 则需要清空
			if (
				shouldClearVariable(
					rightVariable,
					indicatorNodeId,
					indicatorNodeSelectedIndicatorsIds,
				)
			) {
				needsUpdate = true;
				break;
			}

			if (needsUpdate) break;
		}
		if (needsUpdate) {
			const updatedCases = cases.map((caseItem) => ({
				...caseItem,
				conditions: caseItem.conditions.map((condition) => ({
					...condition,
					left: shouldClearVariable(
						condition.left,
						indicatorNodeId,
						indicatorNodeSelectedIndicatorsIds,
					)
						? null
						: condition.left,
					right: shouldClearVariable(
						condition.right,
						indicatorNodeId,
						indicatorNodeSelectedIndicatorsIds,
					)
						? createEmptyRightVariable(condition.right?.varType || null)
						: condition.right,
				})),
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
	indicatorNodeId: string,
	indicatorNodeSelectedIndicatorsIds: number[],
): boolean => {
	if (!variable || variable.nodeId !== indicatorNodeId) {
		return false;
	}
	return !indicatorNodeSelectedIndicatorsIds.includes(
		variable.varConfigId || 0,
	);
};
