import { useCallback, useEffect } from 'react';
import { StrategyLiveConfig, SelectedAccount, StrategyVariable } from '@/types/strategy';
import { useStartNodeDataStore } from '@/store/use-start-node-data-store';

// 接口定义
interface UseLiveConfigProps {
  initialConfig?: StrategyLiveConfig; // 实盘配置
}

// 自定义hook
export const useLiveConfig = ({ initialConfig }: UseLiveConfigProps) => {
  
  // 获取全局状态store的方法和数据
  const {
    liveConfig: config,
    setLiveConfig: setGlobalLiveConfig,
    setDefaultLiveConfig: setGlobalDefaultLiveConfig,
    updateLiveAccounts: updateGlobalLiveAccounts,
    updateLiveVariables: updateGlobalLiveVariables
  } = useStartNodeDataStore();
  
  // 初始化配置（仅在首次使用时设置）
  useEffect(() => {
    if (!config && initialConfig) {
      setGlobalLiveConfig(initialConfig);
    }
  }, [config, initialConfig, setGlobalLiveConfig]);

  // 设置默认实盘配置
  const setDefaultLiveConfig = useCallback(() => {
    setGlobalDefaultLiveConfig();
  }, [setGlobalDefaultLiveConfig]);

  // 更新实盘账户
  const updateLiveAccounts = useCallback((accounts: SelectedAccount[]) => {
    updateGlobalLiveAccounts(accounts);
  }, [updateGlobalLiveAccounts]);

  // 更新实盘变量
  const updateVariables = useCallback((variables: StrategyVariable[]) => {
    updateGlobalLiveVariables(variables);
  }, [updateGlobalLiveVariables]);

  return {
    config,
    setDefaultLiveConfig,
    updateLiveAccounts,
    updateVariables
  };
}; 