import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayIcon, Edit } from 'lucide-react';
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import StartNodePanel from './panel';
import { StartNodeData } from '@/types/start_node';
import { TradingMode } from '@/types/node';
import { useReactFlow } from '@xyflow/react';

function StartNode({ data, isConnectable, id }: NodeProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showEditButton, setShowEditButton] = useState(false);
    const { updateNodeData } = useReactFlow();
    // 确保data是有效的对象
    const nodeData = data as StartNodeData || { 
        strategyTitle: "我的策略",
        tradingMode: TradingMode.SIMULATE,
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

    const handleSave = (data: StartNodeData) => {
        console.log("handleSave", data);
        // 更新节点数据
        updateNodeData(id, data);
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
                            className="h-4 text-[10px] font-normal bg-green-500/10 text-green-600 hover:bg-green-500/10"
                        >
                            起点
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
