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

// 终端状态文本
export const getTerminalStatus = (status: string) => {
	switch (status) {
		case "connected":
			return "已连接";
		case "disconnected":
			return "未连接";
	}
};

// 终端状态样式
export const getTerminalStatusStyle = (status: string) => {
	switch (status) {
		case "connected":
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case "disconnected":
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		case "connecting":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
	}
};

// EA状态样式
export const getEAStatusStyle = (status: string) => {
	switch (status) {
		case "open":
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case "close":
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
	}
};

// EA状态文本
export const getEAStatus = (status: string) => {
	switch (status) {
		case "open":
			return "已开启";
		case "close":
			return "已关闭";
	}
};
