import type { Edge, Node } from "@xyflow/react";
import { useCallback } from "react";
import type { IfElseNodeData } from "@/types/node/if-else-node";
import { NodeType } from "@/types/node/index";
import type { VariableNodeData } from "@/types/node/variable-node";

export const useVarNodeEdgeHandler = () => {
	const handleVarNodeEdgeRemoved = useCallback(
		(varNode: Node, deletedEdge: Edge, nodes: Node[]): Node[] => {
			//1. Find targetNode
			const targetNode = nodes.find((node) => node.id === deletedEdge.target);
			const sourceHandleId = deletedEdge.sourceHandle;
			console.log("sourceHandleId", sourceHandleId);
			// Corresponding indicator configuration ID in varNode
			const varNodeData = varNode.data as VariableNodeData;

			// If indicatorConfigId is empty, it means sourceHandleId is the default output handle, need to clear all configurations of target node
			const varConfigId = varNodeData.backtestConfig?.variableConfigs?.find(
				(variable) => variable.outputHandleId === sourceHandleId,
			)?.configId;

			if (!targetNode) return nodes;
			//2. Determine node type
			if (targetNode.type === NodeType.IfElseNode) {
				const varNodeId = varNode.id;
				const ifElseNodeData = targetNode.data as IfElseNodeData;
				if (ifElseNodeData.backtestConfig) {
					const cases = ifElseNodeData.backtestConfig.cases;
					// Reset variables related to varNode in cases
					// Condition: leftVariable or rightVariable's nodeId is varNodeId, and variableConfigId === varConfigId
					const updatedCases = cases.map((caseItem) => ({
						...caseItem,
						conditions: caseItem.conditions.map((condition) => ({
							...condition,
							left:
								condition.left?.nodeId === varNodeId &&
								(varConfigId === undefined ||
									condition.left?.varConfigId === varConfigId)
									? null
									: condition.left,
							right:
								condition.right?.nodeId === varNodeId &&
								(varConfigId === undefined ||
									condition.right?.varConfigId === varConfigId)
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
		handleVarNodeEdgeRemoved,
	};
};
