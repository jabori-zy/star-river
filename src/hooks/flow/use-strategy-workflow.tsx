import { useReactFlow,IsValidConnection,Connection,Edge } from "@xyflow/react"
import { NodeType } from "@/types/node/index"
import { useCallback } from "react"
import { IndicatorNodeData, SelectedIndicator } from "@/types/node/indicator-node"
import { KlineNodeData, SelectedSymbol } from "@/types/node/kline-node"
import { VariableNodeData, VariableConfig } from "@/types/node/variable-node"
import { TradeMode } from "@/types/strategy"
import { isDefaultOutputHandleId } from "@/types/node/index"
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";

// 定义变量项类型，用于存储节点变量信息
export interface VariableItem {
    nodeId: string;
    nodeName: string;
    nodeType: NodeType;
    variables: (SelectedIndicator | SelectedSymbol | VariableConfig)[]; // 可以包含指标节点、K线节点和变量节点的数据
}

// 节点连接支持映射表 - 定义每种节点类型可以连接到哪些节点类型
const NodeSupportConnectionMap: Record<NodeType, NodeType[]> = {
    [NodeType.StartNode]: [NodeType.KlineNode,NodeType.IfElseNode,NodeType.VariableNode],
    [NodeType.KlineNode]: [NodeType.IndicatorNode,NodeType.IfElseNode, NodeType.VariableNode],
    [NodeType.IndicatorNode]: [NodeType.IfElseNode, NodeType.VariableNode],
    [NodeType.IfElseNode]: [NodeType.FuturesOrderNode, NodeType.VariableNode],
    [NodeType.FuturesOrderNode]: [NodeType.IfElseNode,NodeType.PositionManagementNode, NodeType.VariableNode],
    [NodeType.PositionManagementNode]: [NodeType.IfElseNode, NodeType.VariableNode],
    [NodeType.VariableNode]: [NodeType.IfElseNode],
}

// 节点连接数量限制 - 定义每种节点类型最多可以被连接的次数（-1表示无限制）
const NodeSupportConnectionLimit: Record<NodeType, number> = {
    [NodeType.StartNode]: 0,
    [NodeType.KlineNode]: 1,
    [NodeType.IndicatorNode]: 1,
    [NodeType.IfElseNode]: -1, // -1代表不限制
    [NodeType.FuturesOrderNode]: -1,
    [NodeType.PositionManagementNode]: -1,
    [NodeType.VariableNode]: -1,
}

const useStrategyWorkflow = () => {

    // 获取 ReactFlow 的节点和连接信息
    const {getNode, getNodeConnections} = useReactFlow()

    /**
     * 向变量列表中添加或更新变量项
     * @param variableList 当前变量列表
     * @param nodeId 节点ID
     * @param nodeName 节点名称
     * @param nodeType 节点类型
     * @param variable 要添加的变量
     */
    const addOrUpdateVariableItem = useCallback((
        variableList: VariableItem[], 
        nodeId: string, 
        nodeName: string, 
        nodeType: NodeType, 
        variable: SelectedIndicator | SelectedSymbol | VariableConfig
    ) => {
        // 查找是否已存在相同节点ID的变量项
        const existingItem = variableList.find(item => item.nodeId === nodeId);
        
        if (existingItem) {
            // 检查是否已存在相同handleId的变量，避免重复添加
            const existingVariable = existingItem.variables.find(v => v.outputHandleId === variable.outputHandleId);
            if (!existingVariable) {
                existingItem.variables.push(variable);
            }
        } else {
            // 创建新的变量项
            variableList.push({
                nodeId,
                nodeName,
                nodeType,
                variables: [variable]
            });
        }
    }, []);

    /**
     * 检查连接是否有效
     * 根据节点类型和连接限制来判断两个节点之间是否可以建立连接
     */
    const checkIsValidConnection: IsValidConnection = (connection: Connection | Edge): boolean => {
        const sourceNodeId = connection.source;
        const targetNodeId = connection.target;

        // 获取源节点和目标节点
        const sourceNode = getNode(sourceNodeId);
        const targetNode = getNode(targetNodeId);
        
        // 节点不存在则连接无效
        if (!sourceNode || !targetNode) {
            return false;
        }

        // 检查源节点是否支持连接到目标节点类型
        const supportedConnections = NodeSupportConnectionMap[sourceNode.type as NodeType];
        if (!supportedConnections || !supportedConnections.includes(targetNode.type as NodeType)) {
            return false;
        }

        // 检查目标节点的连接数量限制
        const targetNodeConnections = getNodeConnections({nodeId: targetNodeId});
        const targetNodeSupportConnectionLimit = NodeSupportConnectionLimit[targetNode.type as NodeType];
        
        // -1表示无限制，直接允许连接
        if (targetNodeSupportConnectionLimit === -1) {
            return true;
        }
        
        // 检查是否超过连接数量限制
        return targetNodeSupportConnectionLimit > targetNodeConnections.length;
    };

    /**
     * 获取连接节点的变量信息
     * 遍历所有连接，收集源节点的变量信息，用于后续节点使用
     * @param connections 连接列表
     * @param tradeMode 交易模式（实盘/回测）
     * @returns 变量项列表
     */
    const getConnectedNodeVariables = useCallback((connections: Connection[], tradeMode: TradeMode) => {
        const tempVariableItemList: VariableItem[] = [];
        
        // 遍历所有连接，收集变量信息
        for (const connection of connections) {
            const sourceNodeId = connection.source;
            const sourceHandleId = connection.sourceHandle!;
            
            // 判断是否是默认输出句柄
            const isDefaultOutput = isDefaultOutputHandleId(sourceHandleId);
            const node = getNode(sourceNodeId);
            
            if (!node) continue;
            
            const nodeType = node.type as NodeType;
            
            // 根据节点类型分别处理变量收集
            if (nodeType === NodeType.IndicatorNode) {
                // 处理指标节点
                const indicatorNodeData = node.data as IndicatorNodeData;
                const selectedIndicators = tradeMode === TradeMode.LIVE 
                    ? indicatorNodeData?.liveConfig?.selectedIndicators 
                    : indicatorNodeData?.backtestConfig?.exchangeModeConfig?.selectedIndicators;

                if (isDefaultOutput) {
                    // 默认输出：添加所有指标变量
                    selectedIndicators?.forEach((indicator: SelectedIndicator) => {
                        addOrUpdateVariableItem(tempVariableItemList, node.id, indicatorNodeData.nodeName, NodeType.IndicatorNode, indicator);
                    });
                } else {
                    // 特定输出：只添加匹配的指标变量
                    const selectedIndicator = selectedIndicators?.find((indicator: SelectedIndicator) => 
                        indicator.handleId === sourceHandleId
                    );
                    if (selectedIndicator) {
                        addOrUpdateVariableItem(tempVariableItemList, node.id, indicatorNodeData.nodeName, NodeType.IndicatorNode, selectedIndicator);
                    }
                }
            }
            else if (nodeType === NodeType.KlineNode) {
                // 处理K线节点
                const klineNodeData = node.data as KlineNodeData;
                const selectedSymbols = tradeMode === TradeMode.LIVE 
                    ? klineNodeData?.liveConfig?.selectedSymbols 
                    : klineNodeData?.backtestConfig?.exchangeModeConfig?.selectedSymbols;

                if (isDefaultOutput) {
                    // 默认输出：添加所有K线变量
                    selectedSymbols?.forEach((symbol: SelectedSymbol) => {
                        addOrUpdateVariableItem(tempVariableItemList, node.id, klineNodeData.nodeName, NodeType.KlineNode, symbol);
                    });
                } else {
                    // 特定输出：只添加匹配的K线变量
                    const selectedSymbol = selectedSymbols?.find((symbol: SelectedSymbol) => 
                        symbol.handleId === sourceHandleId
                    );
                    if (selectedSymbol) {
                        addOrUpdateVariableItem(tempVariableItemList, node.id, klineNodeData.nodeName, NodeType.KlineNode, selectedSymbol);
                    }
                }
            }
            else if (nodeType === NodeType.VariableNode) {
                // 处理变量节点
                const variableNodeData = node.data as VariableNodeData;
                console.log("variableNodeData", variableNodeData);
                const variableConfigs = tradeMode === TradeMode.LIVE 
                    ? variableNodeData?.liveConfig?.variableConfigs 
                    : variableNodeData?.backtestConfig?.variableConfigs;

                if (isDefaultOutput) {
                    // 默认输出：添加所有变量配置
                    variableConfigs?.forEach((variableConfig: VariableConfig) => {
                        addOrUpdateVariableItem(tempVariableItemList, node.id, variableNodeData.nodeName, NodeType.VariableNode, variableConfig);
                    });
                } else {
                    // 特定输出：只添加匹配的变量配置
                    const variableConfig = variableConfigs?.find((config: VariableConfig) => 
                        config.inputHandleId === sourceHandleId
                    );
                    if (variableConfig) {
                        addOrUpdateVariableItem(tempVariableItemList, node.id, variableNodeData.nodeName, NodeType.VariableNode, variableConfig);
                    }
                }
            }
        }
        
        return tempVariableItemList;
    }, [getNode, addOrUpdateVariableItem]);


    // 获取回测模式的时间范围
    const getBacktestTimeRange = useCallback(() => {
        const backtestConfig = useStartNodeDataStore.getState().backtestConfig;
        return backtestConfig?.exchangeModeConfig?.timeRange;
    }, [])

    return {
        checkIsValidConnection,
        getConnectedNodeVariables,
        getBacktestTimeRange
    }
}

export default useStrategyWorkflow;