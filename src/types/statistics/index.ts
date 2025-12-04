export type StrategyStatsName =
	| "balance"
	| "unrealizedPnl"
	| "equity"
	| "cumulativeReturn"
	| "realizedPnl"
	| "availableBalance";

	
export type StrategyStats = {
	datetime: string;
	availableBalance: number;
	balance: number;
	unrealizedPnl: number;
	equity: number;
	cumulativeReturn: number;
	realizedPnl: number;
};
