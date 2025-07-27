import type { Exchange } from "@/types/common";
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
