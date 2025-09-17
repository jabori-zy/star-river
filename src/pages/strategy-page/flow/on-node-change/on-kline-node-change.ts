import {
	type Edge,
	getOutgoers,
	type Node,
} from "@xyflow/react";
import type { KlineNodeData } from "@/types/node/kline-node";
import { NodeType } from "@/types/node/index";
import type { KlineNodeBacktestConfig } from "@/types/node/kline-node";
import type { IndicatorNodeData } from "@/types/node/indicator-node";





export const handleKlineNodeChange = (
    oldNode: Node,
	newNode: Node,
	nodes: Node[],
	edges: Edge[],
): Node[] => {
    console.log("nodes", nodes);

    const klineNodeId = newNode.id;
    const oldKlineData = oldNode.data as KlineNodeData;
    const newKlineData = newNode.data as KlineNodeData;

    let updatedNodes = nodes;
    let hasChanged = false;

    if (oldKlineData.backtestConfig !== newKlineData.backtestConfig) {
        console.log("KlineNode backtestConfig changed");
        if (oldKlineData.backtestConfig) {
            updatedNodes = handleBacktestConfigChanged(klineNodeId, updatedNodes, edges);
            hasChanged = true;
        }
    }
    if (oldKlineData.liveConfig !== newKlineData.liveConfig) {
        console.log("KlineNode liveConfig changed");
    }

    if (oldKlineData.simulateConfig !== newKlineData.simulateConfig) {
        console.log("KlineNode simulateConfig changed");
    }


    return hasChanged ? updatedNodes : nodes;
	
};


/**
 * 处理回测配置变化
 * @param oldKlineData 旧的k线节点数据
 * @param newKlineData 新的k线节点数据
 */
const handleBacktestConfigChanged = (klineNodeId: string, nodes: Node[], edges: Edge[]): Node[] => {
    // 获取k线节点
    const klineNode = nodes.find((node) => node.id === klineNodeId);
    if (!klineNode) return nodes;
    const klineNodeData = klineNode.data as KlineNodeData;

    // 找到所有target为指标节点的连接
    const connectedIndicatorNodes = getOutgoers(klineNode, nodes, edges).filter((node) => node.type === NodeType.IndicatorNode);
    if (connectedIndicatorNodes.length === 0) return nodes;

    // 获取k线节点配置的symbol
    const klineNodeSelectedSymbols = klineNodeData.backtestConfig?.exchangeModeConfig?.selectedSymbols;
    // 如果k线节点配置的symbol为空，则直接返回
    if (!klineNodeSelectedSymbols || klineNodeSelectedSymbols.length === 0) {
        return nodes;
    }

    
    return nodes.map((node) => {
        const isConnectedIndicatorNode = connectedIndicatorNodes.some((in_) => in_.id === node.id);

        // 如果节点是指标节点，则更新指标节点配置的selectedSymbol
        if (isConnectedIndicatorNode && node.type === NodeType.IndicatorNode) {
            const indicatorNodeData = node.data as IndicatorNodeData;

            if (indicatorNodeData.backtestConfig) {
                const indicatorNodeSelectedSymbol = indicatorNodeData.backtestConfig?.exchangeModeConfig?.selectedSymbol;

                // 判断indicatorNodeSelectedSymbol的configId与klineNodeSelectedSymbols中的configId相同的对象中的symbol和interval是否相同
                const isSymbolSame = indicatorNodeSelectedSymbol && klineNodeSelectedSymbols.some(
                    (klineSymbol) => klineSymbol.configId === indicatorNodeSelectedSymbol.configId &&
                                    klineSymbol.symbol === indicatorNodeSelectedSymbol.symbol &&
                                    klineSymbol.interval === indicatorNodeSelectedSymbol.interval
                );

                // 如果symbol不相同，清空selectedSymbol
                if (!isSymbolSame) {
                    return {
                        ...node,
                        data: {
                            ...indicatorNodeData,
                            backtestConfig: {
                                ...indicatorNodeData.backtestConfig,
                                exchangeModeConfig: {
                                    ...indicatorNodeData.backtestConfig?.exchangeModeConfig,
                                    selectedSymbol: null,
                                },
                            },
                        },
                    };
                }
            }
        }

        return node;
    });
}
