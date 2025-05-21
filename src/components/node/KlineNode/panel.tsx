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
import { KlineNodeData, KlineNodeBacktestFileConfig } from '@/types/node/klineNode';
import { Strategy, SelectedAccount, BacktestDataSource, TimeRange, DataSourceExchange } from '@/types/strategy';
import FileUpload from "@/components/ui/file-upload"
import { FileWithPreview } from "@/hooks/use-file-upload"

interface KlineNodePanelProps {
  data: KlineNodeData;
  strategy: Strategy;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSave: (data: KlineNodeData) => void;
  nodeName: string;
  onNodeNameChange: (name: string) => void;
}

const KlineNodePanel = ({
  data,
  strategy,
  isEditing,
  setIsEditing,
  handleSave,
  nodeName,
  onNodeNameChange
}: KlineNodePanelProps) => {
  // 节点名称修改
  const [tempNodeName, setTempNodeName] = useState<string>(nodeName || "K线节点");
  const [nodeNameEditing, setNodeNameEditing] = useState<boolean>(false);
  // 设置当前交易模式，默认使用策略设置的模式
  const [tradingMode, setTradingMode] = useState<TradeMode>(strategy.tradeMode);
  // 策略中的账户
  const strategyLiveAccounts = strategy.config.liveConfig?.liveAccounts || [];
  const strategySimulateAccounts = strategy.config.simulateConfig?.simulateAccounts || [];
  
  // 实盘交易配置
  const [liveSymbol, setLiveSymbol] = useState<string | undefined>(data.liveConfig?.symbol || "BTCUSDT");
  const [liveInterval, setLiveInterval] = useState<string | undefined>(data.liveConfig?.interval || "1m");
  const [liveSelectedAccount, setLiveSelectedAccount] = useState<string | undefined>(data.liveConfig?.selectedLiveAccount?.toString() || undefined);

  
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
  
  // 回测交易配置
  const backtestDataSource = strategy.config.backtestConfig?.dataSource;
  const backtestTimeRange = strategy.config.backtestConfig?.timeRange;
  // 从策略配置中获取数据源交易所
  const backtestFromExchanges = strategy.config.backtestConfig?.fromExchanges || [];
  // 回测交易文件数据源配置
  const [backtestFileConfig, setBacktestFileConfig] = useState<KlineNodeBacktestFileConfig>(
    data.backtestConfig?.fileConfig || { filePath: "" }
  );
  
  // 回测交易交易所数据源配置
  const [backtestSymbol, setBacktestSymbol] = useState<string>(data.backtestConfig?.exchangeConfig?.symbol || "");
  const [backtestInterval, setBacktestInterval] = useState<string>(data.backtestConfig?.exchangeConfig?.interval || "");
  // 选择的数据源交易所
  const [selectedDataSource, setSelectedDataSource] = useState<string | undefined>(
    data.backtestConfig?.exchangeConfig?.selectedDataSource ? 
    JSON.stringify(data.backtestConfig.exchangeConfig.selectedDataSource) : 
    undefined
  );

  // 文件上传状态
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);

  useEffect(() => {
    if (strategy.config.backtestConfig) {
      console.log(strategy);
    }
    

  }, [strategy]);

  // 阻止拖拽
  const preventDragHandler = (e: React.MouseEvent | React.DragEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // 文件变更处理
  const handleFilesChange = (files: FileWithPreview[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      const file = files[0].file;
      setBacktestFileConfig({
        filePath: file instanceof File ? file.name : file.name
      });
    }
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
    const updatedData: KlineNodeData = {
      nodeName: tempNodeName,
      liveConfig: data.liveConfig,
      simulateConfig: data.simulateConfig,
      backtestConfig: data.backtestConfig,
      klineData: {
        timestamp: null,
        open: null,
        high: null,
        low: null,
        close: null,
        volume: null,
      }
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
      // 确保 backtestConfig 存在
      if (!updatedData.backtestConfig) {
        updatedData.backtestConfig = {
          dataSource: backtestDataSource || BacktestDataSource.EXCHANGE
        };
      } else {
        // 更新现有的 backtestConfig
        updatedData.backtestConfig.dataSource = backtestDataSource || BacktestDataSource.EXCHANGE;
      }
      
      if (backtestDataSource === BacktestDataSource.EXCHANGE) {
        const selectedDataSourceObj = selectedDataSource ? JSON.parse(selectedDataSource) : undefined;
        
        updatedData.backtestConfig.exchangeConfig = {
          symbol: backtestSymbol || "",
          interval: backtestInterval || "",
          timeRange: backtestTimeRange as TimeRange,
          selectedDataSource: selectedDataSourceObj
        };
      } else if (backtestDataSource === BacktestDataSource.FILE) {
        // 如果有上传的文件，使用上传的文件路径
        if (uploadedFiles.length > 0) {
          const file = uploadedFiles[0].file;
          updatedData.backtestConfig.fileConfig = {
            filePath: file instanceof File ? file.name : file.name
          };
        } else {
          // 如果没有上传文件，保持原有的配置
          updatedData.backtestConfig.fileConfig = backtestFileConfig;
        }
      }
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
                    <TabsList className="grid grid-cols-3 h-8">
                      <TabsTrigger value={TradeMode.LIVE} className="text-xs">
                        实盘交易
                      </TabsTrigger>
                      <TabsTrigger value={TradeMode.SIMULATE} className="text-xs">
                        模拟交易
                      </TabsTrigger>
                      <TabsTrigger value={TradeMode.BACKTEST} className="text-xs">
                        历史回测
                      </TabsTrigger>
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
                      {/* 回测数据来源选择 */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          {backtestDataSource === BacktestDataSource.FILE ? "回测数据来源：自定义文件" : "回测数据来源：交易所"}
                        </Label>
                        
                      </div>
                      {/* 根据不同的数据来源，显示不同的配置 */}
                      {backtestDataSource === BacktestDataSource.FILE && (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <Label htmlFor="file-upload" className="text-xs">上传K线数据文件</Label>
                            <FileUpload
                              maxSize={20 * 1024 * 1024} // 20MB
                              accept=".csv,.xls,.xlsx"
                              onFilesChange={handleFilesChange}
                              dropAreaHeight="h-24"
                              customText={{
                                title: "上传数据文件",
                                description: "拖放或点击上传",
                                emptyState: "支持CSV或Excel格式的K线数据文件"
                              }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            支持CSV或Excel格式的K线数据文件，需包含时间戳、开盘价、最高价、最低价、收盘价和成交量
                          </div>
                        </div>
                      )}

                      {backtestDataSource === BacktestDataSource.EXCHANGE && (
                        <>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="backtest-start-date" className="text-xs">回测时间范围</Label>
                            <div className="text-xs text-muted-foreground">{backtestTimeRange?.startDate} 至 {backtestTimeRange?.endDate}</div>
                          </div>
                          
                          {/* 数据源交易所选择 */}
                          <div className="space-y-2 mt-4">
                            <Label className="flex items-center gap-2">
                              <Settings className="h-4 w-4 text-muted-foreground" />
                              数据源交易所
                            </Label>
                            
                            {backtestFromExchanges.length > 0 ? (
                              <Select 
                                value={selectedDataSource}
                                onValueChange={(value) => {setSelectedDataSource(value)}}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="选择数据源交易所" />
                                </SelectTrigger>
                                <SelectContent>
                                  {backtestFromExchanges.map((account: DataSourceExchange) => (
                                    <SelectItem key={account.id} value={JSON.stringify(account)}>
                                      {account.accountName} ({account.exchange})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                没有可用的数据源交易所，请在策略起点节点中配置
                              </div>
                            )}
                          </div>
                          
                          {/* 交易对选择 */}
                          <div className="space-y-2 mt-4">
                            <Label className="flex items-center gap-2">
                              <CircleDot className="h-3 w-3 text-blue-500 fill-blue-500" />
                              交易对
                            </Label>
                            <Select value={backtestSymbol} onValueChange={setBacktestSymbol}>
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
                            <Select value={backtestInterval} onValueChange={setBacktestInterval}>
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
                        </>
                      )}
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

export default KlineNodePanel; 