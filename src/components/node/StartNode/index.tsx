import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayIcon, Edit } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import StartNodePanel from './panel';
import { useReactFlow } from '@xyflow/react';
import { getTradingModeName, getTradingModeColor } from '@/utils/tradingModeHelper';
import { useStrategyStore } from '@/store/useStrategyStore';
import { type StartNode } from '@/types/node/startNode';
import { Strategy } from '@/types/strategy';


function StartNode({ data, isConnectable, id }: NodeProps<StartNode>) {
    // 编辑状态
    const [isEditing, setIsEditing] = useState(false);
    const [showEditButton, setShowEditButton] = useState(false);
    const [nodeName, setNodeName] = useState(data?.nodeName || "策略起点");


    // 引入React Flow的更新节点数据
    const { setNodes } = useReactFlow();

    // 引入策略状态
    const { strategy, setStrategy } = useStrategyStore();
    
    // 只有在strategy存在时才获取tradingMode
    const tradingMode = strategy?.tradeMode;

    const handleSaveStrategy = useCallback((strategy: Strategy) => {
        setStrategy(strategy);
        console.log("更新后的strategy", strategy);

        setTimeout(() => {
            const startNodeData = {
                strategyId: strategy.id,
                strategyName: strategy.name,
                nodeName: nodeName,
                liveConfig: strategy.config?.liveConfig,
                simulateConfig: strategy.config?.simulateConfig,
                backtestConfig: strategy.config?.backtestConfig
            };
            
            setNodes(nodes => 
                nodes.map(node => 
                    node.id === id 
                        ? { ...node, data: startNodeData }
                        : node
                )
            );
        }, 200);
        

    }, [id, setNodes, setStrategy, nodeName]);

    // 渲染主体内容
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
                            <CardTitle className="text-sm font-medium">{nodeName}</CardTitle>
                        </div>
                        {tradingMode && (
                            <Badge 
                                variant="secondary" 
                                className={`h-4 text-[10px] font-normal ${getTradingModeColor(tradingMode)}`}
                            >
                                {getTradingModeName(tradingMode)}
                            </Badge>
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                        {(data?.strategyName as string) || "我的策略"}
                    </div>
                </CardHeader>

                <Handle 
                    type="source" 
                    position={Position.Right} 
                    id="start_node_output"
                    className="!w-3 !h-3 !border-2 !border-white !bg-blue-400 !top-[22px]"
                    isConnectable={isConnectable}
                />
            </Card>

            {/* 开始节点面板 */}
            {isEditing ? (
                <StartNodePanel
                    strategy={strategy}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    handleSaveStrategy={handleSaveStrategy}
                    nodeName={nodeName}
                    onNodeNameChange={setNodeName}
                />
            ) : null}
        </div>
    );
}

export default StartNode;
