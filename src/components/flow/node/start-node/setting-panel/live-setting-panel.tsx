import React, { useState } from 'react';
import { SettingProps } from '@/components/flow/base/BasePanel/setting-panel';
import { StartNodeData } from '@/types/node/startNode';
import AccountSelector from '../components/account-selector';
import VariableEditor from '../components/variable-editor';
import { SelectedAccount } from '@/types/strategy';
import { useLiveConfig } from '@/hooks/node/start-node/use-live-config';

// 新开始节点实时模式设置面板
export const StartNodeLiveSettingPanel: React.FC<SettingProps> = ({ id, data }) => {
    // 将data转换为StartNodeData类型
    const startNodeData = data as StartNodeData;
    
    // 使用自定义 hook 管理实时配置
    const {
        config,
        updateLiveAccounts,
        updateVariables
    } = useLiveConfig({
        id,
        initialConfig: startNodeData.liveConfig
    });

    // 本地UI状态
    const [selectedAccounts, setSelectedAccounts] = useState<SelectedAccount[]>(config?.liveAccounts || []);

    // 处理函数 - 简化为调用 hook 方法并更新本地状态
    const handleUpdateSelectedAccounts = (accounts: SelectedAccount[]) => {
        setSelectedAccounts(accounts);
        updateLiveAccounts(accounts);
    };
    
    return (
        <div className="p-4 space-y-4">
            <AccountSelector
                selectedAccounts={selectedAccounts} 
                setSelectedAccounts={setSelectedAccounts}
                updateSelectedAccounts={handleUpdateSelectedAccounts}
            />
            
            <VariableEditor
                variables={config?.variables || []}
                onVariablesChange={updateVariables}
            />
        </div>
    );
};

export default StartNodeLiveSettingPanel;