import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { PencilIcon, CircleDot, TrendingUp, X } from 'lucide-react';
import { useStrategyMessages } from '@/hooks/use-strategyMessage';

function SMAIndicatorNode({id, data, isConnectable}:NodeProps) {
    const [showEditButton, setShowEditButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [smaPeriod, setSmaPeriod] = useState(9);
    const [nodeName, setNodeName] = useState(data.nodeName as string || "SMA");
    const [nodeNameEditing, setNodeNameEditing] = useState(false);

    const { messages, clearNodeMessages } = useStrategyMessages();
    const [last_sma, setLastSma] = useState(0);

    useEffect(() => {
        // console.log(`Node ${id} received message`, messages);
        // 获取实时数据节点的消息
        const sma_node_message = messages[id];
        if (sma_node_message && sma_node_message.length > 0) {
            const new_last_sma = sma_node_message.at(-1).indicator_data.indicator_value.sma.at(-1).value;
            if (new_last_sma !== last_sma) {
                console.log(`Node ${id} received message`, new_last_sma);
                setLastSma(new_last_sma);
            }
        }

        clearNodeMessages(id);
        
    }, [messages, id, clearNodeMessages]);



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
            indicatorConfig: {
                ...(data.indicatorConfig || {}),
                period: smaPeriod
            }
        });
        setIsEditing(false);
    };

    // useEffect(() => {
    //     console.log(connections);
    // }, );

    return (
        <>
            <div 
                className="sma-indicator-node relative"
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
                            <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                            <div className="text-sm font-medium">{nodeName}</div>
                        </div>
                        
                        <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">
                                周期: {smaPeriod}
                            </span>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">
                                    SMA:
                                </span>
                                <span className={`text-xs font-medium ${
                                    last_sma > 0 
                                        ? 'text-green-500' 
                                        : last_sma < 0 
                                            ? 'text-red-500' 
                                            : 'text-gray-500'
                                }`}>
                                    {last_sma?.toFixed(2) || '---'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Handle 
                        type="target" 
                        position={Position.Left} 
                        id="indicator_node_input"
                        className="!w-3 !h-3 !border-2 !border-white !bg-blue-400 !top-[22px]"
                        isConnectable={connections.length < 1}
                    />

                    <Handle 
                        type="source" 
                        position={Position.Right} 
                        id="indicator_node_output"
                        className=" !w-3 !h-3 !border-2 !border-white !bg-blue-400 !top-[22px]"
                        isConnectable={isConnectable}
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
                        <DrawerHeader className="border-b" >
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
                                配置简单移动平均线指标参数
                            </DrawerDescription>
                        </DrawerHeader>
                        
                        <ScrollArea className="flex-1 px-4">
                            <div 
                                className="py-6 space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label 
                                            className="flex items-center gap-2"
                                        >
                                            <CircleDot className="h-3 w-3 text-purple-500 fill-purple-500" />
                                            计算周期
                                        </Label>
                                        <Input 
                                            type="number"
                                            value={smaPeriod}
                                            onChange={(e) => setSmaPeriod(Number(e.target.value))}
                                            min={1}
                                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label 
                                            className="flex items-center gap-2"
                                        >
                                            <CircleDot className="h-3 w-3 text-blue-500 fill-blue-500" />
                                            价格来源
                                        </Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择价格来源" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="close">收盘价</SelectItem>
                                                <SelectItem value="open">开盘价</SelectItem>
                                                <SelectItem value="high">最高价</SelectItem>
                                                <SelectItem value="low">最低价</SelectItem>
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

export default SMAIndicatorNode;
