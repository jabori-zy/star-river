import { FuturesOrderNodeData } from "@/types/node/futures-order-node";
import { OrderHandleItem } from "../order-handle-item";

interface LiveModeShowProps {
	id: string;
	data: FuturesOrderNodeData;
}

const LiveModeShow: React.FC<LiveModeShowProps> = ({ id, data }) => {
	// 获取实盘模式配置
	const liveConfig = data.liveConfig;

	const exchangeName = liveConfig?.selectedLiveAccount?.exchange;

	// 如果没有配置或者没有订单配置，显示提示信息
	if (
		!liveConfig ||
		!liveConfig.futuresOrderConfigs ||
		liveConfig.futuresOrderConfigs.length === 0
	) {
		return (
			<div className="text-sm text-muted-foreground p-2 text-center">
				暂无订单配置
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center mb-1">
				<span className="text-xs text-muted-foreground">订单将会发送至</span>
				<span className="text-xs font-bold ">{exchangeName}</span>
			</div>
			{/* 渲染所有的订单配置 */}
			{liveConfig.futuresOrderConfigs.map((config) => (
				<OrderHandleItem id={id} key={config.orderId} orderConfig={config} />
			))}
		</div>
	);
};

export default LiveModeShow;
