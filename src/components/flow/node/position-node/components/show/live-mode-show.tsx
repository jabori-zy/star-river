import type { PositionNodeData } from "@/types/node/position-node";
import { PositionHandleItem } from "../position-handle-item";

interface LiveModeShowProps {
	id: string;
	data: PositionNodeData;
}

const LiveModeShow: React.FC<LiveModeShowProps> = ({ id, data }) => {
	// Get live mode config
	const liveConfig = data.liveConfig;

	// If no config or no position operations, show hint message
	if (
		!liveConfig ||
		!liveConfig.positionOperations ||
		liveConfig.positionOperations.length === 0
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
			{liveConfig.selectedAccount && (
				<div className="text-xs text-muted-foreground px-2">
					Account: {liveConfig.selectedAccount.accountName} (
					{liveConfig.selectedAccount.exchange})
				</div>
			)}

			{/* Render all position operations */}
			{liveConfig.positionOperations.map((operationConfig) => (
				<PositionHandleItem
					key={operationConfig.configId}
					id={id}
					operationConfig={operationConfig}
				/>
			))}
		</div>
	);
};

export default LiveModeShow;
