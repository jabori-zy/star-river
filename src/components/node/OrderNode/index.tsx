import { useState, useEffect } from "react";
import { 
    Handle, 
    type NodeProps, 
    Position,
    useNodeConnections,
    useReactFlow
} from '@xyflow/react';
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { PencilIcon, ShoppingCart, X } from 'lucide-react';
import { type OrderNode } from "@/types/node";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


function OrderNode({id, data, isConnectable}:NodeProps<OrderNode>) {
    
    const [showEditButton, setShowEditButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [nodeName, setNodeName] = useState(data.nodeName as string || "订单节点");
    const [nodeNameEditing, setNodeNameEditing] = useState(false);

    const [exchange, setExchange] = useState<string>("Binance");
    const [symbol, setSymbol] = useState<string>("BTCUSDT");
    const [orderType, setOrderType] = useState<string>("limit");
    const [orderSide, setOrderSide] = useState<string>("long");
    const [price, setPrice] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(0);
    const [tp, setTp] = useState<number | null>(null);
    const [sl, setSl] = useState<number | null>(null);




    const connections = useNodeConnections({
        handleType: 'target',
    });

    const { updateNodeData } = useReactFlow();

    const preventDragHandler = (e: React.MouseEvent | React.DragEvent | React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
    };

    const handleDoubleClick = () => {
        setNodeNameEditing(true);
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNodeName(e.target.value);
    };

    const saveNodeName = () => {
        updateNodeData(id, {
            ...data,
            nodeName: nodeName
        });
        setNodeNameEditing(false);
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveNodeName();
            setNodeNameEditing(false);
        }
    };

    const handleSave = () => {
        updateNodeData(id, {
            ...data,
            nodeName: nodeName,
            exchange: exchange,
            symbol: symbol,
            orderRequest: {
                ...(data.orderRequest || {}),
                exchange: exchange,
                symbol: symbol,
                orderType: orderType,
                orderSide: orderSide,
                price: price,
                quantity: quantity,
                tp: tp,
                sl: sl
            }
        });
        setIsEditing(false);
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
                            <div className="text-sm font-medium">{nodeName}</div>
                        </div>
                        
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>买入金额: {data.orderRequest?.quantity || 0}</span>
                        </div>
                    </div>

                    <Handle 
                        type="target" 
                        position={Position.Left} 
                        id="order_node_input"
                        className="!w-3 !h-3 !border-2 !border-white !bg-green-400 !top-[22px]"
                        isConnectable={connections.length < 1}
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
                    <DrawerContent 
                        className="h-[calc(100vh-2rem)] max-w-[400px] rounded-l-xl shadow-2xl mx-0 my-4"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        <DrawerHeader className="border-b">
                            <DrawerTitle>
                                <div>
                                    {nodeNameEditing ? (
                                        <Input
                                            type="text"
                                            value={nodeName}
                                            onChange={handleNameChange}
                                            onBlur={saveNodeName}
                                            onKeyDown={handleKeyDown}
                                            autoFocus
                                            className="w-full px-1 text-sm border rounded focus:outline-none"
                                        />
                                    ) : (
                                        <span onDoubleClick={handleDoubleClick}>
                                            {nodeName}
                                        </span>
                                    )}
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute right-4 top-4"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </DrawerTitle>
                            <DrawerDescription>
                                配置买入操作参数
                            </DrawerDescription>
                        </DrawerHeader>
                        
                        <ScrollArea className="px-4 max-h-[70vh]">
                            <div className="py-6">
                                {/* 交易基本信息 - 两列布局 */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">交易基本信息</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* 交易所 */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm">
                                                
                                                交易所
                                            </Label>
                                            <Select value={exchange} onValueChange={setExchange}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="选择交易所" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="binance">Binance</SelectItem>
                                                    <SelectItem value="okx">OKX</SelectItem>
                                                    <SelectItem value="bybit">Bybit</SelectItem>
                                                    <SelectItem value="metatrader5">MetaTrader5</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        {/* 交易对 */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm">
                                                
                                                交易对
                                            </Label>
                                            <Input 
                                                type="text"
                                                value={symbol}
                                                onChange={(e) => setSymbol(e.target.value)}
                                                className="h-9"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 订单类型信息 - 两列布局 */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">订单类型</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* 订单类型 */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm">
                                                
                                                订单类型
                                            </Label>
                                            <Select value={orderType} onValueChange={setOrderType}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="选择订单类型" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="market">市价单</SelectItem>
                                                    <SelectItem value="limit">限价单</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        {/* 订单方向 */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm">
                                                
                                                订单方向
                                            </Label>
                                            <Select value={orderSide} onValueChange={setOrderSide}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="选择订单方向" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="long">做多</SelectItem>
                                                    <SelectItem value="short">做空</SelectItem>
                                                    <SelectItem value="close">平仓</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* 价格和数量信息 */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">订单参数</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* 价格 */}
                                        {orderType === "limit" ? (
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm">
                                                    
                                                    价格
                                                </Label>
                                                <Input 
                                                    type="number"
                                                    value={price}
                                                    onChange={(e) => setPrice(Number(e.target.value))}
                                                    min={0}
                                                    step="0.001"
                                                    className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm text-gray-400">
                                                    
                                                    价格
                                                </Label>
                                                <Input 
                                                    type="text"
                                                    value="市价"
                                                    disabled
                                                    className="h-9 bg-gray-100 text-gray-500"
                                                />
                                            </div>
                                        )}
                                        
                                        {/* 数量 */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm">
                                                
                                                数量
                                            </Label>
                                            <Input 
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Number(e.target.value))}
                                                min={0}
                                                step="0.00000001"
                                                className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 止盈止损信息 */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">风险管理 <span className="text-xs text-gray-400">(可选)</span></h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* 止盈 */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm">
                                                
                                                止盈价格
                                            </Label>
                                            <Input 
                                                type="number"
                                                value={tp === null ? "" : tp}
                                                onChange={(e) => setTp(e.target.value === "" ? null : Number(e.target.value))}
                                                min={0}
                                                step="0.0001"
                                                placeholder={orderSide === "long" ? "高于买入价" : "低于卖出价"}
                                                className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                        
                                        {/* 止损 */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm">
                                                
                                                止损价格
                                            </Label>
                                            <Input 
                                                type="number"
                                                value={sl === null ? "" : sl}
                                                onChange={(e) => setSl(e.target.value === "" ? null : Number(e.target.value))}
                                                min={0}
                                                step="0.00000001"
                                                placeholder={orderSide === "long" ? "低于买入价" : "高于卖出价"}
                                                className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* 订单预览 */}
                                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">订单预览</h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">交易所:</span>
                                            <span className="font-medium">{exchange}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">交易对:</span>
                                            <span className="font-medium">{symbol}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">类型:</span>
                                            <span className="font-medium">{orderType === "market" ? "市价单" : "限价单"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">方向:</span>
                                            <span className={`font-medium ${orderSide === "long" ? "text-green-600" : "text-red-600"}`}>
                                                {orderSide === "long" ? "做多" : "做空"}
                                            </span>
                                        </div>
                                        {orderType === "limit" && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">价格:</span>
                                                <span className="font-medium">{price}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">数量:</span>
                                            <span className="font-medium">{quantity}</span>
                                        </div>
                                        {tp !== null && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">止盈:</span>
                                                <span className="font-medium text-green-600">{tp}</span>
                                            </div>
                                        )}
                                        {sl !== null && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">止损:</span>
                                                <span className="font-medium text-red-600">{sl}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <DrawerFooter className="border-t">
                            <div className="flex gap-2">
                                <DrawerClose asChild>
                                    <Button className="flex-1" variant="outline">
                                        取消
                                    </Button>
                                </DrawerClose>
                                <Button 
                                    className="flex-1"
                                    onClick={handleSave}
                                >
                                    保存
                                </Button>
                            </div>
                        </DrawerFooter>
                    </DrawerContent>
                </div>
            </Drawer>
        </>
    );
}

export default OrderNode;
