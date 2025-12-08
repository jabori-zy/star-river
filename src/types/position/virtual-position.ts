import type { Exchange } from "../market";
import type { StrategyId } from "../strategy";
import type { PositionId, PositionSide, PositionState } from ".";

export type VirtualPosition = {
	positionId: PositionId;
	strategyId: StrategyId;
	exchange: string | Exchange;
	symbol: string;
	positionSide: PositionSide;
	positionState: PositionState; // Position state
	quantity: number;
	openPrice: number;
	currentPrice: number;
	unrealizedProfit: number; // Unrealized profit/loss
	forcePrice: number; // Forced liquidation price
	margin: number; // Margin
	marginRatio: number; // Margin ratio
	roi: number; // Return on investment
	createTime: string;
	updateTime: string;
};
