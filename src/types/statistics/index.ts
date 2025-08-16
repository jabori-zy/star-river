


export type StrategyStatsName = "balance" | "unrealizedPnl" | "totalEquity" | "cumulativeReturn" | "realizedPnl" | "positionCount";





export type StrategyStats = {
	timestamp: number;
    playIndex: number;
    balance: number;
    unrealizedPnl: number;
    totalEquity: number;
    cumulativeReturn: number;
    realizedPnl: number;
    positionCount: number;
};






