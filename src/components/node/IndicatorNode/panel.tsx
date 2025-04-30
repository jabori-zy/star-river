import { useState, useEffect } from 'react';
import { DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Save, ChevronLeft, AlertCircle, CreditCard } from 'lucide-react';
import { IndicatorType } from '@/types/indicator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SMASettings from './settings/SMASettings';
import BOLLSettings from './settings/BOLLSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Node } from '@xyflow/react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TradeMode } from '@/types/node';
import { LiveDataNodeData } from '@/types/LiveDataNode';


interface IndicatorNodePanelProps {
  data: Record<string, unknown>;
  sourceNode: Node | undefined;
  setIsEditing: (value: boolean) => void;
  handleSave: (data: Record<string, unknown>) => void;
  nodeName: string;
  nodeNameEditing: boolean;
  setNodeNameEditing: (value: boolean) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveNodeName: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  indicatorType: IndicatorType;
  setIndicatorType: (type: IndicatorType) => void;
  tradingMode: TradeMode;
}

const IndicatorNodePanel = ({
  data,
  sourceNode,
  setIsEditing,
  handleSave,
  nodeName,
  nodeNameEditing,
  setNodeNameEditing,
  handleNameChange,
  saveNodeName,
  handleKeyDown,
  indicatorType,
  setIndicatorType,
  tradingMode
}: IndicatorNodePanelProps) => {
  // 活动的交易模式设置
  const [activeTradingMode, setActiveTradingMode] = useState<TradeMode>(tradingMode);

  // 初始化三种模式的指标配置
  const defaultConfig = {
    indicator_config: {
      period: indicatorType === IndicatorType.SMA ? 9 : 20,
      priceSource: "close",
      ...(indicatorType === IndicatorType.BOLL ? { stdDev: 2 } : {})
    }
  };

  // 三种模式的指标配置
  const [liveConfig, setLiveConfig] = useState<Record<string, unknown>>(
    (data.liveConfig as Record<string, unknown>) || { ...defaultConfig }
  );
  const [simulateConfig, setSimulateConfig] = useState<Record<string, unknown>>(
    (data.simulateConfig as Record<string, unknown>) || { ...defaultConfig }
  );
  const [backtestConfig, setBacktestConfig] = useState<Record<string, unknown>>(
    (data.backtestConfig as Record<string, unknown>) || { ...defaultConfig }
  );
  
  // 数据源信息
  const [dataSourceInfo, setDataSourceInfo] = useState<{
    isLiveData: boolean;
    exchange?: string;
    symbol?: string;
    interval?: string;
  }>({
    isLiveData: false
  });
  
  useEffect(() => {
    if (sourceNode && sourceNode.type === 'liveDataNode') {
      const nodeData = sourceNode.data as LiveDataNodeData;
      if (nodeData.liveConfig) {
        const {symbol, interval } = nodeData.liveConfig;
        const exchange = nodeData.liveConfig.selectedLiveAccount?.exchange;
        
        // 更新数据源信息状态
        const newDataSourceInfo = {
          isLiveData: true,
          exchange: exchange || '未知',
          symbol: symbol || '未知',
          interval: interval || '未知'
        };
        
        setDataSourceInfo(newDataSourceInfo);
        
        // 更新三种交易模式的配置，加入数据源信息
        setLiveConfig(prevConfig => {
          // 获取当前的indicator_config或创建默认值
          const indicatorConfig = prevConfig.indicator_config as Record<string, unknown> || 
            { 
              period: indicatorType === IndicatorType.SMA ? 9 : 20, 
              priceSource: "close",
              ...(indicatorType === IndicatorType.BOLL ? { stdDev: 2 } : {})
            };
          
          return {
            indicator_config: indicatorConfig,
            exchange,
            symbol,
            interval
          };
        });
        
        setSimulateConfig(prevConfig => {
          // 获取当前的indicator_config或创建默认值
          const indicatorConfig = prevConfig.indicator_config as Record<string, unknown> || 
            { 
              period: indicatorType === IndicatorType.SMA ? 9 : 20, 
              priceSource: "close",
              ...(indicatorType === IndicatorType.BOLL ? { stdDev: 2 } : {})
            };
          
          return {
            indicator_config: indicatorConfig,
            exchange,
            symbol,
            interval
          };
        });
        
        setBacktestConfig(prevConfig => {
          // 获取当前的indicator_config或创建默认值
          const indicatorConfig = prevConfig.indicator_config as Record<string, unknown> || 
            { 
              period: indicatorType === IndicatorType.SMA ? 9 : 20, 
              priceSource: "close",
              ...(indicatorType === IndicatorType.BOLL ? { stdDev: 2 } : {})
            };
          
          return {
            indicator_config: indicatorConfig,
            exchange,
            symbol,
            interval
          };
        });
      }
    } else {
      setDataSourceInfo({
        isLiveData: false
      });
    }
  }, [sourceNode, indicatorType]);

  // 处理指标类型变更
  const handleIndicatorTypeChange = (value: string) => {
    const newType = value as IndicatorType;
    setIndicatorType(newType);
    
    // 重置配置
    if (newType === IndicatorType.SMA) {
      updateCurrentModeConfig({
        indicator_config: {
          period: 9,
          priceSource: "close",
        },
        exchange: dataSourceInfo.exchange,
        symbol: dataSourceInfo.symbol,
        interval: dataSourceInfo.interval
      });
    } else if (newType === IndicatorType.BOLL) {
      updateCurrentModeConfig({
        indicator_config: {
          period: 20,
          stdDev: 2,
          priceSource: "close",
        },
        exchange: dataSourceInfo.exchange,
        symbol: dataSourceInfo.symbol,
        interval: dataSourceInfo.interval
      });
    }
  };
  
  // 获取当前交易模式的配置
  const getCurrentConfig = () => {
    switch (activeTradingMode) {
      case TradeMode.LIVE:
        return liveConfig;
      case TradeMode.SIMULATE:
        return simulateConfig;
      case TradeMode.BACKTEST:
        return backtestConfig;
      default:
        return {};
    }
  };
  
  // 更新当前交易模式的配置
  const updateCurrentModeConfig = (newConfig: Record<string, unknown>) => {
    switch (activeTradingMode) {
      case TradeMode.LIVE:
        setLiveConfig(newConfig);
        break;
      case TradeMode.SIMULATE:
        setSimulateConfig(newConfig);
        break;
      case TradeMode.BACKTEST:
        setBacktestConfig(newConfig);
        break;
    }
  };
  
  // 处理配置变更
  const handleConfigChange = (key: string, value: unknown) => {
    const currentConfig = getCurrentConfig();
    const currentIndicatorConfig = (currentConfig.indicator_config as Record<string, unknown>) || {};
    
    updateCurrentModeConfig({
      ...currentConfig,
      indicator_config: {
        ...currentIndicatorConfig,
        [key]: value
      }
    });
  };
  
  // 保存配置
  const onSave = () => {
    handleSave({
      liveConfig,
      simulateConfig,
      backtestConfig,
      indicatorType
    });
  };

  // 获取指标名称
  const getIndicatorName = () => {
    switch (indicatorType) {
      case IndicatorType.SMA:
        return "简单移动平均线";
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
      case IndicatorType.BOLL:
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };
  
  // 获取交易模式的描述文本
  const getTradingModeDescription = (mode: TradeMode) => {
    switch (mode) {
      case TradeMode.LIVE:
        return "使用真实资金进行交易的指标参数";
      case TradeMode.SIMULATE:
        return "使用虚拟资金进行模拟交易的指标参数";
      case TradeMode.BACKTEST:
        return "使用历史数据进行回测的指标参数";
      default:
        return "";
    }
  };

  return (
    <DrawerContent
      className="h-[calc(100vh-2rem)] max-w-[400px] rounded-l-xl shadow-2xl mx-0 my-4 flex flex-col"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <DrawerHeader className="border-b p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setIsEditing(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <DrawerTitle className="text-base font-semibold">
              {nodeNameEditing ? (
                <Input
                  type="text"
                  value={nodeName}
                  onChange={handleNameChange}
                  onBlur={saveNodeName}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="h-7 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span onDoubleClick={() => setNodeNameEditing(true)} className="cursor-pointer hover:underline">
                  {nodeName}
                </span>
              )}
            </DrawerTitle>
          </div>
          <Badge variant="outline" className={`${getIndicatorColor()} font-medium`}>
            {getIndicatorName()}
          </Badge>
        </div>
        <DrawerDescription className="flex items-center gap-1 mt-1 text-xs">
          <Settings className="h-3 w-3 text-muted-foreground" />
          <span>配置指标参数</span>
        </DrawerDescription>
      </DrawerHeader>
      
      <ScrollArea className="flex-1 px-3">
        <div className="py-4 space-y-4">
          {/* 交易模式切换 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-xs font-medium">交易模式</h3>
            </div>
            <Tabs 
              defaultValue={activeTradingMode}
              value={activeTradingMode}
              onValueChange={(value) => setActiveTradingMode(value as TradeMode)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 h-7">
                <TabsTrigger value={TradeMode.LIVE} className="text-[10px]">
                  实盘交易
                </TabsTrigger>
                <TabsTrigger value={TradeMode.SIMULATE} className="text-[10px]">
                  模拟交易
                </TabsTrigger>
                <TabsTrigger value={TradeMode.BACKTEST} className="text-[10px]">
                  历史回测
                </TabsTrigger>
              </TabsList>
              <div className="mt-1 text-[10px] text-muted-foreground">
                {getTradingModeDescription(activeTradingMode)}
              </div>
            </Tabs>
          </div>
          
          {/* 指标类型选择 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium">指标类型</h3>
              <Badge variant="outline" className="text-[10px]">
                选择指标
              </Badge>
            </div>
            <Select 
              value={indicatorType} 
              onValueChange={handleIndicatorTypeChange}
            >
              <SelectTrigger className="w-full h-7 text-xs">
                <SelectValue placeholder="选择指标类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={IndicatorType.SMA}>简单移动平均线 (SMA)</SelectItem>
                <SelectItem value={IndicatorType.BOLL}>布林带 (BOLL)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* 指标参数设置卡片 */}
          <Card className="border shadow-sm">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-medium">指标参数</CardTitle>
              <CardDescription className="text-[10px]">调整{getIndicatorName()}的计算参数</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {/* 指标设置面板 */}
              {indicatorType === IndicatorType.SMA && (
                <SMASettings 
                  config={(getCurrentConfig().indicator_config || {}) as { period: number; priceSource: string }} 
                  onConfigChange={handleConfigChange} 
                />
              )}
              
              {indicatorType === IndicatorType.BOLL && (
                <BOLLSettings 
                  config={(getCurrentConfig().indicator_config || {}) as { period: number; stdDev: number; priceSource: string }} 
                  onConfigChange={handleConfigChange} 
                />
              )}
            </CardContent>
          </Card>
          
          {/* 数据源信息 */}
          {dataSourceInfo.isLiveData ? (
            <div className="rounded-md bg-blue-50 border border-blue-100 p-2.5">
              <h3 className="text-xs font-medium text-blue-800 mb-1">数据源信息</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[10px] text-blue-700">交易对:</span>
                  <span className="text-[10px] font-medium text-blue-900">{dataSourceInfo.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-blue-700">时间间隔:</span>
                  <span className="text-[10px] font-medium text-blue-900">{dataSourceInfo.interval}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-blue-700">交易所:</span>
                  <span className="text-[10px] font-medium text-blue-900">{dataSourceInfo.exchange}</span>
                </div>
              </div>
            </div>
          ) : (
            <Alert className="py-2">
              <AlertCircle className="h-3.5 w-3.5" />
              <AlertDescription className="text-[10px]">
                未连接数据源，请将指标节点连接到数据节点
              </AlertDescription>
            </Alert>
          )}
          
          {/* 底部空间，确保内容可以滚动到保存按钮之上 */}
          <div className="h-4"></div>
        </div>
      </ScrollArea>
      
      <DrawerFooter className="border-t p-3 mt-auto">
        <Button
          className="w-full h-8 text-xs"
          type="submit"
          onClick={onSave}
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          保存配置
        </Button>
      </DrawerFooter>
    </DrawerContent>
  );
};

export default IndicatorNodePanel; 