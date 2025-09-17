import type {
	Edge,
	Node,
	NodeChange,
} from "@xyflow/react";
import { handleKlineNodeChange } from "./on-kline-node-change";





// 处理节点变化的主要逻辑
export const handleNodeChanges = (
	changes: NodeChange[],
	oldNodes: Node[],
	newNodes: Node[],
	edges: Edge[],
): Node[] => {
	// 需要更新的节点
	let updatedNodes = newNodes;
	console.log("changes", changes);

	// 检查是否有startNode的数据发生变化
	for (const change of changes) {
		if (change.type === "replace") {
			const newNode = change.item;
			
			// if (change.item.type === "startNode") {
			// 	const oldNode = newNodes.find((n) => n.id === change.item.id);
			// 	if (oldNode && newNode) {
			// 		updatedNodes = handleStartNodeChange(oldNode, newNode, updatedNodes, edges);
			// 		}
			// }

			if (change.item.type === "klineNode") {
				const oldNode = oldNodes.find((n) => n.id === change.item.id);
				if (oldNode) {
					updatedNodes = handleKlineNodeChange(oldNode, newNode, newNodes, edges);
				}
				
			}
		}
		
	}

	return updatedNodes;
};
