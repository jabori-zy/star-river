import type { StoreApi, UseBoundStore } from "zustand";
import { create } from "zustand";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { createDataInitializationSlice } from "./data-initialization-slice";
import { createDataSlice } from "./data-slice";
import { createEventHandlerSlice } from "./event-handler-slice";
import { createRefsSlice } from "./refs-slice";
import { createSubscriptionSlice } from "./subscription-slice";
import { createTradingSlice } from "./trading-slice";
import type { BacktestChartStore, StoreContext } from "./types";
import { createUtilitySlice } from "./utility-slice";
import { createVisibilitySlice } from "./visibility-slice";

// Factory function to create single chart store
const createBacktestChartStore = (
	chartId: number,
	chartConfig: BacktestChartConfig,
): UseBoundStore<StoreApi<BacktestChartStore>> => {
	const context: StoreContext = {
		chartId,
		chartConfig,
	};

	return create<BacktestChartStore>()((...args) => ({
		// Combine all slices
		...createDataSlice(...args),
		...createRefsSlice(...args),
		...createVisibilitySlice(...args),
		...createTradingSlice(...args),
		...createSubscriptionSlice(...args),
		...createEventHandlerSlice(context)(...args),
		...createDataInitializationSlice()(...args),
		...createUtilitySlice(context)(...args),
		// Add chartConfig to store, some methods need access to it
		chartConfig: chartConfig,
	}));
};

// Multi-instance store manager
const storeInstances = new Map<
	number,
	ReturnType<typeof createBacktestChartStore>
>();

// Get or create store instance for specified chartId
export const getBacktestChartStore = (
	chartId: number,
	chartConfig?: BacktestChartConfig,
) => {
	if (!storeInstances.has(chartId)) {
		if (!chartConfig) {
			throw new Error(`Chart config not found for chartId: ${chartId}`);
		}
		storeInstances.set(chartId, createBacktestChartStore(chartId, chartConfig));
	}
	const store = storeInstances.get(chartId);
	if (!store) {
		throw new Error(`Failed to create store for chartId: ${chartId}`);
	}
	return store;
};

// Clean up store instance for specified chartId
export const cleanupBacktestChartStore = (chartId: number) => {
	const store = storeInstances.get(chartId);
	if (store) {
		// Clean up subscriptions
		const state = store.getState();
		state.cleanupSubscriptions();
		// Remove from manager
		storeInstances.delete(chartId);
	}
};

// Hook: Get corresponding store based on chartId
export const useBacktestChartStore = (
	chartId: number,
	chartConfig?: BacktestChartConfig,
) => {
	const store = getBacktestChartStore(chartId, chartConfig);
	return store();
};

// Get store instance for specified chartId (not a hook)
export const getBacktestChartStoreInstance = (chartId: number) => {
	return getBacktestChartStore(chartId);
};

// Reset data for all stores
export const resetAllBacktestChartStore = () => {
	storeInstances.forEach((store) => {
		store.getState().resetData();
	});
};
