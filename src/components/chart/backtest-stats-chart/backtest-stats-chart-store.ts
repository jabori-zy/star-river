import type {
	IChartApi,
	IPaneApi,
	ISeriesApi,
	SingleValueData,
	Time,
	UTCTimestamp,
} from "lightweight-charts";
import type { Subscription } from "rxjs";
import { create } from "zustand";
import { createStatsStream } from "@/hooks/obs/backtest-strategy-event-obs";
import { getStrategyStatsHistory } from "@/service/backtest-strategy/strategy-stats";
import type { BacktestStrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import type { StrategyStats, StrategyStatsName } from "@/types/statistics";
import type { BacktestStrategyStatsUpdateEvent } from "@/types/strategy-event/backtest-strategy-event";
import { getChartAlignedUtcTimestamp } from "../backtest-chart/utls";

interface BacktestStatsChartStore {
	strategyId: number;
	statsData: Partial<Record<StrategyStatsName, SingleValueData[]>>; // Statistics data, key is statistics name
	subscriptions: Subscription[]; // Subscription collection

	// Data initialization status flag
	isDataInitialized: boolean;

	// Various ref reference storage
	chartRef: IChartApi | null;
	statsPaneRefs: Partial<Record<StrategyStatsName, IPaneApi<Time> | null>>; // Pane reference for each statistics chart
	statsSeriesRefs: Partial<
		Record<StrategyStatsName, ISeriesApi<"Line"> | null>
	>; // Series reference for each statistics data
	statsPaneHtmlElementRefs: Partial<
		Record<StrategyStatsName, HTMLElement | null>
	>; // Pane HTML element reference for each statistics chart

	// === Pane version number, used to force legend re-rendering ===
	paneVersion: number;

	// Data initialization method
	initChartData: (datetime: string, cycleId: number, strategyId: number) => Promise<void>;

	// === Data management methods ===
	setStatsData: (statsName: StrategyStatsName, data: SingleValueData[]) => void;
	getStatsData: (statsName: StrategyStatsName) => SingleValueData[];
	deleteStatsData: (statsName: StrategyStatsName) => void;

	// Data initialization status management
	getIsDataInitialized: () => boolean;
	setIsDataInitialized: (initialized: boolean) => void;

	// === ref management methods ===
	setChartRef: (chart: IChartApi | null) => void;
	getChartRef: () => IChartApi | null;

	setStatsPaneRef: (statsName: StrategyStatsName, ref: IPaneApi<Time>) => void;
	deleteStatsPaneRef: (statsName: StrategyStatsName) => void;
	getStatsPaneRef: (statsName: StrategyStatsName) => IPaneApi<Time> | null;

	setStatsSeriesRef: (
		statsName: StrategyStatsName,
		ref: ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram">,
	) => void;
	deleteStatsSeriesRef: (statsName: StrategyStatsName) => void;
	getStatsSeriesRef: (
		statsName: StrategyStatsName,
	) => ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null;

	addStatsPaneHtmlElementRef: (
		statsName: StrategyStatsName,
		htmlElement: HTMLElement,
	) => void;
	getStatsPaneHtmlElementRef: (
		statsName: StrategyStatsName,
	) => HTMLElement | null;

	// Pane version number management
	getPaneVersion: () => number;
	incrementPaneVersion: () => void;

	// Observer related methods
	initObserverSubscriptions: () => void;
	cleanupSubscriptions: () => void;
	onNewStatsData: (statsData: StrategyStats) => void;

	resetData: () => void;
	clearAllData: () => void;
}

// Factory function to create a single statistics chart store
const createBacktestStatsChartStore = (
	strategyId: number,
	_chartConfig: BacktestStrategyStatsChartConfig,
) =>
	create<BacktestStatsChartStore>((set, get) => ({
		strategyId: strategyId,

		statsData: {},
		subscriptions: [],

		// Data initialization status
		isDataInitialized: false,

		// === ref reference initialization ===
		chartRef: null,
		statsPaneRefs: {},
		statsSeriesRefs: {},
		statsPaneHtmlElementRefs: {},

		// === Pane version number, used to force legend re-rendering ===
		paneVersion: 0,

		// Data initialization method
		initChartData: async (datetime: string, cycleId: number, strategyId: number) => {
			if (cycleId === 0) {
				return;
			}
			// Clear all data before initialization
			const state = get();
			const initialStatsData = await getStrategyStatsHistory(
				strategyId,
				datetime,
			);
			if (initialStatsData) {
				const balanceStatsData: SingleValueData[] = [];
				const unrealizedPnlStatsData: SingleValueData[] = [];
				const equityStatsData: SingleValueData[] = [];
				const availableBalanceStatsData: SingleValueData[] = [];
				const realizedPnlStatsData: SingleValueData[] = [];
				const cumulativeReturnStatsData: SingleValueData[] = [];

				initialStatsData.forEach((statsData) => {
					const timestamp = getChartAlignedUtcTimestamp(
						statsData.datetime,
					) as UTCTimestamp;
					balanceStatsData.push({
						time: timestamp,
						value: statsData.balance,
					});
					unrealizedPnlStatsData.push({
						time: timestamp,
						value: statsData.unrealizedPnl,
					});
					equityStatsData.push({
						time: timestamp,
						value: statsData.equity,
					});
					availableBalanceStatsData.push({
						time: timestamp,
						value: statsData.availableBalance,
					});
					realizedPnlStatsData.push({
						time: timestamp,
						value: statsData.realizedPnl,
					});
					cumulativeReturnStatsData.push({
						time: timestamp,
						value: statsData.cumulativeReturn,
					});
				});

				state.setStatsData("balance", balanceStatsData);
				state.setStatsData("unrealizedPnl", unrealizedPnlStatsData);
				state.setStatsData("equity", equityStatsData);
				state.setStatsData("availableBalance", availableBalanceStatsData);
				state.setStatsData("realizedPnl", realizedPnlStatsData);
				state.setStatsData("cumulativeReturn", cumulativeReturnStatsData);

				state.setIsDataInitialized(true);
			}

		},

		// === Data management methods ===
		setStatsData: (statsName: StrategyStatsName, data: SingleValueData[]) => {
			set((state) => ({
				statsData: { ...state.statsData, [statsName]: data },
			}));
		},
		getStatsData: (statsName: StrategyStatsName) =>
			get().statsData[statsName] || [],
		deleteStatsData: (statsName: StrategyStatsName) =>
			set((state) => {
				const { [statsName]: _, ...rest } = state.statsData;
				return { statsData: rest };
			}),

		// Data initialization status management
		getIsDataInitialized: () => get().isDataInitialized,
		setIsDataInitialized: (initialized: boolean) =>
			set({ isDataInitialized: initialized }),

		// === ref management methods implementation ===
		setChartRef: (chart: IChartApi | null) => set({ chartRef: chart }),
		getChartRef: () => get().chartRef,

		setStatsPaneRef: (statsName: StrategyStatsName, ref: IPaneApi<Time>) =>
			set({
				statsPaneRefs: { ...get().statsPaneRefs, [statsName]: ref },
			}),
		getStatsPaneRef: (statsName: StrategyStatsName) =>
			get().statsPaneRefs[statsName] || null,
		deleteStatsPaneRef: (statsName: StrategyStatsName) =>
			set({
				statsPaneRefs: { ...get().statsPaneRefs, [statsName]: null },
			}),

		setStatsSeriesRef: (
			statsName: StrategyStatsName,
			ref: ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram">,
		) =>
			set({
				statsSeriesRefs: { ...get().statsSeriesRefs, [statsName]: ref },
			}),
		getStatsSeriesRef: (statsName: StrategyStatsName) =>
			get().statsSeriesRefs[statsName] || null,
		deleteStatsSeriesRef: (statsName: StrategyStatsName) =>
			set({
				statsSeriesRefs: { ...get().statsSeriesRefs, [statsName]: null },
			}),

		addStatsPaneHtmlElementRef: (
			statsName: StrategyStatsName,
			htmlElement: HTMLElement,
		) =>
			set({
				statsPaneHtmlElementRefs: {
					...get().statsPaneHtmlElementRefs,
					[statsName]: htmlElement,
				},
			}),
		getStatsPaneHtmlElementRef: (statsName: StrategyStatsName) =>
			get().statsPaneHtmlElementRefs[statsName] || null,

		// Pane version number management
		getPaneVersion: () => get().paneVersion,
		incrementPaneVersion: () =>
			set((state) => ({ paneVersion: state.paneVersion + 1 })),

		// Observer related methods
		initObserverSubscriptions: () => {
			const state = get();

			// Clean up existing subscriptions
			state.cleanupSubscriptions();

			try {
				// Subscribe to statistics data stream
				const statsStream = createStatsStream(true);
				const statsSubscription = statsStream.subscribe({
					next: (statsEvent: BacktestStrategyStatsUpdateEvent) => {
						state.onNewStatsData(statsEvent.statsSnapshot);
					},
					error: (error) => {
						console.error("Statistics data stream subscription error:", error);
					},
				});

				set({
					subscriptions: [statsSubscription],
				});
			} catch (error) {
				console.error("Error initializing Observer subscription for statistics data:", error);
			}
		},

		cleanupSubscriptions: () => {
			const state = get();

			state.subscriptions.forEach((subscription, index) => {
				try {
					subscription.unsubscribe();
				} catch (error) {
					console.error(`Error cleaning up subscription ${index}:`, error);
				}
			});

			set({ subscriptions: [] });
		},

		onNewStatsData: (statsData: StrategyStats) => {
			const state = get();
			const timestamp = getChartAlignedUtcTimestamp(
				statsData.datetime,
			) as UTCTimestamp;

			// Process each statistics data
			Object.entries(statsData).forEach(([statsName, value]) => {
				const existingData = state.getStatsData(statsName as StrategyStatsName);
				const newDataPoint: SingleValueData = {
					time: timestamp,
					value: value as number,
				};

				// Get last data point
				const lastData = existingData[existingData.length - 1];

				// Update series
				const seriesRef = state.getStatsSeriesRef(
					statsName as StrategyStatsName,
				);
				if (seriesRef) {
					seriesRef.update(newDataPoint);
				}

				// If last data point's timestamp matches new data point's timestamp, replace the last data point
				if (lastData && lastData.time === timestamp) {
					const newData = [...existingData.slice(0, -1), newDataPoint];
					state.setStatsData(statsName as StrategyStatsName, newData);
				} else {
					const newData = [...existingData, newDataPoint];
					state.setStatsData(statsName as StrategyStatsName, newData);
				}
			});
		},

		// Clear data
		resetData: () => {
			const state = get();

			// Clear all statistics series data
			Object.values(state.statsSeriesRefs).forEach((seriesRef) => {
				if (seriesRef) {
					seriesRef.setData([]);
				}
			});

			// Clear store state data
			set({
				statsData: {},
			});
		},

		// Clear all state data, including chart references and subscriptions
		clearAllData: () => {
			const state = get();

			// 1. Clean up subscriptions
			state.cleanupSubscriptions();

			// 2. Destroy chart instance
			if (state.chartRef) {
				state.chartRef.remove();
			}

			// 3. Reset all states
			set({
				statsData: {},
				subscriptions: [],
				isDataInitialized: false,
				chartRef: null,
				statsPaneRefs: {},
				statsSeriesRefs: {},
				statsPaneHtmlElementRefs: {},
				paneVersion: 0,
			});
		},
	}));

// Multi-instance store manager
const storeInstances = new Map<
	number,
	ReturnType<typeof createBacktestStatsChartStore>
>();

// Get or create store instance for specified strategyId
export const getBacktestStatsChartStore = (
	strategyId: number,
	chartConfig?: BacktestStrategyStatsChartConfig,
) => {
	if (!storeInstances.has(strategyId)) {
		if (!chartConfig) {
			throw new Error(`Chart config not found for strategyId: ${strategyId}`);
		}
		storeInstances.set(
			strategyId,
			createBacktestStatsChartStore(strategyId, chartConfig),
		);
	}
	const store = storeInstances.get(strategyId);
	if (!store) {
		throw new Error(`Failed to create store for strategyId: ${strategyId}`);
	}
	return store;
};

// Clean up store instance for specified strategyId
export const cleanupBacktestStatsChartStore = (strategyId: number) => {
	const store = storeInstances.get(strategyId);
	if (store) {
		// Clean up subscriptions
		const state = store.getState();
		state.cleanupSubscriptions();
		// Remove from manager
		storeInstances.delete(strategyId);
	}
};

// Hook: Get corresponding store based on strategyId
export const useBacktestStatsChartStore = (
	strategyId: number,
	chartConfig?: BacktestStrategyStatsChartConfig,
) => {
	const store = getBacktestStatsChartStore(strategyId, chartConfig);
	return store();
};

// Get store instance for specified strategyId (not a hook)
export const getBacktestStatsChartStoreInstance = (strategyId: number) => {
	return getBacktestStatsChartStore(strategyId);
};

export const resetAllBacktestStatsChartStore = () => {
	storeInstances.forEach((store) => {
		store.getState().resetData();
	});
};
