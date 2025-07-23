import { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { IndicatorNodeData } from "@/types/node/indicator-node";
import { useReactFlow, useNodeConnections } from "@xyflow/react";
import { useEffect, useState } from "react";
import { useUpdateBacktestConfig } from "@/hooks/node/indicator-node/use-update-backtest-config";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Activity } from 'lucide-react';
import IndicatorEditor from "@/components/flow/node/indicator-node/components/indicator-editor";
import { getNodeDefaultInputHandleId, isDefaultOutputHandleId, NodeType } from "@/types/node/index";
import { KlineNodeData } from "@/types/node/kline-node";
import { SelectedSymbol } from "@/types/node/kline-node";
import SymbolSelector from "../components/symbol-selector";

const IndicatorNodeBacktestSettingPanel: React.FC<SettingProps> = ({ id, data }) => {
    const indicatorNodeData = data as IndicatorNodeData;
    const connections = useNodeConnections({ id, handleType: 'target', handleId: getNodeDefaultInputHandleId(id, NodeType.IndicatorNode) });
    const [isConnected, setIsConnected] = useState(false);

    // 交易对列表
    const [localSymbolList, setLocalSymbolList] = useState<SelectedSymbol[]>([]);

    const { getNode } = useReactFlow();

    // 
    const exchangeModeConfig = indicatorNodeData.backtestConfig?.exchangeModeConfig

    // 使用自定义hook管理指标配置
    const {
        updateSelectedIndicators,
        updateSelectedSymbol,
        updateSelectedAccount
    } = useUpdateBacktestConfig({
        id,
        initialConfig: indicatorNodeData.backtestConfig
    });

    useEffect(() => {
        const hasConnection = connections.length === 1;
        setIsConnected(hasConnection);
        for (const connection of connections) {
            const sourceNodeId = connection.source;
            const sourceHandleId = connection.sourceHandle!;
            // 判断是否是默认输出句柄
            const isDefaultOutput = isDefaultOutputHandleId(sourceHandleId);
            const node = getNode(sourceNodeId);
            // 如果节点不存在，则跳过
            if (!node) continue;

            const nodeType = node.type as NodeType;

            // 如果不是k线节点，则跳过
            if (nodeType !== NodeType.KlineNode) continue;

            const klineNodeData = node.data as KlineNodeData;
            const selectedAccount = klineNodeData.backtestConfig?.exchangeModeConfig?.selectedAccount;
            if (selectedAccount) {
                updateSelectedAccount(selectedAccount);
            }

            const selectedSymbols = klineNodeData.backtestConfig?.exchangeModeConfig?.selectedSymbols;
            // 如果是默认Handle,则加载所有的symbol
            if (isDefaultOutput) {
                // 默认输出：添加所有K线变量
                if (selectedSymbols) {
                    setLocalSymbolList(selectedSymbols);
                }
            } else {
                const selectedSymbol = selectedSymbols?.find((symbol: SelectedSymbol) => symbol.outputHandleId === sourceHandleId);
                if (selectedSymbol) {
                    setLocalSymbolList([selectedSymbol]);
                }
            }
            
        }
    }, [connections, getNode, updateSelectedAccount, updateSelectedIndicators, updateSelectedSymbol]);

    const handleSymbolChange = (symbol: SelectedSymbol) => {
        updateSelectedSymbol(symbol);
    }

    return (
        <div className="space-y-4">
            {/* 连接状态显示 */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    连接状态
                </Label>
                {isConnected ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                        已连接到K线节点
                    </Badge>
                ) : (
                    <Badge variant="destructive">
                        未连接
                    </Badge>
                )}
            </div>
            <SymbolSelector
                symbolList={localSymbolList}
                selectedSymbol={exchangeModeConfig?.selectedSymbol || null}
                onSymbolChange={handleSymbolChange}
            />
            <IndicatorEditor 
                id={id}
                selectedIndicators={exchangeModeConfig?.selectedIndicators || []}
                onSelectedIndicatorsChange={updateSelectedIndicators}
            />
        </div>
    );
};

export default IndicatorNodeBacktestSettingPanel;