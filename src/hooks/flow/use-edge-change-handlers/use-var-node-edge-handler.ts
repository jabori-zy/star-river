import type { Edge, Node } from "@xyflow/react";
import { useCallback } from "react";
import type { IfElseNodeData } from "@/types/node/if-else-node";
import { NodeType } from "@/types/node/index";
import type { VariableNodeData } from "@/types/node/variable-node";

export const useVarNodeEdgeHandler = () => {
	const handleVarNodeEdgeRemoved = useCallback(
		(varNode: Node, deletedEdge: Edge, nodes: Node[]): Node[] => {
			//1. 找到targetNode
			const targetNode = nodes.find((node) => node.id === deletedEdge.target);
			const sourceHandleId = deletedEdge.sourceHandle;
			console.log("sourceHandleId", sourceHandleId);
			// 对应的varNode中的指标配置Id
			const varNodeData = varNode.data as VariableNodeData;

			// 如果indicatorConfigId为空，说明是sourceHandleId为默认输出句柄，需要清空target节点的所有配置
			const varConfigId = varNodeData.backtestConfig?.variableConfigs?.find(
				(variable) => variable.outputHandleId === sourceHandleId,
			)?.configId;

			if (!targetNode) return nodes;
			//2. 判断节点类型
			if (targetNode.type === NodeType.IfElseNode) {
				const varNodeId = varNode.id;
				const ifElseNodeData = targetNode.data as IfElseNodeData;
				if (ifElseNodeData.backtestConfig) {
					const cases = ifElseNodeData.backtestConfig.cases;
					// 重置cases中与varNode相关的变量\
					// 条件: leftVariable或rightVariable的nodeId为varNodeId，并且variableConfigId === varConfigId
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
