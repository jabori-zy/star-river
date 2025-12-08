import type { PositionNodeData } from "@/types/node/position-node";
import { PositionHandleItem } from "../position-handle-item/index";

interface SimulateModeShowProps {
	id: string;
	data: PositionNodeData;
}

const SimulateModeShow: React.FC<SimulateModeShowProps> = ({ id, data }) => {
	// Get simulate mode config
	const simulateConfig = data.simulateConfig;

	// If no config or no position operations, show hint message
	if (
		!simulateConfig ||
		!simulateConfig.positionOperations ||
		simulateConfig.positionOperations.length === 0
	) {
		return (
			<div className="text-sm text-muted-foreground p-2 text-center">
				No position operation configured
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{/* Show account info */}
			{simulateConfig.selectedAccount && (
				<div className="text-xs text-muted-foreground px-2">
					Account: {simulateConfig.selectedAccount.accountName} (
					{simulateConfig.selectedAccount.exchange})
				</div>
			)}

			{/* Render all position operations */}
			{simulateConfig.positionOperations.map((operationConfig) => (
				<PositionHandleItem
					key={operationConfig.configId}
					id={id}
					operationConfig={operationConfig}
				/>
			))}
		</div>
	);
};

export default SimulateModeShow;
