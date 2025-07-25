import BaseHandle from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";

interface ElseCaseItemProps {
	handleId: string;
}

export function ElseCaseItem({ handleId }: ElseCaseItemProps) {
	return (
		<div className="relative">
			{/* <div className="flex items-center justify-between px-2 py-2 bg-gray-100 rounded-md relative mb-2">
                <div className="text-xs text-muted-foreground">
                    当条件都不满足时，执行ELSE分支
                </div>
            </div> */}
			{/* ELSE标签 */}
			<div className="flex items-center justify-end gap-2 pr-2 pl-1 relative">
				<span className="text-sm font-bold">ELSE</span>
				<BaseHandle
					id={handleId}
					type="source"
					position={Position.Right}
					handleColor="!bg-blue-400"
					className="translate-x-2 -translate-y-2.5"
				/>
			</div>
		</div>
	);
}
