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
import { BacktestStrategyRunState } from "@/types/strategy/backtest-strategy";

interface BacktestStrategyControlState {
	strategyId: number | null;
	strategyEventSubscription: Subscription | null;
	strategyRunState: BacktestStrategyRunState;

	// Actions
	setStrategyId: (strategyId: number | null) => void;
	setStrategyRunState: (state: BacktestStrategyRunState) => void;
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
		strategyId: null,
		strategyEventSubscription: null,
		strategyRunState: BacktestStrategyRunState.Ready,

		setStrategyId: (strategyId) => {
			set({ strategyId });
		},

		setStrategyRunState: (state) => {
			set({ strategyRunState: state });
		},

		onPlay: async () => {
			const { strategyId, strategyRunState } = get();
			if (!strategyId) return;

			// Prevent duplicate calls - only allow play from Ready or Pausing state
			if (
				strategyRunState !== BacktestStrategyRunState.Ready &&
				strategyRunState !== BacktestStrategyRunState.Pausing
			) {
				console.log("Cannot play: current state is", strategyRunState);
				return;
			}

			// Save the previous state to restore on failure
			const previousState = strategyRunState;

			set({ strategyRunState: BacktestStrategyRunState.Playing });
			try {
				await play(strategyId);
				// After play() starts successfully, backtest completion will be notified via events
			} catch (error: any) {
				// Play failed to start, revert to previous state
				set({ strategyRunState: previousState });
				console.error("play error:", error);
			}
		},

		onPause: () => {
			const { strategyId } = get();
			if (!strategyId) return;

			set({ strategyRunState: BacktestStrategyRunState.Pausing });
			pause(strategyId);
		},

		onStop: (clearDataCallback) => {
			const { strategyId } = get();
			if (!strategyId) return;

			set({ strategyRunState: BacktestStrategyRunState.Ready });
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
					set({ strategyRunState: BacktestStrategyRunState.PlayComplete });
					toast.success("Backtest completed");
				} else {
					// Throw other errors normally
					console.error("playOne error:", error);
				}
			}
		},

		startEventListening: () => {
			const { strategyRunState, strategyEventSubscription } = get();

			// Clean up existing subscription
			if (strategyEventSubscription) {
				strategyEventSubscription.unsubscribe();
				set({ strategyEventSubscription: null });
			}

			// If not playing, no need to listen
			if (strategyRunState !== BacktestStrategyRunState.Playing) {
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

			set({ strategyRunState: BacktestStrategyRunState.PlayComplete });
			toast.success("Backtest completed");
		},
	}));
