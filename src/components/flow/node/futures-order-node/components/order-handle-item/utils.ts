import {
	type FuturesOrderConfig,
	FuturesOrderSide,
	OrderStatus,
	OrderType,
} from "@/types/order";

export const formatOrderConfig = (config: FuturesOrderConfig): string => {
	const side = config.orderSide === FuturesOrderSide.OPEN_LONG ? "多" : "空";
	const type = getOrderTypeLabel(config.orderType);
	const isMarketOrder =
		config.orderType === OrderType.MARKET ||
		config.orderType === OrderType.STOP_MARKET;

	let result = `${config.symbol} ${side} ${type} ${config.quantity}`;

	if (!isMarketOrder) {
		result += ` @${config.price}`;
	}

	if (config.tp) {
		result += ` TP:${config.tp}`;
	}

	if (config.sl) {
		result += ` SL:${config.sl}`;
	}

	return result;
};

export const getOrderTypeLabel = (type: OrderType): string => {
	const labels = {
		[OrderType.LIMIT]: "限价",
		[OrderType.MARKET]: "市价",
		[OrderType.STOP_LIMIT]: "止损限价",
		[OrderType.STOP_MARKET]: "止损市价",
		[OrderType.TAKE_PROFIT_MARKET]: "止盈",
		[OrderType.TAKE_PROFIT_LIMIT]: "止盈限价",
	};
	return labels[type] || type;
};

export const getOrderSideLabel = (side: FuturesOrderSide): string => {
	const labels = {
		[FuturesOrderSide.OPEN_LONG]: "多",
		[FuturesOrderSide.OPEN_SHORT]: "空",
	};
	return labels[side] || side;
};

export const getOrderConfigSummary = (
	configs: FuturesOrderConfig[],
): string => {
	if (configs.length === 0) return "无订单配置";
	if (configs.length === 1) return formatOrderConfig(configs[0]);
	return `${configs.length}个订单配置`;
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
	const labels = {
		[OrderStatus.CREATED]: "已创建",
		[OrderStatus.PLACED]: "已挂单",
		[OrderStatus.PARTIAL]: "部分成交",
		[OrderStatus.FILLED]: "全部成交",
		[OrderStatus.CANCELLED]: "已取消",
		[OrderStatus.EXPIRED]: "已过期",
		[OrderStatus.REJECTED]: "已拒绝",
		[OrderStatus.ERROR]: "错误",
	};
	return labels[status] || status;
};
