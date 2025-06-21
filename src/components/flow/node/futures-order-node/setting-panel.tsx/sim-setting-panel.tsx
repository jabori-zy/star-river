import { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import TradeAccountSelector from "../components/trade-account-selector";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";
import { useEffect, useState } from "react";
import { SelectedAccount } from "@/types/strategy";
import FuturesOrderSetting from "../components/futures-order-setting";
import { FuturesOrderConfig } from "@/types/order";
import { FuturesOrderNodeData } from "@/types/node/futures-order-node";
import { useUpdateSimulateConfig } from "@/hooks/node/futures-order-node/use-update-simulate-config";

const FuturesOrderNodeSimSettingPanel: React.FC<SettingProps> = ({ id, data }) => {
    // 开始节点的模拟配置 - 注意：这里需要根据实际的store结构来获取simulateConfig
    // 目前看起来startNodeDataStore中没有simulateConfig，可能需要添加
    const { /* simulateConfig: startNodeSimulateConfig */ } = useStartNodeDataStore();

    // 获取节点数据
    const futuresOrderNodeData = data as FuturesOrderNodeData;
    
    // 使用hooks管理节点数据更新
    const { 
        config,
        updateSelectedSimulateAccount,
        updateFuturesOrderConfigs,
    } = useUpdateSimulateConfig({ id, initialConfig: futuresOrderNodeData?.simulateConfig});

    // 可选的账户列表 - 暂时使用空数组，需要根据实际的startNodeSimulateConfig来获取
    const [accountList, setAccountList] = useState<SelectedAccount[]>([]);
    // 当前选中的账户
    const [selectedAccount, setSelectedAccount] = useState<SelectedAccount | null>(
        config?.selectedSimulateAccount || null
    );

    // 当前的订单配置 - 从config中获取，保持同步
    const [orderConfigs, setOrderConfigs] = useState<FuturesOrderConfig[]>(
        config?.futuresOrderConfigs || []
    );

    // 当开始节点的模拟配置变化时，更新可选的账户列表
    // useEffect(() => {
    //     setAccountList(startNodeSimulateConfig?.simulateAccounts || []);
    // }, [startNodeSimulateConfig]);

    // 当config变化时，同步更新本地状态
    useEffect(() => {
        if (config) {
            setSelectedAccount(config.selectedSimulateAccount || null);
            setOrderConfigs(config.futuresOrderConfigs || []);
        }
    }, [config]);

    // 处理账户选择变更
    const handleAccountChange = (account: SelectedAccount) => {
        setSelectedAccount(account);
        updateSelectedSimulateAccount(account);
    }

    // 处理订单配置变更
    const handleOrderConfigsChange = (newOrderConfigs: FuturesOrderConfig[]) => {
        setOrderConfigs(newOrderConfigs);
        updateFuturesOrderConfigs(newOrderConfigs);
    }

    return (
        <div>
            <TradeAccountSelector
                accountList={accountList}
                selectedAccount={selectedAccount}
                onAccountChange={handleAccountChange}
            />
            <FuturesOrderSetting
                orderConfigs={orderConfigs}
                onOrderConfigsChange={handleOrderConfigsChange}
            />
        </div>
    )
}

export default FuturesOrderNodeSimSettingPanel;