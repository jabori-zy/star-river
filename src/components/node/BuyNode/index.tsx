import { useState } from 'react';
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
import { PencilIcon, CircleDot, ShoppingCart, X } from 'lucide-react';

function BuyNode({id, data, isConnectable}:NodeProps) {
    const [showEditButton, setShowEditButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [buyAmount, setBuyAmount] = useState(100);
    const [nodeName, setNodeName] = useState(data.nodeName as string || "买入");
    const [nodeNameEditing, setNodeNameEditing] = useState(false);
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
            buyConfig: {
                ...(data.buyConfig || {}),
                amount: buyAmount
            }
        });
        setIsEditing(false);
    };

    return (
        <>
            <div 
                className="buy-node relative"
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
                            <span>买入金额: {buyAmount}</span>
                        </div>
                    </div>

                    <Handle 
                        type="target" 
                        position={Position.Left} 
                        id="buy_node_input"
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
                        
                        <ScrollArea className="flex-1 px-4">
                            <div className="py-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <CircleDot className="h-3 w-3 text-green-500 fill-green-500" />
                                            买入金额
                                        </Label>
                                        <Input 
                                            type="number"
                                            value={buyAmount}
                                            onChange={(e) => setBuyAmount(Number(e.target.value))}
                                            min={1}
                                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
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

export default BuyNode;
