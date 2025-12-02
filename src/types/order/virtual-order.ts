import type { Exchange } from "@/types/market";
import { FuturesOrderSide, OrderStatus, OrderType } from "./index";

export type VirtualOrder = {
	orderId: number; // 订单ID

	strategyId: string; // 策略ID

	nodeId: string; // 节点ID

	orderConfigId: number; // 订单配置ID

	exchange: string | Exchange; // 交易所

	symbol: string; // 交易对

	orderSide: FuturesOrderSide; // 订单方向

	orderType: OrderType; // 订单类型

	orderStatus: OrderStatus; // 订单状态

	quantity: number; // 数量

	openPrice: number; // 开仓价格

	tp: number | null; // 止盈价格

	sl: number | null; // 止损价格

	createTime: string; // 创建时间

	updateTime: string; // 更新时间
};

// 订单方向样式
export const getOrderSideStyle = (futuresOrderSide: FuturesOrderSide) => {
	switch (futuresOrderSide) {
		case FuturesOrderSide.LONG:
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case FuturesOrderSide.SHORT:
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
	}
};

// 订单方向文本
export const getOrderSideText = (
	side: FuturesOrderSide,
	t: (key: string) => string,
) => {
	switch (side) {
		case FuturesOrderSide.LONG:
			return t("market.futuresOrderSide.long");
		case FuturesOrderSide.SHORT:
			return t("market.futuresOrderSide.short");
		default:
			return side;
	}
};

// 订单状态样式
export const getOrderStatusStyle = (status: string) => {
	switch (status) {
		case "FILLED":
		case "filled":
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case "PENDING":
		case "pending":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
		case "CANCELED":
		case "canceled":
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		case "FAILED":
		case "failed":
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
	}
};

// 订单状态文本
export const getOrderStatusText = (
	status: OrderStatus,
	t: (key: string) => string,
) => {
	switch (status) {
		case OrderStatus.FILLED:
			return t("market.orderStatus.filled");
		case OrderStatus.PLACED:
			return t("market.orderStatus.placed");
		case OrderStatus.PARTIAL:
			return t("market.orderStatus.partial");
		case OrderStatus.CANCELED:
			return t("market.orderStatus.canceled");
		case OrderStatus.CREATED:
			return t("market.orderStatus.created");
		case OrderStatus.EXPIRED:
			return t("market.orderStatus.expired");
		case OrderStatus.REJECTED:
			return t("market.orderStatus.rejected");
		case OrderStatus.ERROR:
			return t("market.orderStatus.error");
		default:
			return status;
	}
};

// 订单类型文本
export const getOrderTypeText = (
	type: OrderType,
	t: (key: string) => string,
) => {
	switch (type) {
		case OrderType.MARKET:
			return t("market.orderType.market");
		case OrderType.LIMIT:
			return t("market.orderType.limit");
		case OrderType.STOP_MARKET:
			return t("market.orderType.stopMarket");
		case OrderType.STOP_LIMIT:
			return t("market.orderType.stopLimit");
		case OrderType.TAKE_PROFIT_MARKET:
			return t("market.orderType.takeProfitMarket");
		case OrderType.TAKE_PROFIT_LIMIT:
			return t("market.orderType.takeProfitLimit");
		default:
			return type;
	}
};
