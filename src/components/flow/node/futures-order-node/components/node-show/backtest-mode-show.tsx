import type { FuturesOrderNodeData } from "@/types/node/futures-order-node";
import { OrderHandleItem } from "../order-handle-item";

interface BacktestModeShowProps {
	id: string;
	data: FuturesOrderNodeData;
	handleColor: string;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({ id, data, handleColor }) => {
	// 获取回测模式配置
	const backtestConfig = data.backtestConfig;

	const exchangeName =
		backtestConfig?.exchangeModeConfig?.selectedAccount?.exchange;

	// 如果没有配置或者没有订单配置，显示提示信息
	if (
		!backtestConfig ||
		!backtestConfig.futuresOrderConfigs ||
		backtestConfig.futuresOrderConfigs.length === 0
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
			{backtestConfig.futuresOrderConfigs.map((config) => (
				<OrderHandleItem
					id={id}
					key={config.orderConfigId}
					orderConfig={config}
					handleColor={handleColor}
				/>
			))}
		</div>
	);
};

export default BacktestModeShow;
