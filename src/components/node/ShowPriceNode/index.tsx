import { useCallback, useState, useEffect } from 'react';
import {
    Handle, 
    type NodeProps, 
    Position,
    useNodeConnections,
    useNodesData,
    Connection,
    HandleType,
    useReactFlow

} from '@xyflow/react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

function ShowPriceNode({id, data, isConnectable}:NodeProps) {
    
    const [price, setPrice] = useState(0);

    const connections = useNodeConnections({
        type: 'target',
        handleId: 'data_fetch_node_source'
    });


    const sourceNodeId = connections?.[0]?.source;
    // console.log(sourceNodeId);

    const priceNodeData = useNodesData(sourceNodeId);

    useEffect(() => {
        setPrice(priceNodeData?.data?.price as number);
    }, [priceNodeData]);

    
    return (
        <div className="show-price-node">
            <Card>
                <CardHeader>
                    <CardTitle>展示价格</CardTitle>
                    <CardDescription>
                        {connections && connections.length > 0
                            ? '已连接到数据源'
                            : '请连接到数据源'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <div>
                        <label htmlFor="text">价格: {price}</label>
                    </div>
                </CardContent>
                <Handle 
                    type="target"
                    position={Position.Left}
                    id="show_price_node_handle"
                    className="w-3 h-3"
                    isConnectable={isConnectable}
                />
            </Card>
        </div>
    );
}

export default ShowPriceNode;
