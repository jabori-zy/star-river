import { useState } from 'react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { PencilIcon, CircleDot, TrendingUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge"
import { useReactFlow } from '@xyflow/react';

function SMAIndicatorNode({id, data, isConnectable}:NodeProps) {
    const [showEditButton, setShowEditButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [smaPeriod, setSmaPeriod] = useState(9);
    const { updateNodeData } = useReactFlow();

    const preventDragHandler = (e: React.MouseEvent | React.DragEvent | React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
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

    return (
        <>
            <div 
                className="sma-indicator-node relative"
                onMouseEnter={() => setShowEditButton(true)}
                onMouseLeave={() => setShowEditButton(false)}
            >
                <Card className="w-[280px] border-2">
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

                    <CardHeader className="p-2 pb-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                                <CardTitle className="text-sm font-medium">SMA指标</CardTitle>
                                <Badge variant="secondary" className="h-4 text-xs">技术指标</Badge>
                            </div>
                            <Badge variant="outline" className="h-4 text-xs px-2">已连接</Badge>
                        </div>
                        <CardDescription className="text-xs mt-0.5">
                            简单移动平均线指标
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-2 pt-0">
                        <div className="space-y-1.5">
                            <div className="grid grid-cols-2 gap-x-4">
                                <div>
                                    <Label className="text-[10px] font-normal text-muted-foreground">
                                        计算周期
                                    </Label>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <CircleDot className="h-2.5 w-2.5 text-purple-500 fill-purple-500" />
                                        <span className="text-xs font-medium">{smaPeriod} 周期</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-[10px] font-normal text-muted-foreground">
                                        当前值
                                    </Label>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <CircleDot className="h-2.5 w-2.5 text-blue-500 fill-blue-500" />
                                        <span className="text-xs font-medium">43,127.52</span>
                                    </div>
                                </div>
                            </div>
                            
                            <Separator className="my-1" />
                            
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-muted-foreground">信号</Label>
                                <div className="text-sm font-semibold text-green-500">做多</div>
                            </div>
                        </div>
                    </CardContent>

                    <Handle 
                        type="target" 
                        position={Position.Left} 
                        id="sma_indicator_node_target"
                        className="w-2.5 h-2.5 !bg-purple-500"
                        isConnectable={isConnectable}
                    />
                    <Handle 
                        type="source" 
                        position={Position.Right} 
                        id="sma_indicator_node_source"
                        className="w-2.5 h-2.5 !bg-purple-500"
                        isConnectable={isConnectable}
                    />
                </Card>
            </div>

            <Drawer open={isEditing} onOpenChange={setIsEditing} direction="right">
                <div 
                    onDragStart={preventDragHandler}
                    onDrag={preventDragHandler}
                    onDragEnd={preventDragHandler}
                    style={{ isolation: 'isolate' }}
                >
                    <DrawerContent className="h-[calc(100vh-2rem)] max-w-[400px] rounded-l-xl shadow-2xl mx-0 my-4">
                        <DrawerHeader className="border-b">
                            <DrawerTitle>编辑 SMA 指标</DrawerTitle>
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
