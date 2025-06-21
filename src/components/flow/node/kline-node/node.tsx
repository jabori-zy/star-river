import { useEffect, useRef } from "react";
import BaseNode from "@/components/flow/base/BaseNode";
import { Play } from "lucide-react";
import { useNodeConnections, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { type KlineNode as KlineNodeType } from "@/types/node/kline-node";
import { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import LiveModeShow from "./components/live-mode-show";
import BacktestModeShow from "./components/backtest-mode-show";
import { TradeMode } from "@/types/strategy";
import useTradingModeStore from "@/store/useTradingModeStore";
import { KlineNodeLiveConfig, KlineNodeBacktestConfig } from "@/types/node/kline-node";
import { useUpdateBacktestConfig } from "@/hooks/node/kline-node/use-update-backtest-config";
import { StartNodeData } from "@/types/node/start-node";
import { useUpdateLiveConfig } from "@/hooks/node/kline-node/use-update-live-config";
import { NodeDefaultInputHandleId } from "@/types/node/index";




const KlineNode: React.FC<NodeProps<KlineNodeType>> = ({id, data, selected}) => {

    const nodeName = data?.nodeName || "K线节点";
    const { tradingMode } = useTradingModeStore();
    const { getNode } = useReactFlow()
    // 实盘配置
    const liveConfig = data?.liveConfig || {} as KlineNodeLiveConfig;
    // 回测配置
    const backtestConfig = data?.backtestConfig || {} as KlineNodeBacktestConfig;

    const connections = useNodeConnections({id, handleType: 'target', handleId: NodeDefaultInputHandleId.KlineNodeInput})

    const { updateTimeRange, setDefaultBacktestConfig, updateSelectedAccount: updateBacktestSelectedAccount } = useUpdateBacktestConfig({ id, initialBacktestConfig: data?.backtestConfig });
    const { setDefaultLiveConfig, updateSelectedAccount: updateLiveSelectedAccount } = useUpdateLiveConfig({ id, initialLiveConfig: data?.liveConfig });

    // 1.初始连接时同步时间范围（仅在连接建立时执行一次）
    // 2. 处理断开后，重新连接的情况。
    // 使用 ref 存储最新的配置值，避免依赖项循环问题
    const liveConfigRef = useRef(liveConfig)
    const backtestConfigRef = useRef(backtestConfig)
    
    // 更新 ref 值
    useEffect(() => {
        liveConfigRef.current = liveConfig
        backtestConfigRef.current = backtestConfig
    })

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

                // 处理live模式的数据源
                const liveDataSource = liveConfigRef.current.selectedAccount
                if (liveDataSource) {
                    // 获取start_node中的交易所列表
                    const liveAccounts = startNodeData.liveConfig?.liveAccounts
                    if (liveAccounts) {
                        // 判断liveDataSource是否在liveAccounts中
                        const isLiveDataSourceInLiveAccounts = liveAccounts.some(account => account.id === liveDataSource.id)
                        if (!isLiveDataSourceInLiveAccounts) {
                            // 如果不在，则清空liveConfig
                            updateLiveSelectedAccount(null)
                        }
                    }
                }

                // 处理backtest模式的数据源
                const backtestDataSource = backtestConfigRef.current.exchangeConfig?.selectedAccount
                if (backtestDataSource) {
                    // 获取start_node中的交易所列表
                    const backtestAccounts = startNodeData.backtestConfig?.exchangeConfig?.fromExchanges
                    if (backtestAccounts) {
                        // 判断backtestDataSource是否在backtestAccounts中
                        const isBacktestDataSourceInBacktestAccounts = backtestAccounts.some(account => account.id === backtestDataSource.id)
                        if (!isBacktestDataSourceInBacktestAccounts) {
                            // 如果不在，则清空backtestConfig
                            updateBacktestSelectedAccount(null)
                        }
                    }
                }
            }
        }
    }, [connections, getNode, updateTimeRange, updateBacktestSelectedAccount, updateLiveSelectedAccount])

    // 初始化时设置默认回测配置
    useEffect(() => {
        if (!data?.liveConfig) {
            setDefaultLiveConfig();
        }
        if (!data?.backtestConfig) {
            setDefaultBacktestConfig();
        }
    }, [setDefaultLiveConfig, setDefaultBacktestConfig, data?.liveConfig, data?.backtestConfig])




    // 默认输入
    const defaultInputHandle: BaseHandleProps = {
        id: NodeDefaultInputHandleId.KlineNodeInput,
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