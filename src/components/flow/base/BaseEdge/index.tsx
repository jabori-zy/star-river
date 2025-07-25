import React from "react";
import {
	BaseEdge as ReactFlowBaseEdge,
	EdgeProps,
	getBezierPath,
} from "@xyflow/react";

/**
 * 自定义边
 */
const BaseEdge: React.FC<EdgeProps> = ({ selected, ...props }) => {
	const [edgePath] = getBezierPath({
		...props,
	});

	// 根据连接节点的悬停状态和选中状态计算边的颜色
	const stroke = React.useMemo(() => {
		if (selected) {
			return "#3b82f6"; // 选中时蓝色
		}

		return "#9ca3af"; // 默认灰色
	}, [selected]);

	return (
		<ReactFlowBaseEdge
			path={edgePath}
			style={{
				stroke,
				strokeWidth: 2,
			}}
		/>
	);
};

export default BaseEdge;
