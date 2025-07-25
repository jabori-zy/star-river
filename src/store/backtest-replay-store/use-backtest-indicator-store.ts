import { create } from "zustand";
import { KeyStr } from "@/types/symbol-key";
import { IndicatorValue } from "@/types/indicator";

// 定义缓存大小常量
const MAX_CACHE_SIZE = 20;

// 回测指标数据存储
interface BacktestIndicatorDataState {
	// 按数据的缓存键存储的指标数据列表
	indicatorData: Record<KeyStr, IndicatorValue[]>;

	// 添加新指标数据到指定的缓存key中，自动控制缓存大小
	addIndicatorData: (cacheKey: KeyStr, data: IndicatorValue[]) => void;

	// 清空特定缓存key的所有指标数据
	clearIndicatorData: (cacheKey: KeyStr) => void;

	// 清空所有指标数据
	clearAllIndicatorData: () => void;

	// 获取指定缓存key的最新指标数据
	getLatestIndicatorData: (cacheKey: KeyStr) => IndicatorValue | undefined;

	// 获取所有的缓存key的指标数据
	getAllIndicatorData: () => Record<KeyStr, IndicatorValue[]>;
}

export const useBacktestIndicatorDataStore = create<BacktestIndicatorDataState>(
	(set, get) => ({
		// 初始化指标数据存储
		indicatorData: {},

		// 添加指标数据到指定缓存key中，限制缓存大小为 MAX_CACHE_SIZE
		addIndicatorData: (cacheKey, data) =>
			set((state) => {
				// 判断cacheKey是否存在
				if (!state.indicatorData[cacheKey]) {
					state.indicatorData[cacheKey] = [];
				}
				const currentData = state.indicatorData[cacheKey];
				// 如果当前数据数组已达到最大容量，则移除最早的数据
				let newData;
				if (currentData.length >= MAX_CACHE_SIZE) {
					// 移除第一个元素(最旧的)，并添加新数据到末尾
					newData = [...currentData.slice(1), ...data];
				} else {
					// 直接添加新数据到末尾
					newData = [...currentData, ...data];
				}
				// console.log("indicatorData", state.indicatorData);

				return {
					indicatorData: {
						...state.indicatorData,
						[cacheKey]: newData,
					},
				};
			}),

		// 清空特定缓存key的所有指标数据
		clearIndicatorData: (cacheKey) =>
			set((state) => ({
				indicatorData: {
					...state.indicatorData,
					[cacheKey]: [],
				},
			})),

		// 清空所有指标数据
		clearAllIndicatorData: () =>
			set({
				indicatorData: {},
			}),

		// 获取指定缓存key的最新指标数据
		getLatestIndicatorData: (cacheKey) => {
			const cache = get().indicatorData[cacheKey];
			if (!cache || cache.length === 0) return undefined;
			return cache[cache.length - 1];
		},

		// 获取所有的缓存key的指标数据
		getAllIndicatorData: () => {
			return get().indicatorData;
		},
	}),
);
