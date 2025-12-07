import type { Exchange } from "@/types/market";
import { FuturesOrderSide, OrderStatus, OrderType } from "./index";

export type VirtualOrder = {
	orderId: number; // Order ID

	strategyId: string; // Strategy ID

	nodeId: string; // Node ID

	orderConfigId: number; // Order config ID

	exchange: string | Exchange; // Exchange

	symbol: string; // Trading symbol

	orderSide: FuturesOrderSide; // Order side

	orderType: OrderType; // Order type

	orderStatus: OrderStatus; // Order status

	quantity: number; // Quantity

	openPrice: number; // Open price

	tp: number | null; // Take profit price

	sl: number | null; // Stop loss price

	createTime: string; // Create time

	updateTime: string; // Update time
};

// Order side style
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

// Order side text
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

// Order status style
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

// Order status text
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

// Order type text
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
