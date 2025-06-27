import { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import OptAccountSelector from "../components/opt-account-selector";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";
import { SelectedAccount } from "@/types/strategy";
import { useState, useEffect } from "react";
import OperationSetting from "../components/operation-setting";
import { PositionManagementNodeData, PositionOperationConfig } from "@/types/node/position-management-node";
import { useUpdateBacktestConfig } from "@/hooks/node/position-management-node/use-update-backtest-config";

const PositionManagementNodeBacktestSettingPanel: React.FC<SettingProps> = ({ id, data }) => {
    // 开始节点的回测配置
    const { backtestConfig: startNodeBacktestConfig } = useStartNodeDataStore();

    // 获取节点数据
    const positionNodeData = data as PositionManagementNodeData;
    
    // 使用hooks管理节点数据更新
    const { 
        config,
        updateSelectedAccount,
        updatePositionOperations,
    } = useUpdateBacktestConfig({ id, initialConfig: positionNodeData?.backtestConfig});

    // 可选的账户列表
    const [accountList, setAccountList] = useState<SelectedAccount[]>(startNodeBacktestConfig?.exchangeModeConfig?.selectedAccounts || []);
    // 当前选中的账户
    const [selectedAccount, setSelectedAccount] = useState<SelectedAccount | null>(
        config?.selectedAccount || null
    );

    // 当前的操作配置 - 从config中获取，保持同步
    const [operationConfigs, setOperationConfigs] = useState<PositionOperationConfig[]>(
        config?.positionOperations || []
    );

    // 当开始节点的回测配置变化时，更新可选的账户列表
    useEffect(() => {
        setAccountList(startNodeBacktestConfig?.exchangeModeConfig?.selectedAccounts || []);
    }, [startNodeBacktestConfig]);

    // 当config变化时，同步更新本地状态
    useEffect(() => {
        if (config) {
            setSelectedAccount(config.selectedAccount || null);
            setOperationConfigs(config.positionOperations || []);
        }
    }, [config]);

    // 处理账户选择变更
    const handleAccountChange = (account: SelectedAccount | null) => {
        setSelectedAccount(account);
        updateSelectedAccount(account);
    };

    // 处理操作配置变更
    const handleOperationConfigsChange = (configs: PositionOperationConfig[]) => {
        setOperationConfigs(configs);
        updatePositionOperations(configs);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col items-start justify-start gap-2">
                <OptAccountSelector
                    accountList={accountList}
                    selectedAccount={selectedAccount}
                    onAccountChange={handleAccountChange}
                />
            </div>

            <div className="p-2">
                <OperationSetting
                    nodeId={id}
                    operationConfigs={operationConfigs}
                    onOperationConfigsChange={handleOperationConfigsChange}
                />
            </div>
        </div>
    );
};

export default PositionManagementNodeBacktestSettingPanel;