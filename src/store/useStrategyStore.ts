import { create } from "zustand";
import type { Strategy } from "@/types/strategy";

interface StrategyState {
	strategy: Strategy | undefined;
	setStrategy: (strategy: Strategy) => void;
}

export const useStrategyStore = create<StrategyState>((set) => ({
	strategy: undefined,
	setStrategy: (strategy: Strategy) => set({ strategy: strategy }),
}));
