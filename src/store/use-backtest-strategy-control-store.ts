import { create } from "zustand";
import { toast } from "sonner";
import { Subscription } from "rxjs";
import {
	pause,
	play,
	playOne,
	stop,
} from "@/service/backtest-strategy/backtest-strategy-control";
import { resetAllBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { resetAllBacktestStatsChartStore } from "@/components/chart/backtest-stats-chart/backtest-stats-chart-store";
import { createPlayFinishedStream } from "@/hooks/obs/backtest-strategy-event-obs";

interface BacktestStrategyControlState {
	isRunning: boolean;
	isPlayFinished: boolean;
	strategyId: number | null;
	strategyEventSubscription: Subscription | null;

	// Actions
	setStrategyId: (strategyId: number | null) => void;
	setIsRunning: (isRunning: boolean) => void;
	setIsPlayFinished: (isPlayFinished: boolean) => void;
	onPlay: () => Promise<void>;
	onPause: () => void;
	onStop: (clearDataCallback?: () => void) => void;
	onPlayOne: () => Promise<void>;
	startEventListening: () => void;
	stopEventListening: () => void;
	handlePlayFinishedEvent: (eventStrategyId: number) => void;
}

export const useBacktestStrategyControlStore = create<BacktestStrategyControlState>((set, get) => ({
	isRunning: false,
	isPlayFinished: false,
	strategyId: null,
	strategyEventSubscription: null,

	setStrategyId: (strategyId) => {
		set({ strategyId });
	},

	setIsRunning: (isRunning) => {
		set({ isRunning });
	},

	setIsPlayFinished: (isPlayFinished) => {
		set({ isPlayFinished });
	},

	onPlay: async () => {
		const { strategyId } = get();
		if (!strategyId) return;

		set({ isRunning: true });
		try {
			await play(strategyId);
			// play()成功启动后，回测完成会通过事件通知
		} catch (error: any) {
			// play启动失败，停止运行状态
			set({ isRunning: false });
			console.error("play error:", error);
		}
	},

	onPause: () => {
		const { strategyId } = get();
		if (!strategyId) return;

		set({ isRunning: false });
		pause(strategyId);
	},

	onStop: (clearDataCallback) => {
		const { strategyId } = get();
		if (!strategyId) return;

		set({ isRunning: false, isPlayFinished: false });
		stop(strategyId);

		// 重置图表stores
		resetAllBacktestChartStore();
		resetAllBacktestStatsChartStore();

		// 调用清空数据的回调
		clearDataCallback?.();
	},

	onPlayOne: async () => {
		const { strategyId } = get();
		if (!strategyId) return;

		try {
			await playOne(strategyId);
		} catch (error: any) {
			// 检查是否是回测完成的错误
			const errorCode = error?.response?.data?.error_code;
			const errorCodeChain = error?.response?.data?.error_code_chain;

			if (errorCode === "STRATEGY_ENGINE_1001" &&
				errorCodeChain?.includes("BACKTEST_STRATEGY_1012")) {
				set({ isRunning: false, isPlayFinished: true });
				toast.success("回测完成");
			} else {
				// 其他错误正常抛出
				console.error("playOne error:", error);
			}
		}
	},

	startEventListening: () => {
		const { isRunning, strategyEventSubscription } = get();

		// 清理现有订阅
		if (strategyEventSubscription) {
			strategyEventSubscription.unsubscribe();
			set({ strategyEventSubscription: null });
		}

		// 如果不在播放，则不需要监听
		if (!isRunning) {
			console.log("不在播放，不启动事件监听");
			return;
		}

		const eventStream = createPlayFinishedStream();
		const subscription = eventStream.subscribe((playFinishedEvent) => {
			const eventStrategyId = playFinishedEvent.strategyId;
			if (eventStrategyId !== undefined) {
				get().handlePlayFinishedEvent(eventStrategyId);
			}
		});

		set({ strategyEventSubscription: subscription });
	},

	stopEventListening: () => {
		const { strategyEventSubscription } = get();
		if (strategyEventSubscription) {
			strategyEventSubscription.unsubscribe();
			set({ strategyEventSubscription: null });
		}
	},

	handlePlayFinishedEvent: (eventStrategyId) => {
		const { strategyId } = get();

		if (strategyId !== null && eventStrategyId !== strategyId) {
			console.log("策略ID不匹配，忽略事件");
			return;
		}

		set({ isRunning: false, isPlayFinished: true });
		toast.success("回测完成");
	},
}));