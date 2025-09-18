import { useCallback } from "react";
import type { Edge, Node } from "@xyflow/react";
import type { IfElseNodeData } from "@/types/node/if-else-node";




export const useIfElseNodeChangeHandler = () => {

    const handleBacktestConfigChanged = useCallback((
        ifElseNodeId: string,
        nodes: Node[],
        edges: Edge[],
    ): Node[] => {
        return nodes;
    }, []);




    const handleIfElseNodeChange = useCallback((
        oldNode: Node,
        newNode: Node,
        nodes: Node[],
        edges: Edge[],
    ): Node[] => {
        const ifElseNodeId = newNode.id;
        const oldIfElseData = oldNode.data as IfElseNodeData;
        const newIfElseData = newNode.data as IfElseNodeData;

        let updatedNodes = nodes;
        let hasChanged = false;

        if (oldIfElseData.backtestConfig !== newIfElseData.backtestConfig) {
            if (newIfElseData.backtestConfig) {
                updatedNodes = handleBacktestConfigChanged(ifElseNodeId, updatedNodes, edges);
                hasChanged = true;
            }
        }
        return hasChanged ? updatedNodes : nodes;
    }, [handleBacktestConfigChanged]);

    return {
        handleIfElseNodeChange,
    };
}