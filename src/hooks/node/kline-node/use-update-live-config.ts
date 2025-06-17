import { useCallback, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { 
  KlineNodeLiveConfig,
  SelectedSymbol 
} from '@/types/node/kline-node';
import { SelectedAccount } from '@/types/strategy';

interface UseUpdateLiveConfigProps {
  id: string;
  initialLiveConfig?: KlineNodeLiveConfig;
}

export const useUpdateLiveConfig = ({ 
  id, 
  initialLiveConfig
}: UseUpdateLiveConfigProps) => {
  const { updateNodeData } = useReactFlow();
  
  // 统一的状态管理
  const [liveConfig, setLiveConfig] = useState<KlineNodeLiveConfig | undefined>(initialLiveConfig);
  
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

  // 实盘配置默认值
  const getDefaultLiveConfig = useCallback((prev?: KlineNodeLiveConfig): KlineNodeLiveConfig => ({
    selectedLiveAccount: prev?.selectedLiveAccount || null, //默认值为null
    selectedSymbols: prev?.selectedSymbols || [], //默认值为空数组
    ...prev
  }), []);

  // 实盘配置更新方法
  const setDefaultLiveConfig = useCallback(() => {
    const defaultConfig = getDefaultLiveConfig();
    updateLiveConfig(prev => ({
      ...getDefaultLiveConfig(prev),
      selectedLiveAccount: defaultConfig.selectedLiveAccount,
      selectedSymbols: defaultConfig.selectedSymbols
    }));
  }, [updateLiveConfig, getDefaultLiveConfig]);


  const updateSelectedLiveAccount = useCallback((selectedLiveAccount: SelectedAccount | null) => {
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

  return {
    liveConfig,
    // 实盘配置更新方法
    setDefaultLiveConfig,
    updateSelectedLiveAccount,
    updateLiveSelectedSymbols,

  };
};
