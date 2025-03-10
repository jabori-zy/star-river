import { useState } from 'react';
import { Handle, type NodeProps, Position, useReactFlow } from '@xyflow/react';
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
import { PencilIcon, CircleDot } from 'lucide-react';
import { Badge } from "@/components/ui/badge"
import { type LiveDataNode } from "@/types/node";

function LiveDataNode({id, data, isConnectable}:NodeProps<LiveDataNode>) {
    const [showEditButton, setShowEditButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const { updateNodeData } = useReactFlow();
    const [exchange, setExchange] = useState(data.exchange || 'binance');
    const [symbol, setSymbol] = useState(data.symbol || 'BTC/USDT');
    const [interval, setInterval] = useState(data.interval || '1m');

    const handleSave = () => {
        updateNodeData(id, {
            ...data,
            exchange,
            symbol,
            interval
        });
        setIsEditing(false);
    };

    return (
        <>
            <div 
                className="live-data-node relative"
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
                                <CardTitle className="text-sm font-medium">数据获取节点</CardTitle>
                                <Badge variant="secondary" className="h-4 text-xs">实时</Badge>
                            </div>
                            <Badge variant="outline" className="h-4 text-xs px-2">已连接</Badge>
                        </div>
                        <CardDescription className="text-xs mt-0.5">
                            从交易所获取实时价格数据
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-2 pt-0">
                        <div className="space-y-1.5">
                            <div className="grid grid-cols-2 gap-x-4">
                                <div>
                                    <Label className="text-[10px] font-normal text-muted-foreground">
                                        交易所
                                    </Label>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <CircleDot className="h-2.5 w-2.5 text-green-500 fill-green-500" />
                                        <span className="text-xs font-medium">{data.exchange || 'Binance'}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-[10px] font-normal text-muted-foreground">
                                        交易对
                                    </Label>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <CircleDot className="h-2.5 w-2.5 text-blue-500 fill-blue-500" />
                                        <span className="text-xs font-medium">{data.symbol || 'BTC/USDT'}</span>
                                    </div>
                                </div>
                                <div className="mt-1">
                                    <Label className="text-[10px] font-normal text-muted-foreground">
                                        时间间隔
                                    </Label>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <CircleDot className="h-2.5 w-2.5 text-purple-500 fill-purple-500" />
                                        <span className="text-xs font-medium">{data.interval || '1m'}</span>
                                    </div>
                                </div>
                                <div className="mt-1">
                                    <Label className="text-[10px] font-normal text-muted-foreground">
                                        网络延迟
                                    </Label>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <CircleDot className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-medium">234ms</span>
                                    </div>
                                </div>
                            </div>
                            
                            <Separator className="my-1" />
                            
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-muted-foreground">最新价格</Label>
                                <div className="text-sm font-semibold text-green-500">$43,521.34</div>
                            </div>
                        </div>
                    </CardContent>

                    <Handle 
                        type="source" 
                        position={Position.Right} 
                        id="data_fetch_node_source"
                        className="w-2.5 h-2.5 !bg-blue-500"
                        isConnectable={isConnectable}
                    />
                    <Handle 
                        type="target" 
                        position={Position.Left} 
                        id="data_fetch_node_target"
                        className="w-2.5 h-2.5 !bg-blue-500"
                        isConnectable={isConnectable}
                    />
                </Card>
            </div>

            <Drawer open={isEditing} onOpenChange={setIsEditing} direction="right">
                <DrawerContent className="h-[calc(100vh-2rem)] max-w-[400px] rounded-l-xl shadow-2xl mx-0 my-4">
                    <DrawerHeader className="border-b">
                        <DrawerTitle>编辑节点</DrawerTitle>
                        <DrawerDescription>
                            配置数据获取节点的参数
                        </DrawerDescription>
                    </DrawerHeader>
                    
                    <ScrollArea className="flex-1 px-4">
                        <div className="py-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <CircleDot className="h-3 w-3 text-green-500 fill-green-500" />
                                        交易所
                                    </Label>
                                    <Select value={exchange} onValueChange={setExchange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择交易所" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="binance">Binance</SelectItem>
                                            <SelectItem value="okx">OKX</SelectItem>
                                            <SelectItem value="bitget">Bitget</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <CircleDot className="h-3 w-3 text-blue-500 fill-blue-500" />
                                        交易对
                                    </Label>
                                    <Select value={symbol} onValueChange={setSymbol}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择交易对" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="btc/usdt">BTC/USDT</SelectItem>
                                            <SelectItem value="eth/usdt">ETH/USDT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <CircleDot className="h-3 w-3 text-purple-500 fill-purple-500" />
                                        时间间隔
                                    </Label>
                                    <Select value={interval} onValueChange={setInterval}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择时间间隔" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1m">1分钟</SelectItem>
                                            <SelectItem value="5m">5分钟</SelectItem>
                                            <SelectItem value="15m">15分钟</SelectItem>
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
            </Drawer>
        </>
    );
}

export default LiveDataNode;