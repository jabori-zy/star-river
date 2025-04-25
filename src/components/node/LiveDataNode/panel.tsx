// 数据获取节点面板
import { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Settings, CircleDot, Info } from 'lucide-react'
import { AccountItem } from '@/types/start_node';
import { TradeMode } from '@/types/node';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Node } from '@xyflow/react';
import { LiveTradeConfig, SimulateTradeConfig, BacktestTradeConfig } from '@/types/start_node';
import { Badge } from '@/components/ui/badge';
import useTradingModeStore from '@/store/useTradingModeStore';
import { getSafeLiveAccounts, getSafeSimulateAccounts, getTradingModeColor, getTradingModeDescription } from '@/utils/tradingModeHelper';

// 每个交易模式的配置
interface LiveDataNodeConfig {
  symbol: string;
  interval: string;
  selectedAccount?: string;
}

interface LiveDataNodePanelProps {
  data: {
    liveDataNodeConfig: LiveDataNodeConfig;
    tradingMode?: TradeMode;
    liveTradingConfig?: LiveTradeConfig;
    simulateTradingConfig?: SimulateTradeConfig;
    backtestTradingConfig?: BacktestTradeConfig;
  };
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSave: (data: Record<string, unknown>) => void;
  sourceNodes: Node[];
}

const LiveDataNodePanel = ({
  data,
  isEditing,
  setIsEditing,
  handleSave,
  sourceNodes
}: LiveDataNodePanelProps) => {
  // 从当前配置获取初始值
  const [symbol, setSymbol] = useState<string>(data.liveDataNodeConfig.symbol || 'BTCUSDT');
  const [interval, setInterval] = useState<string>(data.liveDataNodeConfig.interval || '1m');
  
  // 使用全局交易模式
  const { tradingMode } = useTradingModeStore();
  
  // 交易配置
  const [liveTradingConfig, setLiveTradingConfig] = useState<LiveTradeConfig | undefined>(
    data?.liveTradingConfig || undefined
  );
  const [simulateTradingConfig, setSimulateTradingConfig] = useState<SimulateTradeConfig | undefined>(
    data?.simulateTradingConfig || undefined
  );
  const [backtestTradingConfig, setBacktestTradingConfig] = useState<BacktestTradeConfig | undefined>(
    data?.backtestTradingConfig || undefined
  );

  // 当前选中的账户
  const [selectedAccount, setSelectedAccount] = useState<string>(
    data.liveDataNodeConfig.selectedAccount || ""
  );

  // 从上游节点获取配置
  useEffect(() => {
    if (sourceNodes.length > 0 && sourceNodes[0].data) {
      const sourceNode = sourceNodes[0];
      
      // 更新账户配置
      if (tradingMode === TradeMode.LIVE && sourceNode.data.liveTradingConfig) {
        setLiveTradingConfig(sourceNode.data.liveTradingConfig as LiveTradeConfig);
        
        // 安全获取账户列表并设置默认选择第一个账户
        const accounts = getSafeLiveAccounts(sourceNode.data.liveTradingConfig);
        if (accounts.length > 0 && !selectedAccount) {
          setSelectedAccount(accounts[0].id.toString());
        }
      } else if (tradingMode === TradeMode.SIMULATE && sourceNode.data.simulateTradingConfig) {
        setSimulateTradingConfig(sourceNode.data.simulateTradingConfig as SimulateTradeConfig);
        
        // 安全获取账户列表并设置默认选择第一个账户
        const accounts = getSafeSimulateAccounts(sourceNode.data.simulateTradingConfig);
        if (accounts.length > 0 && !selectedAccount) {
          setSelectedAccount(accounts[0].id.toString());
        }
      } else if (tradingMode === TradeMode.BACKTEST && sourceNode.data.backtestTradingConfig) {
        setBacktestTradingConfig(sourceNode.data.backtestTradingConfig as BacktestTradeConfig);
      }
    }
  }, [sourceNodes, tradingMode, selectedAccount]);

  const preventDragHandler = (e: React.MouseEvent | React.DragEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const onSave = () => {
    // 根据当前交易模式，更新相应的配置
    const updatedData: Record<string, unknown> = {
      liveTradingConfig,
      simulateTradingConfig,
      backtestTradingConfig
    };

    // 根据当前交易模式设置对应的配置
    if (tradingMode === TradeMode.LIVE) {
      updatedData.liveDataNodeConfig = {
        liveModeConfig: {
          symbol,
          interval,
          selectedAccount
        }
      };
    } else if (tradingMode === TradeMode.SIMULATE) {
      updatedData.liveDataNodeConfig = {
        simulateModeConfig: {
          symbol,
          interval,
          selectedAccount
        }
      };
    } else if (tradingMode === TradeMode.BACKTEST) {
      updatedData.liveDataNodeConfig = {
        backtestModeConfig: {
          symbol,
          interval
        }
      };
    }

    handleSave(updatedData);
  };

  // 安全获取账户列表
  const liveAccounts = getSafeLiveAccounts(liveTradingConfig);
  const simulateAccounts = getSafeSimulateAccounts(simulateTradingConfig);

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
            <DrawerTitle>编辑数据获取节点</DrawerTitle>
            <DrawerDescription>
              配置数据获取节点的参数
            </DrawerDescription>
          </DrawerHeader>
          
          <ScrollArea className="flex-1 px-4">
            <div className="py-6 space-y-6">
              {/* 当前交易模式显示 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  当前交易模式
                </Label>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className={`h-6 ${getTradingModeColor(tradingMode)}`}>
                    {tradingMode === TradeMode.LIVE ? "实盘交易" : 
                     tradingMode === TradeMode.SIMULATE ? "模拟交易" : "回测交易"}
                  </Badge>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <span>由起始节点控制</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {getTradingModeDescription(tradingMode)}
                </div>
              </div>
              
              {/* 账户选择部分 - 移到首要位置 */}
              {tradingMode === TradeMode.LIVE && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    实盘交易账户
                  </Label>
                  
                  {liveAccounts.length > 0 ? (
                    <Select 
                      value={selectedAccount}
                      onValueChange={setSelectedAccount}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择交易账户" />
                      </SelectTrigger>
                      <SelectContent>
                        {liveAccounts.map((account: AccountItem) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.accountName} (可用: {account.availableBalance})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      没有可用的实盘账户，请从起始节点配置
                    </div>
                  )}
                </div>
              )}

              {tradingMode === TradeMode.SIMULATE && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    模拟交易账户
                  </Label>
                  
                  {simulateAccounts.length > 0 ? (
                    <Select 
                      value={selectedAccount}
                      onValueChange={setSelectedAccount}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择模拟账户" />
                      </SelectTrigger>
                      <SelectContent>
                        {simulateAccounts.map((account: AccountItem) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
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
              )}

              {tradingMode === TradeMode.BACKTEST && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    回测时间范围
                  </Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="backtest-start-date" className="text-xs">开始日期</Label>
                      <Input
                        id="backtest-start-date"
                        type="date"
                        value={backtestTradingConfig?.backtestStartDate || ""}
                        disabled
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="backtest-end-date" className="text-xs">结束日期</Label>
                      <Input
                        id="backtest-end-date"
                        type="date"
                        value={backtestTradingConfig?.backtestEndDate || ""}
                        disabled
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    回测时间范围从起始节点获取，如需修改请在起始节点中设置
                  </div>
                </div>
              )}

              {/* 基础参数配置 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CircleDot className="h-3 w-3 text-blue-500 fill-blue-500" />
                    交易对
                  </Label>
                  <Select value={symbol} onValueChange={setSymbol}>
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

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CircleDot className="h-3 w-3 text-purple-500 fill-purple-500" />
                    时间间隔
                  </Label>
                  <Select value={interval} onValueChange={setInterval}>
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
      </div>
    </Drawer>
  );
};

export default LiveDataNodePanel; 