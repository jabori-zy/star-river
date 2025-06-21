import { useCallback, useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { 
  FuturesOrderNodeLiveConfig,
} from '@/types/node/futures-order-node';
import { FuturesOrderConfig } from '@/types/order';
import { SelectedAccount } from '@/types/strategy';

interface UseUpdateLiveConfigProps {
  id: string;
  initialConfig?: FuturesOrderNodeLiveConfig;
}

export const useUpdateLiveConfig = ({ id, initialConfig }: UseUpdateLiveConfigProps) => {
  const { updateNodeData, getNode } = useReactFlow();
  
  // 统一的状态管理
  const [config, setConfig] = useState<FuturesOrderNodeLiveConfig | undefined>(initialConfig);

  // 同步节点数据到本地状态
  useEffect(() => {
    const node = getNode(id);
    if (node?.data?.liveConfig) {
      setConfig(node.data.liveConfig as FuturesOrderNodeLiveConfig);
    }
  }, [id, getNode]);

  // 通用的更新函数
  const updateConfig = useCallback((updater: (prev: FuturesOrderNodeLiveConfig | undefined) => FuturesOrderNodeLiveConfig) => {
    // 获取最新的节点数据，而不是依赖可能过时的state
    const currentNode = getNode(id);
    const currentConfig = currentNode?.data?.liveConfig as FuturesOrderNodeLiveConfig | undefined;
    
    const newConfig = updater(currentConfig);
    
    // 更新节点数据
    updateNodeData(id, {
      liveConfig: newConfig
    });
    
    // 更新本地状态
    setConfig(newConfig);
  }, [id, updateNodeData, getNode]);

  // 默认配置值
  const getDefaultConfig = useCallback((prev?: FuturesOrderNodeLiveConfig): FuturesOrderNodeLiveConfig => ({
    futuresOrderConfigs: prev?.futuresOrderConfigs || [],
    selectedLiveAccount: prev?.selectedLiveAccount,
    ...prev
  }), []);

  // 通用的字段更新方法
  const updateField = useCallback(<K extends keyof FuturesOrderNodeLiveConfig>(
    field: K, 
    value: FuturesOrderNodeLiveConfig[K]
  ) => {
    updateConfig(prev => ({
      ...prev,
      futuresOrderConfigs: prev?.futuresOrderConfigs || [],
      [field]: value
    }));
  }, [updateConfig]);

  // 设置默认实盘配置
  const setDefaultLiveConfig = useCallback(() => {
    updateConfig(prev => getDefaultConfig(prev));
  }, [updateConfig, getDefaultConfig]);

  // 更新选中的实盘账户
  const updateSelectedLiveAccount = useCallback((selectedLiveAccount: SelectedAccount) => {
    updateField('selectedLiveAccount', selectedLiveAccount);
  }, [updateField]);

  // 更新订单配置列表
  const updateFuturesOrderConfigs = useCallback((futuresOrderConfigs: FuturesOrderConfig[]) => {
    updateField('futuresOrderConfigs', futuresOrderConfigs);
  }, [updateField]);

  // 添加订单配置
  const addFuturesOrderConfig = useCallback((orderConfig: FuturesOrderConfig) => {
    updateConfig(prev => {
      const currentConfigs = prev?.futuresOrderConfigs || [];
      return {
        ...prev,
        futuresOrderConfigs: [...currentConfigs, orderConfig]
      };
    });
  }, [updateConfig]);

  // 更新指定订单配置
  const updateFuturesOrderConfig = useCallback((index: number, orderConfig: FuturesOrderConfig) => {
    updateConfig(prev => {
      const currentConfigs = prev?.futuresOrderConfigs || [];
      const updatedConfigs = [...currentConfigs];
      updatedConfigs[index] = orderConfig;
      
      return {
        ...prev,
        futuresOrderConfigs: updatedConfigs
      };
    });
  }, [updateConfig]);

  // 删除订单配置
  const removeFuturesOrderConfig = useCallback((index: number) => {
    updateConfig(prev => {
      const currentConfigs = prev?.futuresOrderConfigs || [];
      const updatedConfigs = currentConfigs
        .filter((_, i) => i !== index)
        .map((order, newIndex) => ({
          ...order,
          id: newIndex + 1 // 重新分配id，保持连续性
        }));
      
      return {
        ...prev,
        futuresOrderConfigs: updatedConfigs
      };
    });
  }, [updateConfig]);

  return {
    // 状态
    config,
    
    // 基础配置方法
    setDefaultLiveConfig,
    updateSelectedLiveAccount,
    updateFuturesOrderConfigs,
    
    // 订单配置管理方法
    addFuturesOrderConfig,
    updateFuturesOrderConfig,
    removeFuturesOrderConfig,
  };
};
