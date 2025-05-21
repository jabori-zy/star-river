import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Database, Calendar, Wallet, TrendingUp, PercentSquare, Play, X, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { BacktestDataSource, TimeRange, DataSourceExchange } from '@/types/strategy';
import { Exchange } from '@/types/common';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePickerWithInput from "@/components/ui/date-picker-with-input";
import { Input } from "@/components/ui/input";
import SliderWithTick from "@/components/custom/slider-with-tick";
import { MT5AccountConfig } from './accountService';

interface BacktestAccountProps {
  backtestDataSource: BacktestDataSource;
  setBacktestDataSource: (dataSource: BacktestDataSource) => void;
  backtestTimeRange: TimeRange;
  setBacktestTimeRange: (timeRange: TimeRange) => void;
  fromExchanges?: DataSourceExchange[];
  setFromExchanges?: (accounts: DataSourceExchange[]) => void;
  initialBalance?: number;
  setInitialBalance?: (value: number) => void;
  leverage?: number;
  setLeverage?: (value: number) => void;
  feeRate?: number;
  setFeeRate?: (value: number) => void;
  playSpeed?: number;
  setPlaySpeed?: (value: number) => void;
  availableMT5Accounts: MT5AccountConfig[];
  isLoadingAccounts: boolean;
  errorMessage: string;
  onRefreshAccounts: () => Promise<void>;
}

export const BacktestModeConfig = ({
  backtestDataSource,
  setBacktestDataSource,
  backtestTimeRange,
  setBacktestTimeRange,
  fromExchanges = [],
  setFromExchanges,
  initialBalance = 10000,
  setInitialBalance,
  leverage = 10,
  setLeverage,
  feeRate = 0.0001,
  setFeeRate,
  playSpeed = 1,
  setPlaySpeed,
  availableMT5Accounts,
  isLoadingAccounts,
  errorMessage,
  onRefreshAccounts
}: BacktestAccountProps) => {
  // 是否锁定账户选择
  const [isLockedSelect, setIsLockedSelect] = useState<boolean>(true);
  // 本地维护的账户列表 - 仅在内部使用
  const [localDataSourceAccounts, setLocalDataSourceAccounts] = useState<DataSourceExchange[]>([]);

  // 处理数据源变更
  const handleDataSourceChange = (value: string) => {
    setBacktestDataSource(value as BacktestDataSource);
  };

  // 初始化时从props同步到本地状态
  useEffect(() => {
    if (fromExchanges && fromExchanges.length > 0) {
      setLocalDataSourceAccounts([...fromExchanges]);
    } else {
      setLocalDataSourceAccounts([]);
    }
  }, [fromExchanges]);

  // 阻止事件冒泡，防止DrawerContent中的内容关闭
  const handleMouseDownEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 添加数据源账户
  const handleAddDataSourceAccount = () => {
    setIsLockedSelect(false);
    const newAccount = { 
      id: 0,
      accountName: "", 
      exchange: "" as Exchange
    };
    setLocalDataSourceAccounts(prev => [...prev, newAccount]);
  };

  // 移除数据源账户
  const handleRemoveDataSourceAccount = (index: number) => {
    const newAccounts = [...localDataSourceAccounts];
    newAccounts.splice(index, 1);
    
    setLocalDataSourceAccounts(newAccounts);
    
    // 同步到父组件
    const validAccounts = newAccounts.filter(acc => acc.id !== 0);
    setFromExchanges?.(validAccounts);
  };

  // 更新账户信息
  const updateLocalAccount = (index: number, updates: Partial<DataSourceExchange>) => {
    const newAccounts = [...localDataSourceAccounts];
    newAccounts[index] = { ...newAccounts[index], ...updates };
    setLocalDataSourceAccounts(newAccounts);
    
    // 同步到父组件
    const validAccounts = newAccounts.filter(acc => acc.id !== 0);
    setFromExchanges?.(validAccounts);
  };

  // 获取可用的账户选项
  const getAvailableAccountOptions = (currentIndex: number) => {
    // 获取已选择的账户ID列表（排除当前项）
    const selectedIds = localDataSourceAccounts
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
      });
    }
  };

  // 渲染账户选择器
  const renderAccountSelector = (account: DataSourceExchange, index: number) => {
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

  return (
    <div className="space-y-4" onMouseDown={handleMouseDownEvent}>
      {/* 数据源选择 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <Label className="font-medium">数据源</Label>
        </div>
        <Select defaultValue={backtestDataSource} onValueChange={handleDataSourceChange}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="选择数据源" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={BacktestDataSource.FILE}>文件</SelectItem>
            <SelectItem value={BacktestDataSource.EXCHANGE}>交易所</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 根据数据源类型显示不同的配置项 */}
      {backtestDataSource === BacktestDataSource.EXCHANGE && (
        <>
          {/* 时间范围 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Label className="font-medium">回测时间范围</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <DatePickerWithInput 
                  label="开始日期"
                  value={backtestTimeRange.startDate}
                  onChange={(date: string) => setBacktestTimeRange({
                    ...backtestTimeRange,
                    startDate: date
                  })}
                />
              </div>
              <div className="space-y-1">
                <DatePickerWithInput 
                  label="结束日期"
                  value={backtestTimeRange.endDate}
                  onChange={(date: string) => setBacktestTimeRange({
                    ...backtestTimeRange,
                    endDate: date
                  })}
                />
              </div>
            </div>
          </div>

          {/* 数据源交易所 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <Label className="font-medium">数据源交易所</Label>
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
                  onClick={onRefreshAccounts}
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
                  {localDataSourceAccounts.length === 0 ? (
                    <div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
                      暂无账户选择
                    </div>
                  ) : (
                    localDataSourceAccounts.map((account, index) => (
                      <div key={`data-source-account-${index}`} className="flex items-center gap-2">
                        {renderAccountSelector(account, index)}
                        <div className="flex items-center">
                          {!isLockedSelect && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleRemoveDataSourceAccount(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  
                  {/* 添加账户按钮单独显示 */}
                  {!isLockedSelect && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 mt-2 border-dashed"
                      onClick={handleAddDataSourceAccount}
                    >
                      <Plus className="h-3.5 w-3.5 mr-2" />
                      添加账户
                    </Button>
                  )}
                  
                  {/* 显示可用账户状态 */}
                  {(availableMT5Accounts.length > 0 && 
                   localDataSourceAccounts.filter(acc => acc.id !== 0).length >= availableMT5Accounts.length) ? (
                    <div className="text-xs text-muted-foreground mt-1">
                      所有可用账户已选择完毕
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* 公共字段，无论数据源类型如何都显示 */}
      {/* 初始资金 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <Label className="font-medium">初始资金</Label>
        </div>
        <Input
          type="number"
          value={initialBalance}
          onChange={(e) => setInitialBalance && setInitialBalance(Number(e.target.value))}
          className="h-8 text-sm"
        />
      </div>

      {/* 杠杆倍数 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <Label className="font-medium">杠杆倍数</Label>
        </div>
        <Input
          type="number"
          value={leverage}
          onChange={(e) => setLeverage && setLeverage(Number(e.target.value))}
          className="h-8 text-sm"
        />
      </div>

      {/* 手续费率 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <PercentSquare className="h-4 w-4 text-muted-foreground" />
          <Label className="font-medium">手续费率</Label>
        </div>
        <Input
          type="number"
          value={feeRate}
          onChange={(e) => setFeeRate && setFeeRate(Number(e.target.value))}
          className="h-8 text-sm"
          step="0.0001"
        />
      </div>

      {/* 播放速度 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-muted-foreground" />
          <Label className="font-medium">播放速度</Label>
        </div>
        <SliderWithTick
          defaultValue={[playSpeed]}
          min={0}
          max={100}
          step={10}
          skipInterval={10}
          onValueChange={(value) => {
            // 当值为0时，设置为1
            const actualValue = value[0] === 0 ? 1 : value[0];
            if (setPlaySpeed) {
              setPlaySpeed(actualValue);
            }
          }}
          label=""
          showTicks={true}
        />
        <div className="text-xs text-muted-foreground mt-1">
          {/* 当playSpeed为0时，显示1根K线 */}
          {playSpeed === 0 ? "每秒播放 1 根K线" : `每秒播放 ${playSpeed} 根K线`}
        </div>
      </div>
    </div>
  );
};

export default BacktestModeConfig; 