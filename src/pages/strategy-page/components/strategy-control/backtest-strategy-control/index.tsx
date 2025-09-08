import { useEffect } from "react";
import type { TradeMode } from "@/types/strategy";
import useStrategyLoadingStore from "@/store/useStrategyLoadingStore";
import { getStrategyStatus } from "@/service/backtest-strategy/strategy-status";
import StartButton from "./start-button";
import LoadingButton from "./loading-button";
import RetryButton from "./retry-button";
import BacktestingButton from "./backtesting-button";
import StoppingButton from "./stopping-button";

interface BacktestStrategyControlProps {
	strategyId: number | undefined;
	tradeMode: TradeMode;
}

const BacktestStrategyControl: React.FC<BacktestStrategyControlProps> = ({
	strategyId,
}) => {
	// 使用全局策略加载状态
	const { 
		reset, 
		setInitializing, 
		setFailed,
		setBacktesting,
		isInitializing, 
		isBacktesting,
		isFailed,
		isStopping
	} = useStrategyLoadingStore();

	// 组件首次加载时检查策略状态
	useEffect(() => {
		if (!strategyId) return;

		const checkStrategyStatus = async () => {
			try {
				const status = await getStrategyStatus(strategyId);
				console.log('初始化策略状态:', status);
				
				// 根据接口返回的状态设置按钮状态
				switch (status) {
					case 'stopped':
						// 策略已停止，重置所有状态
						reset();
						break;
					case 'initializing':
						// 策略正在初始化，设置相应状态
						setInitializing(true);
						break;
					case 'running':
					case 'playing':
					case 'pausing':
					case 'ready':
						// 策略处于回测中状态
						setBacktesting(true);
						break;
					case 'failed':
						// 策略启动失败，设置失败状态
						setFailed(true);
						break;
					default:
						console.warn('未知的策略状态:', status);
						break;
				}
			} catch (error) {
				console.error('获取策略状态失败:', error);
				// 获取状态失败时，保持默认状态（假设策略已停止）
			}
		};

		checkStrategyStatus();
	}, [strategyId, reset, setInitializing, setBacktesting, setFailed]);

	// 根据状态返回对应的按钮组件
	if (isBacktesting) {
		return <BacktestingButton strategyId={strategyId} />;
	}
	
	if (isStopping) {
		return <StoppingButton strategyId={strategyId} />;
	}
	
	if (isFailed) {
		return <RetryButton strategyId={strategyId} />;
	}
	
	if (isInitializing) {
		return <LoadingButton strategyId={strategyId} />;
	}
	
	// 默认状态：显示开始按钮
	return <StartButton strategyId={strategyId} />;
};

export default BacktestStrategyControl;
