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
  SelectedAccount,
  TimeRange 
} from '@/types/strategy';
import { Exchange } from '@/types/common';

interface UseUpdateBacktestConfigProps {
  id: string;
  initialBacktestConfig?: KlineNodeBacktestConfig;
}

export const useUpdateBacktestConfig = ({ id, initialBacktestConfig }: UseUpdateBacktestConfigProps) => {
  const { updateNodeData } = useReactFlow();
  
  // 统一的状态管理
  const [config, setConfig] = useState<KlineNodeBacktestConfig | undefined>(initialBacktestConfig);
  
  // 生成 handleId 的辅助函数
  const generateHandleId = useCallback((index: number) => {
    return `${id}_output${index}`;
  }, [id]);

  // 为交易对数组添加 handleId
  const addHandleIds = useCallback((symbols: SelectedSymbol[]): SelectedSymbol[] => {
    return symbols.map((symbol, index) => ({
      ...symbol,
      handleId: generateHandleId(index)
    }));
  }, [generateHandleId]);

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


  const setDefaultBacktestConfig = useCallback(() => {
    const defaultConfig = getDefaultConfig();
    updateField('dataSource', defaultConfig.dataSource);
    updateField('fileConfig', defaultConfig.fileConfig);
    updateField('exchangeConfig', defaultConfig.exchangeConfig);
  }, [updateField, getDefaultConfig]);

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

  const updateSelectedAccount = useCallback((selectedAccount: SelectedAccount | null) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      exchangeConfig: {
        ...prev?.exchangeConfig,
        selectedAccount: selectedAccount,
        selectedSymbols: prev?.exchangeConfig?.selectedSymbols || [],
        timeRange: prev?.exchangeConfig?.timeRange || { startDate: "", endDate: "" }
      }
    }));
  }, [updateConfig, getDefaultConfig]);

  const updateSelectedSymbols = useCallback((selectedSymbols: SelectedSymbol[]) => {
    // 为交易对添加 handleId
    const symbolsWithHandleIds = addHandleIds(selectedSymbols);
    
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      exchangeConfig: {
        ...prev?.exchangeConfig,
        selectedAccount: prev?.exchangeConfig?.selectedAccount || { id: 0, exchange: Exchange.BINANCE, accountName: '' },
        selectedSymbols: symbolsWithHandleIds,
        timeRange: prev?.exchangeConfig?.timeRange || { startDate: "", endDate: "" }
      }
    }));
  }, [updateConfig, getDefaultConfig, addHandleIds]);

  const updateTimeRange = useCallback((timeRange: TimeRange) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      exchangeConfig: {
        ...prev?.exchangeConfig,
        selectedAccount: prev?.exchangeConfig?.selectedAccount || { id: 0, exchange: Exchange.BINANCE, accountName: '' },
        selectedSymbols: prev?.exchangeConfig?.selectedSymbols || [],
        timeRange
      }
    }));
  }, [updateConfig, getDefaultConfig]);

  return {
    config,
    setDefaultBacktestConfig,
    updateDataSource,
    updateFileConfig,
    updateFilePath,
    updateExchangeConfig,
    updateSelectedAccount,
    updateSelectedSymbols,
    updateTimeRange
  };
};
