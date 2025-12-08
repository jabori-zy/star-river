import { Position } from "@xyflow/react";
import BaseHandle from "@/components/flow/base/BaseHandle";

export const getLimitOrderHandleGroup = (
	nodeId: string,
	orderConfigId: number,
	handleColor: string,
) => {
	return (
		<div className="flex flex-row gap-1">
			<BaseHandle
				id={`${nodeId}_all_status_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-2"
			/>
			<BaseHandle
				id={`${nodeId}_created_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-8"
			/>

			<BaseHandle
				id={`${nodeId}_placed_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-14"
			/>

			<BaseHandle
				id={`${nodeId}_partial_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-20"
			/>
			<BaseHandle
				id={`${nodeId}_filled_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-26"
			/>
			<BaseHandle
				id={`${nodeId}_canceled_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-32"
			/>
			<BaseHandle
				id={`${nodeId}_expired_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-38"
			/>
			<BaseHandle
				id={`${nodeId}_rejected_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-44"
			/>
			<BaseHandle
				id={`${nodeId}_error_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-50"
			/>
		</div>
	);
};

export const getMarketOrderHandleGroup = (
	nodeId: string,
	orderConfigId: number,
	handleColor: string,
) => {
	return (
		<div className="flex flex-row gap-1">
			<BaseHandle
				id={`${nodeId}_all_status_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-2"
			/>
			<BaseHandle
				id={`${nodeId}_created_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-8"
			/>

			<BaseHandle
				id={`${nodeId}_partial_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-14"
			/>
			<BaseHandle
				id={`${nodeId}_filled_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-20"
			/>
			<BaseHandle
				id={`${nodeId}_canceled_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-26"
			/>
			<BaseHandle
				id={`${nodeId}_expired_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-32"
			/>
			<BaseHandle
				id={`${nodeId}_rejected_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-38"
			/>
			<BaseHandle
				id={`${nodeId}_error_output_${orderConfigId}`}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-44"
			/>
		</div>
	);
};
