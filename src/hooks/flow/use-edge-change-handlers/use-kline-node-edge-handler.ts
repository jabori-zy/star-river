import type { Edge, Node } from "@xyflow/react";
import { useCallback } from "react";
import type { IfElseNodeData } from "@/types/node/if-else-node";
import { NodeType } from "@/types/node/index";
import type { IndicatorNodeData } from "@/types/node/indicator-node";

export const useKlineNodeEdgeHandler = () => {
	const handleKlineNodeEdgeRemoved = useCallback(
		(klineNode: Node, deletedEdge: Edge, nodes: Node[]): Node[] => {
			//1. 找到targetNode
			const targetNode = nodes.find((node) => node.id === deletedEdge.target);
			if (targetNode) {
				//2. 判断节点类型
				if (targetNode.type === NodeType.IndicatorNode) {
					//3. 更新indicatorNode的selectedSymbol, 将selectedSymbol设置为null
					const indicatorNodeData = targetNode.data as IndicatorNodeData;
					return nodes.map((node) => {
						if (node.id === targetNode.id) {
							return {
								...node,
								data: {
									...indicatorNodeData,
									backtestConfig: indicatorNodeData.backtestConfig
										? {
												...indicatorNodeData.backtestConfig,
												exchangeModeConfig: {
													...(indicatorNodeData.backtestConfig
														.exchangeModeConfig || {}),
													selectedSymbol: null,
												},
											}
										: indicatorNodeData.backtestConfig,
								},
							};
						}
						return node;
					});
				} else if (targetNode.type === NodeType.IfElseNode) {
					const klineNodeId = klineNode.id;
					const ifElseNodeData = targetNode.data as IfElseNodeData;

					if (ifElseNodeData.backtestConfig) {
						const cases = ifElseNodeData.backtestConfig.cases;

						// 重置cases中与klineNode相关的变量
						const updatedCases = cases.map((caseItem) => ({
							...caseItem,
							conditions: caseItem.conditions.map((condition) => ({
								...condition,
								left:
									condition.left?.nodeId === klineNodeId
										? null
										: condition.left,
								right:
									condition.right?.nodeId === klineNodeId
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
			}

			return nodes;
		},
		[],
	);

	return {
		handleKlineNodeEdgeRemoved,
	};
};
