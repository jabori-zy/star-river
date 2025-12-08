import {
	type EdgeProps,
	getBezierPath,
	BaseEdge as ReactFlowBaseEdge,
} from "@xyflow/react";
import React from "react";

/**
 * Custom edge
 */
const BaseEdge: React.FC<EdgeProps> = ({ selected, ...props }) => {
	const [edgePath] = getBezierPath({
		...props,
	});

	// Calculate edge color based on connected nodes' hover state and selected state
	const stroke = React.useMemo(() => {
		if (selected) {
			return "#101112"; // Black when selected
		}

		return "#9ca3af"; // Default gray
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
