import type { FuturesOrderNodeData } from "@/types/node/futures-order-node";
import OrderHandleItem from "../order-handle-item";

interface SimulateModeShowProps {
	id: string;
	data: FuturesOrderNodeData;
	handleColor: string;
}

const SimulateModeShow: React.FC<SimulateModeShowProps> = ({
	id,
	data,
	handleColor,
}) => {
	// Get simulate mode config
	const simulateConfig = data.simulateConfig;

	const exchangeName = simulateConfig?.selectedSimulateAccount?.exchange;

	// If no config or no order configs, show hint message
	if (
		!simulateConfig ||
		!simulateConfig.futuresOrderConfigs ||
		simulateConfig.futuresOrderConfigs.length === 0
	) {
		return (
			<div className="text-sm text-muted-foreground p-2 text-center">
				No order configured
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center mb-1">
				<span className="text-xs text-muted-foreground">Orders will be sent to </span>
				<span className="text-xs font-bold ">{exchangeName}</span>
			</div>
			{/* Render all order configs */}
			{simulateConfig.futuresOrderConfigs.map((config) => (
				<OrderHandleItem
					key={config.orderConfigId}
					id={id}
					orderConfig={config}
					handleColor={handleColor}
				/>
			))}
		</div>
	);
};

export default SimulateModeShow;
