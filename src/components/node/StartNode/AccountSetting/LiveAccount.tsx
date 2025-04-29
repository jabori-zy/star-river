import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { X, Plus, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { SelectedAccount } from '@/types/strategy';
import axios from 'axios';
import { Exchange } from '@/types/common';

interface LiveAccountProps {
  liveAccounts: SelectedAccount[];
  setLiveAccounts: (accounts: SelectedAccount[]) => void;
}

interface MT5AccountConfig {
  id: number;
  account_name: string;
  exchange: string;
  login: number;
  server: string;
  terminal_path: string;
  is_available: boolean;
  created_time: string;
}

export const LiveAccount = ({ liveAccounts, setLiveAccounts }: LiveAccountProps) => {
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);
  // 是否锁定账户选择
  const [isLockedSelect, setIsLockedSelect] = useState<boolean>(true);
  // 从接口获取的所有MT5账户列表
  const [availableMT5Accounts, setAvailableMT5Accounts] = useState<MT5AccountConfig[]>([]);
  // 错误提示
  const [errorMessage, setErrorMessage] = useState<string>("");
  // 本地维护的账户列表 - 仅在内部使用
  const [localAccounts, setLocalAccounts] = useState<SelectedAccount[]>([]);

  // 初始化时从props同步到本地状态
  useEffect(() => {
    if (liveAccounts && liveAccounts.length > 0) {
      setLocalAccounts([...liveAccounts]);
    } else {
      // 初始状态可以为空数组，不需要默认添加一个空账户
      setLocalAccounts([]);
    }
  }, [liveAccounts]);

  // 添加实盘账户
  const handleAddLiveAccount = () => {
    setIsLockedSelect(false);
    const newAccount = { 
      id: 0,
      accountName: "", 
      exchange: "" 
    };
    setLocalAccounts(prev => [...prev, newAccount as SelectedAccount]);
    setErrorMessage("");
    
    // 不需要立即同步到父组件，因为新添加的账户id为0，相当于未选择
  };

  // 移除实盘账户
  const handleRemoveLiveAccount = (index: number) => {
    const newAccounts = [...localAccounts];
    newAccounts.splice(index, 1);
    
    // 不再需要自动添加空账户，允许账户数量为0
    setLocalAccounts(newAccounts);
    setErrorMessage("");
    
    // 同步到父组件
    const validAccounts = newAccounts.filter(acc => acc.id !== 0);
    setLiveAccounts(validAccounts);
  };

  // 更新账户信息
  const updateLocalAccount = (index: number, updates: Partial<SelectedAccount>) => {
    const newAccounts = [...localAccounts];
    newAccounts[index] = { ...newAccounts[index], ...updates };
    setLocalAccounts(newAccounts);
    
    // 同步到父组件
    const validAccounts = newAccounts.filter(acc => acc.id !== 0);
    setLiveAccounts(validAccounts);
  };

  // 获取实盘账户配置列表
  const getMT5AccountConfigs = useCallback(async () => {
    try {
      const {data} = await axios.get(`http://localhost:3100/get_mt5_account_config`);
      const mt5ConfigData = data.data || [];
      console.log("获取到的MT5账户配置:", mt5ConfigData);
      
      // 手动添加延迟以展示加载过程
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAvailableMT5Accounts(mt5ConfigData);
    } catch (error) {
      console.error("获取MT5账户配置失败:", error);
      setErrorMessage("获取账户列表失败，请稍后重试");
    }
  }, []);

  // 点击刷新按钮时获取最新账户列表
  const handleFetchMT5Accounts = useCallback(async () => {
    try {
      if (isLoadingAccounts) return;
      setIsLoadingAccounts(true);
      await getMT5AccountConfigs();
    } catch (error) {
      console.error("获取实盘账户失败:", error);
      setErrorMessage("获取账户列表失败，请稍后重试");
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [isLoadingAccounts, getMT5AccountConfigs]);

  // 获取可用的账户选项
  const getAvailableAccountOptions = (currentIndex: number) => {
    // 获取已选择的账户ID列表（排除当前项）
    const selectedIds = localAccounts
      .filter((_, idx) => idx !== currentIndex)
      .map(acc => acc.id)
      .filter(id => id !== 0);

    // 过滤出未被选择的账户
    return availableMT5Accounts
      .filter(account => !selectedIds.includes(account.id));
  };

  // 处理账户选择变更
  const handleAccountChange = (index: number, selectedId: string) => {
    if (!selectedId) return;
    
    const numericId = parseInt(selectedId);
    const selectedAccount = availableMT5Accounts.find(acc => acc.id === numericId);
    
    if (selectedAccount) {
      updateLocalAccount(index, { 
        id: numericId,
        accountName: selectedAccount.account_name,
        exchange: selectedAccount.exchange as Exchange,
        availableBalance: 0
      });
      setErrorMessage("");
    }
  };

  // 渲染账户选择器
  const renderAccountSelector = (account: SelectedAccount, index: number) => {
    const availableOptions = getAvailableAccountOptions(index);
    
    return (
      <div className="relative group">
        <Select 
          value={account.id !== 0 ? account.id.toString() : ""} 
          onValueChange={(value) => handleAccountChange(index, value)}
          disabled={isLockedSelect}
        >
          <SelectTrigger className="h-8 text-xs w-[180px]">
            <SelectValue placeholder="选择账户">
              <div className="flex items-center gap-2">
                {account.accountName}
                {account.exchange && (
                  <Badge variant="outline" className="ml-2">
                    {account.exchange === "metatrader5" ? "MT5" : account.exchange}
                  </Badge>
                )}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {isLoadingAccounts ? (
              <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
                加载账户中...
              </div>
            ) : availableOptions.length > 0 ? (
              availableOptions.map(item => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.account_name}
                  <Badge variant="outline" className="ml-2">
                    {item.exchange === "metatrader5" ? "MT5" : item.exchange}
                  </Badge>
                </SelectItem>
              ))
            ) : (
              <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
                {availableMT5Accounts.length > 0 ? '所有账户已选择' : '暂无账户数据'}
              </div>
            )}
          </SelectContent>
        </Select>

        {account.id !== 0 && !isLockedSelect && (
          
          <Button
            variant="ghost"
            size="sm"
            className={`h-4 w-4 p-0 absolute right-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}
            onClick={(e) => {
              e.stopPropagation();
              updateLocalAccount(index, { 
                id: 0,
                accountName: "",
                exchange: "" as Exchange
              });
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  // 组件挂载时加载账户列表
  useEffect(() => {
    handleFetchMT5Accounts();
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <Label className="font-medium">实盘交易账户</Label>
        </div>
        <div className="flex items-center gap-2">
          {/* 锁定账户选择 */}
          {!isLockedSelect ? (
            <Button
              variant="default"
              size="sm"
              className="flex items-center justify-center text-xs"
              onClick={() => {
                setIsLockedSelect(true);
              }}
            >
              锁定已选账户
            </Button>
          ):(
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center text-xs bg-red-200"
              onClick={() => setIsLockedSelect(false)}
            >
              解锁已选账户
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7"
            disabled={isLoadingAccounts}
            onClick={handleFetchMT5Accounts}
          >
            {isLoadingAccounts ? (
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>

        </div>

      </div>
      
      {errorMessage && (
        <div className="flex items-center p-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded">
          <AlertCircle className="h-4 w-4 mr-2" />
          {errorMessage}
        </div>
      )}
      
      <div className="space-y-3">
        {isLoadingAccounts && availableMT5Accounts.length === 0 ? (
          <div className="flex items-center justify-center p-4 border rounded-md bg-muted/30">
            <span className="text-sm">加载账户中...</span>
          </div>
        ) : (
          <>
            {localAccounts.length === 0 ? (
              <div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
                暂无账户选择
              </div>
            ) : (
              localAccounts.map((account, index) => (
                <div key={`local-account-${index}`} className="flex items-center gap-2">
                  {renderAccountSelector(account, index)}
                  {/* 如果账户选择被锁定，则可用资金输入框不可编辑 */}
                    <Input
                      type="number"
                      value={(account.availableBalance ?? 0).toString()}
                      onChange={(e) => updateLocalAccount(index, { 
                        availableBalance: Number(e.target.value) || 0 
                      })}
                      className="h-8 flex-1 text-sm"
                      placeholder="可用资金"
                      disabled={isLockedSelect}
                    />
                  <div className="flex items-center">
                    {/* 所有行都显示删除按钮 */}
                    {!isLockedSelect && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveLiveAccount(index)}
                    >
                      <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {/* 添加账户按钮单独显示 */}
            {/* 如果已选择账户为0，账户选择被锁定，则显示解锁账户按钮 */}
            {
              !isLockedSelect && (
                <Button
                  variant="outline"
                  size="sm"
                className="w-full h-8 mt-2 border-dashed"
                onClick={handleAddLiveAccount}
              >
                <Plus className="h-3.5 w-3.5 mr-2" />
                  添加账户
                </Button>
              )
            }
            
            
            {/* 显示可用账户状态 */}
            {availableMT5Accounts.length > 0 && 
             localAccounts.filter(acc => acc.id !== 0).length >= availableMT5Accounts.length && (
              <div className="text-xs text-muted-foreground mt-1">
                所有可用账户已选择完毕
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LiveAccount; 