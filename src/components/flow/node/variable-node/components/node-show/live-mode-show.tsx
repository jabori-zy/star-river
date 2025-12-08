import type React from "react";
import type { VariableNodeData } from "@/types/node/variable-node";
import { VariableHandleItem } from "../variable-handle-item/index";

interface LiveModeShowProps {
	id: string;
	data: VariableNodeData;
}

const LiveModeShow: React.FC<LiveModeShowProps> = ({ id, data }) => {
	// Get live mode configuration
	const liveConfig = data.liveConfig;

	// If no config or no variable configs, show hint message
	if (
		!liveConfig ||
		!liveConfig.variableConfigs ||
		liveConfig.variableConfigs.length === 0
	) {
		return (
			<div className="text-sm text-muted-foreground p-2 text-center">
				暂无变量配置
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{/* Render all variable configs */}
			{liveConfig.variableConfigs.map((variableConfig) => (
				<VariableHandleItem
					key={variableConfig.configId}
					id={id}
					variableConfig={variableConfig}
				/>
			))}
		</div>
	);
};

export default LiveModeShow;
