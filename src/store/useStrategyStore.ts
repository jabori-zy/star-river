import { create } from 'zustand';
import { Strategy } from '@/types/strategy';

interface StrategyState {
  strategy: Strategy | null;
  setStrategy: (strategy: Strategy) => void;
}

const useStrategyStore = create<StrategyState>((set) => ({
  strategy: null,
  setStrategy: (strategy: Strategy) => set({ strategy: strategy }),
}));

export default useStrategyStore;
