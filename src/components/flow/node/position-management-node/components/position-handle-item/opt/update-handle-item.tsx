import { Position } from "@xyflow/react";
import BaseHandle from "@/components/flow/base/BaseHandle";
import type { PositionOperationConfig } from "@/types/node/position-management-node";
import { formatSymbolDisplay, getPositionOperationLabel } from "../utils";

interface UpdateHandleItemProps {
	id: string; // 节点id
	operationConfig: PositionOperationConfig;
}

export function UpdateHandleItem({
	id,
	operationConfig,
}: UpdateHandleItemProps) {
	const operationLabel = getPositionOperationLabel(
		operationConfig.positionOperation,
	);

	return (
		<div className="relative">
			{/* 标题 */}
			<div className="flex items-center justify-between gap-2 pr-2 pl-1 mb-1 relative ">
				<span className="text-xs font-bold text-muted-foreground">
					操作{operationConfig.positionOperationId}
				</span>
				{/* 入口 */}
				<BaseHandle
					id={`${id}_input${operationConfig.positionOperationId}`}
					type="target"
					position={Position.Left}
					handleColor="!bg-black"
					className="-translate-x-2 -translate-y-3"
				/>
			</div>

			<div className="flex flex-row justify-between gap-2">
				{/* 操作配置 */}
				<div className="flex items-center justify-between px-2 py-2 bg-gray-100 rounded-md relative flex-1">
					<div className="flex items-center gap-2 justify-between w-full">
						<div className="flex flex-col gap-1 flex-1">
							{/* 操作名称 */}
							<div className="text-xs font-medium">
								{operationConfig.positionOperationName || "未设置操作名称"}
							</div>

							<div className="flex items-center gap-2">
								<span className="text-xs text-muted-foreground">操作:</span>
								<span className="bg-orange-100 px-1 rounded text-xs font-medium">
									{operationLabel}
								</span>
							</div>

							{/* 交易对信息 */}
							<div className="flex items-center gap-2">
								<span className="text-xs text-muted-foreground">交易对:</span>
								<span className="bg-blue-100 px-1 rounded text-xs">
									{formatSymbolDisplay(operationConfig.symbol)}
								</span>
							</div>
						</div>
					</div>
				</div>
				{/* 出口名称 */}
				<div className="flex flex-col justify-between py-2 ">
					<div className="text-xs text-green-400">成功</div>
					<div className="text-xs text-red-400">失败</div>
				</div>
			</div>
			{/* handle出口 */}
			<div className="flex flex-row gap-1">
				<BaseHandle
					id={`${id}_${operationConfig.positionOperation}_success_output${operationConfig.positionOperationId}`}
					type="source"
					position={Position.Right}
					handleColor="!bg-green-400"
					className="translate-x-2 translate-y-4"
				/>
				<BaseHandle
					id={`${id}_${operationConfig.positionOperation}_failed_output${operationConfig.positionOperationId}`}
					type="source"
					position={Position.Right}
					handleColor="!bg-red-400"
					className="translate-x-2 translate-y-14"
				/>
			</div>
		</div>
	);
}
