// 策略起点节点面板
import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Plus, Calendar, CreditCard, DollarSign, Settings, Globe } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid';
import { StartNodeData } from '@/types/start_node';
import { TradingMode } from '@/types/node';

interface Account {
  id: string;
  accountName: string | null;
  availableFunds: string;
}

interface StartNodePanelProps {
  id: string;
  data: StartNodeData;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSave: (data: StartNodeData) => void;
}

const StartNodePanel = ({
  data,
  isEditing,
  setIsEditing,
  handleSave
}: StartNodePanelProps) => {
  // 策略标题
  const [strategyTitle, setStrategyTitle] = useState<string>(data?.strategyTitle || "我的策略");
  // 交易模式
  const [tradingMode, setTradingMode] = useState<TradingMode>(data?.tradingMode || TradingMode.BACKTEST);
  
  // 实盘交易配置
  const [liveAccounts, setLiveAccounts] = useState<Account[]>(data?.liveTradingConfig?.liveAccounts || [{ id: uuidv4(), accountName: null, availableFunds: "" }]);
  const [liveMaxPositions, setLiveMaxPositions] = useState<number>(data?.liveTradingConfig?.maxPositions || 10);

  // 模拟交易配置
  const [simulateAccounts, setSimulateAccounts] = useState<Account[]>(data?.simulateTradingConfig?.simulateAccounts || [{ id: uuidv4(), accountName: null, availableFunds: "" }]);
  const [simulateMaxPositions, setSimulateMaxPositions] = useState<number>(data?.simulateTradingConfig?.maxPositions || 10);
  const [simulateFeeRate, setSimulateFeeRate] = useState<number>(data?.simulateTradingConfig?.feeRate || 0.0003);

  // 回测交易配置
  const [backtestStartDate, setBacktestStartDate] = useState<string>(data?.backtestTradingConfig?.backtestStartDate || "");
  const [backtestEndDate, setBacktestEndDate] = useState<string>(data?.backtestTradingConfig?.backtestEndDate || "");
  const [backtestFeeRate, setBacktestFeeRate] = useState<number>(data?.backtestTradingConfig?.feeRate || 0.0003);

  // 添加实盘账户
  const handleAddLiveAccount = () => {
    setLiveAccounts([...liveAccounts, { id: uuidv4(), accountName: null, availableFunds: "" }]);
  };

  // 移除实盘账户
  const handleRemoveLiveAccount = (id: string) => {
    if (liveAccounts.length > 1) {
      setLiveAccounts(liveAccounts.filter(account => account.id !== id));
    }
  };

  // 更新实盘账户
  const updateLiveAccount = (id: string, updates: Partial<Account>) => {
    setLiveAccounts(liveAccounts.map(account => 
      account.id === id 
        ? { ...account, ...updates }
        : account
    ));
  };

  // 添加模拟账户
  const handleAddSimulateAccount = () => {
    setSimulateAccounts([...simulateAccounts, { id: uuidv4(), accountName: null, availableFunds: "" }]);
  };

  // 移除模拟账户
  const handleRemoveSimulateAccount = (id: string) => {
    if (simulateAccounts.length > 1) {
      setSimulateAccounts(simulateAccounts.filter(account => account.id !== id));
    }
  };

  // 更新模拟账户
  const updateSimulateAccount = (id: string, updates: Partial<Account>) => {
    setSimulateAccounts(simulateAccounts.map(account => 
      account.id === id 
        ? { ...account, ...updates }
        : account
    ));
  };

  const preventDragHandler = (e: React.MouseEvent | React.DragEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const renderSelectWithClear = (
    value: string | null, 
    onChange: (value: string | null) => void, 
    placeholder: string,
    items: Array<{id: string, label: string}>,
    width?: string
  ) => (
    <div className="relative group">
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger className={`h-8 text-xs ${width || ''}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map(item => (
            <SelectItem key={item.id} value={item.id}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 absolute right-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onChange(null)}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  // 根据不同的交易模式返回不同的描述文本
  const getTradingModeDescription = (mode: TradingMode) => {
    switch (mode) {
      case TradingMode.LIVE:
        return "使用真实资金进行交易";
      case TradingMode.SIMULATE:
        return "使用虚拟资金进行模拟交易，使用实时行情数据";
      case TradingMode.BACKTEST:
        return "使用历史数据进行快速迭代策略测试";
      default:
        return "";
    }
  };

  return (
    <Drawer open={isEditing} onOpenChange={setIsEditing} direction="right">
      <div 
        onDragStart={preventDragHandler}
        onDrag={preventDragHandler}
        onDragEnd={preventDragHandler}
        style={{ isolation: 'isolate' }}
      >
        <DrawerContent className="h-[calc(100vh-2rem)] max-w-[400px] rounded-l-xl shadow-2xl mx-0 my-4">
          <DrawerHeader className="border-b">
            <DrawerTitle>编辑策略起点</DrawerTitle>
            <DrawerDescription>
              配置量化策略的全局参数
            </DrawerDescription>
          </DrawerHeader>
          
          <ScrollArea className="flex-1 px-4">
            <div className="py-6 space-y-6">
              {/* 策略标题 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <Label className="font-medium">策略名称</Label>
                </div>
                <Input 
                  value={strategyTitle}
                  onChange={(e) => setStrategyTitle(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="输入策略名称"
                />
              </div>

              {/* 交易模式切换 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <Label className="font-medium">交易模式</Label>
                </div>
                <Tabs 
                  defaultValue={tradingMode}
                  value={tradingMode}
                  onValueChange={(value) => setTradingMode(value as TradingMode)}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 h-8">
                    <TabsTrigger value={TradingMode.LIVE} className="text-xs">
                      实盘交易
                    </TabsTrigger>
                    <TabsTrigger value={TradingMode.SIMULATE} className="text-xs">
                      模拟交易
                    </TabsTrigger>
                    <TabsTrigger value={TradingMode.BACKTEST} className="text-xs">
                      历史回测
                    </TabsTrigger>
                  </TabsList>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {getTradingModeDescription(tradingMode)}
                  </div>
                </Tabs>
              </div>

              {/* 实盘交易账户 - 仅在实盘模式下显示 */}
              {tradingMode === TradingMode.LIVE && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">实盘交易账户</Label>
                  </div>
                  <div className="space-y-3">
                    {liveAccounts.map((account, index) => (
                      <div key={account.id} className="flex items-center gap-2">
                        {renderSelectWithClear(
                          account.accountName,
                          (value) => updateLiveAccount(account.id, { accountName: value }),
                          "选择账户",
                          [
                            { id: "account1", label: "证券账户001" },
                            { id: "account2", label: "证券账户002" },
                            { id: "account3", label: "期货账户001" },
                            { id: "account4", label: "期货账户002" }
                          ],
                          "w-[180px]"
                        )}
                        <Input
                          type="number"
                          value={account.availableFunds}
                          onChange={(e) => updateLiveAccount(account.id, { availableFunds: e.target.value })}
                          className="h-8 flex-1 text-sm"
                          placeholder="可用资金"
                        />
                        {index === liveAccounts.length - 1 ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleAddLiveAccount}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemoveLiveAccount(account.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* 最大持仓数量 */}
                  <div className="space-y-2 mt-4">
                    <Label className="text-xs text-muted-foreground">最大持仓数量</Label>
                    <Input
                      type="number"
                      value={liveMaxPositions}
                      onChange={(e) => setLiveMaxPositions(Number(e.target.value))}
                      className="h-8 text-sm"
                      placeholder="输入最大持仓数量"
                    />
                  </div>
                </div>
              )}

              {/* 模拟交易账户 - 仅在模拟模式下显示 */}
              {tradingMode === TradingMode.SIMULATE && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">模拟交易账户</Label>
                  </div>
                  <div className="space-y-3">
                    {simulateAccounts.map((account, index) => (
                      <div key={account.id} className="flex items-center gap-2">
                        {renderSelectWithClear(
                          account.accountName,
                          (value) => updateSimulateAccount(account.id, { accountName: value }),
                          "选择账户",
                          [
                            { id: "account1", label: "证券账户001" },
                            { id: "account2", label: "证券账户002" },
                            { id: "account3", label: "期货账户001" },
                            { id: "account4", label: "期货账户002" }
                          ],
                          "w-[180px]"
                        )}
                        <Input
                          type="number"
                          value={account.availableFunds}
                          onChange={(e) => updateSimulateAccount(account.id, { availableFunds: e.target.value })}
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
                    ))}
                  </div>
                  
                  {/* 最大持仓数量 */}
                  <div className="space-y-2 mt-4">
                    <Label className="text-xs text-muted-foreground">最大持仓数量</Label>
                    <Input
                      type="number"
                      value={simulateMaxPositions}
                      onChange={(e) => setSimulateMaxPositions(Number(e.target.value))}
                      className="h-8 text-sm"
                      placeholder="输入最大持仓数量"
                    />
                  </div>
                  
                  {/* 交易手续费率 */}
                  <div className="space-y-2 mt-4">
                    <Label className="text-xs text-muted-foreground">交易手续费率</Label>
                    <Input
                      type="number"
                      value={simulateFeeRate}
                      onChange={(e) => setSimulateFeeRate(Number(e.target.value))}
                      className="h-8 text-sm"
                      placeholder="输入手续费率"
                      step="0.0001"
                    />
                    <p className="text-xs text-muted-foreground">例如：0.0003表示万分之三</p>
                  </div>
                </div>
              )}

              {/* 回测交易配置 - 仅在回测模式下显示 */}
              {tradingMode === TradingMode.BACKTEST && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">回测时间范围</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">开始日期</Label>
                      <Input
                        type="date"
                        value={backtestStartDate}
                        onChange={(e) => setBacktestStartDate(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">结束日期</Label>
                      <Input
                        type="date"
                        value={backtestEndDate}
                        onChange={(e) => setBacktestEndDate(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* 交易手续费率 */}
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">交易手续费率</Label>
                    </div>
                    <Input
                      type="number"
                      value={backtestFeeRate}
                      onChange={(e) => setBacktestFeeRate(Number(e.target.value))}
                      className="h-8 text-sm"
                      placeholder="输入手续费率"
                      step="0.0001"
                    />
                    <p className="text-xs text-muted-foreground">例如：0.0003表示万分之三</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DrawerFooter className="border-t">
            <div className="flex gap-2">
              <DrawerClose asChild>
                <Button className="flex-1" variant="outline">
                  取消
                </Button>
              </DrawerClose>
              <Button 
                className="flex-1"
                onClick={() => {
                  // 构建需要保存的数据
                  const newData: StartNodeData = {
                    strategyTitle,
                    tradingMode,
                    // 根据当前选择的交易模式，设置对应的配置
                    ...(tradingMode === TradingMode.LIVE ? {
                      liveTradingConfig: {
                        liveAccounts,
                        maxPositions: liveMaxPositions
                      }
                    } : {}),
                    ...(tradingMode === TradingMode.SIMULATE ? {
                      simulateTradingConfig: {
                        simulateAccounts,
                        maxPositions: simulateMaxPositions,
                        feeRate: simulateFeeRate
                      }
                    } : {}),
                    ...(tradingMode === TradingMode.BACKTEST ? {
                      backtestTradingConfig: {
                        backtestStartDate,
                        backtestEndDate,
                        feeRate: backtestFeeRate
                      }
                    } : {})
                  };
                  handleSave(newData);
                  setIsEditing(false);
                }}
              >
                保存
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </div>
    </Drawer>
  );
};

export default StartNodePanel; 