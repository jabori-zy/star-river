import type { TFunction } from "i18next";
import type { ConditionTrigger } from "@/types/condition-trigger";
export type { VirtualOrder } from "./virtual-order";

export type OrderId = number;

export enum OrderType {
	LIMIT = "LIMIT", // 限价单
	MARKET = "MARKET", // 市价单
	STOP_LIMIT = "STOP_LIMIT", // 止损限价单
	STOP_MARKET = "STOP_MARKET", // 止损市价单
	TAKE_PROFIT_MARKET = "TAKE_PROFIT_MARKET", // 止盈市价单
	TAKE_PROFIT_LIMIT = "TAKE_PROFIT_LIMIT", // 止盈限价单
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


export const getTpSlTypeLabel = (type: "price" | "percentage" | "point", t: TFunction): string => {
	const labels: Record<"price" | "percentage" | "point", string> = {
		price: t("futuresOrderNode.tpSlType.price"),
		percentage: t("futuresOrderNode.tpSlType.percentage"),
		point: t("futuresOrderNode.tpSlType.point"),
	};
	return labels[type];
};




export enum SpotOrderSide {
	BUY = "BUY", // 买入
	SELL = "SELL", // 卖出
}

export enum FuturesOrderSide {
	LONG = "LONG", // 做多
	SHORT = "SHORT", // 做空
}


export const getFuturesOrderSideLabel = (side: FuturesOrderSide, t: TFunction): string => {
	const labels: Record<FuturesOrderSide, string> = {
		[FuturesOrderSide.LONG]: t("market.futuresOrderSide.long"),
		[FuturesOrderSide.SHORT]: t("market.futuresOrderSide.short"),
	};
	return labels[side];
};

export const getFuturesOrderSideColor = (side: FuturesOrderSide): string => {
	const colors: Record<FuturesOrderSide, string> = {
		[FuturesOrderSide.LONG]: "#65a30d",
		[FuturesOrderSide.SHORT]: "#dc2626",
	};
	return colors[side];
};




export enum OrderStatus {
	CREATED = "CREATED", // 已创建
	PLACED = "PLACED", // 已挂单
	PARTIAL = "PARTIAL", // 部分成交
	FILLED = "FILLED", // 已执行
	CANCELED = "CANCELED", // 已取消
	EXPIRED = "EXPIRED", // 已过期
	REJECTED = "REJECTED", // 已拒绝
	ERROR = "ERROR", // 错误
}


export const getOrderStatusLabel = (status: OrderStatus, t: TFunction): string => {
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
