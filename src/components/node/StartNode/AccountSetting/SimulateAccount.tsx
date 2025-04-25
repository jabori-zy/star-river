import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { X, Plus, DollarSign, RefreshCw } from 'lucide-react';
import { AccountItem } from '@/types/start_node';

interface SimulateAccountProps {
  simulateAccounts: AccountItem[];
  setSimulateAccounts: (accounts: AccountItem[]) => void;
}

export const SimulateAccount = ({ simulateAccounts, setSimulateAccounts }: SimulateAccountProps) => {
  // 添加模拟账户
  const handleAddSimulateAccount = () => {
    setSimulateAccounts([...simulateAccounts, { 
      id: Math.round(Math.random() * 10000),
      accountName: "", 
      availableBalance: 0 
    }]);
  };

  // 移除模拟账户
  const handleRemoveSimulateAccount = (id: number) => {
    if (simulateAccounts.length > 1) {
      setSimulateAccounts(simulateAccounts.filter(account => account.id !== id));
    }
  };

  // 更新模拟账户
  const updateSimulateAccount = (id: number, updates: Partial<AccountItem>) => {
    setSimulateAccounts(simulateAccounts.map(account => 
      account.id === id 
        ? { ...account, ...updates }
        : account
    ));
  };

  // 修改renderSelectWithClear函数，确保显示账户名而非ID
  const renderSelectWithClear = (
    value: string, 
    onChange: (value: string | undefined) => void, 
    placeholder: string,
    items: Array<{id: number, label: string}>,
    width?: string
  ) => {
    // 根据ID查找对应的标签名称
    const getSelectedLabel = () => {
      if (!value) return undefined;
      const item = items.find(item => item.id.toString() === value);
      return item ? item.label : undefined;
    };
    
    return (
      <div className="relative group">
        <Select 
          value={value || ''} 
          onValueChange={onChange}
        >
          <SelectTrigger 
            className={`h-8 text-xs ${width || ''}`}
          >
            <SelectValue placeholder={placeholder}>
              {getSelectedLabel()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {items.length > 0 ? (
              items.map(item => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.label}
                </SelectItem>
              ))
            ) : (
              <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
                暂无账户数据
              </div>
            )}
          </SelectContent>
        </Select>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 absolute right-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation(); // 防止事件冒泡
              onChange(undefined);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <Label className="font-medium">模拟交易账户</Label>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7"
          onClick={() => {
            // 如果没有账户，添加一个默认账户
            if (simulateAccounts.length === 0) {
              handleAddSimulateAccount();
            }
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-3">
        {simulateAccounts.length === 0 ? (
          <div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
            <span>暂无模拟账户，请先添加</span>
          </div>
        ) : (
          simulateAccounts.map((account, index) => (
            <div key={account.id} className="flex items-center gap-2">
              {renderSelectWithClear(
                account.accountName,
                (value) => {
                  if (value) {
                    updateSimulateAccount(account.id, { accountName: value });
                  }
                },
                "选择账户",
                simulateAccounts.map((acc) => ({
                  id: acc.id,
                  label: acc.accountName
                })),
                "w-[180px]"
              )}
              <Input
                type="number"
                value={(account.availableBalance ?? 0).toString()}
                onChange={(e) => updateSimulateAccount(account.id, { availableBalance: Number(e.target.value) || 0 })}
                className="h-8 flex-1 text-sm"
                placeholder="可用资金"
              />
              {index === simulateAccounts.length - 1 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleAddSimulateAccount}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemoveSimulateAccount(account.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SimulateAccount; 