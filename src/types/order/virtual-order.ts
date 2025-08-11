import type { Exchange } from "@/types/market";
import type { FuturesOrderSide, OrderStatus, OrderType } from "./index";

export type VirtualOrder = {
	orderId: string; // 订单ID

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


// 格式化日期时间
export const formatDateTime = (dateTimeStr: string) => {
	if (!dateTimeStr) return "-";
	try {
		const date = new Date(dateTimeStr);
		return date
			.toLocaleString("zh-CN", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			})
			.replace(/\//g, "-");
	} catch {
		return dateTimeStr;
	}
};

// 订单方向样式
export const getOrderSideStyle = (side: string) => {
	switch (side) {
		case "buy":
		case "BUY":
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case "sell":
		case "SELL":
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
	}
};

// 订单方向文本
export const getOrderSideText = (side: string) => {
	switch (side) {
		case "buy":
		case "BUY":
			return "买入";
		case "sell":
		case "SELL":
			return "卖出";
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
export const getOrderStatusText = (status: string) => {
	switch (status) {
		case "FILLED":
		case "filled":
			return "已成交";
		case "PENDING":
		case "pending":
			return "待成交";
		case "CANCELED":
		case "canceled":
			return "已取消";
		case "FAILED":
		case "failed":
			return "失败";
		default:
			return status;
	}
};

// 订单类型文本
export const getOrderTypeText = (type: string) => {
	switch (type) {
		case "MARKET":
		case "market":
			return "市价单";
		case "LIMIT":
		case "limit":
			return "限价单";
		case "STOP":
		case "stop":
			return "止损单";
		case "STOP_LIMIT":
		case "stop_limit":
			return "止损限价单";
		default:
			return type;
	}
};