import { useCallback, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { StrategyLiveConfig, SelectedAccount, StrategyVariable } from '@/types/strategy';

interface UseLiveConfigProps {
  id: string;
  initialConfig?: StrategyLiveConfig;
}

export const useLiveConfig = ({ id, initialConfig }: UseLiveConfigProps) => {
  const { updateNodeData } = useReactFlow();
  
  // 统一的状态管理
  const [config, setConfig] = useState<StrategyLiveConfig | undefined>(initialConfig);
  
  // 通用的更新函数
  const updateConfig = useCallback((updater: (prev: StrategyLiveConfig | undefined) => StrategyLiveConfig) => {
    setConfig(prevConfig => {
      const newConfig = updater(prevConfig);
      
      // 更新节点数据
      updateNodeData(id, {
        liveConfig: newConfig
      });
      
      return newConfig;
    });
  }, [id, updateNodeData]);

  // 默认配置值
  const getDefaultConfig = useCallback((prev?: StrategyLiveConfig): StrategyLiveConfig => ({
    liveAccounts: prev?.liveAccounts || [],
    variables: prev?.variables || [],
    ...prev
  }), []);

  // 通用的字段更新方法
  const updateField = useCallback(<K extends keyof StrategyLiveConfig>(
    field: K, 
    value: StrategyLiveConfig[K]
  ) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      [field]: value
    }));
  }, [updateConfig, getDefaultConfig]);

  // 具体的更新方法
  const updateLiveAccounts = useCallback((accounts: SelectedAccount[]) => {
    updateField('liveAccounts', accounts);
  }, [updateField]);

  const updateVariables = useCallback((variables: StrategyVariable[]) => {
    updateField('variables', variables);
  }, [updateField]);

  return {
    config,
    updateLiveAccounts,
    updateVariables
  };
}; 