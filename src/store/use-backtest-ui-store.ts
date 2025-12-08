import { create } from "zustand";

// Backtest page UI state management
interface BacktestUIState {
	// UI state managed by strategy ID
	uiState: Record<
		number,
		{
			isShowHistoryPosition: boolean;
			// More UI states can be added here
		}
	>;

	// Set whether to show history position
	setShowHistoryPosition: (strategyId: number, show: boolean) => void;

	// Get whether to show history position
	getShowHistoryPosition: (strategyId: number) => boolean;

	// Clear UI state for specified strategy
	clearUIState: (strategyId: number) => void;

	// Clear all UI states
	clearAllUIState: () => void;
}

export const useBacktestUIStore = create<BacktestUIState>((set, get) => ({
	uiState: {},

	setShowHistoryPosition: (strategyId, show) =>
		set((state) => ({
			uiState: {
				...state.uiState,
				[strategyId]: {
					...state.uiState[strategyId],
					isShowHistoryPosition: show,
				},
			},
		})),

	getShowHistoryPosition: (strategyId) => {
		const state = get().uiState[strategyId];
		return state?.isShowHistoryPosition ?? false;
	},

	clearUIState: (strategyId) =>
		set((state) => {
			const newState = { ...state.uiState };
			delete newState[strategyId];
			return { uiState: newState };
		}),

	clearAllUIState: () =>
		set({
			uiState: {},
		}),
}));
