import {
	type EdgeProps,
	getBezierPath,
	BaseEdge as ReactFlowBaseEdge,
} from "@xyflow/react";
import React from "react";

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
			return "#101112"; // 选中时黑色
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
