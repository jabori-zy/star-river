import type { FuturesOrderNodeData } from "@/types/node/futures-order-node";
import OrderHandleItem from "../order-handle-item";

interface LiveModeShowProps {
	id: string;
	data: FuturesOrderNodeData;
}

const LiveModeShow: React.FC<LiveModeShowProps> = ({ id, data }) => {
	// Get live mode config
	const liveConfig = data.liveConfig;

	const exchangeName = liveConfig?.selectedLiveAccount?.exchange;

	// If no config or no order configs, show hint message
	if (
		!liveConfig ||
		!liveConfig.futuresOrderConfigs ||
		liveConfig.futuresOrderConfigs.length === 0
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
			{liveConfig.futuresOrderConfigs.map((config) => (
				<OrderHandleItem id={id} key={config.orderId} orderConfig={config} />
			))}
		</div>
	);
};

export default LiveModeShow;
