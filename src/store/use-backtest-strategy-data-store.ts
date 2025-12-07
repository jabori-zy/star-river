import { create } from "zustand";
import type { Kline } from "@/types/kline";
import type { KeyStr } from "@/types/symbol-key";

// Define cache size constant
const MAX_CACHE_SIZE = 20;

// Backtest strategy data store
interface BacktestStrategyMarketDataState {
	// Data list stored by cache key
	marketData: Record<KeyStr, (Kline | Record<string, number>)[]>;

	// Add new data to specified cache key, automatically control cache size
	addMarketData: (
		cacheKey: KeyStr,
		data: (Kline | Record<string, number>)[],
	) => void;

	// Clear all data for specific cache key
	clearMarketData: (cacheKey: KeyStr) => void;

	// Clear all data
	clearAllMarketData: () => void;

	// Get latest data for specified cache key
	getLatestMarketData: (
		cacheKey: KeyStr,
	) => Kline | Record<string, number> | undefined;

	// Get data for all cache keys
	getAllMarketData: () => Record<KeyStr, (Kline | Record<string, number>)[]>;
}

export const useBacktestStrategyMarketDataStore =
	create<BacktestStrategyMarketDataState>((set, get) => ({
		// Initialize event storage
		marketData: {},

		// Add data to specified cache key, limit cache size to MAX_CACHE_SIZE
		addMarketData: (cacheKey, data) =>
			set((state) => {
				// Check if cacheKey exists
				if (!state.marketData[cacheKey]) {
					state.marketData[cacheKey] = [];
				}
				const currentData = state.marketData[cacheKey];
				// If current data array has reached max capacity, remove earliest data
				let newData: (Kline | Record<string, number>)[] = [];
				if (currentData.length >= MAX_CACHE_SIZE) {
					// Remove first element (oldest) and add new event to the end
					newData = [...currentData.slice(1), ...data];
				} else {
					// Directly add new event to the end
					newData = [...currentData, ...data];
				}
				// console.log("marketData", state.marketData);

				return {
					marketData: {
						...state.marketData,
						[cacheKey]: newData,
					},
				};
			}),

		// Clear all data for specific cache key
		clearMarketData: (cacheKey) =>
			set((state) => ({
				marketData: {
					...state.marketData,
					[cacheKey]: [],
				},
			})),

		// Clear all data
		clearAllMarketData: () =>
			set({
				marketData: {},
			}),

		// Get latest data for specified cache key
		getLatestMarketData: (cacheKey) => {
			const cache = get().marketData[cacheKey];
			if (!cache || cache.length === 0) return undefined;
			return cache[cache.length - 1];
		},

		// Get data for all cache keys
		getAllMarketData: () => {
			return get().marketData;
		},
	}));
