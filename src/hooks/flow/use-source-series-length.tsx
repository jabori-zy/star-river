import { type Connection, useReactFlow } from "@xyflow/react";
import { useCallback, useMemo } from "react";
import { isDefaultOutputHandleId, NodeType } from "@/types/node/index";
import type { IndicatorNodeData } from "@/types/node/indicator-node";
import type { KlineNodeData } from "@/types/node/kline-node";
import { TradeMode } from "@/types/strategy";

/**
 * Information about the source that limits the series length
 */
export interface SeriesLengthLimitInfo {
	nodeId: string;
	nodeName: string;
	nodeType: NodeType;
	seriesLength: number;
}

/**
 * Hook to get the minimum series length from upstream connected nodes
 * This is used to limit the rolling window size in OperationGroup
 *
 * Only processes KlineNode and IndicatorNode for now
 */
const useSourceSeriesLength = () => {
	const { getNode } = useReactFlow();

	/**
	 * Get series length info from a single connected node
	 */
	const getNodeSeriesLengthInfo = useCallback(
		(
			sourceNodeId: string,
			sourceHandleId: string,
			tradeMode: TradeMode,
		): SeriesLengthLimitInfo | null => {
			if (!sourceHandleId) return null;

			const node = getNode(sourceNodeId);
			if (!node) return null;

			const nodeType = node.type as NodeType;

			// Handle IndicatorNode
			if (nodeType === NodeType.IndicatorNode) {
				const indicatorNodeData = node.data as IndicatorNodeData;
				const seriesLength =
					tradeMode === TradeMode.BACKTEST
						? indicatorNodeData?.backtestConfig?.sourceSeriesLength
						: undefined;

				if (seriesLength !== undefined) {
					return {
						nodeId: node.id,
						nodeName: indicatorNodeData.nodeName,
						nodeType: NodeType.IndicatorNode,
						seriesLength,
					};
				}
			}
			// Handle KlineNode
			else if (nodeType === NodeType.KlineNode) {
				const klineNodeData = node.data as KlineNodeData;
				const seriesLength =
					tradeMode === TradeMode.BACKTEST
						? klineNodeData?.backtestConfig?.seriesLength
						: undefined;

				if (seriesLength !== undefined) {
					return {
						nodeId: node.id,
						nodeName: klineNodeData.nodeName,
						nodeType: NodeType.KlineNode,
						seriesLength,
					};
				}
			}

			return null;
		},
		[getNode],
	);

	/**
	 * Get the minimum series length from all connected upstream nodes
	 * Returns the node info with the smallest series length
	 *
	 * @param connections Connection list from useNodeConnections
	 * @param tradeMode Trading mode (LIVE/BACKTEST)
	 * @returns The limit info with smallest series length, or null if no limits found
	 */
	const getMinSeriesLengthLimit = useCallback(
		(
			connections: Connection[],
			tradeMode: TradeMode,
		): SeriesLengthLimitInfo | null => {
			let minLimitInfo: SeriesLengthLimitInfo | null = null;

			for (const connection of connections) {
				const sourceNodeId = connection.source;
				const sourceHandleId = connection.sourceHandle;

				if (!sourceHandleId) continue;

				const limitInfo = getNodeSeriesLengthInfo(
					sourceNodeId,
					sourceHandleId,
					tradeMode,
				);

				if (limitInfo) {
					if (!minLimitInfo || limitInfo.seriesLength < minLimitInfo.seriesLength) {
						minLimitInfo = limitInfo;
					}
				}
			}

			return minLimitInfo;
		},
		[getNodeSeriesLengthInfo],
	);

	/**
	 * Get all series length limits from connected upstream nodes
	 * Useful when you need to see all limits, not just the minimum
	 *
	 * @param connections Connection list from useNodeConnections
	 * @param tradeMode Trading mode (LIVE/BACKTEST)
	 * @returns Array of limit info for all connected nodes that have series length configured
	 */
	const getAllSeriesLengthLimits = useCallback(
		(
			connections: Connection[],
			tradeMode: TradeMode,
		): SeriesLengthLimitInfo[] => {
			const limits: SeriesLengthLimitInfo[] = [];

			for (const connection of connections) {
				const sourceNodeId = connection.source;
				const sourceHandleId = connection.sourceHandle;

				if (!sourceHandleId) continue;

				const limitInfo = getNodeSeriesLengthInfo(
					sourceNodeId,
					sourceHandleId,
					tradeMode,
				);

				if (limitInfo) {
					// Check if already added (avoid duplicates from multiple connections to same node)
					const exists = limits.some((l) => l.nodeId === limitInfo.nodeId);
					if (!exists) {
						limits.push(limitInfo);
					}
				}
			}

			return limits;
		},
		[getNodeSeriesLengthInfo],
	);

	return {
		getMinSeriesLengthLimit,
		getAllSeriesLengthLimits,
	};
};

export default useSourceSeriesLength;
