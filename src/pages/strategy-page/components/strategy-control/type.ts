import type { StrategyRunState, TradeMode } from "@/types/strategy"

export type OperationType = 'init' | 'stop'

export interface StrategyControlProps {
    strategyId: number,
    strategyName: string,
    tradeMode: TradeMode,
    strategyRunState: StrategyRunState,
    onOperationSuccess?: (operationType: OperationType) => void,
}




export interface BacktestControlProps {
    strategyId: number,
    strategyRunState: StrategyRunState,
    onStartBacktest: (strategyId: number) => void,
    onStopBacktest: () => void,
    onOpenBacktestWindow: () => void,
    onReopenDialog?: (operationType: OperationType) => void,
}