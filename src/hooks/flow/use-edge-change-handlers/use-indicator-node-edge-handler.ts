import type { Edge, Node } from "@xyflow/react";
import { useCallback } from "react";
import type { IfElseNodeData } from "@/types/node/if-else-node";
import { NodeType } from "@/types/node/index";
import type { IndicatorNodeData } from "@/types/node/indicator-node";

export const useIndicatorNodeEdgeHandler = () => {
	const handleIndicatorNodeEdgeRemoved = useCallback(
		(indicatorNode: Node, deletedEdge: Edge, nodes: Node[]): Node[] => {
			//1. Find targetNode
			const targetNode = nodes.find((node) => node.id === deletedEdge.target);
			const sourceHandleId = deletedEdge.sourceHandle;
			console.log("sourceHandleId", sourceHandleId);
			// Corresponding indicator configuration ID in indicatorNode
			const indicatorNodeData = indicatorNode.data as IndicatorNodeData;

			// If indicatorConfigId is empty, it means sourceHandleId is the default output handle, need to clear all configurations of target node
			const indicatorConfigId =
				indicatorNodeData.backtestConfig?.exchangeModeConfig?.selectedIndicators?.find(
					(indicator) => indicator.outputHandleId === sourceHandleId,
				)?.configId;

			if (!targetNode) return nodes;
			//2. Determine node type
			if (targetNode.type === NodeType.IfElseNode) {
				const indicatorNodeId = indicatorNode.id;
				const ifElseNodeData = targetNode.data as IfElseNodeData;
				if (ifElseNodeData.backtestConfig) {
					const cases = ifElseNodeData.backtestConfig.cases;
					// Reset variables related to indicatorNode in cases
					// Condition: leftVariable or rightVariable's nodeId is indicatorNodeId, and variableConfigId === indicatorConfigId
					const updatedCases = cases.map((caseItem) => ({
						...caseItem,
						conditions: caseItem.conditions.map((condition) => ({
							...condition,
							left:
								condition.left?.nodeId === indicatorNodeId &&
								(indicatorConfigId === undefined ||
									condition.left?.varConfigId === indicatorConfigId)
									? null
									: condition.left,
							right:
								condition.right?.nodeId === indicatorNodeId &&
								(indicatorConfigId === undefined ||
									condition.right?.varConfigId === indicatorConfigId)
									? {
											varType: condition.right.varType,
											nodeId: null,
											outputHandleId: null,
											varConfigId: null,
											varName: null,
											nodeName: null,
										}
									: condition.right,
						})),
					}));
					return nodes.map((node) => {
						if (node.id === targetNode.id) {
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
						return node;
					});
				}
			}
			return nodes;
		},
		[],
	);

	return {
		handleIndicatorNodeEdgeRemoved,
	};
};
