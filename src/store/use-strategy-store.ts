import { create } from "zustand";
import type { Strategy } from "@/types/strategy";

interface StrategyState {
	strategy: Strategy | null;
	isSaveEdit: boolean; // is save edit
	setStrategy: (strategy: Strategy) => void;
	setIsSaveEdit: (isSaveEdit: boolean) => void;
}

export const useStrategyStore = create<StrategyState>((set) => ({
	strategy: null,
	isSaveEdit: false,
	setStrategy: (strategy: Strategy) => set({ strategy: strategy }),
	setIsSaveEdit: (isSaveEdit: boolean) => set({ isSaveEdit: isSaveEdit }),
}));
