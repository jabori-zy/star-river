import { useCallback } from "react"
import { StrategyControlProps, type OperationType } from "./type"
import BacktestControl from "./backtest-control"
import { TradeMode } from "@/types/strategy"
import { useInitBacktestStrategy } from "@/service/backtest-strategy/init-strategy"
import { useStopBacktestStrategy } from "@/service/backtest-strategy/stop-strategy"
import { openBacktestWindow } from "@/utils/open-backtest-window"



const StrategyControl: React.FC<StrategyControlProps> = ({
    strategyId,
    tradeMode,
    strategyRunState,
    onOperationSuccess,
}) => {

    // Use useInitBacktestStrategy hook
    const { mutate: initBacktestStrategy } = useInitBacktestStrategy({
        meta: {
            showSuccessToast: false,
            errorMessage: "策略初始化失败",
            showErrorToast: true,
        },
        onSuccess: () => {
            onOperationSuccess?.('init');
        },
    })

    // Use useStopBacktestStrategy hook
    const { mutate: stopBacktestStrategy } = useStopBacktestStrategy({
        meta: {
            showSuccessToast: true,
            successMessage: "策略已停止",
            errorMessage: "停止策略失败",
            showErrorToast: true,
        },
        onSuccess: () => {
            onOperationSuccess?.('stop');
        },
    })

    const handleRunBacktest = useCallback(() => {
        if (!strategyId) return

        // Initialize backtest strategy
        initBacktestStrategy({ strategyId })
    }, [strategyId, initBacktestStrategy])

    const handleStopBacktest = useCallback(() => {
        if (!strategyId) return

        // Stop backtest strategy
        stopBacktestStrategy({ strategyId })
    }, [strategyId, stopBacktestStrategy])

    const handleOpenBacktestWindow = useCallback(() => {
        if (!strategyId) return

        // Open backtest window
        openBacktestWindow(strategyId)
    }, [strategyId])

    const handleReopenDialog = useCallback((operationType: OperationType) => {
        onOperationSuccess?.(operationType)
    }, [onOperationSuccess])

    switch (tradeMode) {
        case TradeMode.BACKTEST:
            return (
                <BacktestControl
                    strategyId={strategyId}
                    strategyRunState={strategyRunState}
                    onStartBacktest={handleRunBacktest}
                    onStopBacktest={handleStopBacktest}
                    onOpenBacktestWindow={handleOpenBacktestWindow}
                    onReopenDialog={handleReopenDialog}
                />
            )
        default:
            return null;
    }
}


export default StrategyControl;