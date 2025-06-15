import { useEffect } from "react";
import BaseNode from "@/components/flow/base/BaseNode";
import { Play } from "lucide-react";
import { useNodeConnections, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { type KlineNode } from "@/types/node/kline-node";
import { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import LiveModeShow from "./components/live-mode-show";
import BacktestModeShow from "./components/backtest-mode-show";
import { TradeMode } from "@/types/strategy";
import useTradingModeStore from "@/store/useTradingModeStore";
import { KlineNodeLiveConfig, KlineNodeBacktestConfig } from "@/types/node/kline-node";
import { useUpdateBacktestConfig } from "@/hooks/node/kline-node/use-update-backtest-config";
import { StartNodeData } from "@/types/node/start-node";





const KlineNode: React.FC<NodeProps<KlineNode>> = ({id, data, selected}) => {

    const nodeName = data?.nodeName || "K线节点";
    const { tradingMode } = useTradingModeStore();
    const { getNode } = useReactFlow()
    // 实盘配置
    const liveConfig = data?.liveConfig || {} as KlineNodeLiveConfig;
    // 回测配置
    const backtestConfig = data?.backtestConfig || {} as KlineNodeBacktestConfig;

    const connections = useNodeConnections({id})

    const { updateTimeRange } = useUpdateBacktestConfig({ id, initialConfig: data?.backtestConfig });

    // 初始连接时同步时间范围（仅在连接建立时执行一次）
    useEffect(() => {
        if (connections.length === 1) {
            const startNodeId = connections[0].source
            const startNode = getNode(startNodeId)
            if (startNode) {
                const startNodeData = startNode.data as StartNodeData
                const newTimeRange = startNodeData.backtestConfig?.exchangeConfig?.timeRange
                if (newTimeRange) {
                    updateTimeRange(newTimeRange)
                }
            }
        }
    }, [connections, getNode, updateTimeRange])




    // 默认输入
    const defaultInputHandle: BaseHandleProps = {
        id: 'kline_node_input',
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
            selectedBorderColor="border-red-400"
            // defaultOutputHandle={defaultOutputHandle}
            defaultInputHandle={defaultInputHandle} // 默认只有一个输入
        >
            {/* 已选择的账户列表 */}
        
        {/* 实盘模式 */}
        { 
            tradingMode === TradeMode.LIVE && (
                <LiveModeShow liveConfig={liveConfig} />
            )
        }
        {/* 回测模式 */}
        {
            tradingMode === TradeMode.BACKTEST && (
                <BacktestModeShow backtestConfig={backtestConfig} />
            )
        }
        </BaseNode>
    )
}

export default KlineNode;