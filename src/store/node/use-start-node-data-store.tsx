import dayjs from "dayjs";
import { create } from "zustand";
import {
	BacktestDataSource,
	type SelectedAccount,
	type StrategyBacktestConfig,
	type StrategyLiveConfig,
	type TimeRange,
} from "@/types/strategy";
import type { CustomVariable } from "@/types/variable";

// StartNode data state interface
interface StartNodeDataState {
	// Live mode configuration
	liveConfig: StrategyLiveConfig | null;
	// Backtest mode configuration
	backtestConfig: StrategyBacktestConfig | null;
}

// StartNode data actions interface
interface StartNodeDataActions {
	// === Live config related methods ===
	setLiveConfig: (config: StrategyLiveConfig) => void;
	setDefaultLiveConfig: () => void;
	updateLiveAccounts: (accounts: SelectedAccount[]) => void;
	updateLiveVariables: (variables: CustomVariable[]) => void;

	// === Backtest config related methods ===
	setBacktestConfig: (config: StrategyBacktestConfig) => void;
	setDefaultBacktestConfig: () => void;
	updateInitialBalance: (balance: number) => void;
	updateLeverage: (leverage: number) => void;
	updateFeeRate: (feeRate: number) => void;
	updatePlaySpeed: (playSpeed: number) => void;
	updateDataSource: (dataSource: BacktestDataSource) => void;
	updateBacktestAccounts: (accounts: SelectedAccount[]) => void;
	updateTimeRange: (timeRange: TimeRange) => void;
	updateBacktestVariables: (variables: CustomVariable[]) => void;

	// === Reset methods ===
	resetLiveConfig: () => void;
	resetBacktestConfig: () => void;
	resetAll: () => void;
}

// Default config generator functions
const createDefaultLiveConfig = (): StrategyLiveConfig => ({
	selectedAccounts: [],
	customVariables: [],
});

const createDefaultBacktestConfig = (): StrategyBacktestConfig => ({
	dataSource: BacktestDataSource.EXCHANGE,
	exchangeModeConfig: {
		selectedAccounts: [],
		timeRange: {
			startDate: dayjs().subtract(2, "day").format("YYYY-MM-DD"),
			endDate: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
		},
	},
	fileModeConfig: null,
	initialBalance: 10000,
	leverage: 1,
	feeRate: 0.001,
	playSpeed: 1,
	customVariables: [],
});

// Create zustand store
export const useStartNodeDataStore = create<
	StartNodeDataState & StartNodeDataActions
>((set) => ({
	// === Initial state ===
	liveConfig: null,
	backtestConfig: null,

	// === Live config related methods ===
	setLiveConfig: (config: StrategyLiveConfig) => {
		set({ liveConfig: config });
	},

	setDefaultLiveConfig: () => {
		const defaultConfig = createDefaultLiveConfig();
		set({ liveConfig: defaultConfig });
	},

	updateLiveAccounts: (accounts: SelectedAccount[]) => {
		set((state) => ({
			liveConfig: state.liveConfig
				? {
						...state.liveConfig,
						selectedAccounts: accounts,
					}
				: {
						...createDefaultLiveConfig(),
						selectedAccounts: accounts,
					},
		}));
	},

	updateLiveVariables: (variables: CustomVariable[]) => {
		set((state) => ({
			liveConfig: state.liveConfig
				? {
						...state.liveConfig,
						customVariables: variables,
					}
				: {
						...createDefaultLiveConfig(),
						customVariables: variables,
					},
		}));
	},

	// === Backtest config related methods ===
	setBacktestConfig: (config: StrategyBacktestConfig) => {
		set({ backtestConfig: config });
	},

	setDefaultBacktestConfig: () => {
		const defaultConfig = createDefaultBacktestConfig();
		set({ backtestConfig: defaultConfig });
	},

	updateInitialBalance: (balance: number) => {
		set((state) => ({
			backtestConfig: state.backtestConfig
				? {
						...state.backtestConfig,
						initialBalance: balance,
					}
				: {
						...createDefaultBacktestConfig(),
						initialBalance: balance,
					},
		}));
	},

	updateLeverage: (leverage: number) => {
		set((state) => ({
			backtestConfig: state.backtestConfig
				? {
						...state.backtestConfig,
						leverage,
					}
				: {
						...createDefaultBacktestConfig(),
						leverage,
					},
		}));
	},

	updateFeeRate: (feeRate: number) => {
		set((state) => ({
			backtestConfig: state.backtestConfig
				? {
						...state.backtestConfig,
						feeRate,
					}
				: {
						...createDefaultBacktestConfig(),
						feeRate,
					},
		}));
	},

	updatePlaySpeed: (playSpeed: number) => {
		set((state) => ({
			backtestConfig: state.backtestConfig
				? {
						...state.backtestConfig,
						playSpeed,
					}
				: {
						...createDefaultBacktestConfig(),
						playSpeed,
					},
		}));
	},

	updateDataSource: (dataSource: BacktestDataSource) => {
		set((state) => ({
			backtestConfig: state.backtestConfig
				? {
						...state.backtestConfig,
						dataSource,
					}
				: {
						...createDefaultBacktestConfig(),
						dataSource,
					},
		}));
	},

	updateBacktestAccounts: (accounts: SelectedAccount[]) => {
		set((state) => {
			const currentConfig =
				state.backtestConfig || createDefaultBacktestConfig();
			const startDate = dayjs().subtract(2, "day").format("YYYY-MM-DD");
			const endDate = dayjs().subtract(1, "day").format("YYYY-MM-DD");

			return {
				backtestConfig: {
					...currentConfig,
					exchangeModeConfig: {
						selectedAccounts: accounts,
						timeRange: currentConfig.exchangeModeConfig?.timeRange || {
							startDate,
							endDate,
						},
					},
				},
			};
		});
	},

	updateTimeRange: (timeRange: TimeRange) => {
		set((state) => {
			const currentConfig =
				state.backtestConfig || createDefaultBacktestConfig();

			return {
				backtestConfig: {
					...currentConfig,
					exchangeModeConfig: {
						selectedAccounts:
							currentConfig.exchangeModeConfig?.selectedAccounts || [],
						timeRange,
					},
				},
			};
		});
	},

	updateBacktestVariables: (variables: CustomVariable[]) => {
		set((state) => ({
			backtestConfig: state.backtestConfig
				? {
						...state.backtestConfig,
						customVariables: variables,
					}
				: {
						...createDefaultBacktestConfig(),
						customVariables: variables,
					},
		}));
	},

	// === Reset methods ===
	resetLiveConfig: () => {
		set({ liveConfig: null });
	},

	resetBacktestConfig: () => {
		set({ backtestConfig: null });
	},

	resetAll: () => {
		set({ liveConfig: null, backtestConfig: null });
	},
}));

export default useStartNodeDataStore;
