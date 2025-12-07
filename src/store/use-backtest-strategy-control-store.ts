import type { Subscription } from "rxjs";
import { toast } from "sonner";
import { create } from "zustand";
import { resetAllBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { resetAllBacktestStatsChartStore } from "@/components/chart/backtest-stats-chart/backtest-stats-chart-store";
import { createPlayFinishedStream } from "@/hooks/obs/backtest-strategy-event-obs";
import {
	pause,
	play,
	playOne,
	stop,
} from "@/service/backtest-strategy/backtest-strategy-control";

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

export const useBacktestStrategyControlStore =
	create<BacktestStrategyControlState>((set, get) => ({
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
				// After play() starts successfully, backtest completion will be notified via events
			} catch (error: any) {
				// play failed to start, stop running state
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

			// Reset chart stores
			resetAllBacktestChartStore();
			resetAllBacktestStatsChartStore();

			// Call clear data callback
			clearDataCallback?.();
		},

		onPlayOne: async () => {
			const { strategyId } = get();
			if (!strategyId) return;

			try {
				await playOne(strategyId);
			} catch (error: any) {
				// Check if this is a backtest completion error
				const errorCode = error?.response?.data?.error_code;
				const errorCodeChain = error?.response?.data?.error_code_chain;

				if (
					errorCode === "STRATEGY_ENGINE_1001" &&
					errorCodeChain?.includes("BACKTEST_STRATEGY_1012")
				) {
					set({ isRunning: false, isPlayFinished: true });
					toast.success("Backtest completed");
				} else {
					// Throw other errors normally
					console.error("playOne error:", error);
				}
			}
		},

		startEventListening: () => {
			const { isRunning, strategyEventSubscription } = get();

			// Clean up existing subscription
			if (strategyEventSubscription) {
				strategyEventSubscription.unsubscribe();
				set({ strategyEventSubscription: null });
			}

			// If not playing, no need to listen
			if (!isRunning) {
				console.log("Not playing, skipping event listener start");
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
				console.log("Strategy ID mismatch, ignoring event");
				return;
			}

			set({ isRunning: false, isPlayFinished: true });
			toast.success("Backtest completed");
		},
	}));
