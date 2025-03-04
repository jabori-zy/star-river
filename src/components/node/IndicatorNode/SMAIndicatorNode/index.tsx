import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button} from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


import {
    Handle, 
    type NodeProps, 
    Position,
    useReactFlow
} from '@xyflow/react';

import { useState } from 'react';


function SMAIdicatorNode({id, data, isConnectable}:NodeProps) {
    const [smaPeriod, setSmaPeriod] = useState(9);
    const [isEditing, setIsEditing] = useState(false);

    return (
    <div className="sma-indicator-node">
        <Card>
            <CardHeader>
                <CardTitle>简单移动平均线</CardTitle>
                <CardDescription>计算简单移动平均线</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <div className="flex flex-row min-h-10 gap-2 p-2">
                    <Label className="nodrag" htmlFor="sma_period">周期:</Label>
                    {isEditing ? (
                        <>
                            <Input 
                                type="number" 
                                id="sma_period"
                                min="0"
                                value={smaPeriod}
                                onChange={(e) => setSmaPeriod(Number(e.target.value))}
                                onInput={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    if (input.value < "0") {
                                        input.value = "0";
                                    }
                                }}
                                placeholder="请输入周期"
                                className="nodrag [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            />
                            <Button 
                                className="nodrag"
                                onClick={() => setIsEditing(false)}
                            >
                                确认
                            </Button>
                        </>
                    ) : (
                        <>
                            <span className="nodrag flex items-center">{smaPeriod}</span>
                            <Button 
                                className="nodrag hover:bg-primary hover:text-primary-foreground border border-input"
                                variant="ghost"
                                onClick={() => setIsEditing(true)}
                            >
                                修改
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button className="nodrag" onClick={() => {}}>获取指标</Button>
            </CardFooter>
        </Card>
    </div>
    )
}


export default SMAIdicatorNode;
