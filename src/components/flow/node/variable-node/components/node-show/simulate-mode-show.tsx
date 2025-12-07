import type React from "react";
import type { VariableNodeData } from "@/types/node/variable-node";
import { VariableHandleItem } from "../variable-handle-item/index";

interface SimulateModeShowProps {
	id: string;
	data: VariableNodeData;
}

const SimulateModeShow: React.FC<SimulateModeShowProps> = ({ id, data }) => {
	// Get simulation mode configuration
	const simulateConfig = data.simulateConfig;

	// If no config or no variable configs, show hint message
	if (
		!simulateConfig ||
		!simulateConfig.variableConfigs ||
		simulateConfig.variableConfigs.length === 0
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
			{simulateConfig.variableConfigs.map((variableConfig) => (
				<VariableHandleItem
					key={variableConfig.configId}
					id={id}
					variableConfig={variableConfig}
				/>
			))}
		</div>
	);
};

export default SimulateModeShow;
