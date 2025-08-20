import { Position } from "@xyflow/react";
import BaseHandle from "@/components/flow/base/BaseHandle";

export const getLimitOrderHandleGroup = (
	nodeId: string,
	orderConfigId: number,
) => {
	return (
		<div className="flex flex-row gap-1">
			<BaseHandle
				id={`${nodeId}_created_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-2"
			/>

			<BaseHandle
				id={`${nodeId}_placed_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-8"
			/>

			<BaseHandle
				id={`${nodeId}_partial_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-14"
			/>
			<BaseHandle
				id={`${nodeId}_filled_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-20"
			/>
			<BaseHandle
				id={`${nodeId}_canceled_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-26"
			/>
			<BaseHandle
				id={`${nodeId}_expired_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-32"
			/>
			<BaseHandle
				id={`${nodeId}_rejected_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-38"
			/>
			<BaseHandle
				id={`${nodeId}_error_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-44"
			/>
		</div>
	);
};

export const getMarketOrderHandleGroup = (
	nodeId: string,
	orderConfigId: number,
) => {
	return (
		<div className="flex flex-row gap-1">
			<BaseHandle
				id={`${nodeId}_created_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-2"
			/>

			<BaseHandle
				id={`${nodeId}_partial_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-8"
			/>
			<BaseHandle
				id={`${nodeId}_filled_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-14"
			/>
			<BaseHandle
				id={`${nodeId}_canceled_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-20"
			/>
			<BaseHandle
				id={`${nodeId}_expired_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-26"
			/>
			<BaseHandle
				id={`${nodeId}_rejected_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-32"
			/>
			<BaseHandle
				id={`${nodeId}_error_output${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black-400"
				className="translate-x-2 translate-y-38"
			/>
		</div>
	);
};
