import { create } from 'zustand';
import { 
  StrategyLiveConfig, 
  StrategyBacktestConfig, 
  SelectedAccount, 
  StrategyVariable, 
  BacktestDataSource, 
  TimeRange,
} from '@/types/strategy';
import dayjs from 'dayjs';

// StartNode数据状态接口
interface StartNodeDataState {
  // Live模式配置
  liveConfig: StrategyLiveConfig | null;
  // Backtest模式配置
  backtestConfig: StrategyBacktestConfig | null;
}

// StartNode数据操作接口
interface StartNodeDataActions {
  // === Live配置相关方法 ===
  setLiveConfig: (config: StrategyLiveConfig) => void;
  setDefaultLiveConfig: () => void;
  updateLiveAccounts: (accounts: SelectedAccount[]) => void;
  updateLiveVariables: (variables: StrategyVariable[]) => void;
  
  // === Backtest配置相关方法 ===
  setBacktestConfig: (config: StrategyBacktestConfig) => void;
  setDefaultBacktestConfig: () => void;
  updateInitialBalance: (balance: number) => void;
  updateLeverage: (leverage: number) => void;
  updateFeeRate: (feeRate: number) => void;
  updatePlaySpeed: (playSpeed: number) => void;
  updateDataSource: (dataSource: BacktestDataSource) => void;
  updateBacktestAccounts: (accounts: SelectedAccount[]) => void;
  updateTimeRange: (timeRange: TimeRange) => void;
  updateBacktestVariables: (variables: StrategyVariable[]) => void;
  
  // === 重置方法 ===
  resetLiveConfig: () => void;
  resetBacktestConfig: () => void;
  resetAll: () => void;
}

// 默认配置生成函数
const createDefaultLiveConfig = (): StrategyLiveConfig => ({
  liveAccounts: [],
  variables: []
});

const createDefaultBacktestConfig = (): StrategyBacktestConfig => ({
  dataSource: BacktestDataSource.EXCHANGE,
  exchangeConfig: {
    fromExchanges: [],
    timeRange: { 
      startDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD'), 
      endDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD') 
    }
  },
  initialBalance: 10000,
  leverage: 1,
  feeRate: 0.001,
  playSpeed: 1,
  variables: []
});

// 创建zustand store
export const useStartNodeDataStore = create<StartNodeDataState & StartNodeDataActions>((set, get) => ({
  // === 初始状态 ===
  liveConfig: null,
  backtestConfig: null,

  // === Live配置相关方法 ===
  setLiveConfig: (config: StrategyLiveConfig) => {
    set({ liveConfig: config });
  },

  setDefaultLiveConfig: () => {
    const defaultConfig = createDefaultLiveConfig();
    set({ liveConfig: defaultConfig });
  },

  updateLiveAccounts: (accounts: SelectedAccount[]) => {
    set(state => ({
      liveConfig: state.liveConfig ? {
        ...state.liveConfig,
        liveAccounts: accounts
      } : {
        ...createDefaultLiveConfig(),
        liveAccounts: accounts
      }
    }));
  },

  updateLiveVariables: (variables: StrategyVariable[]) => {
    set(state => ({
      liveConfig: state.liveConfig ? {
        ...state.liveConfig,
        variables
      } : {
        ...createDefaultLiveConfig(),
        variables
      }
    }));
  },

  // === Backtest配置相关方法 ===
  setBacktestConfig: (config: StrategyBacktestConfig) => {
    set({ backtestConfig: config });
  },

  setDefaultBacktestConfig: () => {
    const defaultConfig = createDefaultBacktestConfig();
    set({ backtestConfig: defaultConfig });
  },

  updateInitialBalance: (balance: number) => {
    set(state => ({
      backtestConfig: state.backtestConfig ? {
        ...state.backtestConfig,
        initialBalance: balance
      } : {
        ...createDefaultBacktestConfig(),
        initialBalance: balance
      }
    }));
  },

  updateLeverage: (leverage: number) => {
    set(state => ({
      backtestConfig: state.backtestConfig ? {
        ...state.backtestConfig,
        leverage
      } : {
        ...createDefaultBacktestConfig(),
        leverage
      }
    }));
  },

  updateFeeRate: (feeRate: number) => {
    set(state => ({
      backtestConfig: state.backtestConfig ? {
        ...state.backtestConfig,
        feeRate
      } : {
        ...createDefaultBacktestConfig(),
        feeRate
      }
    }));
  },

  updatePlaySpeed: (playSpeed: number) => {
    set(state => ({
      backtestConfig: state.backtestConfig ? {
        ...state.backtestConfig,
        playSpeed
      } : {
        ...createDefaultBacktestConfig(),
        playSpeed
      }
    }));
  },

  updateDataSource: (dataSource: BacktestDataSource) => {
    set(state => ({
      backtestConfig: state.backtestConfig ? {
        ...state.backtestConfig,
        dataSource
      } : {
        ...createDefaultBacktestConfig(),
        dataSource
      }
    }));
  },

  updateBacktestAccounts: (accounts: SelectedAccount[]) => {
    set(state => {
      const currentConfig = state.backtestConfig || createDefaultBacktestConfig();
      const startDate = dayjs().subtract(2, 'day').format('YYYY-MM-DD');
      const endDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      
      return {
        backtestConfig: {
          ...currentConfig,
          exchangeConfig: {
            fromExchanges: accounts,
            timeRange: currentConfig.exchangeConfig?.timeRange || { startDate, endDate }
          }
        }
      };
    });
  },

  updateTimeRange: (timeRange: TimeRange) => {
    set(state => {
      const currentConfig = state.backtestConfig || createDefaultBacktestConfig();
      
      return {
        backtestConfig: {
          ...currentConfig,
          exchangeConfig: {
            fromExchanges: currentConfig.exchangeConfig?.fromExchanges || [],
            timeRange
          }
        }
      };
    });
  },

  updateBacktestVariables: (variables: StrategyVariable[]) => {
    set(state => ({
      backtestConfig: state.backtestConfig ? {
        ...state.backtestConfig,
        variables
      } : {
        ...createDefaultBacktestConfig(),
        variables
      }
    }));
  },

  // === 重置方法 ===
  resetLiveConfig: () => {
    set({ liveConfig: null });
  },

  resetBacktestConfig: () => {
    set({ backtestConfig: null });
  },

  resetAll: () => {
    set({ liveConfig: null, backtestConfig: null });
  }
}));

export default useStartNodeDataStore;
