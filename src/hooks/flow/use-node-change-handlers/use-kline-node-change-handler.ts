import { type Edge, getOutgoers, type Node } from "@xyflow/react";
import { useCallback } from "react";
import type { IfElseNodeData, Variable } from "@/types/node/if-else-node";
import { NodeType } from "@/types/node/index";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
import type { KlineNodeData, SelectedSymbol } from "@/types/node/kline-node";
import { createEmptyRightVariable } from "./utils";

/**
 * 检查变量是否需要清空
 * @param variable 要检查的变量
 * @param klineNodeId K线节点ID
 * @param klineNodeSymbolIds K线节点有效的symbol配置ID列表
 * @returns 是否需要清空该变量
 */
const shouldClearVariable = (
	variable: Variable | null,
	klineNodeId: string,
	klineNodeSymbolIds: number[],
): boolean => {
	if (!variable || variable.nodeId !== klineNodeId) {
		return false;
	}
	return !klineNodeSymbolIds.includes(variable.varConfigId || 0);
};

/**
 * 检查是否需要清空指标节点的selectedSymbol
 * @param selectedSymbol 指标节点的selectedSymbol
 * @param klineNodeSelectedSymbols K线节点的symbol配置列表
 * @returns 是否需要清空
 */
const shouldClearIndicatorSymbol = (
	selectedSymbol: SelectedSymbol | null,
	klineNodeSelectedSymbols: SelectedSymbol[],
): boolean => {
	if (!selectedSymbol) {
		return false;
	}
	// 如果configId在K线节点的symbol配置中不存在，则需要清空
	return !klineNodeSelectedSymbols.some(
		(klineSymbol) => klineSymbol.configId === selectedSymbol.configId,
	);
};

/**
 * 检查是否需要更新指标节点的selectedSymbol
 * @param selectedSymbol 指标节点的selectedSymbol
 * @param klineNodeSelectedSymbols K线节点的symbol配置列表
 * @returns 是否需要更新
 */
const shouldUpdateIndicatorSymbol = (
	selectedSymbol: SelectedSymbol | null,
	klineNodeSelectedSymbols: SelectedSymbol[],
): boolean => {
	if (!selectedSymbol) {
		return false;
	}
	// 查找configId相同的K线symbol配置
	const matchingKlineSymbol = klineNodeSelectedSymbols.find(
		(klineSymbol) => klineSymbol.configId === selectedSymbol.configId,
	);
	if (!matchingKlineSymbol) {
		return false;
	}
	// 如果configId相同但symbol或interval不同，则需要更新
	return (
		matchingKlineSymbol.symbol !== selectedSymbol.symbol ||
		matchingKlineSymbol.interval !== selectedSymbol.interval
	);
};

/**
 * 更新指标节点的selectedSymbol配置
 * @param selectedSymbol 指标节点的selectedSymbol
 * @param klineNodeSelectedSymbols K线节点的symbol配置列表
 * @returns 更新后的selectedSymbol或原selectedSymbol
 */
const updateIndicatorSymbol = (
	selectedSymbol: SelectedSymbol | null,
	klineNodeSelectedSymbols: SelectedSymbol[],
): SelectedSymbol | null => {
	if (!selectedSymbol) {
		return selectedSymbol;
	}

	// 查找对应的K线symbol配置
	const matchingKlineSymbol = klineNodeSelectedSymbols.find(
		(klineSymbol) => klineSymbol.configId === selectedSymbol.configId,
	);

	if (!matchingKlineSymbol) {
		return selectedSymbol;
	}

	// 更新symbol和interval字段
	return {
		...selectedSymbol,
		symbol: matchingKlineSymbol.symbol,
		interval: matchingKlineSymbol.interval,
	};
};

/**
 * 更新指标节点的selectedSymbol配置
 * @param node 节点对象
 * @param klineNodeSelectedSymbols K线节点的symbol配置列表
 * @returns 更新后的节点或null（如果不需要更新）
 */
const updateIndicatorNode = (
	node: Node,
	klineNodeSelectedSymbols: SelectedSymbol[],
): Node | null => {
	const indicatorNodeData = node.data as IndicatorNodeData;

	if (!indicatorNodeData.backtestConfig) {
		return null;
	}

	const indicatorNodeSelectedSymbol =
		indicatorNodeData.backtestConfig?.exchangeModeConfig?.selectedSymbol ??
		null;

	// 检查是否需要清空或更新
	const needsClear = shouldClearIndicatorSymbol(
		indicatorNodeSelectedSymbol,
		klineNodeSelectedSymbols,
	);
	const needsUpdate = shouldUpdateIndicatorSymbol(
		indicatorNodeSelectedSymbol,
		klineNodeSelectedSymbols,
	);

	if (needsClear || needsUpdate) {
		return {
			...node,
			data: {
				...indicatorNodeData,
				backtestConfig: {
					...indicatorNodeData.backtestConfig,
					exchangeModeConfig: {
						...indicatorNodeData.backtestConfig?.exchangeModeConfig,
						selectedSymbol: needsClear
							? null
							: updateIndicatorSymbol(
									indicatorNodeSelectedSymbol,
									klineNodeSelectedSymbols,
								),
					},
				},
			},
		};
	}

	return null;
};

/**
 * 更新IfElse节点的变量配置
 * @param node 节点对象
 * @param klineNodeId K线节点ID
 * @param klineNodeSymbolIds K线节点有效的symbol配置ID列表
 * @returns 更新后的节点或null（如果不需要更新）
 */
const updateIfElseNode = (
	node: Node,
	klineNodeId: string,
	klineNodeSymbolIds: number[],
): Node | null => {
	const ifElseNodeData = node.data as IfElseNodeData;

	if (!ifElseNodeData.backtestConfig) {
		return null;
	}

	const cases = ifElseNodeData.backtestConfig.cases;
	let needsUpdate = false;

	// 检查是否有需要清空的变量
	for (const caseItem of cases) {
		for (const condition of caseItem.conditions) {
			const leftVariable = condition.left;
			const rightVariable = condition.right;

			if (leftVariable) {
				// 如果左变量与k线节点id相同
				if (
					shouldClearVariable(leftVariable, klineNodeId, klineNodeSymbolIds)
				) {
					// 将左边变量配置清空
					console.log("leftVariable configId", leftVariable.varConfigId);
					needsUpdate = true;
					break;
				}
			}

			if (rightVariable) {
				// 如果右变量与k线节点id相同
				if (
					shouldClearVariable(rightVariable, klineNodeId, klineNodeSymbolIds)
				) {
					console.log("rightVariable configId", rightVariable.varConfigId);
					needsUpdate = true;
					break;
				}
			}
		}
		if (needsUpdate) break;
	}

	// 如果需要更新，则创建新的节点数据
	if (needsUpdate) {
		const updatedCases = cases.map((caseItem) => ({
			...caseItem,
			conditions: caseItem.conditions.map((condition) => ({
				...condition,
				left: shouldClearVariable(
					condition.left,
					klineNodeId,
					klineNodeSymbolIds,
				)
					? null
					: condition.left,
				right: shouldClearVariable(
					condition.right,
					klineNodeId,
					klineNodeSymbolIds,
				)
					? createEmptyRightVariable(condition.right!.varType)
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

	return null;
};

/**
 * K线节点变更处理相关的hook
 */
export const useKlineNodeChangeHandler = () => {
	/**
	 * 处理回测配置变化
	 */
	const handleBacktestConfigChanged = useCallback(
		(klineNodeId: string, nodes: Node[], edges: Edge[]): Node[] => {
			// 获取k线节点
			const klineNode = nodes.find((node) => node.id === klineNodeId);
			if (!klineNode) return nodes;
			const klineNodeData = klineNode.data as KlineNodeData;

			// 找到所有连接的节点
			const connectedNodes = getOutgoers(klineNode, nodes, edges);
			// 获取所有连接的指标节点
			const connectedIndicatorNodes = connectedNodes.filter(
				(node) => node.type === NodeType.IndicatorNode,
			);
			// 获取所有连接的ifElse节点
			const connectedIfElseNodes = connectedNodes.filter(
				(node) => node.type === NodeType.IfElseNode,
			);

			// 如果没有任何连接，则直接返回
			if (
				connectedIndicatorNodes.length === 0 &&
				connectedIfElseNodes.length === 0
			)
				return nodes;

			// 获取k线节点配置的symbol
			const klineNodeSelectedSymbols =
				klineNodeData.backtestConfig?.exchangeModeConfig?.selectedSymbols || [];

			// 预计算K线节点的symbol配置ID列表
			const klineNodeSymbolIds = klineNodeSelectedSymbols.map(
				(klineSymbol) => klineSymbol.configId,
			);

			// 开始处理指标节点和ifElse节点
			return nodes.map((node) => {
				const isConnectedIndicatorNode = connectedIndicatorNodes.some(
					(in_) => in_.id === node.id,
				);
				const isConnectedIfElseNode = connectedIfElseNodes.some(
					(ifElseNode) => ifElseNode.id === node.id,
				);

				// 如果节点是指标节点，则更新指标节点配置的selectedSymbol
				if (isConnectedIndicatorNode && node.type === NodeType.IndicatorNode) {
					const updatedNode = updateIndicatorNode(
						node,
						klineNodeSelectedSymbols,
					);
					return updatedNode || node;
				}

				// 如果节点是ifElse节点，则更新ifElse节点变量
				else if (isConnectedIfElseNode && node.type === NodeType.IfElseNode) {
					const updatedNode = updateIfElseNode(
						node,
						klineNodeId,
						klineNodeSymbolIds,
					);
					return updatedNode || node;
				}

				return node;
			});
		},
		[],
	);

	/**
	 * 处理K线节点变化
	 */
	const handleKlineNodeChange = useCallback(
		(oldNode: Node, newNode: Node, nodes: Node[], edges: Edge[]): Node[] => {
			const klineNodeId = newNode.id;
			const oldKlineData = oldNode.data as KlineNodeData;
			const newKlineData = newNode.data as KlineNodeData;

			let updatedNodes = nodes;
			let hasChanged = false;

			if (oldKlineData.backtestConfig !== newKlineData.backtestConfig) {
				if (newKlineData.backtestConfig) {
					updatedNodes = handleBacktestConfigChanged(
						klineNodeId,
						updatedNodes,
						edges,
					);
					hasChanged = true;
				}
			}

			if (oldKlineData.liveConfig !== newKlineData.liveConfig) {
				console.log("KlineNode liveConfig changed");
			}

			if (oldKlineData.simulateConfig !== newKlineData.simulateConfig) {
				console.log("KlineNode simulateConfig changed");
			}

			return hasChanged ? updatedNodes : nodes;
		},
		[handleBacktestConfigChanged],
	);

	return {
		handleKlineNodeChange,
	};
};
