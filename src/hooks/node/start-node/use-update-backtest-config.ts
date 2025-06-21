import { useCallback, useEffect } from 'react';
import { StrategyBacktestConfig, SelectedAccount, StrategyVariable, TimeRange, BacktestDataSource } from '@/types/strategy';
import { useStartNodeDataStore } from '@/store/use-start-node-data-store';

interface UseBacktestConfigProps {
  initialConfig?: StrategyBacktestConfig;
}

export const useBacktestConfig = ({ initialConfig }: UseBacktestConfigProps) => {
  
  // 获取全局状态store的方法和数据
  const {
    backtestConfig: config,
    setBacktestConfig: setGlobalBacktestConfig,
    setDefaultBacktestConfig: setGlobalDefaultBacktestConfig,
    updateInitialBalance: updateGlobalInitialBalance,
    updateLeverage: updateGlobalLeverage,
    updateFeeRate: updateGlobalFeeRate,
    updatePlaySpeed: updateGlobalPlaySpeed,
    updateDataSource: updateGlobalDataSource,
    updateBacktestAccounts: updateGlobalBacktestAccounts,
    updateTimeRange: updateGlobalTimeRange,
    updateBacktestVariables: updateGlobalBacktestVariables
  } = useStartNodeDataStore();
  
  // 初始化配置（仅在首次使用时设置）
  useEffect(() => {
    if (!config && initialConfig) {
      setGlobalBacktestConfig(initialConfig);
    }
  }, [config, initialConfig, setGlobalBacktestConfig]);

  // 设置默认回测配置
  const setDefaultBacktestConfig = useCallback(() => {
    setGlobalDefaultBacktestConfig();
  }, [setGlobalDefaultBacktestConfig]);

  // 具体的更新方法 - 直接调用全局状态方法
  const updateInitialBalance = useCallback((initialBalance: number) => {
    updateGlobalInitialBalance(initialBalance);
  }, [updateGlobalInitialBalance]);

  const updateLeverage = useCallback((leverage: number) => {
    updateGlobalLeverage(leverage);
  }, [updateGlobalLeverage]);

  const updateFeeRate = useCallback((feeRate: number) => {
    updateGlobalFeeRate(feeRate);
  }, [updateGlobalFeeRate]);

  const updatePlaySpeed = useCallback((playSpeed: number) => {
    updateGlobalPlaySpeed(playSpeed);
  }, [updateGlobalPlaySpeed]);

  const updateDataSource = useCallback((dataSource: BacktestDataSource) => {
    updateGlobalDataSource(dataSource);
  }, [updateGlobalDataSource]);

  const updateVariables = useCallback((variables: StrategyVariable[]) => {
    updateGlobalBacktestVariables(variables);
  }, [updateGlobalBacktestVariables]);

  const updateSelectedAccounts = useCallback((accounts: SelectedAccount[]) => {
    updateGlobalBacktestAccounts(accounts);
  }, [updateGlobalBacktestAccounts]);

  const updateTimeRange = useCallback((timeRange: TimeRange) => {
    updateGlobalTimeRange(timeRange);
  }, [updateGlobalTimeRange]);

  return {
    config,
    setDefaultBacktestConfig,
    updateInitialBalance,
    updateLeverage,
    updateFeeRate,
    updatePlaySpeed,
    updateDataSource,
    updateSelectedAccounts,
    updateTimeRange,
    updateVariables
  };
}; 