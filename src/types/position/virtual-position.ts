import type { Exchange } from "../market";
import type { NodeId } from "../node";
import type { OrderId } from "../order";
import type { StrategyId } from "../strategy";
import type { PositionId, PositionSide, PositionState } from ".";

export type VirtualPosition = {
	positionId: PositionId;
	orderId: OrderId;
	strategyId: StrategyId;
	nodeId: NodeId;
	exchange: string | Exchange;
	symbol: string;
	positionSide: PositionSide;
	positionState: PositionState; // 持仓状态
	quantity: number;
	openPrice: number;
	currentPrice: number;
	tp: number | null;
	sl: number | null;
	unrealizedProfit: number; // 未实现盈亏
	forcePrice: number; // 强制平仓价格
	margin: number; // 保证金
	marginRatio: number; // 保证金比例
	createTime: string;
	updateTime: string;
};
