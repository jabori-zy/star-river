import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayIcon, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import StartNodePanel from './panel';
import { StartNodeData } from '@/types/start_node';
import { TradeMode } from '@/types/node';
import { useReactFlow } from '@xyflow/react';
import useTradingModeStore from '@/store/useTradingModeStore';
import useTradingConfigStore from '@/store/useTradingConfigStore';
import { getTradingModeName, getTradingModeColor } from '@/utils/tradingModeHelper';

function StartNode({ data, isConnectable, id }: NodeProps) {
    // 编辑状态
    const [isEditing, setIsEditing] = useState(false);
    const [showEditButton, setShowEditButton] = useState(false);
    const { updateNodeData } = useReactFlow();
    // 引入交易模式
    const { tradingMode } = useTradingModeStore();
    // 引入交易配置状态
    const { 
        setLiveModeConfig,
        setSimulateModeConfig,
        setBacktestModeConfig
    } = useTradingConfigStore();
    
    // 确保data是有效的对象
    const nodeData = data as StartNodeData || { 
        strategyTitle: "我的策略",
        tradingMode: TradeMode.SIMULATE,
        liveTradingConfig: {
            liveAccounts: [],
            maxPositions: 10
        },
        simulateTradingConfig: {
            simulateAccounts: [],
            maxPositions: 10,
            feeRate: 0.0003
        },
        backtestTradingConfig: {
            backtestStartDate: "",
            backtestEndDate: "",
            feeRate: 0.0003
        }
    };

    // 将节点数据中的配置保存到全局状态，当节点数据更新时触发
    useEffect(() => {
        if (nodeData) {
            // 更新三种模式的独立配置
            if (nodeData.liveTradingConfig) {
                setLiveModeConfig(nodeData.liveTradingConfig);
            }
            
            if (nodeData.simulateTradingConfig) {
                setSimulateModeConfig(nodeData.simulateTradingConfig);
            }
            
            if (nodeData.backtestTradingConfig) {
                setBacktestModeConfig(nodeData.backtestTradingConfig);
            }
        }
    }, [nodeData, setLiveModeConfig, setSimulateModeConfig, setBacktestModeConfig]);

    const handleSave = (data: StartNodeData) => {
        // 更新节点数据
        updateNodeData(id, data);
        
        // 更新三种模式的独立配置
        if (data.liveTradingConfig) {
            setLiveModeConfig(data.liveTradingConfig);
        }
        
        if (data.simulateTradingConfig) {
            setSimulateModeConfig(data.simulateTradingConfig);
        }
        
        if (data.backtestTradingConfig) {
            setBacktestModeConfig(data.backtestTradingConfig);
        }
        
        console.log(nodeData);
    };

    return (
        <div className="flex">
            <Card 
                className="w-[200px] border-2 relative"
                onMouseEnter={() => setShowEditButton(true)}
                onMouseLeave={() => setShowEditButton(false)}
            >
                {showEditButton && (
                    <Button
                        variant="outline" 
                        size="icon"
                        className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-white shadow-md hover:bg-gray-100 z-10"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                        }}
                    >
                        <Edit className="h-3 w-3" />
                    </Button>
                )}
                <CardHeader className="p-2 space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <PlayIcon className="h-3.5 w-3.5 text-green-500" />
                            <CardTitle className="text-sm font-medium">开始节点</CardTitle>
                        </div>
                        <Badge 
                            variant="secondary" 
                            className={`h-4 text-[10px] font-normal ${getTradingModeColor(tradingMode)}`}
                        >
                            {getTradingModeName(tradingMode)}
                        </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                        {nodeData?.strategyTitle || "我的策略"}
                    </div>
                </CardHeader>

                <Handle 
                    type="source" 
                    position={Position.Right} 
                    id="start_node_output"
                    className="w-2.5 h-2.5 !bg-green-500"
                    isConnectable={isConnectable}
                />
            </Card>

            <StartNodePanel
                id={id}
                data={nodeData}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                handleSave={handleSave}
            />
        </div>
    );
}

export default StartNode;
