import { useState } from "react";
import { 
    Handle, 
    type NodeProps, 
    Position,
    useReactFlow
} from '@xyflow/react';
import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"
import { PencilIcon, LayoutGrid, Plus } from 'lucide-react';
import { type PositionNode, PositionOperationConfig, PositionOperationType } from "@/types/positionNode";
import { Badge } from "@/components/ui/badge";
import { TradeMode } from "@/types/node";
import { useStrategyStore } from "@/store/useStrategyStore";
import { getTradingModeName, getTradingModeColor } from "@/utils/tradingModeHelper";
import PositionNodePanel from './panel';

function PositionNode({id, data}:NodeProps<PositionNode>) {
    
    const [showEditButton, setShowEditButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [nodeName, setNodeName] = useState(data.nodeName as string || "仓位管理节点");

    // 获取策略信息
    const { strategy } = useStrategyStore();
    const tradingMode = strategy!.tradeMode;

    // 获取当前配置下的操作列表
    const getOperations = () => {
        let operations: PositionOperationConfig[] = [];
        if (tradingMode === TradeMode.LIVE && data.liveConfig) {
            operations = data.liveConfig.operations || [];
        } else if (tradingMode === TradeMode.SIMULATE && data.simulateConfig) {
            operations = data.simulateConfig.operations || [];
        } else if (tradingMode === TradeMode.BACKTEST && data.backtestConfig) {
            operations = data.backtestConfig.operations || [];
        }
        
        return operations;
    };

    const operations = getOperations();

    const { updateNodeData } = useReactFlow();

    const handleSave = (updatedData: PositionNode["data"]) => {
        updateNodeData(id, updatedData);
        setIsEditing(false);
    };

    // 获取操作类型的文字和样式
    const getOperationTypeInfo = (type: PositionOperationType) => {
        switch (type) {
            case PositionOperationType.UPDATE:
                return { text: "更新仓位", className: "bg-blue-100 text-blue-800" };
            case PositionOperationType.CLOSEALL:
                return { text: "全部平仓", className: "bg-red-100 text-red-800" };
            default:
                return { text: "未知操作", className: "bg-gray-100 text-gray-800" };
        }
    };

    return (
        <>
            <div 
                className="position-node relative"
                onMouseEnter={() => setShowEditButton(true)}
                onMouseLeave={() => setShowEditButton(false)}
            >
                <div className="w-[220px] bg-white border-2 rounded-lg shadow-sm">
                    {showEditButton && (
                        <Button 
                            variant="outline" 
                            size="icon"
                            className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-white shadow-md hover:bg-gray-100 z-10"
                            onClick={() => setIsEditing(true)}
                        >
                            <PencilIcon className="h-3 w-3" />
                        </Button>
                    )}

                    <div className="p-2 border-b">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="h-3.5 w-3.5 text-blue-500" />
                            <div className="text-xs font-medium">{nodeName}</div>
                            <Badge variant="secondary" className={`h-5 text-xs ${getTradingModeColor(tradingMode)}`}>
                                {getTradingModeName(tradingMode)}
                            </Badge>
                        </div>
                    </div>

                    {/* 操作列表 */}
                    {operations.length > 0 ? (
                        <div className="px-3 py-2 space-y-2">
                            {operations.map((operation, idx) => (
                                <div key={operation.configId} className="relative pl-4 py-1 border-l-2 border-blue-200">
                                    {/* 操作名称和类型 */}
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="text-xs font-medium">{operation.operationName}</div>
                                        <Badge variant="outline" className={`text-[10px] h-5 ${getOperationTypeInfo(operation.operationType).className}`}>
                                            {getOperationTypeInfo(operation.operationType).text}
                                        </Badge>
                                    </div>
                                    
                                    {/* 显示账户和交易对 */}
                                    <div className="space-y-0.5">
                                        {/* 显示账户信息 (如果有) */}
                                        {operation.operationConfig.selectedAccount && (
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-muted-foreground">账户:</span>
                                                <span className="text-[10px]">{operation.operationConfig.selectedAccount.accountName || "未选择"}</span>
                                            </div>
                                        )}
                                        
                                        {/* 显示交易对 */}
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-muted-foreground">交易对:</span>
                                            <span className="text-[10px]">{operation.operationConfig.symbol || "未设置"}</span>
                                        </div>
                                    </div>
                                    
                                    {/* 输入Handle */}
                                    <Handle 
                                        type="target" 
                                        position={Position.Left} 
                                        id={idx === 0 ? "position_node_1_input" : `position_node_${operation.configId}_input`}
                                        className="!w-3 !h-3 !border-2 !border-white !bg-blue-400"
                                        title={`${operation.operationName}输入`}
                                    />
                                    
                                    {/* 输出Handle */}
                                    <Handle 
                                        type="source" 
                                        position={Position.Right} 
                                        id={idx === 0 ? "position_node_1_output" : `position_node_${operation.configId}_output`}
                                        className="!w-3 !h-3 !border-2 !border-white !bg-blue-400"
                                        title={`${operation.operationName}输出`}
                                    />
                                    
                                    {/* 添加兼容性Handle，支持旧的连接ID */}
                                    {idx === 0 && (
                                        <>
                                            <Handle 
                                                type="target" 
                                                position={Position.Left} 
                                                id="position_node_default_input"
                                                className="!w-3 !h-3 !border-2 !border-white !bg-blue-400 !opacity-0"
                                                style={{ top: '50%' }}
                                                title="兼容旧连接输入"
                                            />
                                            <Handle 
                                                type="source" 
                                                position={Position.Right} 
                                                id="position_node_default_output"
                                                className="!w-3 !h-3 !border-2 !border-white !bg-green-400 !opacity-0"
                                                style={{ top: '50%' }}
                                                title="兼容旧连接输出"
                                            />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-3 py-6 flex flex-col items-center justify-center">
                            <div className="text-xs text-muted-foreground text-center mb-2">未配置任何仓位操作</div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => setIsEditing(true)}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                添加操作
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Drawer 
                open={isEditing} 
                onOpenChange={setIsEditing} 
                direction="right"
                modal={false}
            >
                <div style={{ isolation: 'isolate' }}>
                    <PositionNodePanel
                        data={data}
                        strategy={strategy || null}
                        nodeName={nodeName}
                        onNodeNameChange={setNodeName}
                        handleSave={handleSave}
                        setIsEditing={setIsEditing}
                    />
                </div>
            </Drawer>
        </>
    );
}

export default PositionNode; 