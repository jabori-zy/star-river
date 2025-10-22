import type { Edge, Node, NodeChange } from "@xyflow/react";
import { useCallback } from "react";
import { NodeType } from "@/types/node";
import { useIndicatorNodeChangeHandler } from "./use-indicator-node-change-handler";
import { useKlineNodeChangeHandler } from "./use-kline-node-change-handler";
import { useVarNodeChangeHandler } from "./use-var-node-change-handler";

/**
 * 节点变更处理相关的hook
 */
const useNodeChangeHandlers = () => {
	const { handleKlineNodeChange } = useKlineNodeChangeHandler();
	const { handleIndicatorNodeChange } = useIndicatorNodeChangeHandler();
	const { handleVarNodeChange } = useVarNodeChangeHandler();

	/**
	 * 处理节点变化的主要逻辑
	 */
	const handleNodeChanges = useCallback(
		(
			changes: NodeChange[],
			oldNodes: Node[],
			newNodes: Node[],
			edges: Edge[],
		): Node[] => {
			// 需要更新的节点
			let updatedNodes = newNodes;
			// 检查是否有节点的数据发生变化
			for (const change of changes) {
				if (change.type === "replace") {
					const newNode = change.item;

					if (change.item.type === NodeType.KlineNode) {
						const oldNode = oldNodes.find((n) => n.id === change.item.id);
						if (oldNode) {
							updatedNodes = handleKlineNodeChange(
								oldNode,
								newNode,
								newNodes,
								edges,
							);
						}
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
