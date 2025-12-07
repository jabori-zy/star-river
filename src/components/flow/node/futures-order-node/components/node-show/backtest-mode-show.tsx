import { useTranslation } from "react-i18next";
import type { FuturesOrderNodeData } from "@/types/node/futures-order-node";
import OrderHandleItem from "../order-handle-item";

interface BacktestModeShowProps {
	id: string;
	data: FuturesOrderNodeData;
	handleColor: string;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({
	id,
	data,
	handleColor,
}) => {
	const { t } = useTranslation();
	// Get backtest mode config
	const backtestConfig = data.backtestConfig;

	const exchangeName =
		backtestConfig?.exchangeModeConfig?.selectedAccount?.exchange;

	// If no config or no order configs, show hint message
	if (
		!backtestConfig ||
		!backtestConfig.futuresOrderConfigs ||
		backtestConfig.futuresOrderConfigs.length === 0
	) {
		return (
			<div className="text-sm text-muted-foreground p-2 text-center">
				{t("futuresOrderNode.noOrderConfig")}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-1 mb-1">
				<span className="text-xs text-muted-foreground">
					{t("futuresOrderNode.orderSendDescription")}
				</span>
				<span className="text-xs font-bold">{exchangeName}</span>
			</div>
			{/* Render all order configs */}
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
