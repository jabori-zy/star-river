import { NodeProps, Position, useNodeConnections, useReactFlow } from "@xyflow/react";
import BaseNode from "@/components/flow/base/BaseNode";
import { Play } from "lucide-react";
import { type IndicatorNode } from "@/types/node/indicator-node";
import { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import { useEffect, useRef } from "react";
import { useUpdateLiveConfig } from "@/hooks/node/indicator-node/use-update-live-config";
import { useUpdateBacktestConfig } from "@/hooks/node/indicator-node/use-update-backtest-config";
import useTradingModeStore from "@/store/useTradingModeStore";
import { TradeMode } from "@/types/strategy";
import { KlineNodeData, SelectedSymbol } from "@/types/node/kline-node";
import LiveModeShow from "./components/live-mode-show";
import BacktestModeShow from "./components/backtest-mode-show";
import { NodeDefaultInputHandleId } from "@/types/node/index";

const IndicatorNode: React.FC<NodeProps<IndicatorNode>> = ({id, data, selected}) => {
    const nodeName = data?.nodeName || "指标节点";
    const { tradingMode } = useTradingModeStore();
    const { getNode } = useReactFlow();
    const lastConnectionRef = useRef<string | null>(null);
    
    // 使用分离的hooks
    const { updateLiveKlineInfo, setDefaultLiveConfig } = useUpdateLiveConfig({
        id,
        initialLiveConfig: data?.liveConfig
    });

    const { updateBacktestKlineInfo, setDefaultBacktestConfig } = useUpdateBacktestConfig({
        id,
        initialConfig: data?.backtestConfig
    });

    const connections = useNodeConnections({id});

    // 从连接的kline节点获取基础配置信息
    const getKlineNodeData = (klineNodeData: KlineNodeData, sourceHandleId: string | null) => {
        if (!sourceHandleId) return null;

        // 从所有可能的配置中查找匹配的symbol
        let selectedSymbol: SelectedSymbol | null = null;
        let exchange: string | null = null;
        let timeRange = null;

        // 优先从live配置获取
        if (klineNodeData.liveConfig?.selectedSymbols) {
            selectedSymbol = klineNodeData.liveConfig.selectedSymbols.find(
                symbol => symbol.handleId === sourceHandleId
            ) || null;
            exchange = klineNodeData.liveConfig.selectedLiveAccount?.exchange || null;
        }

        // 如果live配置没有，尝试从simulate配置获取
        if (!selectedSymbol && klineNodeData.simulateConfig?.selectedSymbols) {
            selectedSymbol = klineNodeData.simulateConfig.selectedSymbols.find(
                symbol => symbol.handleId === sourceHandleId
            ) || null;
            exchange = klineNodeData.simulateConfig.selectedSimulateAccount?.exchange || null;
        }

        // 如果都没有，尝试从backtest配置获取
        if (!selectedSymbol && klineNodeData.backtestConfig?.exchangeConfig?.selectedSymbols) {
            selectedSymbol = klineNodeData.backtestConfig.exchangeConfig.selectedSymbols.find(
                symbol => symbol.handleId === sourceHandleId
            ) || null;
            exchange = klineNodeData.backtestConfig.exchangeConfig?.selectedDataSource?.exchange || null;
            timeRange = klineNodeData.backtestConfig.exchangeConfig?.timeRange || null;
        }

        if (selectedSymbol && exchange) {
            return {
                exchange,
                symbol: selectedSymbol.symbol,
                interval: selectedSymbol.interval,
                timeRange
            };
        }

        return null;
    };

    // 当连接发生变化时，更新配置
    useEffect(() => {
        if (connections.length === 1) {
            const currentConnectionKey = `${connections[0].source}_${connections[0].sourceHandle}`;
            
            // 只在连接真正改变时才更新
            if (lastConnectionRef.current !== currentConnectionKey) {
                const connection = connections[0];
                const klineNodeId = connection.source;
                const sourceHandleId = connection.sourceHandle;

                const klineNode = getNode(klineNodeId);
                if (!klineNode) return;

                const klineNodeData = klineNode.data as KlineNodeData;
                const configInfo = getKlineNodeData(klineNodeData, sourceHandleId);

                if (configInfo) {
                    const { exchange, symbol, interval, timeRange } = configInfo;
                    
                    // 更新live配置
                    updateLiveKlineInfo(exchange, symbol, interval);
                    
                    // 更新backtest配置
                    if (timeRange) {
                        updateBacktestKlineInfo(exchange, symbol, interval, timeRange);
                    }
                }
                
                lastConnectionRef.current = currentConnectionKey;
            }
        } else {
            // 没有连接时清理引用
            lastConnectionRef.current = null;
        }
    }, [connections, getNode, updateLiveKlineInfo, updateBacktestKlineInfo]);

    // 初始化时设置默认配置
    useEffect(() => {
        if (!data?.liveConfig) {
            setDefaultLiveConfig();
        }
        if (!data?.backtestConfig) {
            setDefaultBacktestConfig();
        }
    }, [setDefaultLiveConfig, setDefaultBacktestConfig, data?.liveConfig, data?.backtestConfig]);

    const defaultInputHandle: BaseHandleProps = {
        id: NodeDefaultInputHandleId.IndicatorNodeInput,
        type: 'target',
        position: Position.Left,
        handleColor: '!bg-red-400',
    }

    return (
        <BaseNode
            id={id}
            nodeName={nodeName}
            icon={Play}
            selected={selected}
            defaultInputHandle={defaultInputHandle}
        >
            {tradingMode === TradeMode.LIVE && <LiveModeShow data={data} />}
            {tradingMode === TradeMode.BACKTEST && <BacktestModeShow data={data} />}
        </BaseNode>
    )
}

export default IndicatorNode;