import { useCallback, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { 
  KlineNodeBacktestConfig, 
  KlineNodeBacktestExchangeConfig,
  KlineNodeBacktestFileConfig,
  SelectedSymbol 
} from '@/types/node/kline-node';
import { 
  BacktestDataSource, 
  DataSourceExchange, 
  TimeRange 
} from '@/types/strategy';
import { Exchange } from '@/types/common';

interface UseUpdateBacktestConfigProps {
  id: string;
  initialConfig?: KlineNodeBacktestConfig;
}

export const useUpdateBacktestConfig = ({ id, initialConfig }: UseUpdateBacktestConfigProps) => {
  const { updateNodeData } = useReactFlow();
  
  // 统一的状态管理
  const [config, setConfig] = useState<KlineNodeBacktestConfig | undefined>(initialConfig);
  
  // 通用的更新函数
  const updateConfig = useCallback((updater: (prev: KlineNodeBacktestConfig | undefined) => KlineNodeBacktestConfig) => {
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
  const getDefaultConfig = useCallback((prev?: KlineNodeBacktestConfig): KlineNodeBacktestConfig => ({
    dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
    fileConfig: prev?.fileConfig,
    exchangeConfig: prev?.exchangeConfig,
    ...prev
  }), []);

  // 通用的字段更新方法
  const updateField = useCallback(<K extends keyof KlineNodeBacktestConfig>(
    field: K, 
    value: KlineNodeBacktestConfig[K]
  ) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      [field]: value
    }));
  }, [updateConfig, getDefaultConfig]);

  // 具体的更新方法
  const updateDataSource = useCallback((dataSource: BacktestDataSource) => {
    updateField('dataSource', dataSource);
  }, [updateField]);

  // 更新文件配置
  const updateFileConfig = useCallback((fileConfig: KlineNodeBacktestFileConfig) => {
    updateField('fileConfig', fileConfig);
  }, [updateField]);

  const updateFilePath = useCallback((filePath: string) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      fileConfig: {
        filePath
      }
    }));
  }, [updateConfig, getDefaultConfig]);

  // 更新交易所配置
  const updateExchangeConfig = useCallback((exchangeConfig: KlineNodeBacktestExchangeConfig) => {
    updateField('exchangeConfig', exchangeConfig);
  }, [updateField]);

  const updateSelectedDataSource = useCallback((selectedDataSource: DataSourceExchange) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      exchangeConfig: {
        ...prev?.exchangeConfig,
        selectedDataSource,
        selectedSymbols: prev?.exchangeConfig?.selectedSymbols || [],
        timeRange: prev?.exchangeConfig?.timeRange || { startDate: "", endDate: "" }
      }
    }));
  }, [updateConfig, getDefaultConfig]);

  const updateSelectedSymbols = useCallback((selectedSymbols: SelectedSymbol[]) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      exchangeConfig: {
        ...prev?.exchangeConfig,
        selectedDataSource: prev?.exchangeConfig?.selectedDataSource || { id: 0, exchange: Exchange.BINANCE, accountName: '' },
        selectedSymbols,
        timeRange: prev?.exchangeConfig?.timeRange || { startDate: "", endDate: "" }
      }
    }));
  }, [updateConfig, getDefaultConfig]);

  const updateTimeRange = useCallback((timeRange: TimeRange) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      exchangeConfig: {
        ...prev?.exchangeConfig,
        selectedDataSource: prev?.exchangeConfig?.selectedDataSource || { id: 0, exchange: Exchange.BINANCE, accountName: '' },
        selectedSymbols: prev?.exchangeConfig?.selectedSymbols || [],
        timeRange
      }
    }));
  }, [updateConfig, getDefaultConfig]);

  return {
    config,
    updateDataSource,
    updateFileConfig,
    updateFilePath,
    updateExchangeConfig,
    updateSelectedDataSource,
    updateSelectedSymbols,
    updateTimeRange
  };
};
