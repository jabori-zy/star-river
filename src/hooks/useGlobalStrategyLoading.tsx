import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { createBacktestStrategyStateLogStream } from '@/hooks/obs/backtest-strategy-state-log-obs';
import { StrategyState, LogLevel } from '@/types/strategy-event/strategy-log-event';
import useStrategyLoadingStore from '@/store/useStrategyLoadingStore';

// 全局策略加载管理器
export const useGlobalStrategyLoading = () => {
  const {
    isLoading,
    strategyId,
    isSSEEnabled,
    showDialog,
    addLog,
    stopLoading,
    setRunning,
    setInitializing,
    setBacktesting,
    setFailed,
    setShowDialog,
  } = useStrategyLoadingStore();

  // 用于追踪已触发的回调状态，避免重复调用
  const triggeredStatesRef = useRef<Set<string>>(new Set());

  // 管理SSE订阅
  useEffect(() => {
    if (!isSSEEnabled || !isLoading) {
      return;
    }

    console.log('启动全局SSE订阅，策略ID:', strategyId);

    // 打开回测窗口的函数
    const openBacktestWindow = async (strategyId: number | null) => {
      if (!strategyId) return;

      try {
        // 检查是否在 Electron 环境中
        if (window.require) {
          // Electron 环境：打开新窗口
          const electronModule = window.require("electron");
          if (electronModule?.ipcRenderer) {
            await electronModule.ipcRenderer.invoke(
              "open-backtest-window",
              strategyId,
            );
          }
        } else {
          // 浏览器环境：打开新标签页
          const backtestUrl = `/backtest/${strategyId}`;
          window.open(backtestUrl, "_blank", "width=1200,height=800");
        }
      } catch (error) {
        console.error("打开回测窗口失败:", error);
        toast.error('打开回测窗口失败');
      }
    };

    // 订阅策略日志数据流
    const logSub = createBacktestStrategyStateLogStream(true).subscribe({
      next: (logEvent) => {
        console.log('全局SSE收到策略日志:', logEvent);
        addLog(logEvent);

        // 检查策略状态变化或错误状态
        if ('strategyState' in logEvent) {
          const strategyState = logEvent.strategyState;
          const hasError = logEvent.errorCode && logEvent.logLevel === LogLevel.ERROR;
          const stateKey = `${strategyState}-${logEvent.timestamp}`;

          // 检查是否已经触发过这个状态的回调
          if (!triggeredStatesRef.current.has(stateKey)) {
            if (strategyState === StrategyState.Ready) {
              // 策略就绪
              // 只有在对话框关闭时才显示toast
              if (!showDialog) {
                toast.success('策略加载成功，准备启动...', {
                  duration: 3000,
                });
              }
              
              // 设置为回测中状态  
              setBacktesting(true);
              setInitializing(false);
              setRunning(false); // 清除运行状态，进入回测状态
              
              // 暂时保持isLoading为true，让用户看到"策略加载完成，准备启动..."
              // isLoading会在setTimeout中被清除
              
              // 等待2秒后先关闭dialog，再打开新窗口
              setTimeout(() => {
                setShowDialog(false); // 先关闭dialog
                // 稍微延迟一下再打开新窗口，让dialog关闭动画完成
                setTimeout(() => {
                  openBacktestWindow(strategyId);
                }, 300);
              }, 2000);
              
              triggeredStatesRef.current.add(stateKey);
            } else if (strategyState === StrategyState.Failed || hasError) {
              // 策略失败或有错误发生
              // 只有在对话框关闭时才显示toast
              if (!showDialog) {
                toast.error('策略加载失败', {
                  duration: 5000,
                });
              }
              setFailed(true); // 设置失败状态
              stopLoading(); // 停止加载状态
              triggeredStatesRef.current.add(stateKey);
            }
          }
        } else if ('nodeState' in logEvent) {
          // 检查节点错误
          const hasError = logEvent.errorCode && logEvent.logLevel === LogLevel.ERROR;
          if (hasError) {
            const stateKey = `node-error-${logEvent.timestamp}`;
            if (!triggeredStatesRef.current.has(stateKey)) {
              // 只有在对话框关闭时才显示toast
              if (!showDialog) {
                toast.error(`节点初始化失败: ${logEvent.nodeName}`, {
                  duration: 5000,
                });
              }
              setFailed(true); // 设置失败状态
              stopLoading(); // 停止加载状态
              triggeredStatesRef.current.add(stateKey);
            }
          }
        }
      },
      error: (error) => {
        console.error('全局策略日志流错误:', error);
        // 只有在对话框关闭时才显示toast
        if (!showDialog) {
          toast.error('策略日志连接错误');
        }
        setFailed(true);
        stopLoading();
      }
    });

    return () => {
      console.log('清理全局SSE订阅');
      logSub.unsubscribe();
    };
  }, [isSSEEnabled, isLoading, strategyId, showDialog, addLog, stopLoading, setRunning, setInitializing, setBacktesting, setFailed, setShowDialog]);

  // 处理对话框关闭
  const handleDialogClose = (open: boolean) => {
    setShowDialog(open);
    if (!open) {
      // 对话框关闭时，如果仍在加载中，则提示用户已切换至后台加载
      const store = useStrategyLoadingStore.getState();
      if (store.isLoading) {
        toast.info('策略已切换至后台加载，完成后将自动打开回测窗口', {
          duration: 5000,
        });
      }
    }
  };

  return {
    handleDialogClose,
  };
};

// 声明 window.require 类型
declare global {
  interface Window {
    require?: (module: string) => {
      ipcRenderer?: {
        invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
      };
    };
  }
}
