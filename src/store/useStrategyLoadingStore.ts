import { create } from 'zustand';
import type { StrategyStateLogEvent, NodeStateLogEvent } from '@/types/strategy-event/strategy-log-event';

export interface StrategyLoadingState {
  // 加载状态
  isLoading: boolean;
  isInitializing: boolean; // 是否正在初始化中
  isRunning: boolean; // 策略是否正在运行
  isBacktesting: boolean; // 策略是否正在回测中
  isFailed: boolean; // 策略是否启动失败
  isStopping: boolean; // 策略是否正在停止中
  isStopped: boolean; // 策略是否已停止
  strategyId: number | null;
  logs: (StrategyStateLogEvent | NodeStateLogEvent)[];
  
  // 对话框显示状态
  showDialog: boolean;
  dialogTitle: "策略加载中" | "策略停止中"; // 对话框标题
  
  // SSE订阅状态
  isSSEEnabled: boolean;
  
  // Actions
  startLoading: (strategyId: number) => void;
  stopLoading: () => void;
  setInitializing: (initializing: boolean) => void; // 设置初始化状态
  setRunning: (running: boolean) => void; // 设置运行状态
  setBacktesting: (backtesting: boolean) => void; // 设置回测状态
  setFailed: (failed: boolean) => void; // 设置失败状态
  setStopping: (stopping: boolean) => void; // 设置停止中状态
  setStopped: (stopped: boolean) => void; // 设置已停止状态
  addLog: (log: StrategyStateLogEvent | NodeStateLogEvent) => void;
  clearLogs: () => void;
  setShowDialog: (show: boolean) => void;
  setDialogTitle: (title: "策略加载中" | "策略停止中") => void; // 设置对话框标题
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
  isStopping: false,
  isStopped: false,
  strategyId: null,
  logs: [],
  showDialog: false,
  dialogTitle: "策略加载中", // 默认标题
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
      dialogTitle: "策略加载中", // 设置加载标题
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
      isBacktesting: false, // 失败时清除回测状态
      isStopping: false, // 失败时清除停止状态
      isStopped: false // 失败时清除已停止状态
    });
  },
  
  setStopping: (stopping: boolean) => {
    set({ 
      isStopping: stopping,
      isStopped: false, // 开始停止时清除已停止状态
      isBacktesting: false // 开始停止时清除回测状态
    });
  },
  
  setStopped: (stopped: boolean) => {
    set({ 
      isStopped: stopped,
      isStopping: false, // 已停止时清除停止中状态
      isRunning: false, // 停止时清除运行状态
      isBacktesting: false // 停止时清除回测状态
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
  
  setDialogTitle: (title: "策略加载中" | "策略停止中") => {
    set({ dialogTitle: title });
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
      isStopping: false,
      isStopped: false,
      strategyId: null,
      logs: [],
      showDialog: false,
      dialogTitle: "策略加载中", // 重置为默认标题
      isSSEEnabled: false,
    });
  },
}));

export default useStrategyLoadingStore;
