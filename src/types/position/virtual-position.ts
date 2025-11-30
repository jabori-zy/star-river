import type { Exchange } from "../market";
import type { StrategyId } from "../strategy";
import type { PositionId, PositionSide, PositionState } from ".";

export type VirtualPosition = {
	positionId: PositionId;
	strategyId: StrategyId;
	exchange: string | Exchange;
	symbol: string;
	positionSide: PositionSide;
	positionState: PositionState; // 持仓状态
	quantity: number;
	openPrice: number;
	currentPrice: number;
	unrealizedProfit: number; // 未实现盈亏
	forcePrice: number; // 强制平仓价格
	margin: number; // 保证金
	marginRatio: number; // 保证金比例
	roi: number; // 投资回报率
	createTime: string;
	updateTime: string;
};
