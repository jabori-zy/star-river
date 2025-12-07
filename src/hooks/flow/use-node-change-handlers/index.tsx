import type { Edge, Node, NodeChange } from "@xyflow/react";
import { useCallback } from "react";
import { NodeType } from "@/types/node";
import { useIndicatorNodeChangeHandler } from "./use-indicator-node-change-handler";
import { useKlineNodeChangeHandler } from "./use-kline-node-change-handler";
import { useVarNodeChangeHandler } from "./use-var-node-change-handler";

/**
 * Hook for handling node changes
 */
const useNodeChangeHandlers = () => {
	const { handleKlineNodeChange } = useKlineNodeChangeHandler();
	const { handleIndicatorNodeChange } = useIndicatorNodeChangeHandler();
	const { handleVarNodeChange } = useVarNodeChangeHandler();

	/**
	 * Main logic for handling node changes
	 */
	const handleNodeChanges = useCallback(
		(
			changes: NodeChange[],
			oldNodes: Node[],
			newNodes: Node[],
			edges: Edge[],
		): Node[] => {
			// Nodes that need to be updated
			let updatedNodes = newNodes;
			// Check if any node data has changed
			for (const change of changes) {
				if (change.type === "replace") {
					const newNode = change.item;

					if (change.item.type === NodeType.KlineNode) {
						// const oldNode = oldNodes.find((n) => n.id === change.item.id);
						// if (oldNode) {
						// 	updatedNodes = handleKlineNodeChange(
						// 		oldNode,
						// 		newNode,
						// 		newNodes,
						// 		edges,
						// 	);
						// }
					} else if (change.item.type === NodeType.IndicatorNode) {
						const oldNode = oldNodes.find((n) => n.id === change.item.id);
						if (oldNode) {
							updatedNodes = handleIndicatorNodeChange(
								oldNode,
								newNode,
								newNodes,
								edges,
							);
						}
					} else if (change.item.type === NodeType.VariableNode) {
						const oldNode = oldNodes.find((n) => n.id === change.item.id);
						if (oldNode) {
							updatedNodes = handleVarNodeChange(
								oldNode,
								newNode,
								newNodes,
								edges,
							);
						}
					}
				}
			}

			return updatedNodes;
		},
		[handleKlineNodeChange, handleIndicatorNodeChange, handleVarNodeChange],
	);

	return {
		handleNodeChanges,
	};
};

export default useNodeChangeHandlers;
