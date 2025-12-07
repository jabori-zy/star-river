import type { Edge, EdgeChange, Node } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { NodeType } from "@/types/node/index";
import { useIndicatorNodeEdgeHandler } from "./use-indicator-node-edge-handler";
import { useKlineNodeEdgeHandler } from "./use-kline-node-edge-handler";
import { useVarNodeEdgeHandler } from "./use-var-node-edge-handler";

const useEdgeChangeHandlers = () => {
	const { getNodes } = useReactFlow();
	const { handleKlineNodeEdgeRemoved } = useKlineNodeEdgeHandler();
	const { handleIndicatorNodeEdgeRemoved } = useIndicatorNodeEdgeHandler();
	const { handleVarNodeEdgeRemoved } = useVarNodeEdgeHandler();

	const handleEdgeChanges = useCallback(
		(
			changes: EdgeChange[],
			oldEdges: Edge[],
			newEdges: Edge[],
		): [Edge[], Node[]] => {
			const updatedEdges = newEdges;
			let updatedNodes = getNodes();
			// Collect all deleted edges from klineNode, grouped by sourceNode
			const klineNodeRemovedEdges = new Map<string, Edge[]>();
			const indicatorNodeRemovedEdges = new Map<string, Edge[]>();
			const varNodeRemovedEdges = new Map<string, Edge[]>();

			for (const change of changes) {
				if (change.type === "remove") {
					// Find the deleted edge
					const removedEdge = oldEdges.find((edge) => edge.id === change.id);
					if (removedEdge) {
						// Confirm the sourceNodeId of the deleted edge
						const sourceNodeId = removedEdge.source;
						// Confirm the node type corresponding to sourceNodeId
						const sourceNode = updatedNodes.find(
							(node) => node.id === sourceNodeId,
						);
						if (sourceNode && sourceNode.type === NodeType.KlineNode) {
							// Collect edges from the same klineNode
							if (!klineNodeRemovedEdges.has(sourceNodeId)) {
								klineNodeRemovedEdges.set(sourceNodeId, []);
							}
							const edges = klineNodeRemovedEdges.get(sourceNodeId);
							if (edges) {
								edges.push(removedEdge);
							}
						} else if (
							sourceNode &&
							sourceNode.type === NodeType.IndicatorNode
						) {
							if (!indicatorNodeRemovedEdges.has(sourceNodeId)) {
								indicatorNodeRemovedEdges.set(sourceNodeId, []);
							}
							const edges = indicatorNodeRemovedEdges.get(sourceNodeId);
							if (edges) {
								edges.push(removedEdge);
							}
						} else if (
							sourceNode &&
							sourceNode.type === NodeType.VariableNode
						) {
							if (!varNodeRemovedEdges.has(sourceNodeId)) {
								varNodeRemovedEdges.set(sourceNodeId, []);
							}
							const edges = varNodeRemovedEdges.get(sourceNodeId);
							if (edges) {
								edges.push(removedEdge);
							}
						}
					}
				}
			}

			// Batch process edge deletion for each klineNode
			// for (const [sourceNodeId, removedEdges] of klineNodeRemovedEdges) {
			// 	const sourceNode = updatedNodes.find(
			// 		(node) => node.id === sourceNodeId,
			// 	);
			// 	if (sourceNode) {
			// 		// Handle each deleted edge
			// 		for (const removedEdge of removedEdges) {
			// 			updatedNodes = handleKlineNodeEdgeRemoved(
			// 				sourceNode,
			// 				removedEdge,
			// 				updatedNodes,
			// 			);
			// 		}
			// 	}
			// }
			for (const [sourceNodeId, removedEdges] of indicatorNodeRemovedEdges) {
				const sourceNode = updatedNodes.find(
					(node) => node.id === sourceNodeId,
				);
				if (sourceNode) {
					for (const removedEdge of removedEdges) {
						updatedNodes = handleIndicatorNodeEdgeRemoved(
							sourceNode,
							removedEdge,
							updatedNodes,
						);
					}
				}
			}
			for (const [sourceNodeId, removedEdges] of varNodeRemovedEdges) {
				const sourceNode = updatedNodes.find(
					(node) => node.id === sourceNodeId,
				);
				if (sourceNode) {
					for (const removedEdge of removedEdges) {
						updatedNodes = handleVarNodeEdgeRemoved(
							sourceNode,
							removedEdge,
							updatedNodes,
						);
					}
				}
			}
			return [updatedEdges, updatedNodes];
		},
		[
			getNodes,
			handleKlineNodeEdgeRemoved,
			handleIndicatorNodeEdgeRemoved,
			handleVarNodeEdgeRemoved,
		],
	);

	return {
		handleEdgeChanges,
	};
};

export default useEdgeChangeHandlers;
