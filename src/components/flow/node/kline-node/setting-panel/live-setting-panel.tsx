import { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { KlineNodeData } from "@/types/node/kline-node";
import DataSourceSelector from "../components/data-source-selector";
import { TradeMode } from "@/types/strategy";
import {useNodeConnections, useReactFlow } from "@xyflow/react";
import { useState,useEffect } from "react";
import { StartNode } from "@/types/node/start-node";
import SymbolSelector from "../components/symbol-selector";
import { useUpdateLiveConfig } from "@/hooks/node/kline-node/use-update-live-config";
import { NodeDefaultInputHandleId } from "@/types/node/index";

const KlineNodeLiveSettingPanel: React.FC<SettingProps> = ({ id, data }) => {
    const klineNodeData = data as KlineNodeData;

    const { getNode } = useReactFlow()

    // 已连接的start_node
    const [connectedStartNode, setConnectedStartNode] = useState<StartNode | null>(null)

    const connections = useNodeConnections({id, handleType: 'target', handleId: NodeDefaultInputHandleId.KlineNodeInput})

    // 使用自定义hook管理实盘配置
    const {
        liveConfig,
        updateSelectedAccount,
        updateLiveSelectedSymbols
    } = useUpdateLiveConfig({
        id,
        initialLiveConfig: klineNodeData.liveConfig
    });

    useEffect(() => {
        if (connections.length === 1) { 
            // console.log('connections:', connections)
            // 获取已连接的start_node的id
            const startNodeId = connections[0].source
            const startNodeNode = getNode(startNodeId)
            setConnectedStartNode(startNodeNode as StartNode)
        }
    }, [connections, getNode])
    
    return (
        <div className="space-y-4">
            <DataSourceSelector
                startNode={connectedStartNode}
                tradeMode={TradeMode.LIVE}
                selectedAccount={liveConfig?.selectedAccount}
                onAccountChange={updateSelectedAccount}
            />
            <SymbolSelector
                selectedSymbols={liveConfig?.selectedSymbols || []}
                onSymbolsChange={updateLiveSelectedSymbols}
                selectedDataSource={liveConfig?.selectedAccount}
            />
        </div>
    )
}

export default KlineNodeLiveSettingPanel;