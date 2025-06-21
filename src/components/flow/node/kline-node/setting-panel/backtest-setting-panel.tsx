import { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { KlineNodeData } from "@/types/node/kline-node";
import DataSourceSelector from "../components/data-source-selector";
import { TradeMode, SelectedAccount } from "@/types/strategy";
import { useNodeConnections, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";
import { StartNode, StartNodeData } from "@/types/node/start-node";
import SymbolSelector from "../components/symbol-selector";
import { useUpdateBacktestConfig } from "@/hooks/node/kline-node/use-update-backtest-config";
import { TimeRange } from "@/types/strategy";
import { Label } from "@/components/ui/label";
import { NodeDefaultInputHandleId } from "@/types/node/index";


const KlineNodeBacktestSettingPanel: React.FC<SettingProps> = ({ id, data }) => {
    const klineNodeData = data as KlineNodeData;

    const { getNode } = useReactFlow()

    
    // 当前节点的connection
    const connections = useNodeConnections({id, handleType: 'target', handleId: NodeDefaultInputHandleId.KlineNodeInput})
    // 已连接的start_node
    const [connectedStartNode, setConnectedStartNode] = useState<StartNode | null>(null)

    // timeRange
    const [timeRange, setTimeRange] = useState<TimeRange | null>(klineNodeData?.backtestConfig?.exchangeConfig?.timeRange || null)

    // 使用自定义hook管理回测配置
    const {
        config: backtestConfig,
        updateSelectedAccount,
        updateSelectedSymbols
    } = useUpdateBacktestConfig({
        id,
        initialBacktestConfig: klineNodeData.backtestConfig
    });

    useEffect(() => {
        if (connections.length === 1) {
            const startNodeId = connections[0].source
            const startNode = getNode(startNodeId)
            if (startNode) {
                const startNodeData = startNode.data as StartNodeData
                setConnectedStartNode(startNode as StartNode)
                setTimeRange(startNodeData.backtestConfig?.exchangeConfig?.timeRange || null)
            }
        }
    }, [connections, getNode])

    // 处理数据源选择（回测模式下选择的是交易所数据源）
    const handleDataSourceChange = (selectedAccount: SelectedAccount) => {
        updateSelectedAccount({
            id: selectedAccount.id,
            exchange: selectedAccount.exchange,
            accountName: selectedAccount.accountName
        });
    };

    return (
        <div className="space-y-4">
            <DataSourceSelector
                startNode={connectedStartNode} 
                tradeMode={TradeMode.BACKTEST}
                selectedAccount={backtestConfig?.exchangeConfig?.selectedAccount}
                onAccountChange={handleDataSourceChange}
            />
            <SymbolSelector
                selectedSymbols={backtestConfig?.exchangeConfig?.selectedSymbols || []}
                onSymbolsChange={updateSelectedSymbols}
                selectedDataSource={backtestConfig?.exchangeConfig?.selectedAccount}
            />
            <div className="flex items-center justify-between gap-2 bg-gray-100 p-2 rounded-md">
                <Label className="text-sm font-bold"> 回测时间范围： </Label>
                <Label className="text-xs text-muted-foreground"> {timeRange?.startDate} ~ {timeRange?.endDate} </Label>
            </div>
        </div>
    )
}

export default KlineNodeBacktestSettingPanel;