import { useCallback, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { 
  IndicatorNodeBacktestConfig,
  IndicatorNodeBacktestExchangeConfig
} from '@/types/node/indicator-node';
import { 
  BacktestDataSource, 
  DataSourceExchange, 
  TimeRange 
} from '@/types/strategy';
import { Exchange } from '@/types/common';
import { IndicatorConfig } from '@/types/indicator';

interface UseUpdateBacktestConfigProps {
  id: string;
  initialConfig?: IndicatorNodeBacktestConfig;
}

export const useUpdateBacktestConfig = ({ id, initialConfig }: UseUpdateBacktestConfigProps) => {
  const { updateNodeData } = useReactFlow();
  
  // 统一的状态管理
  const [config, setConfig] = useState<IndicatorNodeBacktestConfig | undefined>(initialConfig);

  // 通用的更新函数
  const updateConfig = useCallback((updater: (prev: IndicatorNodeBacktestConfig | undefined) => IndicatorNodeBacktestConfig) => {
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
  const getDefaultConfig = useCallback((prev?: IndicatorNodeBacktestConfig): IndicatorNodeBacktestConfig => ({
    dataSource: prev?.dataSource || BacktestDataSource.EXCHANGE,
    fileConfig: prev?.fileConfig,
    exchangeConfig: prev?.exchangeConfig,
    ...prev
  }), []);

  // 通用的字段更新方法
  const updateField = useCallback(<K extends keyof IndicatorNodeBacktestConfig>(
    field: K, 
    value: IndicatorNodeBacktestConfig[K]
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

  // 更新数据源
  const updateDataSource = useCallback((dataSource: BacktestDataSource) => {
    updateField('dataSource', dataSource);
  }, [updateField]);

  // 更新交易所配置
  const updateExchangeConfig = useCallback((exchangeConfig: IndicatorNodeBacktestExchangeConfig) => {
    updateField('exchangeConfig', exchangeConfig);
  }, [updateField]);

  // 更新选中的数据源
  const updateSelectedDataSource = useCallback((selectedDataSource: DataSourceExchange) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      exchangeConfig: {
        ...prev?.exchangeConfig,
        exchange: selectedDataSource.exchange,
        symbol: prev?.exchangeConfig?.symbol || '',
        interval: prev?.exchangeConfig?.interval || '',
        timeRange: prev?.exchangeConfig?.timeRange || { startDate: "", endDate: "" },
        selectedIndicators: prev?.exchangeConfig?.selectedIndicators || [] as IndicatorConfig[]
      }
    }));
  }, [updateConfig, getDefaultConfig]);

  // 更新symbol和interval
  const updateSymbolAndInterval = useCallback((symbol: string, interval: string) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      exchangeConfig: {
        ...prev?.exchangeConfig,
        exchange: prev?.exchangeConfig?.exchange || Exchange.BINANCE,
        symbol,
        interval,
        timeRange: prev?.exchangeConfig?.timeRange || { startDate: "", endDate: "" },
        selectedIndicators: prev?.exchangeConfig?.selectedIndicators || [] as IndicatorConfig[]
      }
    }));
  }, [updateConfig, getDefaultConfig]);

  // 更新基础配置（交易所、交易对、时间间隔、时间范围）
  const updateBacktestKlineInfo = useCallback((
    exchange: string,
    symbol: string,
    interval: string,
    timeRange: TimeRange
  ) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      exchangeConfig: {
        ...prev?.exchangeConfig,
        exchange: exchange as Exchange,
        symbol,
        interval,
        timeRange,
        selectedIndicators: prev?.exchangeConfig?.selectedIndicators || [] as IndicatorConfig[]
      }
    }));
  }, [updateConfig, getDefaultConfig]);

  // 更新时间范围
  const updateTimeRange = useCallback((timeRange: TimeRange) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      exchangeConfig: {
        ...prev?.exchangeConfig,
        exchange: prev?.exchangeConfig?.exchange || Exchange.BINANCE,
        symbol: prev?.exchangeConfig?.symbol || '',
        interval: prev?.exchangeConfig?.interval || '',
        timeRange,
        selectedIndicators: prev?.exchangeConfig?.selectedIndicators || [] as IndicatorConfig[]
      }
    }));
  }, [updateConfig, getDefaultConfig]);

  // 更新选中的指标
  const updateSelectedIndicators = useCallback((selectedIndicators: IndicatorConfig[]) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      exchangeConfig: {
        ...prev?.exchangeConfig,
        exchange: prev?.exchangeConfig?.exchange || Exchange.BINANCE,
        symbol: prev?.exchangeConfig?.symbol || '',
        interval: prev?.exchangeConfig?.interval || '',
        timeRange: prev?.exchangeConfig?.timeRange || { startDate: "", endDate: "" },
        selectedIndicators
      }
    }));
  }, [updateConfig, getDefaultConfig]);

  return {
    // 状态
    config,
    setDefaultBacktestConfig,
    // 具体更新方法
    updateDataSource,
    updateExchangeConfig,
    updateSelectedDataSource,
    updateSymbolAndInterval,
    updateBacktestKlineInfo,
    updateTimeRange,
    updateSelectedIndicators
  };
}; 