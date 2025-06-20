import BaseHandle from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";

interface ElseCaseItemProps {
    handleId: string;
}

export function ElseCaseItem({ handleId }: ElseCaseItemProps) {
    return (
        <div className="flex items-center justify-between px-2 py-2 bg-gray-100 rounded-md relative mb-2">
            <div className="flex items-center gap-2 justify-between w-full">
                <div className="flex flex-col gap-1 flex-1">
                    {/* ELSE标签 */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">ELSE</span>
                    </div>
                    
                    {/* ELSE描述 */}
                    <div className="text-xs text-muted-foreground">
                        当条件都不满足时，执行ELSE分支
                    </div>
                </div>
            </div>
            
            {/* 右侧连接点 */}
            <BaseHandle
                id={handleId}
                type="source"
                position={Position.Right}
                handleColor="!bg-blue-400"
                className="translate-x-2 translate-y-2"
            />
        </div>
    );
}
