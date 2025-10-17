import type { Edge, Node } from "@xyflow/react";
import { useCallback } from "react";
import type { IfElseNodeData } from "@/types/node/if-else-node";
import { NodeType } from "@/types/node/index";
import type { IndicatorNodeData } from "@/types/node/indicator-node";

export const useIndicatorNodeEdgeHandler = () => {
	const handleIndicatorNodeEdgeRemoved = useCallback(
		(indicatorNode: Node, deletedEdge: Edge, nodes: Node[]): Node[] => {
			//1. 找到targetNode
			const targetNode = nodes.find((node) => node.id === deletedEdge.target);
			const sourceHandleId = deletedEdge.sourceHandle;
			console.log("sourceHandleId", sourceHandleId);
			// 对应的indicatorNode中的指标配置Id
			const indicatorNodeData = indicatorNode.data as IndicatorNodeData;

			// 如果indicatorConfigId为空，说明是sourceHandleId为默认输出句柄，需要清空target节点的所有配置
			const indicatorConfigId =
				indicatorNodeData.backtestConfig?.exchangeModeConfig?.selectedIndicators?.find(
					(indicator) => indicator.outputHandleId === sourceHandleId,
				)?.configId;

			if (!targetNode) return nodes;
			//2. 判断节点类型
			if (targetNode.type === NodeType.IfElseNode) {
				const indicatorNodeId = indicatorNode.id;
				const ifElseNodeData = targetNode.data as IfElseNodeData;
				if (ifElseNodeData.backtestConfig) {
					const cases = ifElseNodeData.backtestConfig.cases;
					// 重置cases中与indicatorNode相关的变量\
					// 条件: leftVariable或rightVariable的nodeId为indicatorNodeId，并且variableConfigId === indicatorConfigId
					const updatedCases = cases.map((caseItem) => ({
						...caseItem,
						conditions: caseItem.conditions.map((condition) => ({
							...condition,
							leftVariable:
								condition.leftVariable?.nodeId === indicatorNodeId &&
								(indicatorConfigId === undefined ||
									condition.leftVariable?.varConfigId === indicatorConfigId)
									? null
									: condition.leftVariable,
							rightVariable:
								condition.rightVariable?.nodeId === indicatorNodeId &&
								(indicatorConfigId === undefined ||
									condition.rightVariable?.varConfigId === indicatorConfigId)
									? {
											varType: condition.rightVariable.varType,
											nodeId: null,
											outputHandleId: null,
											varConfigId: null,
											varName: null,
											nodeName: null,
										}
									: condition.rightVariable,
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
