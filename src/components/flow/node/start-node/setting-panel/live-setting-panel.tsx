import React from 'react';
import { SettingProps } from '@/components/flow/base/BasePanel/setting-panel';
import { StartNodeData } from '@/types/node/start-node';
import AccountSelector from '../components/account-selector';
import VariableEditor from '../components/variable-editor';
import { useLiveConfig } from '@/hooks/node/start-node/use-update-live-config';
import { useStartNodeDataStore } from '@/store/use-start-node-data-store';

// 新开始节点实时模式设置面板
export const StartNodeLiveSettingPanel: React.FC<SettingProps> = ({ data }) => {
    // 将data转换为StartNodeData类型
    const startNodeData = data as StartNodeData;
    
    // 从全局状态获取数据
    const { liveConfig: globalLiveConfig } = useStartNodeDataStore();
    
    // 使用自定义 hook 管理实时配置
    const {
        updateLiveAccounts,
        updateVariables
    } = useLiveConfig({
        initialConfig: startNodeData.liveConfig || undefined
    });
    
    return (
        <div className="p-4 space-y-4">
            <AccountSelector
                selectedAccounts={globalLiveConfig?.liveAccounts || []} 
                setSelectedAccounts={() => {}} // 不再需要本地状态设置
                updateSelectedAccounts={updateLiveAccounts}
            />
            
            <VariableEditor
                variables={globalLiveConfig?.variables || []}
                onVariablesChange={updateVariables}
            />
        </div>
    );
};

export default StartNodeLiveSettingPanel;