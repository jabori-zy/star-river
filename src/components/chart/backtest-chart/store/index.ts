import { create } from "zustand";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { BacktestChartStore, StoreContext } from "./types";
import { createDataSlice } from "./data-slice";
import { createRefsSlice } from "./refs-slice";
import { createVisibilitySlice } from "./visibility-slice";
import { createTradingSlice } from "./trading-slice";
import { createSubscriptionSlice } from "./subscription-slice";
import { createEventHandlerSlice } from "./event-handler-slice";
import { createDataInitializationSlice } from "./data-initialization-slice";
import { createUtilitySlice } from "./utility-slice";

// 创建单个图表store的工厂函数
const createBacktestChartStore = (
	chartId: number,
	chartConfig: BacktestChartConfig,
) => {
	const context: StoreContext = {
		chartId,
		chartConfig,
	};

	return create<BacktestChartStore>()((...args) => ({
		// 组合所有slices
		...createDataSlice(...args),
		...createRefsSlice(...args),
		...createVisibilitySlice(...args),
		...createTradingSlice(...args),
		...createSubscriptionSlice(...args),
		...createEventHandlerSlice(context)(...args),
		...createDataInitializationSlice(context)(...args),
		...createUtilitySlice(context)(...args),
		// 添加chartConfig到store中，某些方法需要访问
		chartConfig: chartConfig,
	}));
};

// 多实例store管理器
const storeInstances = new Map<
	number,
	ReturnType<typeof createBacktestChartStore>
>();

// 获取或创建指定chartId的store实例
export const getBacktestChartStore = (chartId: number, chartConfig?: BacktestChartConfig) => {
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

// 清理指定chartId的store实例
export const cleanupBacktestChartStore = (chartId: number) => {
	const store = storeInstances.get(chartId);
	if (store) {
		// 清理订阅
		const state = store.getState();
		state.cleanupSubscriptions();
		// 从管理器中移除
		storeInstances.delete(chartId);
	}
};

// Hook：根据chartId获取对应的store
export const useBacktestChartStore = (chartId: number, chartConfig?: BacktestChartConfig) => {
	const store = getBacktestChartStore(chartId, chartConfig);
	return store();
};

// 获取指定chartId的store实例（不是hook）
export const getBacktestChartStoreInstance = (chartId: number) => {
	return getBacktestChartStore(chartId);
};

// 重置所有store的数据
export const resetAllBacktestChartStore = () => {
	storeInstances.forEach((store) => {
		store.getState().resetData();
	});
};