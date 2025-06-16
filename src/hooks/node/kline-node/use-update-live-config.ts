import { useCallback, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { 
  KlineNodeLiveConfig, 
  KlineNodeSimulateConfig,
  SelectedSymbol 
} from '@/types/node/kline-node';
import { SelectedAccount } from '@/types/strategy';
import { Exchange } from '@/types/common';

interface UseUpdateLiveConfigProps {
  id: string;
  initialLiveConfig?: KlineNodeLiveConfig;
  initialSimulateConfig?: KlineNodeSimulateConfig;
}

export const useUpdateLiveConfig = ({ 
  id, 
  initialLiveConfig, 
  initialSimulateConfig 
}: UseUpdateLiveConfigProps) => {
  const { updateNodeData } = useReactFlow();
  
  // 统一的状态管理
  const [liveConfig, setLiveConfig] = useState<KlineNodeLiveConfig | undefined>(initialLiveConfig);
  const [simulateConfig, setSimulateConfig] = useState<KlineNodeSimulateConfig | undefined>(initialSimulateConfig);
  
  // 生成 handleId 的辅助函数
  const generateHandleId = useCallback((index: number) => {
    return `${id}_output_${index}`;
  }, [id]);

  // 为交易对数组添加 handleId
  const addHandleIds = useCallback((symbols: SelectedSymbol[]): SelectedSymbol[] => {
    return symbols.map((symbol, index) => ({
      ...symbol,
      handleId: generateHandleId(index)
    }));
  }, [generateHandleId]);

  // 实盘配置更新函数
  const updateLiveConfig = useCallback((updater: (prev: KlineNodeLiveConfig | undefined) => KlineNodeLiveConfig) => {
    setLiveConfig(prevConfig => {
      const newConfig = updater(prevConfig);
      
      // 更新节点数据
      updateNodeData(id, {
        liveConfig: newConfig
      });
      
      return newConfig;
    });
  }, [id, updateNodeData]);

  // 模拟配置更新函数
  const updateSimulateConfig = useCallback((updater: (prev: KlineNodeSimulateConfig | undefined) => KlineNodeSimulateConfig) => {
    setSimulateConfig(prevConfig => {
      const newConfig = updater(prevConfig);
      
      // 更新节点数据
      updateNodeData(id, {
        simulateConfig: newConfig
      });
      
      return newConfig;
    });
  }, [id, updateNodeData]);

  // 实盘配置默认值
  const getDefaultLiveConfig = useCallback((prev?: KlineNodeLiveConfig): KlineNodeLiveConfig => ({
    selectedLiveAccount: prev?.selectedLiveAccount || { id: 0, exchange: Exchange.BINANCE, accountName: '' },
    selectedSymbols: prev?.selectedSymbols || [],
    ...prev
  }), []);

  // 模拟配置默认值
  const getDefaultSimulateConfig = useCallback((prev?: KlineNodeSimulateConfig): KlineNodeSimulateConfig => ({
    selectedSimulateAccount: prev?.selectedSimulateAccount || { id: 0, exchange: Exchange.BINANCE, accountName: '' },
    selectedSymbols: prev?.selectedSymbols || [],
    ...prev
  }), []);

  // 实盘配置更新方法
  const updateSelectedLiveAccount = useCallback((selectedLiveAccount: SelectedAccount) => {
    updateLiveConfig(prev => ({
      ...getDefaultLiveConfig(prev),
      selectedLiveAccount
    }));
  }, [updateLiveConfig, getDefaultLiveConfig]);

  const updateLiveSelectedSymbols = useCallback((selectedSymbols: SelectedSymbol[]) => {
    // 为交易对添加 handleId
    const symbolsWithHandleIds = addHandleIds(selectedSymbols);
    
    updateLiveConfig(prev => ({
      ...getDefaultLiveConfig(prev),
      selectedSymbols: symbolsWithHandleIds
    }));
  }, [updateLiveConfig, getDefaultLiveConfig, addHandleIds]);

  // 模拟配置更新方法
  const updateSelectedSimulateAccount = useCallback((selectedSimulateAccount: SelectedAccount) => {
    updateSimulateConfig(prev => ({
      ...getDefaultSimulateConfig(prev),
      selectedSimulateAccount
    }));
  }, [updateSimulateConfig, getDefaultSimulateConfig]);

  const updateSimulateSelectedSymbols = useCallback((selectedSymbols: SelectedSymbol[]) => {
    // 为交易对添加 handleId
    const symbolsWithHandleIds = addHandleIds(selectedSymbols);
    
    updateSimulateConfig(prev => ({
      ...getDefaultSimulateConfig(prev),
      selectedSymbols: symbolsWithHandleIds
    }));
  }, [updateSimulateConfig, getDefaultSimulateConfig, addHandleIds]);

  return {
    liveConfig,
    simulateConfig,
    // 实盘配置更新方法
    updateSelectedLiveAccount,
    updateLiveSelectedSymbols,
    // 模拟配置更新方法
    updateSelectedSimulateAccount,
    updateSimulateSelectedSymbols
  };
};
