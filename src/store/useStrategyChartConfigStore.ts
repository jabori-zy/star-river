import { create } from "zustand";
import type { StrategyChartConfig } from "@/types/strategyChartConfig";

interface StrategyChartConfigState {
	strategyChartConfig: StrategyChartConfig[];
	setStrategyChartConfig: (config: StrategyChartConfig[]) => void;
}

const useStrategyChartConfigStore = create<StrategyChartConfigState>((set) => ({
	strategyChartConfig: [],
	setStrategyChartConfig: (config: StrategyChartConfig[]) =>
		set({ strategyChartConfig: config }),
}));

export default useStrategyChartConfigStore;
