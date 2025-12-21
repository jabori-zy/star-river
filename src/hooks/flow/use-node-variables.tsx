import { type Connection, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import type { CaseItem, IfElseNodeData } from "@/types/node/if-else-node";
import { isDefaultOutputHandleId, NodeType } from "@/types/node/index";
import type {
	IndicatorNodeData,
	SelectedIndicator,
} from "@/types/node/indicator-node";
import type { KlineNodeData, SelectedSymbol } from "@/types/node/kline-node";
import type {
	VariableConfig,
	VariableNodeData,
} from "@/types/node/variable-node";
import { TradeMode } from "@/types/strategy";
import type { OperationGroupData } from "@/types/node/group/operation-group";
import type { OperationOutputConfig, OperationInputConfig } from "@/types/node/group/operation-group";
import type { OperationNodeData, OutputConfig } from "@/types/node/operation-node";

// Define variable item type for storing node variable information
export interface VariableItem {
	nodeId: string;
	nodeName: string;
	nodeType: NodeType;
	variables: (SelectedIndicator | SelectedSymbol | VariableConfig | OperationOutputConfig | OperationInputConfig | OutputConfig)[]; // Can contain data from indicator nodes, kline nodes, variable nodes, and operation nodes
}

/**
 * Hook for node variable management
 */
const useNodeVariables = () => {
	// Get ReactFlow node information
	const { getNode } = useReactFlow();

	/**
	 * Add or update variable options in the variable list
	 * @param variableList Current variable list
	 * @param nodeId Node ID
	 * @param nodeName Node name
	 * @param nodeType Node type
	 * @param variable Variable to add
	 */
	const addOrUpdateVariableItem = useCallback(
		(
			variableList: VariableItem[],
			nodeId: string,
			nodeName: string,
			nodeType: NodeType,
			variable: SelectedIndicator | SelectedSymbol | VariableConfig | OperationOutputConfig | OperationInputConfig | OutputConfig,
		) => {
			// Find if a variable item with the same node ID already exists
			const existingItem = variableList.find((item) => item.nodeId === nodeId);

			if (existingItem) {
				// Check if a variable already exists to avoid duplicates
				// For OperationGroup output, OperationStartNode input, and OperationNode output, use configId for comparison
				// since inputConfigs don't have outputHandleId property
				const existingVariable = existingItem.variables.find((v) => {
					if (nodeType === NodeType.OperationGroup || nodeType === NodeType.OperationStartNode || nodeType === NodeType.OperationNode) {
						return v.configId === variable.configId;
					}
					return 'outputHandleId' in v && 'outputHandleId' in variable && v.outputHandleId === variable.outputHandleId;
				});
				if (!existingVariable) {
					existingItem.variables.push(variable);
				}
			} else {
				// Create a new variable item
				variableList.push({
					nodeId,
					nodeName,
					nodeType,
					variables: [variable],
				});
			}
		},
		[],
	);

	/**
	 * Get variable information from connected nodes (specific to ifelse nodes)
	 * Traverse all connections, collect variable information from source nodes for use by subsequent nodes
	 * @param connections Connection list
	 * @param tradeMode Trading mode (live/backtest)
	 * @returns Variable item list
	 */
	const getConnectedNodeVariables = useCallback(
		(connections: Connection[], tradeMode: TradeMode) => {
			const tempVariableItemList: VariableItem[] = [];

			// Iterate through all connections to collect variable information
			for (const connection of connections) {
				const sourceNodeId = connection.source;
				const sourceHandleId = connection.sourceHandle;

				// Skip this connection if sourceHandleId is empty
				if (!sourceHandleId) continue;

				// Check if upstream node has default output handle, if so, add all variables
				const isDefaultOutput = isDefaultOutputHandleId(sourceHandleId);
				const node = getNode(sourceNodeId);

				if (!node) continue;

				const nodeType = node.type as NodeType;

				// Handle variable collection based on node type
				if (nodeType === NodeType.IndicatorNode) {
					// Handle indicator node
					const indicatorNodeData = node.data as IndicatorNodeData;
					const selectedIndicators =
						tradeMode === TradeMode.LIVE
							? indicatorNodeData?.liveConfig?.selectedIndicators
							: indicatorNodeData?.backtestConfig?.exchangeModeConfig
									?.selectedIndicators;

					if (isDefaultOutput) {
						// Default output: add all indicator variables
						selectedIndicators?.forEach((indicator: SelectedIndicator) => {
							addOrUpdateVariableItem(
								tempVariableItemList,
								node.id,
								indicatorNodeData.nodeName,
								NodeType.IndicatorNode,
								indicator,
							);
						});
					} else {
						// Specific output: only add matching indicator variable
						const selectedIndicator = selectedIndicators?.find(
							(indicator: SelectedIndicator) =>
								indicator.outputHandleId === sourceHandleId,
						);
						if (selectedIndicator) {
							addOrUpdateVariableItem(
								tempVariableItemList,
								node.id,
								indicatorNodeData.nodeName,
								NodeType.IndicatorNode,
								selectedIndicator,
							);
						}
					}
				}
				// Collect kline node variables
				else if (nodeType === NodeType.KlineNode) {
					// Handle kline node
					const klineNodeData = node.data as KlineNodeData;
					const selectedSymbols =
						tradeMode === TradeMode.LIVE
							? klineNodeData?.liveConfig?.selectedSymbols
							: klineNodeData?.backtestConfig?.exchangeModeConfig
									?.selectedSymbols;

					if (isDefaultOutput) {
						// Default output: add all kline variables
						selectedSymbols?.forEach((symbol: SelectedSymbol) => {
							addOrUpdateVariableItem(
								tempVariableItemList,
								node.id,
								klineNodeData.nodeName,
								NodeType.KlineNode,
								symbol,
							);
						});
					} else {
						// Specific output: only add matching kline variable
						const selectedSymbol = selectedSymbols?.find(
							(symbol: SelectedSymbol) =>
								symbol.outputHandleId === sourceHandleId,
						);
						if (selectedSymbol) {
							addOrUpdateVariableItem(
								tempVariableItemList,
								node.id,
								klineNodeData.nodeName,
								NodeType.KlineNode,
								selectedSymbol,
							);
						}
					}
				} else if (nodeType === NodeType.VariableNode) {
					// Handle variable node
					const variableNodeData = node.data as VariableNodeData;
					const variableConfigs =
						tradeMode === TradeMode.LIVE
							? variableNodeData?.liveConfig?.variableConfigs
							: variableNodeData?.backtestConfig?.variableConfigs;

					if (isDefaultOutput) {
						// Default output: add all variable configs
						variableConfigs?.forEach((variableConfig: VariableConfig) => {
							addOrUpdateVariableItem(
								tempVariableItemList,
								node.id,
								variableNodeData.nodeName,
								NodeType.VariableNode,
								variableConfig,
							);
						});
					} else {
						// Specific output: only add matching variable config
						const variableConfig = variableConfigs?.find(
							(config: VariableConfig) =>
								config.outputHandleId === sourceHandleId,
						);
						if (variableConfig) {
							addOrUpdateVariableItem(
								tempVariableItemList,
								node.id,
								variableNodeData.nodeName,
								NodeType.VariableNode,
								variableConfig,
							);
						}
					}
				} else if (nodeType === NodeType.OperationGroup) {
					// Handle operation group node (only has default output)
					const operationGroupNodeData = node.data as OperationGroupData;
					operationGroupNodeData.outputConfigs.forEach((outputConfig: OperationOutputConfig) => {
						addOrUpdateVariableItem(
							tempVariableItemList,
							node.id,
							operationGroupNodeData.nodeName,
							NodeType.OperationGroup,
							outputConfig,
						);
					});
				}
				else if (nodeType === NodeType.OperationStartNode) {
					if (!node.parentId) continue;
					const parentNode = getNode(node.parentId);
					if (!parentNode) continue;
					const parentNodeData = parentNode.data as OperationGroupData;
					parentNodeData.inputConfigs.forEach((inputConfig: OperationInputConfig) => {
						// Use parent Group's info for nodeId/nodeName/nodeType
						addOrUpdateVariableItem(
							tempVariableItemList,
							parentNode.id,
							parentNodeData.nodeName,
							NodeType.OperationGroup,
							inputConfig,
						);
					});
				}
				else if (nodeType === NodeType.OperationNode) {
					// Handle operation node (single output config)
					const operationNodeData = node.data as OperationNodeData;
					const outputConfig = operationNodeData.outputConfig;
					if (outputConfig) {
						addOrUpdateVariableItem(
							tempVariableItemList,
							node.id,
							operationNodeData.nodeName,
							NodeType.OperationNode,
							outputConfig,
						);
					}
				}
			}

			return tempVariableItemList;
		},
		[getNode, addOrUpdateVariableItem],
	);

	/**
	 * Get case information from upstream if-else nodes
	 * Used to collect case configurations from if-else nodes connected to the current node
	 * @param connections Connection list
	 * @param tradeMode Trading mode (live/backtest)
	 * @returns List of case information, including node info and corresponding case configurations
	 */
	const getIfElseNodeCases = useCallback(
		(connections: Connection[], tradeMode: TradeMode) => {
			// Import IfElseNodeData and CaseItem types
			const tempCaseList: Array<{
				nodeId: string;
				nodeName: string;
				nodeType: NodeType;
				caseItem: CaseItem | string;
			}> = [];

			// Iterate through all connections to collect if-else node case information
			for (const connection of connections) {
				const sourceNodeId = connection.source;
				const sourceHandleId = connection.sourceHandle;

				// Skip this connection if sourceHandleId is empty
				if (!sourceHandleId) continue;

				const node = getNode(sourceNodeId);
				if (!node) continue;

				const nodeType = node.type as NodeType;

				// Only handle if-else nodes
				if (nodeType === NodeType.IfElseNode) {
					// Dynamically import types to avoid circular dependencies
					const ifElseNodeData = node.data as IfElseNodeData; // Use any to avoid direct import of IfElseNodeData

					// if_else_node_1762999781229_v36t5s0_else_output split by "_"
					const sourceHandleIdParts = sourceHandleId.split("_");
					if (sourceHandleIdParts[sourceHandleIdParts.length - 2] === "else") {
						tempCaseList.push({
							nodeId: node.id,
							nodeName: ifElseNodeData.nodeName,
							nodeType: NodeType.IfElseNode,
							caseItem: "else",
						});
						continue;
					}

					// Get the corresponding config based on trade mode
					const cases =
						tradeMode === TradeMode.LIVE
							? ifElseNodeData?.liveConfig?.cases
							: ifElseNodeData?.backtestConfig?.cases;

					// Find matching case (by outputHandleId)
					const matchedCase = cases?.find(
						(caseItem: CaseItem) => caseItem.outputHandleId === sourceHandleId,
					);
					if (matchedCase) {
						tempCaseList.push({
							nodeId: node.id,
							nodeName: ifElseNodeData.nodeName,
							nodeType: NodeType.IfElseNode,
							caseItem: matchedCase,
						});
					}
				}
			}

			return tempCaseList;
		},
		[getNode],
	);

	return {
		getConnectedNodeVariables,
		getIfElseNodeCases,
	};
};

export default useNodeVariables;
