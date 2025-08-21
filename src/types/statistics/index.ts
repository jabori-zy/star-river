


export type StrategyStatsName = 
    "balance" | 
    "unrealizedPnl" | 
    "equity" | 
    "cumulativeReturn" | 
    "realizedPnl" | 
    "positionCount";





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






