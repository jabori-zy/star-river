import type { FuturesOrderNodeData } from "@/types/node/futures-order-node";
import { OrderHandleItem } from "../order-handle-item";

interface SimulateModeShowProps {
	id: string;
	data: FuturesOrderNodeData;
	handleColor: string;
}

const SimulateModeShow: React.FC<SimulateModeShowProps> = ({ id,data, handleColor }) => {
	// 获取模拟模式配置
	const simulateConfig = data.simulateConfig;

	const exchangeName = simulateConfig?.selectedSimulateAccount?.exchange;

	// 如果没有配置或者没有订单配置，显示提示信息
	if (
		!simulateConfig ||
		!simulateConfig.futuresOrderConfigs ||
		simulateConfig.futuresOrderConfigs.length === 0
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
