import { useState } from "react";
import { 
    Handle, 
    type NodeProps, 
    Position,
    useNodeConnections,
    useReactFlow
} from '@xyflow/react';
import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"
import { PencilIcon, ShoppingCart } from 'lucide-react';
import { type OrderNodeData } from "@/types/orderNode";
import { Badge } from "@/components/ui/badge";
import { TradeMode } from "@/types/node";
import { useStrategyStore } from "@/store/useStrategyStore";
import { getTradingModeName, getTradingModeColor } from "@/utils/tradingModeHelper";
import OrderNodePanel from './panel';


function OrderNode({id, data}:NodeProps<OrderNodeData>) {
    
    const [showEditButton, setShowEditButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [nodeName, setNodeName] = useState(data.nodeName as string || "订单节点");

    // 获取策略信息
    const { strategy } = useStrategyStore();
    const tradingMode = strategy!.tradeMode;

    const connections = useNodeConnections({
        handleType: 'target',
    });

    const { updateNodeData } = useReactFlow();

    const preventDragHandler = (e: React.MouseEvent | React.DragEvent | React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
    };

    const handleSave = (updatedData: OrderNodeData['data']) => {
        updateNodeData(id, updatedData);
        setIsEditing(false);
        console.log(data);
    };

    return (
        <>
            <div 
                className="order-node relative"
                onMouseEnter={() => setShowEditButton(true)}
                onMouseLeave={() => setShowEditButton(false)}
            >
                <div className="w-[200px] bg-white border-2 rounded-lg shadow-sm">
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

                    <div className="p-2">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-3.5 w-3.5 text-green-500" />
                            <div className="text-xs font-medium">{nodeName}</div>
                            <Badge variant="secondary" className={`h-5 text-xs ${getTradingModeColor(tradingMode)}`}>
                                {getTradingModeName(tradingMode)}
                            </Badge>
                        </div>
                        
                        <div className="mt-1.5 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">交易对:</span>
                                <span className="text-xs font-medium">{
                                    tradingMode === TradeMode.LIVE
                                        ? data.liveConfig?.orderConfig?.symbol || "未设置"
                                        : tradingMode === TradeMode.SIMULATE
                                            ? data.simulateConfig?.orderConfig?.symbol || "未设置"
                                            : data.backtestConfig?.orderConfig?.symbol || "未设置"
                                }</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">买入量:</span>
                                <span className="text-xs font-medium">{
                                    tradingMode === TradeMode.LIVE
                                        ? data.liveConfig?.orderConfig?.quantity || 0
                                        : tradingMode === TradeMode.SIMULATE
                                            ? data.simulateConfig?.orderConfig?.quantity || 0
                                            : data.backtestConfig?.orderConfig?.quantity || 0
                                }</span>
                            </div>
                            
                            {/* 显示选择的账户 */}
                            {(tradingMode === TradeMode.LIVE || tradingMode === TradeMode.SIMULATE) && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">账户:</span>
                                    <span className="text-xs font-medium">{
                                        tradingMode === TradeMode.LIVE 
                                            ? data.liveConfig?.selectedLiveAccount?.accountName || "未选择"
                                            : data.simulateConfig?.selectedSimulateAccount?.accountName || "未选择"
                                    }</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Handle 
                        type="target" 
                        position={Position.Left} 
                        id="order_node_input"
                        className="!w-3 !h-3 !border-2 !border-white !bg-green-400 !top-[22px]"
                    />
                </div>
            </div>

            <Drawer 
                open={isEditing} 
                onOpenChange={setIsEditing} 
                direction="right"
                modal={false}
            >
                <div 
                    onDragStart={preventDragHandler}
                    onDrag={preventDragHandler}
                    onDragEnd={preventDragHandler}
                    style={{ isolation: 'isolate' }}
                >
                    <OrderNodePanel
                        data={data}
                        strategy={strategy}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        handleSave={handleSave}
                        nodeName={nodeName}
                        onNodeNameChange={setNodeName}
                    />
                </div>
            </Drawer>
        </>
    );
}

export default OrderNode;
