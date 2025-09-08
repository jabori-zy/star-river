import { create } from 'zustand';
import type { StrategyStateLogEvent, NodeStateLogEvent } from '@/types/strategy-event/strategy-log-event';

export interface StrategyLoadingState {
  // 加载状态
  isLoading: boolean;
  isInitializing: boolean; // 是否正在初始化中
  isRunning: boolean; // 策略是否正在运行
  isBacktesting: boolean; // 策略是否正在回测中
  isFailed: boolean; // 策略是否启动失败
  strategyId: number | null;
  logs: (StrategyStateLogEvent | NodeStateLogEvent)[];
  
  // 对话框显示状态
  showDialog: boolean;
  
  // SSE订阅状态
  isSSEEnabled: boolean;
  
  // Actions
  startLoading: (strategyId: number) => void;
  stopLoading: () => void;
  setInitializing: (initializing: boolean) => void; // 设置初始化状态
  setRunning: (running: boolean) => void; // 设置运行状态
  setBacktesting: (backtesting: boolean) => void; // 设置回测状态
  setFailed: (failed: boolean) => void; // 设置失败状态
  addLog: (log: StrategyStateLogEvent | NodeStateLogEvent) => void;
  clearLogs: () => void;
  setShowDialog: (show: boolean) => void;
  setSSEEnabled: (enabled: boolean) => void;
  
  // 重置所有状态
  reset: () => void;
}

const useStrategyLoadingStore = create<StrategyLoadingState>((set, get) => ({
  // 初始状态
  isLoading: false,
  isInitializing: false,
  isRunning: false,
  isBacktesting: false,
  isFailed: false,
  strategyId: null,
  logs: [],
  showDialog: false,
  isSSEEnabled: false,
  
  // Actions
  startLoading: (strategyId: number) => {
    set({
      isLoading: true,
      isInitializing: true, // 开始加载时设置为初始化中
      isFailed: false, // 重置失败状态
      strategyId,
      logs: [],
      showDialog: true,
      isSSEEnabled: true,
    });
  },
  
  stopLoading: () => {
    set({
      isLoading: false,
      isInitializing: false,
      isRunning: false,
      // 注意：不重置isFailed状态，保持失败状态直到用户重新启动
      strategyId: null,
      isSSEEnabled: false,
    });
  },
  
  setInitializing: (initializing: boolean) => {
    set({ isInitializing: initializing });
  },
  
  setRunning: (running: boolean) => {
    set({ isRunning: running });
  },
  
  setBacktesting: (backtesting: boolean) => {
    set({ isBacktesting: backtesting });
  },
  
  setFailed: (failed: boolean) => {
    set({ 
      isFailed: failed,
      isInitializing: false, // 失败时清除初始化状态
      isRunning: false, // 失败时清除运行状态
      isBacktesting: false // 失败时清除回测状态
    });
  },
  
  addLog: (log: StrategyStateLogEvent | NodeStateLogEvent) => {
    const { logs } = get();
    set({
      logs: [log, ...logs].slice(0, 100), // 限制日志数量
    });
  },
  
  clearLogs: () => {
    set({ logs: [] });
  },
  
  setShowDialog: (show: boolean) => {
    set({ showDialog: show });
  },
  
  setSSEEnabled: (enabled: boolean) => {
    set({ isSSEEnabled: enabled });
  },
  
  reset: () => {
    set({
      isLoading: false,
      isInitializing: false,
      isRunning: false,
      isBacktesting: false,
      isFailed: false,
      strategyId: null,
      logs: [],
      showDialog: false,
      isSSEEnabled: false,
    });
  },
}));

export default useStrategyLoadingStore;
