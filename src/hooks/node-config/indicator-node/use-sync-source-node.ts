import { useNodeConnections, useNodesData } from "@xyflow/react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { StrategyFlowNode } from "@/types/node";
import { isKlineNode } from "@/types/node/index";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
import type { KlineNodeData, SelectedSymbol } from "@/types/node/kline-node";
import { useBacktestConfig } from "./use-update-backtest-config";

/**
 * Sync indicator node with source Kline node's Symbol configuration
 *
 * Responsibilities:
 * 1. Listen to source node connection changes
 * 2. Validate connection rules (only one source node allowed)
 * 3. Automatically sync Kline node's Symbol to Indicator node
 *
 * @param id - Indicator node ID
 * @param currentNodeData - Current node data (passed from external to avoid duplicate fetching)
 */
export const useSyncSourceNode = ({
	id,
	currentNodeData,
}: {
	id: string;
	currentNodeData: IndicatorNodeData;
}) => {
	const { updateSelectedSymbol } = useBacktestConfig({ id });

	// Get current node's input connections
	const connections = useNodeConnections({ id, handleType: "target" });
	const sourceNodes = useNodesData<StrategyFlowNode>(
		connections.map((connection) => connection.source),
	);

	useEffect(() => {
		// Rule 1: Indicator node can only have one source node
		if (sourceNodes.length > 1) {
			toast.error("indicator node only has one source node");
			return;
		}

		// Rule 2: Clear selected symbol when disconnected
		if (sourceNodes.length === 0) {
			updateSelectedSymbol(null);
			return;
		}

		// Rule 3: Can only connect to Kline node
		if (sourceNodes.length === 1) {
			if (!isKlineNode(sourceNodes[0])) {
				// Silent handling: If source node is not a Kline node, do nothing
				// toast.error("indicator node only has been connected by kline node");
				return;
			}

			// Sync Kline node's Symbol configuration
			syncSymbolFromKlineNode(
				sourceNodes[0].data as KlineNodeData,
				currentNodeData,
				updateSelectedSymbol,
			);
		}
	}, [sourceNodes, id, updateSelectedSymbol]);
};

/**
 * Sync Symbol from Kline node to Indicator node
 *
 * Sync rules:
 * 1. If Kline node has no Symbol configuration, clear Indicator node's selection
 * 2. If Indicator node has no selected Symbol, do nothing
 * 3. If Indicator node's Symbol doesn't exist in Kline node, clear selection
 * 4. If Symbol's symbol or interval changes, update selection
 *
 * @param klineNodeData - Kline node data
 * @param indicatorNodeData - Indicator node data
 * @param updateSelectedSymbol - Callback function to update Symbol
 */
function syncSymbolFromKlineNode(
	klineNodeData: KlineNodeData,
	indicatorNodeData: IndicatorNodeData,
	updateSelectedSymbol: (symbol: SelectedSymbol | null) => void,
) {
	// Get currently selected symbol of indicator node
	const selectedSymbol =
		indicatorNodeData?.backtestConfig?.exchangeModeConfig?.selectedSymbol;

	// If indicator node has no selected symbol, no need to sync
	if (!selectedSymbol) {
		return;
	}

	// Get Kline node's symbol configuration
	const klineNodeSymbols =
		klineNodeData.backtestConfig?.exchangeModeConfig?.selectedSymbols;

	// If Kline node has no symbol configuration, clear indicator node's selection
	if (!klineNodeSymbols || klineNodeSymbols.length === 0) {
		updateSelectedSymbol(null);
		return;
	}

	// Find matching symbol (match by configId)
	const matchingSymbol = klineNodeSymbols.find(
		(symbol) => symbol.configId === selectedSymbol.configId,
	);

	// If no matching symbol found, clear selection
	if (!matchingSymbol) {
		updateSelectedSymbol(null);
		return;
	}

	// If symbol or interval changes, update selection
	if (
		matchingSymbol.symbol !== selectedSymbol.symbol ||
		matchingSymbol.interval !== selectedSymbol.interval
	) {
		updateSelectedSymbol(matchingSymbol);
	}

	// If both symbol and interval haven't changed, do nothing
}
