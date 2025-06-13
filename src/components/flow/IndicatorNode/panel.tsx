import { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, DrawerOverlay, DrawerPortal } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, X } from 'lucide-react'
import { TradeMode } from '@/types/node';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { IndicatorNodeData, IndicatorNodeLiveConfig, IndicatorNodeSimulateConfig, IndicatorNodeBacktestConfig } from '@/types/node/indicatorNode';
import { Strategy, BacktestDataSource } from '@/types/strategy';
import { IndicatorType, PriceSource } from '@/types/indicator';
import { SmaConfig, EmaConfig, BollConfig } from '@/types/indicator/indicatorConfig';
import SMASettings from './settings/SMASettings';
import EMASettings from './settings/EMASettings';
import BOLLSettings from './settings/BOLLSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { getIndicatorValue } from '@/utils/getIndicatorValue';

interface IndicatorNodePanelProps {
  data: IndicatorNodeData;
  strategy: Strategy;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSave: (data: IndicatorNodeData) => void;
  nodeName: string;
  onNodeNameChange: (name: string) => void;
  indicatorType: IndicatorType;
  setIndicatorType: (type: IndicatorType) => void;
}

const IndicatorNodePanel = ({
  data,
  strategy,
  isEditing,
  setIsEditing,
  handleSave,
  nodeName,
  onNodeNameChange,
  indicatorType,
  setIndicatorType
}: IndicatorNodePanelProps) => {
  // 节点名称修改
  const [tempNodeName, setTempNodeName] = useState<string>(nodeName || "指标节点");
  const [nodeNameEditing, setNodeNameEditing] = useState<boolean>(false);
  
  // 设置当前交易模式，默认使用策略设置的模式
  const [tradingMode, setTradingMode] = useState<TradeMode>(strategy.tradeMode);

  // 创建默认的指标配置
  const createDefaultIndicatorConfig = (type: IndicatorType) => {
    switch (type) {
      case IndicatorType.SMA:
        return { period: 9, priceSource: PriceSource.CLOSE } as SmaConfig;
      case IndicatorType.EMA:
        return { period: 9, priceSource: PriceSource.CLOSE } as EmaConfig;
      case IndicatorType.BOLL:
        return { period: 20, stdDev: 2, priceSource: PriceSource.CLOSE } as BollConfig;
      default:
        return { period: 9, priceSource: PriceSource.CLOSE } as SmaConfig;
    }
  };

  // 实盘交易配置
  const [liveConfig, setLiveConfig] = useState<IndicatorNodeLiveConfig>(() => {
    const defaultConfig = createDefaultIndicatorConfig(indicatorType);
    if (data.liveConfig && data.liveConfig.indicatorConfig) {
      return data.liveConfig;
    }
    return {
      indicatorConfig: defaultConfig
    };
  });

  // 模拟交易配置  
  const [simulateConfig, setSimulateConfig] = useState<IndicatorNodeSimulateConfig>(() => {
    const defaultConfig = createDefaultIndicatorConfig(indicatorType);
    if (data.simulateConfig && data.simulateConfig.indicatorConfig) {
      return data.simulateConfig;
    }
    return {
      indicatorConfig: defaultConfig
    };
  });

  // 回测交易配置
  const [backtestConfig, setBacktestConfig] = useState<IndicatorNodeBacktestConfig>(() => {
    const defaultConfig = createDefaultIndicatorConfig(indicatorType);
    if (data.backtestConfig && data.backtestConfig.indicatorConfig) {
      return data.backtestConfig;
    }
    return {
      dataSource: strategy.config.backtestConfig?.dataSource || BacktestDataSource.EXCHANGE,
      indicatorConfig: defaultConfig
    };
  });

  useEffect(() => {
    // 根据策略配置初始化数据源信息
    if (strategy.config) {
      // 实盘模式：从策略的实盘配置中获取第一个账户的交易所信息
      if (strategy.config.liveConfig?.liveAccounts && strategy.config.liveConfig.liveAccounts.length > 0) {
        const firstAccount = strategy.config.liveConfig.liveAccounts[0];
        setLiveConfig(prev => ({
          ...prev,
          exchange: firstAccount.exchange,
          symbol: prev.symbol || "BTCUSDm",
          interval: prev.interval || "1m"
        }));
      }

      // 回测模式：从策略的回测配置中获取信息  
      if (strategy.config.backtestConfig) {
        const backtestStrategyConfig = strategy.config.backtestConfig;
        setBacktestConfig(prev => ({
          ...prev,
          dataSource: backtestStrategyConfig.dataSource,
          ...(backtestStrategyConfig.dataSource === BacktestDataSource.EXCHANGE && 
             backtestStrategyConfig.fromExchanges && 
             backtestStrategyConfig.fromExchanges.length > 0 && 
             backtestStrategyConfig.timeRange && {
            exchangeConfig: {
              exchange: backtestStrategyConfig.fromExchanges[0].exchange,
              symbol: prev.exchangeConfig?.symbol || "BTCUSDm",
              interval: prev.exchangeConfig?.interval || "1m",
              timeRange: backtestStrategyConfig.timeRange
            }
          })
        }));
      }
    }
  }, [strategy]);

  // 阻止拖拽
  const preventDragHandler = (e: React.MouseEvent | React.DragEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // 获取交易模式的描述文本
  const getTradingModeDescription = (mode: TradeMode) => {
    switch (mode) {
      case TradeMode.LIVE:
        return "使用真实资金进行交易的指标配置";
      case TradeMode.SIMULATE:
        return "使用虚拟资金进行模拟交易的指标配置";
      case TradeMode.BACKTEST:
        return "使用历史数据进行回测的指标配置";
      default:
        return "";
    }
  };

  // 获取指标名称
  const getIndicatorName = () => {
    switch (indicatorType) {
      case IndicatorType.SMA:
        return "简单移动平均线";
      case IndicatorType.EMA:
        return "指数移动平均线";
      case IndicatorType.BOLL:
        return "布林带";
      default:
        return "指标";
    }
  };

  // 获取指标颜色
  const getIndicatorColor = () => {
    switch (indicatorType) {
      case IndicatorType.SMA:
        return "bg-purple-100 text-purple-700 border-purple-200";
      case IndicatorType.EMA:
        return "bg-green-100 text-green-700 border-green-200";
      case IndicatorType.BOLL:
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // 处理指标类型变更
  const handleIndicatorTypeChange = (value: string) => {
    const newType = value as IndicatorType;
    setIndicatorType(newType);
    
    // 重置所有模式的配置
    const newIndicatorConfig = createDefaultIndicatorConfig(newType);
    
    setLiveConfig(prev => ({
      ...prev,
      indicatorConfig: newIndicatorConfig
    }));
    
    setSimulateConfig(prev => ({
      ...prev,
      indicatorConfig: newIndicatorConfig
    }));
    
    setBacktestConfig(prev => ({
      ...prev,
      indicatorConfig: newIndicatorConfig
    }));
  };

  // 处理配置变更 - 根据当前模式更新对应的配置
  const handleConfigChange = (key: string, value: number | PriceSource) => {
    switch (tradingMode) {
      case TradeMode.LIVE:
        setLiveConfig(prev => {
          if (!prev.indicatorConfig) {
            prev.indicatorConfig = createDefaultIndicatorConfig(indicatorType);
          }
          return {
            ...prev,
            indicatorConfig: {
              ...prev.indicatorConfig,
              [key]: value
            }
          };
        });
        break;
      case TradeMode.SIMULATE:
        setSimulateConfig(prev => {
          if (!prev.indicatorConfig) {
            prev.indicatorConfig = createDefaultIndicatorConfig(indicatorType);
          }
          return {
            ...prev,
            indicatorConfig: {
              ...prev.indicatorConfig,
              [key]: value
            }
          };
        });
        break;
      case TradeMode.BACKTEST:
        setBacktestConfig(prev => {
          if (!prev.indicatorConfig) {
            prev.indicatorConfig = createDefaultIndicatorConfig(indicatorType);
          }
          return {
            ...prev,
            indicatorConfig: {
              ...prev.indicatorConfig,
              [key]: value
            }
          };
        });
        break;
    }
  };

  // 获取当前模式的指标配置
  const getCurrentIndicatorConfig = () => {
    const defaultConfig = createDefaultIndicatorConfig(indicatorType);
    
    switch (tradingMode) {
      case TradeMode.LIVE:
        return liveConfig?.indicatorConfig || defaultConfig;
      case TradeMode.SIMULATE:
        return simulateConfig?.indicatorConfig || defaultConfig;
      case TradeMode.BACKTEST:
        return backtestConfig?.indicatorConfig || defaultConfig;
      default:
        return simulateConfig?.indicatorConfig || defaultConfig;
    }
  };

  // 保存配置
  const onSave = () => {
    // 生成对应指标类型的指标值
    const indicatorValue = getIndicatorValue(indicatorType);
    
    // 构建更新数据
    const updatedData: IndicatorNodeData = {
      nodeName: tempNodeName,
      indicatorType,
      indicatorValue,
      liveConfig: tradingMode === TradeMode.LIVE || data.liveConfig ? liveConfig : undefined,
      simulateConfig: tradingMode === TradeMode.SIMULATE || data.simulateConfig ? simulateConfig : undefined,
      backtestConfig: tradingMode === TradeMode.BACKTEST || data.backtestConfig ? backtestConfig : undefined,
    };

    handleSave(updatedData);
    setIsEditing(false);
  };

  // 节点名称相关函数
  const handleDoubleClick = () => {
    setNodeNameEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempNodeName(e.target.value);
  };

  const saveNodeName = () => {
    onNodeNameChange(tempNodeName);
    setNodeNameEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveNodeName();
    }
  };

  // 渲染数据源信息
  const renderDataSourceInfo = () => {
    switch (tradingMode) {
      case TradeMode.LIVE:
        if (liveConfig.exchange && liveConfig.symbol && liveConfig.interval) {
          return (
            <div className="rounded-md bg-blue-50 border border-blue-100 p-2.5">
              <h3 className="text-xs font-medium text-blue-800 mb-1">数据源信息</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[10px] text-blue-700">交易所:</span>
                  <span className="text-[10px] font-medium text-blue-900">{liveConfig.exchange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-blue-700">交易对:</span>
                  <span className="text-[10px] font-medium text-blue-900">{liveConfig.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-blue-700">时间间隔:</span>
                  <span className="text-[10px] font-medium text-blue-900">{liveConfig.interval}</span>
                </div>
              </div>
            </div>
          );
        }
        break;
      case TradeMode.BACKTEST:
        if (backtestConfig.exchangeConfig) {
          return (
            <div className="rounded-md bg-blue-50 border border-blue-100 p-2.5">
              <h3 className="text-xs font-medium text-blue-800 mb-1">数据源信息</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[10px] text-blue-700">交易所:</span>
                  <span className="text-[10px] font-medium text-blue-900">{backtestConfig.exchangeConfig.exchange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-blue-700">交易对:</span>
                  <span className="text-[10px] font-medium text-blue-900">{backtestConfig.exchangeConfig.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-blue-700">时间间隔:</span>
                  <span className="text-[10px] font-medium text-blue-900">{backtestConfig.exchangeConfig.interval}</span>
                </div>
                {backtestConfig.exchangeConfig.timeRange && (
                  <div className="flex justify-between">
                    <span className="text-[10px] text-blue-700">时间范围:</span>
                    <span className="text-[10px] font-medium text-blue-900">
                      {backtestConfig.exchangeConfig.timeRange.startDate} - {backtestConfig.exchangeConfig.timeRange.endDate}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        }
        break;
    }
    
    return (
      <Alert className="py-2">
        <AlertCircle className="h-3.5 w-3.5" />
        <AlertDescription className="text-[10px]">
          数据源信息未配置，请检查策略设置
        </AlertDescription>
      </Alert>
    );
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
                配置{getIndicatorName()}的参数
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

                {/* 指标类型选择 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">指标类型</Label>
                    <Badge variant="outline" className={`${getIndicatorColor()} font-medium`}>
                      {getIndicatorName()}
                    </Badge>
                  </div>
                  <Select 
                    value={indicatorType} 
                    onValueChange={handleIndicatorTypeChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择指标类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={IndicatorType.SMA}>简单移动平均线 (SMA)</SelectItem>
                      <SelectItem value={IndicatorType.EMA}>指数移动平均线 (EMA)</SelectItem>
                      <SelectItem value={IndicatorType.BOLL}>布林带 (BOLL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 指标参数设置 - 所有模式都显示 */}
                <Card className="border shadow-sm">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-medium">指标参数</CardTitle>
                    <CardDescription className="text-xs">
                      调整{getIndicatorName()}在{tradingMode === TradeMode.LIVE ? '实盘交易' : tradingMode === TradeMode.SIMULATE ? '模拟交易' : '历史回测'}模式下的计算参数
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {indicatorType === IndicatorType.SMA && (
                      <SMASettings 
                        config={getCurrentIndicatorConfig() as SmaConfig} 
                        onConfigChange={handleConfigChange} 
                      />
                    )}
                    
                    {indicatorType === IndicatorType.EMA && (
                      <EMASettings 
                        config={getCurrentIndicatorConfig() as EmaConfig} 
                        onConfigChange={handleConfigChange} 
                      />
                    )}
                    
                    {indicatorType === IndicatorType.BOLL && (
                      <BOLLSettings 
                        config={getCurrentIndicatorConfig() as BollConfig} 
                        onConfigChange={handleConfigChange} 
                      />
                    )}
                  </CardContent>
                </Card>

                {/* 数据源信息 */}
                {renderDataSourceInfo()}
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

export default IndicatorNodePanel; 