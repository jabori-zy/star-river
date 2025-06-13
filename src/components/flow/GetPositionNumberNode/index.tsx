import { type GetPositionNumberNode } from "@/types/node";
import { useState, useEffect } from "react";
import { 
    Handle, 
    type NodeProps, 
    Position,
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
import { PencilIcon, Box , X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



function GetPositionNumberNode({id, data, isConnectable} : NodeProps<GetPositionNumberNode>) {

    const [showEditButton, setShowEditButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [nodeName, setNodeName] = useState(data.nodeName as string || "获取订单数量");
    const [nodeNameEditing, setNodeNameEditing] = useState<boolean>(false);
    const [exchange, setExchange] = useState<string>("Metatrader5");
    const [symbol, setSymbol] = useState<string>("BTCUSDT");
    const [positionSide, setPositionSide] = useState<string>("所有类型")
    const [positionNumber, setPositionNumber] = useState<number>(0);


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
            getPositionNumberRequest: {
                ...(data.getPositionNumberRequest || {}),
                exchange: exchange,
                symbol: symbol,
                positionSide: positionSide,
            }
        });
        setIsEditing(false);
    };

    return (
        <>
            <div 
                className="get-position-number-node relative"
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
                            <Box className="h-3.5 w-3.5 text-green-500" />
                            <div className="text-sm font-medium">{nodeName}</div>
                        </div>
                        
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>仓位数量: {data.positionNumber || 0}</span>
                        </div>
                    </div>

                    <Handle 
                        type="target" 
                        position={Position.Left} 
                        id="get_position_number_node_input"
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
                                {/* 交易基本信息 - 两列布局 */}
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

                                {/* 订单类型信息 - 两列布局 */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">订单类型</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* 订单类型 */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm">
                                                
                                                仓位方向
                                            </Label>
                                            <Select value={positionSide} onValueChange={setPositionSide}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="选择订单类型" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">所有方向</SelectItem>
                                                    <SelectItem value="long">多</SelectItem>
                                                    <SelectItem value="short">空</SelectItem>
                                                </SelectContent>
                                            </Select>
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

export default GetPositionNumberNode;