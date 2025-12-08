import { type Edge, getOutgoers, type Node } from "@xyflow/react";
import { useCallback } from "react";
import type { IfElseNodeData, Variable } from "@/types/node/if-else-node";
import { NodeType } from "@/types/node/index";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
import type { KlineNodeData, SelectedSymbol } from "@/types/node/kline-node";
import { createEmptyRightVariable } from "./utils";

/**
 * Check if variable needs to be cleared
 * @param variable Variable to check
 * @param klineNodeId Kline node ID
 * @param klineNodeSymbolIds Valid symbol config ID list of kline node
 * @returns Whether the variable needs to be cleared
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
 * Check if indicator node's selectedSymbol needs to be cleared
 * @param selectedSymbol Indicator node's selectedSymbol
 * @param klineNodeSelectedSymbols Kline node's symbol config list
 * @returns Whether it needs to be cleared
 */
const shouldClearIndicatorSymbol = (
	selectedSymbol: SelectedSymbol | null,
	klineNodeSelectedSymbols: SelectedSymbol[],
): boolean => {
	if (!selectedSymbol) {
		return false;
	}
	// If configId doesn't exist in Kline node's symbol config, it needs to be cleared
	return !klineNodeSelectedSymbols.some(
		(klineSymbol) => klineSymbol.configId === selectedSymbol.configId,
	);
};

/**
 * Check if indicator node's selectedSymbol needs to be updated
 * @param selectedSymbol Indicator node's selectedSymbol
 * @param klineNodeSelectedSymbols Kline node's symbol config list
 * @returns Whether it needs to be updated
 */
const shouldUpdateIndicatorSymbol = (
	selectedSymbol: SelectedSymbol | null,
	klineNodeSelectedSymbols: SelectedSymbol[],
): boolean => {
	if (!selectedSymbol) {
		return false;
	}
	// Find Kline symbol config with the same configId
	const matchingKlineSymbol = klineNodeSelectedSymbols.find(
		(klineSymbol) => klineSymbol.configId === selectedSymbol.configId,
	);
	if (!matchingKlineSymbol) {
		return false;
	}
	// If configId is the same but symbol or interval differs, update is needed
	return (
		matchingKlineSymbol.symbol !== selectedSymbol.symbol ||
		matchingKlineSymbol.interval !== selectedSymbol.interval
	);
};

/**
 * Update indicator node's selectedSymbol configuration
 * @param selectedSymbol Indicator node's selectedSymbol
 * @param klineNodeSelectedSymbols Kline node's symbol config list
 * @returns Updated selectedSymbol or original selectedSymbol
 */
const updateIndicatorSymbol = (
	selectedSymbol: SelectedSymbol | null,
	klineNodeSelectedSymbols: SelectedSymbol[],
): SelectedSymbol | null => {
	if (!selectedSymbol) {
		return selectedSymbol;
	}

	// Find the corresponding Kline symbol config
	const matchingKlineSymbol = klineNodeSelectedSymbols.find(
		(klineSymbol) => klineSymbol.configId === selectedSymbol.configId,
	);

	if (!matchingKlineSymbol) {
		return selectedSymbol;
	}

	// Update symbol and interval fields
	return {
		...selectedSymbol,
		symbol: matchingKlineSymbol.symbol,
		interval: matchingKlineSymbol.interval,
	};
};

/**
 * Update indicator node's selectedSymbol configuration
 * @param node Node object
 * @param klineNodeSelectedSymbols Kline node's symbol config list
 * @returns Updated node or null (if no update needed)
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

	// Check if clearing or updating is needed
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
 * Update IfElse node's variable configuration
 * @param node Node object
 * @param klineNodeId Kline node ID
 * @param klineNodeSymbolIds Valid symbol config ID list of kline node
 * @returns Updated node or null (if no update needed)
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

	// Check if there are variables that need to be cleared
	for (const caseItem of cases) {
		for (const condition of caseItem.conditions) {
			const leftVariable = condition.left;
			const rightVariable = condition.right;

			if (leftVariable) {
				// If left variable matches the kline node id
				if (
					shouldClearVariable(leftVariable, klineNodeId, klineNodeSymbolIds)
				) {
					// Clear left variable config
					console.log("leftVariable configId", leftVariable.varConfigId);
					needsUpdate = true;
					break;
				}
			}

			if (rightVariable) {
				// If right variable matches the kline node id
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

	// If update is needed, create new node data
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
 * Hook for handling kline node changes
 */
export const useKlineNodeChangeHandler = () => {
	/**
	 * Handle backtest configuration changes
	 */
	const handleBacktestConfigChanged = useCallback(
		(klineNodeId: string, nodes: Node[], edges: Edge[]): Node[] => {
			// Get kline node
			const klineNode = nodes.find((node) => node.id === klineNodeId);
			if (!klineNode) return nodes;
			const klineNodeData = klineNode.data as KlineNodeData;

			// Find all connected nodes
			const connectedNodes = getOutgoers(klineNode, nodes, edges);
			// Get all connected indicator nodes
			const connectedIndicatorNodes = connectedNodes.filter(
				(node) => node.type === NodeType.IndicatorNode,
			);
			// Get all connected ifElse nodes
			const connectedIfElseNodes = connectedNodes.filter(
				(node) => node.type === NodeType.IfElseNode,
			);

			// If there are no connections, return directly
			if (
				connectedIndicatorNodes.length === 0 &&
				connectedIfElseNodes.length === 0
			)
				return nodes;

			// Get kline node's configured symbols
			const klineNodeSelectedSymbols =
				klineNodeData.backtestConfig?.exchangeModeConfig?.selectedSymbols || [];

			// Pre-calculate Kline node's symbol config ID list
			const klineNodeSymbolIds = klineNodeSelectedSymbols.map(
				(klineSymbol) => klineSymbol.configId,
			);

			// Start processing indicator nodes and ifElse nodes
			return nodes.map((node) => {
				const isConnectedIndicatorNode = connectedIndicatorNodes.some(
					(in_) => in_.id === node.id,
				);
				const isConnectedIfElseNode = connectedIfElseNodes.some(
					(ifElseNode) => ifElseNode.id === node.id,
				);

				// If node is indicator node, update indicator node's selectedSymbol config
				if (isConnectedIndicatorNode && node.type === NodeType.IndicatorNode) {
					const updatedNode = updateIndicatorNode(
						node,
						klineNodeSelectedSymbols,
					);
					return updatedNode || node;
				}

				// If node is ifElse node, update ifElse node variables
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
	 * Handle kline node changes
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
