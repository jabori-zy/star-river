import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayIcon } from 'lucide-react';

function StartNode({ data, isConnectable }: NodeProps) {
    return (
        <Card className="w-[200px] border-2  ">
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
                    {data.strategyTitle || "我的策略"}
                </div>
            </CardHeader>

            <Handle 
                type="source" 
                position={Position.Right} 
                id="start_node_source"
                className="w-2.5 h-2.5 !bg-green-500"
                isConnectable={isConnectable}
            />
        </Card>
    );
}

export default StartNode;
