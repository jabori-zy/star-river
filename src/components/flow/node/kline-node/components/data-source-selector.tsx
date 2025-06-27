import React, { useMemo } from "react";
import { TradeMode, SelectedAccount } from "@/types/strategy";
import { StartNode, StartNodeData } from "@/types/node/start-node";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface DataSourceSelectorProps {
    startNode: StartNode | null; // 已连接的start节点
    tradeMode: TradeMode;
    selectedAccount?: SelectedAccount | null; // 当前选中的账户
    onAccountChange?: (account: SelectedAccount) => void; // 账户变更回调
}

// 已选择的账户列表
const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({
    startNode,
    tradeMode, 
    selectedAccount,
    onAccountChange
}) => {
    
    const startNodeData = startNode?.data as StartNodeData


    
    // 根据交易模式获取账户列表
    const accountList = useMemo(() => {
        if (!startNodeData) return [];
        
        switch (tradeMode) {
            case TradeMode.LIVE:
                return startNodeData.liveConfig?.selectedAccounts || [];
            case TradeMode.BACKTEST:
                return startNodeData.backtestConfig?.exchangeModeConfig?.selectedAccounts || [];
            case TradeMode.SIMULATE:
                return startNodeData.simulateConfig?.selectedAccounts || [];
            default:
                return [];
        }
    }, [startNodeData, tradeMode]);
    
    // 检查是否有可用的账户/交易所
    const hasAccounts = accountList.length > 0;
    
    // 处理账户选择变更
    const handleAccountChange = (accountId: string) => {
        const selectedAcc = accountList.find(acc => acc.id.toString() === accountId);
        if (selectedAcc && onAccountChange) {
            onAccountChange(selectedAcc);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">
                数据源
            </label>
            
            <Select 
                disabled={!hasAccounts}
                value={selectedAccount?.id?.toString() || ""}
                onValueChange={handleAccountChange}
            >
                <SelectTrigger className="w-full h-8 px-2 bg-gray-100 border-1 rounded-md">
                    <SelectValue 
                        placeholder={hasAccounts ? "请选择账户" : "当前策略未选择交易所"} 
                    />
                </SelectTrigger>
                {hasAccounts && (
                    <SelectContent>
                        {accountList.map((account, index) => (
                            <SelectItem 
                                key={`${account.id}-${index}`} 
                                value={`${account.id}`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span>{account.accountName}</span>
                                    <Badge variant="outline" className="text-xs text-gray-500 ml-2">
                                        {account.exchange}
                                    </Badge>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                )}
            </Select>
            
            {!hasAccounts && (
                <p className="text-xs text-gray-500 mt-1">
                    在策略起点配置{tradeMode === TradeMode.LIVE ? '实盘账户' : 
                                      tradeMode === TradeMode.BACKTEST ? '回测数据源' : 
                                      '模拟账户'}
                </p>
            )}
        </div>
    )
}

export default DataSourceSelector;