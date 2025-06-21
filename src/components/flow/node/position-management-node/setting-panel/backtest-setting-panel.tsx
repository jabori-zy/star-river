


import { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import AccountSymbolSelector from "../components/account-symbol-selector";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";
import { SelectedAccount } from "@/types/strategy";
import { useState } from "react";





const PositionManagementNodeBacktestSettingPanel: React.FC<SettingProps> = ({ id, data }) => {
    // 开始节点的回测配置
    const { backtestConfig: startNodeBacktestConfig } = useStartNodeDataStore();

    // 可选的账户列表
    const [accountList, setAccountList] = useState<SelectedAccount[]>(startNodeBacktestConfig?.exchangeConfig?.fromExchanges || []);
    // 当前选中的账户
    const [selectedAccount, setSelectedAccount] = useState<SelectedAccount | null>(null);

    return (
        <div>
            <AccountSymbolSelector
                accountList={accountList}
                selectedAccount={selectedAccount}
                onAccountChange={() => {}}
            />
        </div>
    )
}

export default PositionManagementNodeBacktestSettingPanel;