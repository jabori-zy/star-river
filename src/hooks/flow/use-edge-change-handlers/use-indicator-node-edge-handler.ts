import { useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";
import { NodeType } from "@/types/node/index";
import type { IfElseNodeData } from "@/types/node/if-else-node";
import type { IndicatorNodeData } from "@/types/node/indicator-node";



export const useIndicatorNodeEdgeHandler = () => {

    const handleIndicatorNodeEdgeRemoved = useCallback((
        indicatorNode: Node,
        deletedEdge: Edge,
        nodes: Node[],
    ): Node[] => {
        //1. 找到targetNode
        const targetNode = nodes.find((node) => node.id === deletedEdge.target);
        const sourceHandleId = deletedEdge.sourceHandle;
        // 对应的indicatorNode中的指标配置Id
        const indicatorConfigId = (indicatorNode.data as IndicatorNodeData).backtestConfig?.exchangeModeConfig?.selectedIndicators?.find((indicator) => indicator.outputHandleId === sourceHandleId)?.configId;

        console.log("indicatorConfigId", indicatorConfigId);
        if (!targetNode) return nodes;
        //2. 判断节点类型
        if (targetNode.type === NodeType.IfElseNode) {
            const indicatorNodeId = indicatorNode.id;
            const ifElseNodeData = targetNode.data as IfElseNodeData;
            if (ifElseNodeData.backtestConfig) {
                const cases = ifElseNodeData.backtestConfig.cases;
                // 重置cases中与indicatorNode相关的变量\
                // 条件: leftVariable或rightVariable的nodeId为indicatorNodeId，并且variableConfigId === indicatorConfigId
                const updatedCases = cases.map((caseItem) => ({
                    ...caseItem,
                    conditions: caseItem.conditions.map((condition) => ({
                        ...condition,
                        leftVariable: condition.leftVariable?.nodeId === indicatorNodeId && condition.leftVariable?.variableConfigId === indicatorConfigId
                            ? null : condition.leftVariable,
                        rightVariable: condition.rightVariable?.nodeId === indicatorNodeId && condition.rightVariable?.variableConfigId === indicatorConfigId
                            ? {
                                varType: condition.rightVariable.varType,
                                nodeId: null,
                                outputHandleId: null,
                                variableConfigId: null,
                                variable: null,
                                nodeName: null,
                            } : condition.rightVariable,
                    }))
                }));
                return nodes.map((node) => {
                    if (node.id === targetNode.id) {
                        return {
                            ...node,
                            data: { ...ifElseNodeData, backtestConfig: { ...ifElseNodeData.backtestConfig, cases: updatedCases } },
                        };
                    }
                    return node;
                });
            }
        }
        return nodes;
    }, []);

    return {
        handleIndicatorNodeEdgeRemoved,
    };
}