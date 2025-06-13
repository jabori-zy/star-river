import { useCallback, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { StrategyBacktestConfig, SelectedAccount, StrategyVariable, TimeRange, BacktestDataSource } from '@/types/strategy';

interface UseBacktestConfigProps {
  id: string;
  initialConfig?: StrategyBacktestConfig;
}

export const useBacktestConfig = ({ id, initialConfig }: UseBacktestConfigProps) => {
  const { updateNodeData } = useReactFlow();
  
  // 统一的状态管理
  const [config, setConfig] = useState<StrategyBacktestConfig | undefined>(initialConfig);
  
  // 通用的更新函数
  const updateConfig = useCallback((updater: (prev: StrategyBacktestConfig | undefined) => StrategyBacktestConfig) => {
    setConfig(prevConfig => {
      const newConfig = updater(prevConfig);
      
      // 更新节点数据
      updateNodeData(id, {
        backtestConfig: newConfig
      });
      
      return newConfig;
    });
  }, [id, updateNodeData]);

  // 默认配置值
  const getDefaultConfig = useCallback((prev?: StrategyBacktestConfig): StrategyBacktestConfig => ({
    dataSource: prev?.dataSource || BacktestDataSource.FILE,
    exchangeConfig: prev?.exchangeConfig,
    initialBalance: prev?.initialBalance || 10000,
    leverage: prev?.leverage || 1,
    feeRate: prev?.feeRate || 0.001,
    playSpeed: prev?.playSpeed || 1,
    variables: prev?.variables || [],
    ...prev
  }), []);

  // 通用的字段更新方法
  const updateField = useCallback(<K extends keyof StrategyBacktestConfig>(
    field: K, 
    value: StrategyBacktestConfig[K]
  ) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      [field]: value
    }));
  }, [updateConfig, getDefaultConfig]);

  // 具体的更新方法
  const updateInitialBalance = useCallback((initialBalance: number) => {
    updateField('initialBalance', initialBalance);
  }, [updateField]);

  const updateLeverage = useCallback((leverage: number) => {
    updateField('leverage', leverage);
  }, [updateField]);

  const updateFeeRate = useCallback((feeRate: number) => {
    updateField('feeRate', feeRate);
  }, [updateField]);

  const updatePlaySpeed = useCallback((playSpeed: number) => {
    updateField('playSpeed', playSpeed);
  }, [updateField]);

  const updateDataSource = useCallback((dataSource: BacktestDataSource) => {
    updateField('dataSource', dataSource);
  }, [updateField]);

  const updateVariables = useCallback((variables: StrategyVariable[]) => {
    updateField('variables', variables);
  }, [updateField]);

  // 复杂字段的更新方法
  const updateSelectedAccounts = useCallback((accounts: SelectedAccount[]) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      exchangeConfig: {
        ...prev?.exchangeConfig,
        fromExchanges: accounts,
        timeRange: prev?.exchangeConfig?.timeRange || { startDate: "", endDate: "" }
      }
    }));
  }, [updateConfig, getDefaultConfig]);

  const updateTimeRange = useCallback((timeRange: TimeRange) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      exchangeConfig: {
        fromExchanges: prev?.exchangeConfig?.fromExchanges || [],
        timeRange
      }
    }));
  }, [updateConfig, getDefaultConfig]);

  return {
    config,
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