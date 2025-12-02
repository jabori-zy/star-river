import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useInitBacktestStrategy } from "@/service/backtest-strategy/init-strategy";
import { useStopBacktestStrategy } from "@/service/backtest-strategy/stop-strategy";
import { TradeMode } from "@/types/strategy";
import { openBacktestWindow } from "@/utils/open-backtest-window";
import BacktestControl from "./backtest-control";
import type { OperationType, StrategyControlProps } from "./type";

const StrategyControl: React.FC<StrategyControlProps> = ({
	strategyId,
	strategyName,
	tradeMode,
	strategyRunState,
	onOperationSuccess,
}) => {
	const { t } = useTranslation();
	// Use useInitBacktestStrategy hook
	const { mutate: initBacktestStrategy } = useInitBacktestStrategy({
		meta: {
			showSuccessToast: false,
			errorMessage: t("apiMessage.initStrategyFailed"),
			showErrorToast: true,
		},
		onSuccess: () => {
			onOperationSuccess?.("init");
		},
	});

	// Use useStopBacktestStrategy hook
	const { mutate: stopBacktestStrategy } = useStopBacktestStrategy({
		meta: {
			showSuccessToast: false,
			errorMessage: t("apiMessage.stopStrategyFailed"),
			showErrorToast: true,
		},
		onSuccess: () => {
			onOperationSuccess?.("stop");
		},
	});

	const handleRunBacktest = useCallback(() => {
		if (!strategyId) return;

		// Initialize backtest strategy
		initBacktestStrategy({ strategyId });
	}, [strategyId, initBacktestStrategy]);

	const handleStopBacktest = useCallback(() => {
		if (!strategyId) return;

		// Stop backtest strategy
		stopBacktestStrategy({ strategyId });
	}, [strategyId, stopBacktestStrategy]);

	const handleOpenBacktestWindow = useCallback(() => {
		if (!strategyId) return;

		// Open backtest window
		openBacktestWindow(strategyId, strategyName);
	}, [strategyId, strategyName]);

	const handleReopenDialog = useCallback(
		(operationType: OperationType) => {
			onOperationSuccess?.(operationType);
		},
		[onOperationSuccess],
	);

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
			);
		default:
			return null;
	}
};

export default StrategyControl;
