export type StrategyStatsName =
	| "balance"
	| "unrealizedPnl"
	| "equity"
	| "cumulativeReturn"
	| "realizedPnl"
	| "positionCount";

export type StrategyStats = {
	datetime: string;
	playIndex: number;
	balance: number;
	unrealizedPnl: number;
	equity: number;
	cumulativeReturn: number;
	realizedPnl: number;
	positionCount: number;
};
