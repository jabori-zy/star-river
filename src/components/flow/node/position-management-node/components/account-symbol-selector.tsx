import React, {useState, useEffect} from "react";
import { SelectedAccount } from "@/types/strategy";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface AccountSymbolSelectorProps {
    accountList: SelectedAccount[];
    selectedAccount: SelectedAccount | null; // 当前选中的账户
    onAccountChange: (account: SelectedAccount) => void; // 账户变更回调
}

// 已选择的账户列表
const AccountSymbolSelector: React.FC<AccountSymbolSelectorProps> = ({
    accountList,
    selectedAccount,
    onAccountChange
}) => {

    const [localSelectedAccount, setLocalSelectedAccount] = useState<SelectedAccount | null>(selectedAccount)
    const [localSelectedSymbol, setLocalSelectedSymbol] = useState<string | null>(null)
    const [hasAccounts, setHasAccounts] = useState<boolean>(accountList.length > 0)

    useEffect(() => {
        if (selectedAccount) {
            setLocalSelectedAccount(selectedAccount)
        }
        // 如果账户列表为空，则设置为false
        if (accountList.length === 0) {
            setHasAccounts(false)
        } else {
            setHasAccounts(true)
        }
    }, [selectedAccount, accountList])
    
    // 处理账户选择变更
    const handleAccountChange = (accountId: string) => {
        const selectedAcc = accountList?.find(acc => acc.id.toString() === accountId);
        if (selectedAcc) {
            setLocalSelectedAccount(selectedAcc)
            if (onAccountChange) {
                onAccountChange(selectedAcc);
            }
        }
    };

    const handleSymbolChange = (symbol: string) => {
        setLocalSelectedSymbol(symbol)
    }

    return (
        <div className="flex flex-col gap-2 p-2 border-1 rounded-md bg-gray-100">
            <div className="text-sm font-bold">
                选择账户
            </div>
            <Select
                disabled={!hasAccounts}
                value={localSelectedAccount?.id?.toString() || ""}
                onValueChange={handleAccountChange}
            >
                <SelectTrigger className="w-full h-8 px-2 bg-gray-100 border-1 rounded-md">
                    <SelectValue 
                        placeholder={hasAccounts ? "请选择账户" : "未配置账户"}
                    />
                </SelectTrigger>
                {hasAccounts && (
                    <SelectContent>
                        {accountList.map((account) => (
                            <SelectItem 
                                key={account.id} 
                                value={account.id.toString()}
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
            <div className="text-sm font-bold">
                选择交易对
            </div>
            <Select
                disabled={!hasAccounts}
                value={localSelectedSymbol || ""}
                onValueChange={handleSymbolChange}
            >
                <SelectTrigger className="w-full h-8 px-2 bg-gray-100 border-1 rounded-md">
                    <SelectValue 
                        placeholder={hasAccounts ? "请选择交易对" : "未配置交易对"}
                    />
                </SelectTrigger>
                {hasAccounts && (
                    <SelectContent>
                        <SelectItem value="all">
                            全部
                        </SelectItem>
                        <SelectItem value="symbol1">
                            symbol1
                        </SelectItem>
                        <SelectItem value="symbol2">
                            symbol2
                        </SelectItem>
                    </SelectContent>
                )}
            </Select>
            {!hasAccounts && (
                <p className="text-xs text-gray-500 mt-1">
                    在策略起点配置
                </p>
            )}
        </div>
    )
}

export default AccountSymbolSelector;