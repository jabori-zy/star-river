// 数据获取节点面板
import { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, DrawerOverlay, DrawerPortal } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Settings, CircleDot, X } from 'lucide-react'
import { TradeMode } from '@/types/node';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Node } from '@xyflow/react';
import { LiveDataNodeData } from '@/types/LiveDataNode';
import { Strategy, SelectedAccount } from '@/types/strategy';

interface LiveDataNodePanelProps {
  data: LiveDataNodeData;
  strategy: Strategy;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSave: (data: LiveDataNodeData) => void;
  nodeName: string;
  onNodeNameChange: (name: string) => void;
}

const LiveDataNodePanel = ({
  data,
  strategy,
  isEditing,
  setIsEditing,
  handleSave,
  nodeName,
  onNodeNameChange
}: LiveDataNodePanelProps) => {
  // 节点名称修改
  const [tempNodeName, setTempNodeName] = useState<string>(nodeName || "数据获取节点");
  const [nodeNameEditing, setNodeNameEditing] = useState<boolean>(false);
  // 设置当前交易模式，默认使用策略设置的模式
  const [tradingMode, setTradingMode] = useState<TradeMode>(strategy.tradeMode);
  // 策略中的账户
  const strategyLiveAccounts = strategy.config.liveConfig?.liveAccounts || [];
  const strategySimulateAccounts = strategy.config.simulateConfig?.simulateAccounts || [];
  
  // 实盘交易配置
  const [liveSymbol, setLiveSymbol] = useState<string | undefined>(
    data.liveConfig?.symbol || "BTCUSDT"
  );
  const [liveInterval, setLiveInterval] = useState<string | undefined>(
    data.liveConfig?.interval || "1m"
  );
  const [liveSelectedAccount, setLiveSelectedAccount] = useState<string | undefined>(
    data.liveConfig?.selectedLiveAccount?.toString() || undefined
  );

  
  // 模拟交易配置
  const [simulateSymbol, setSimulateSymbol] = useState<string | undefined>(
    data.simulateConfig?.symbol || "BTCUSDT"
  );
  const [simulateInterval, setSimulateInterval] = useState<string | undefined>(
    data.simulateConfig?.interval || "1m"
  );
  const [simulateSelectedAccount, setSimulateSelectedAccount] = useState<string | undefined>(
    data.simulateConfig?.selectedSimulateAccount?.toString() || undefined
  );
  
  // // 回测交易配置
  // const backtestStartDate = strategy.backtestTradeConfig?.backtestStartDate || "";
  // const backtestEndDate = strategy.backtestTradeConfig?.backtestEndDate || "";

  // 阻止拖拽
  const preventDragHandler = (e: React.MouseEvent | React.DragEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  



  // 获取交易模式的描述文本
  const getTradingModeDescription = (mode: TradeMode) => {
    switch (mode) {
      case TradeMode.LIVE:
        return "使用真实资金进行交易";
      case TradeMode.SIMULATE:
        return "使用虚拟资金进行模拟交易，使用实时行情数据";
      case TradeMode.BACKTEST:
        return "使用历史数据进行快速迭代策略测试";
      default:
        return "";
    }
  };
  
  // 保存配置
  const onSave = () => {
    // 构建更新数据
    const updatedData: LiveDataNodeData = {
      nodeName: tempNodeName,
      liveConfig: data.liveConfig,
      simulateConfig: data.simulateConfig,
      backtestConfig: data.backtestConfig
    };
    
    // 更新实盘交易配置
    if (tradingMode === TradeMode.LIVE || data.liveConfig) {
      // 获取已选择的账户
      const selectedLiveAccountObj = JSON.parse(liveSelectedAccount || "{}");
      updatedData.liveConfig = {
        ...data.liveConfig, 
        selectedLiveAccount: selectedLiveAccountObj,
        symbol: liveSymbol || "",
        interval: liveInterval || "",
      };
    }
    
    // 更新模拟交易配置
    if (tradingMode === TradeMode.SIMULATE || data.simulateConfig) {
      const selectedAccountObj = JSON.parse(simulateSelectedAccount || "{}");
      updatedData.simulateConfig = {
        ...data.simulateConfig,
        selectedSimulateAccount: selectedAccountObj,
        symbol: simulateSymbol || "",
        interval: simulateInterval || "",
      };
    }
    
    // 更新回测交易配置
    if (tradingMode === TradeMode.BACKTEST || data.backtestConfig) {
      updatedData.backtestConfig = {
        ...data.backtestConfig,
        backtestStartDate: strategy.config.backtestConfig?.backtestStartDate || "",
        backtestEndDate: strategy.config.backtestConfig?.backtestEndDate || ""
      };
    }
    updatedData.nodeName = tempNodeName;

    handleSave(updatedData);
    setIsEditing(false);
  };

  // 节点名称相关函数
  const handleDoubleClick = () => {
    setNodeNameEditing(true);
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempNodeName(e.target.value);
  };

  const saveNodeName = () => {
    onNodeNameChange(tempNodeName);
    setNodeNameEditing(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveNodeName();
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
        <DrawerPortal>
          <DrawerOverlay className="!bg-transparent" />
          <DrawerContent
            className="h-[calc(100vh-2rem)] max-w-[400px] rounded-l-xl shadow-2xl mx-0 my-4"
          >
            <DrawerHeader className="border-b">
            <DrawerTitle>
                <div>
                  {nodeNameEditing ? (
                    <Input
                      type="text"
                      value={tempNodeName}
                      onChange={handleNameChange}
                      onBlur={saveNodeName}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="w-full px-1 text-sm border rounded focus:outline-none"
                    />
                  ) : (
                    <span onDoubleClick={handleDoubleClick}>
                      {nodeName}
                    </span>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-4 top-4"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DrawerTitle>
              <DrawerDescription>
                配置数据获取节点的参数
              </DrawerDescription>
            </DrawerHeader>
            
            <ScrollArea className="flex-1 px-4">
              <div className="py-6 space-y-6">
                {/* 交易模式切换 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">交易模式</Label>
                  </div>
                  <Tabs 
                    defaultValue={tradingMode}
                    value={tradingMode}
                    onValueChange={(value) => setTradingMode(value as TradeMode)}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-2 h-8">
                      <TabsTrigger value={TradeMode.LIVE} className="text-xs">
                        实盘交易
                      </TabsTrigger>
                      <TabsTrigger value={TradeMode.SIMULATE} className="text-xs">
                        模拟交易
                      </TabsTrigger>
                      {/* <TabsTrigger value={TradeMode.BACKTEST} className="text-xs">
                        历史回测
                      </TabsTrigger> */}
                    </TabsList>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {getTradingModeDescription(tradingMode)}
                    </div>
                  </Tabs>
                </div>

                {/* 实盘交易配置 */}
                {tradingMode === TradeMode.LIVE && (
                  <div className="space-y-4">
                    {/* 账户选择 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        实盘交易账户
                      </Label>
                      
                      {strategyLiveAccounts.length > 0 ? (
                        <Select 
                          value={liveSelectedAccount}
                          onValueChange={(value) => {setLiveSelectedAccount(value)}}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="选择交易账户" />
                          </SelectTrigger>
                          <SelectContent>
                            {strategyLiveAccounts.map((account: SelectedAccount) => (
                              <SelectItem key={account.id} value={JSON.stringify(account)}>
                                {account.accountName} (可用: {account.availableBalance})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          没有可用的实盘账户，请在开始节点选择账户
                        </div>
                      )}
                    </div>

                    {/* 交易对选择 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CircleDot className="h-3 w-3 text-blue-500 fill-blue-500" />
                        交易对
                      </Label>
                      <Select value={liveSymbol} onValueChange={setLiveSymbol}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择交易对" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                          <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                          <SelectItem value="XAUUSD">XAU/USD</SelectItem>
                          <SelectItem value="BTCUSDm">BTC/USDm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 时间间隔选择 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CircleDot className="h-3 w-3 text-purple-500 fill-purple-500" />
                        时间间隔
                      </Label>
                      <Select value={liveInterval} onValueChange={setLiveInterval}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择时间间隔" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1m">1分钟</SelectItem>
                          <SelectItem value="5m">5分钟</SelectItem>
                          <SelectItem value="15m">15分钟</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* 模拟交易配置 */}
                {tradingMode === TradeMode.SIMULATE && (
                  <div className="space-y-4">
                    {/* 账户选择 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        模拟交易账户
                      </Label>
                      
                      {strategySimulateAccounts.length > 0 ? (
                        <Select 
                          value={simulateSelectedAccount}
                          onValueChange={(value) => {setSimulateSelectedAccount(value)}}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="选择模拟账户" />
                          </SelectTrigger>
                          <SelectContent>
                            {strategySimulateAccounts.map((account: SelectedAccount) => (
                              <SelectItem key={account.id} value={JSON.stringify(account)}>
                                {account.accountName} (可用: {account.availableBalance})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          没有可用的模拟账户，请从起始节点配置
                        </div>
                      )}
                    </div>

                    {/* 交易对选择 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CircleDot className="h-3 w-3 text-blue-500 fill-blue-500" />
                        交易对
                      </Label>
                      <Select value={simulateSymbol} onValueChange={setSimulateSymbol}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择交易对" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                          <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                          <SelectItem value="XAUUSD">XAU/USD</SelectItem>
                          <SelectItem value="BTCUSDm">BTC/USDm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 时间间隔选择 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CircleDot className="h-3 w-3 text-purple-500 fill-purple-500" />
                        时间间隔
                      </Label>
                      <Select value={simulateInterval} onValueChange={setSimulateInterval}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择时间间隔" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1m">1分钟</SelectItem>
                          <SelectItem value="5m">5分钟</SelectItem>
                          <SelectItem value="15m">15分钟</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* 回测交易配置 */}
                {tradingMode === TradeMode.BACKTEST && (
                  <div className="space-y-4">
                    {/* 回测时间范围显示 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        回测时间范围
                      </Label>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="backtest-start-date" className="text-xs">开始日期</Label>
                          <Input
                            id="backtest-start-date"
                            type="date"
                            value={strategy.config.backtestConfig?.backtestStartDate}
                            disabled
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="backtest-end-date" className="text-xs">结束日期</Label>
                          <Input
                            id="backtest-end-date"
                            type="date"
                            value={strategy.config.backtestConfig?.backtestEndDate}
                            disabled
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        回测时间范围从起始节点获取，如需修改请在起始节点中设置
                      </div>
                    </div>

                    {/* 交易对选择 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CircleDot className="h-3 w-3 text-blue-500 fill-blue-500" />
                        交易对
                      </Label>
                      <Select value={data.backtestConfig?.symbol} onValueChange={setBacktestSymbol}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择交易对" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                          <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                          <SelectItem value="XAUUSD">XAU/USD</SelectItem>
                          <SelectItem value="BTCUSDm">BTC/USDm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 时间间隔选择 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CircleDot className="h-3 w-3 text-purple-500 fill-purple-500" />
                        时间间隔
                      </Label>
                      <Select value={data.backtestConfig?.interval} onValueChange={setBacktestInterval}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择时间间隔" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1m">1分钟</SelectItem>
                          <SelectItem value="5m">5分钟</SelectItem>
                          <SelectItem value="15m">15分钟</SelectItem>
                        </SelectContent>
                      </Select>
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
                  onClick={onSave}
                >
                  保存
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </DrawerPortal>
      </div>
    </Drawer>
  );
};

export default LiveDataNodePanel; 