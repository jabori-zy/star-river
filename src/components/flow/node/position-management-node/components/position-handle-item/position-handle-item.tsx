import {
	PositionOperation,
	PositionOperationConfig,
} from "@/types/node/position-management-node";
import { UpdateHandleItem } from "./opt/update-handle-item";
import { CloseAllHandleItem } from "./opt/close-all-handle-item";

interface PositionHandleItemProps {
	id: string; // 节点id
	operationConfig: PositionOperationConfig;
}

export function PositionHandleItem({
	id,
	operationConfig,
}: PositionHandleItemProps) {
	return (
		// 根据操作类型返回不同的item
		<div>
			{operationConfig.positionOperation === PositionOperation.UPDATE && (
				<UpdateHandleItem id={id} operationConfig={operationConfig} />
			)}
			{operationConfig.positionOperation === PositionOperation.CLOSEALL && (
				<CloseAllHandleItem id={id} operationConfig={operationConfig} />
			)}
		</div>
	);
}
