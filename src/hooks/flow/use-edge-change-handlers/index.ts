import { useCallback } from "react";
import { type Edge, type EdgeChange, type Node } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { NodeType } from "@/types/node/index";
import { useKlineNodeEdgeHandler } from "./use-kline-node-edge-handler";


const useEdgeChangeHandlers = () => {

    const { getNodes } = useReactFlow();
    const { handleKlineNodeEdgeRemoved } = useKlineNodeEdgeHandler();

	const handleEdgeChanges = useCallback((
		changes: EdgeChange[],
		oldEdges: Edge[],
		newEdges: Edge[],
	): [Edge[], Node[]] => {
        let updatedEdges = newEdges;
        let updatedNodes = getNodes();

        // 收集所有被删除的来自 klineNode 的边，按 sourceNode 分组
        const klineNodeRemovedEdges = new Map<string, Edge[]>();

        for (const change of changes) {
            if (change.type === "remove") {
                // 找到被删除的边
                const removedEdge = oldEdges.find((edge) => edge.id === change.id);
                if (removedEdge) {
                    // 确认被删除的边的sourceNodeId
                    const sourceNodeId = removedEdge.source;
                    // 确认sourceNodeId对应的节点类型
                    const sourceNode = updatedNodes.find((node) => node.id === sourceNodeId);
                    if (sourceNode && sourceNode.type === NodeType.KlineNode) {
                        // 收集来自同一个 klineNode 的边
                        if (!klineNodeRemovedEdges.has(sourceNodeId)) {
                            klineNodeRemovedEdges.set(sourceNodeId, []);
                        }
                        klineNodeRemovedEdges.get(sourceNodeId)!.push(removedEdge);
                    }
                }
            }
        }

        // 批量处理每个 klineNode 的边删除
        for (const [sourceNodeId, removedEdges] of klineNodeRemovedEdges) {
            const sourceNode = updatedNodes.find((node) => node.id === sourceNodeId);
            if (sourceNode) {
                // 处理每条被删除的边
                for (const removedEdge of removedEdges) {
                    updatedNodes = handleKlineNodeEdgeRemoved(sourceNode, removedEdge, updatedNodes);
                }
            }
        }
		return [updatedEdges, updatedNodes];
	}, []);

	return {
		handleEdgeChanges,
	};
};

export default useEdgeChangeHandlers;