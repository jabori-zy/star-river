import type { TFunction } from "i18next";
import type { ConditionTrigger } from "@/types/condition-trigger";

export type { VirtualOrder } from "./virtual-order";

export type OrderId = number;

export enum OrderType {
	LIMIT = "LIMIT", // Limit order
	MARKET = "MARKET", // Market order
	STOP_LIMIT = "STOP_LIMIT", // Stop limit order
	STOP_MARKET = "STOP_MARKET", // Stop market order
	TAKE_PROFIT_MARKET = "TAKE_PROFIT_MARKET", // Take profit market order
	TAKE_PROFIT_LIMIT = "TAKE_PROFIT_LIMIT", // Take profit limit order
}

export const getOrderTypeLabel = (type: OrderType, t: TFunction): string => {
	const labels: Record<OrderType, string> = {
		[OrderType.LIMIT]: t("market.orderType.limit"),
		[OrderType.MARKET]: t("market.orderType.market"),
		[OrderType.STOP_LIMIT]: t("market.orderType.stopLimit"),
		[OrderType.STOP_MARKET]: t("market.orderType.stopMarket"),
		[OrderType.TAKE_PROFIT_MARKET]: t("market.orderType.takeProfitMarket"),
		[OrderType.TAKE_PROFIT_LIMIT]: t("market.orderType.takeProfitLimit"),
	};
	return labels[type];
};

export const getTpSlTypeLabel = (
	type: "price" | "percentage" | "point",
	t: TFunction,
): string => {
	const labels: Record<"price" | "percentage" | "point", string> = {
		price: t("futuresOrderNode.tpSlType.price"),
		percentage: t("futuresOrderNode.tpSlType.percentage"),
		point: t("futuresOrderNode.tpSlType.point"),
	};
	return labels[type];
};

export enum SpotOrderSide {
	BUY = "BUY", // Buy
	SELL = "SELL", // Sell
}

export enum FuturesOrderSide {
	LONG = "LONG", // Long
	SHORT = "SHORT", // Short
}

export const getFuturesOrderSideLabel = (
	side: FuturesOrderSide,
	t: TFunction,
): string => {
	const labels: Record<FuturesOrderSide, string> = {
		[FuturesOrderSide.LONG]: t("market.futuresOrderSide.long"),
		[FuturesOrderSide.SHORT]: t("market.futuresOrderSide.short"),
	};
	return labels[side];
};

export const getFuturesOrderSideColor = (side: FuturesOrderSide): string => {
	const colors: Record<FuturesOrderSide, string> = {
		[FuturesOrderSide.LONG]: "text-green-600 dark:text-green-400",
		[FuturesOrderSide.SHORT]: "text-red-600 dark:text-red-400",
	};
	return colors[side];
};

export enum OrderStatus {
	CREATED = "CREATED", // Created
	PLACED = "PLACED", // Placed
	PARTIAL = "PARTIAL", // Partially filled
	FILLED = "FILLED", // Filled
	CANCELED = "CANCELED", // Canceled
	EXPIRED = "EXPIRED", // Expired
	REJECTED = "REJECTED", // Rejected
	ERROR = "ERROR", // Error
}

export const getOrderStatusLabel = (
	status: OrderStatus,
	t: TFunction,
): string => {
	const labels: Record<OrderStatus, string> = {
		[OrderStatus.CREATED]: t("market.orderStatus.created"),
		[OrderStatus.PLACED]: t("market.orderStatus.placed"),
		[OrderStatus.PARTIAL]: t("market.orderStatus.partial"),
		[OrderStatus.FILLED]: t("market.orderStatus.filled"),
		[OrderStatus.CANCELED]: t("market.orderStatus.canceled"),
		[OrderStatus.EXPIRED]: t("market.orderStatus.expired"),
		[OrderStatus.REJECTED]: t("market.orderStatus.rejected"),
		[OrderStatus.ERROR]: t("market.orderStatus.error"),
	};
	return labels[status];
};

export type FuturesOrderConfig = {
	orderConfigId: number;
	inputHandleId: string;
	outputHandleIds: string[];
	symbol: string;
	orderType: OrderType;
	orderSide: FuturesOrderSide;
	price: number;
	quantity: number;
	tp: number | null;
	sl: number | null;
	tpType: "price" | "percentage" | "point" | null;
	slType: "price" | "percentage" | "point" | null;
	triggerConfig: ConditionTrigger | null;
};
