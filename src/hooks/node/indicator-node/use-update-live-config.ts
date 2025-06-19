import { useCallback, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { IndicatorNodeLiveConfig } from '@/types/node/indicator-node';
import { SelectedIndicator } from '@/types/node/indicator-node';

interface UseUpdateLiveConfigProps {
  id: string;
  initialLiveConfig?: IndicatorNodeLiveConfig;
}

export const useUpdateLiveConfig = ({ 
  id, 
  initialLiveConfig
}: UseUpdateLiveConfigProps) => {
  const { updateNodeData } = useReactFlow();
  
  // 状态管理
  const [liveConfig, setLiveConfig] = useState<IndicatorNodeLiveConfig | undefined>(initialLiveConfig);

  // 实盘配置默认值
  const getDefaultLiveConfig = useCallback((prev?: IndicatorNodeLiveConfig): IndicatorNodeLiveConfig => ({
    exchange: prev?.exchange || null,
    symbol: prev?.symbol || null,
    interval: prev?.interval || null,
    selectedIndicators: prev?.selectedIndicators || [],
    ...prev
  }), []);

  // 通用的实盘配置更新函数
  const updateLiveConfig = useCallback((updater: (prev: IndicatorNodeLiveConfig | undefined) => IndicatorNodeLiveConfig) => {
    setLiveConfig(prevConfig => {
      const newConfig = updater(prevConfig);
      
      // 更新节点数据
      updateNodeData(id, {
        liveConfig: newConfig
      });
      
      return newConfig;
    });
  }, [id, updateNodeData]);

  // 实盘配置字段更新方法
  const updateLiveField = useCallback(<K extends keyof IndicatorNodeLiveConfig>(
    field: K, 
    value: IndicatorNodeLiveConfig[K]
  ) => {
    updateLiveConfig(prev => ({
      ...getDefaultLiveConfig(prev),
      [field]: value
    }));
  }, [updateLiveConfig, getDefaultLiveConfig]);


  const setDefaultLiveConfig = useCallback(() => {
    const defaultConfig = getDefaultLiveConfig();
    updateLiveField('exchange', defaultConfig.exchange);
    updateLiveField('symbol', defaultConfig.symbol);
    updateLiveField('interval', defaultConfig.interval);
  }, [updateLiveField, getDefaultLiveConfig]);

  // 更新实盘k线信息（交易所、交易对、时间间隔）
  const updateLiveKlineInfo = useCallback((
    exchange: string, 
    symbol: string, 
    interval: string
  ) => {
    updateLiveConfig(prev => ({
      ...getDefaultLiveConfig(prev),
      exchange,
      symbol,
      interval
    }));
  }, [updateLiveConfig, getDefaultLiveConfig]);

  // 更新实盘选中的指标
  const updateLiveSelectedIndicators = useCallback((selectedIndicators: SelectedIndicator[]) => {
    updateLiveField('selectedIndicators', selectedIndicators);
  }, [updateLiveField]);

  return {
    // 状态
    liveConfig,
    setDefaultLiveConfig,
    // 具体更新方法
    updateLiveKlineInfo,
    updateLiveSelectedIndicators
  };
}; 