import { useCallback, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { StrategyLiveConfig, SelectedAccount, StrategyVariable } from '@/types/strategy';

// 接口定义
interface UseLiveConfigProps {
  id: string; // 节点ID
  initialConfig?: StrategyLiveConfig; // 实盘配置
}

// 自定义hook
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
  // 类型 K 必须是 StrategyLiveConfig 的属性名之一
  const updateField = useCallback(<K extends keyof StrategyLiveConfig>(
    field: K, 
    value: StrategyLiveConfig[K]
  ) => {
    updateConfig(prev => ({
      ...getDefaultConfig(prev),
      [field]: value
    }));
  }, [updateConfig, getDefaultConfig]);

  // 设置默认实盘配置
  const setDefaultLiveConfig = useCallback(() => {
    const defaultConfig = getDefaultConfig();
    updateField('liveAccounts', defaultConfig.liveAccounts);
    updateField('variables', defaultConfig.variables);
  }, [updateField, getDefaultConfig]);

  // 更新实盘账户
  const updateLiveAccounts = useCallback((accounts: SelectedAccount[]) => {
    updateField('liveAccounts', accounts);
  }, [updateField]);

  // 更新实盘变量
  const updateVariables = useCallback((variables: StrategyVariable[]) => {
    updateField('variables', variables);
  }, [updateField]);

  return {
    config,
    setDefaultLiveConfig,
    updateLiveAccounts,
    updateVariables
  };
}; 