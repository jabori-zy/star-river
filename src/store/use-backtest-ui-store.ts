import { create } from "zustand";

// 回测页面UI状态管理
interface BacktestUIState {
	// 按策略ID管理的UI状态
	uiState: Record<
		number,
		{
			isShowHistoryPosition: boolean;
			// 可以在这里添加更多UI状态
		}
	>;

	// 设置是否显示历史持仓
	setShowHistoryPosition: (strategyId: number, show: boolean) => void;

	// 获取是否显示历史持仓
	getShowHistoryPosition: (strategyId: number) => boolean;

	// 清空指定策略的UI状态
	clearUIState: (strategyId: number) => void;

	// 清空所有UI状态
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
