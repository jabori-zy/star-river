import { useState, useEffect, useMemo } from "react";
import { getStrategyCacheKeys } from "@/service/strategy";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseCacheKey } from "@/utils/parseCacheKey";
import { KlineCacheKey, IndicatorCacheKey } from "@/types/cache";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// 导入自定义组件和工具函数
import ChartHeader from "./components/ChartHeader";
import ChartCard from "./components/ChartCard";
import { 
  getIndicatorOptionsForKline, 
  renderKlineItem
} from "./utils/chartUtils";
import MultipleSelector, { Option } from "@/components/ui/multi-select";
import { StrategyChartConfig } from "@/types/strategyChartConfig";
import { useStrategyStore } from "@/store/useStrategyStore";
import { updateStrategy } from "@/service/strategy";

export interface StrategyChartContentProps {
  strategyId: number;
}

export default function StrategyChartContent({ strategyId }: StrategyChartContentProps) {
  const [cacheKeys, setCacheKeys] = useState<Record<string, KlineCacheKey | IndicatorCacheKey>>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  
  // 图表配置列表
  const { strategy, setStrategy } = useStrategyStore();
  const [strategyChartConfig, setStrategyChartConfig] = useState<StrategyChartConfig[]>([]);
  
  // 添加/编辑对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [currentEditingChart, setCurrentEditingChart] = useState<StrategyChartConfig | null>(null);

  // 临时图表配置
  const [tempChartConfig, setTempChartConfig] = useState<StrategyChartConfig>({
    chart_id: "",
    klineKeyStr: "",
    indicatorKeyStrs: []
  });
  
  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chartToDelete, setChartToDelete] = useState<string | null>(null);
  
  // 进入页面后，获取策略订阅的缓存键
  useEffect(() => {
    if (strategy?.chartConfig) {
      setStrategyChartConfig(strategy.chartConfig);
    }

    // 获取策略缓存键
    getStrategyCacheKeys(strategyId).then((keys) => {
      const parsedKeyMap: Record<string, KlineCacheKey | IndicatorCacheKey> = {};
      
      keys.forEach(keyString => {
        parsedKeyMap[keyString] = parseCacheKey(keyString);
      });
      
      setCacheKeys(parsedKeyMap);
      console.log("原始缓存键:", keys);
      console.log("解析后的缓存键映射:", parsedKeyMap);
    });
  }, [strategyId, strategyChartConfig, strategy, setStrategyChartConfig]);

  // 计算k线选项
  const klineOptions = useMemo(() => {
    const options: { key: string; data: KlineCacheKey }[] = [];
    
    Object.entries(cacheKeys).forEach(([key, value]) => {
      if (key.startsWith("kline|")) {
        options.push({
          key,
          data: value as KlineCacheKey
        });
      }
    });
    
    return options;
  }, [cacheKeys]);

  // 转换指标选项为MultipleSelector需要的格式
  const getIndicatorOptions = (klineKey: string): Option[] => {
    if (!klineKey) return [];
    
    return getIndicatorOptionsForKline(klineKey, cacheKeys).map(option => {
      // 将指标数据转换为字符串标签
      const indicatorData = option.data;
      const label = `${indicatorData.indicatorType} (${indicatorData.indicatorConfig.period})`;
      return {
        value: option.key,
        label: label
      };
    });
  };

  // 打开添加图表对话框
  const openAddChartDialog = () => {
    setDialogMode("add");
    // 计算当前已有几个图表
    const currentChartCount = strategy?.chartConfig?.length ?? 0;
    setTempChartConfig({
      chart_id: `chart_${currentChartCount + 1}`,
      klineKeyStr: "",
      indicatorKeyStrs: []
    });
    console.log("当前图表数量:", currentChartCount, "tempChartConfig:", tempChartConfig);
    setDialogOpen(true);
  };
  
  // 打开编辑图表对话框
  const openEditChartDialog = (chartConfig: StrategyChartConfig) => {
    setDialogMode("edit");
    setCurrentEditingChart(chartConfig);
    setTempChartConfig({...chartConfig});
    setDialogOpen(true);
  };
  
  // 打开删除确认对话框
  const openDeleteDialog = (chartId: string) => {
    setChartToDelete(chartId);
    setDeleteDialogOpen(true);
  };
  
  // 更新临时图表配置
  const updateTempChartConfig = (key: keyof StrategyChartConfig, value: string | string[]) => {
    setTempChartConfig(prev => {
      const newConfig = {
        ...prev,
        [key]: value,
        ...(key === 'klineKeyStr' ? { indicatorKeyStrs: [] } : {})
      };
      console.log("更新后的tempChartConfig", newConfig);
      return newConfig;
    });
  };

  // 显示警告信息
  const showAlertMessage = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // 处理对话框确认
  const handleDialogConfirm = () => {
    if (!tempChartConfig.klineKeyStr) {
      showAlertMessage("请至少选择一个K线");
      return;
    }
    
    let newConfigs: StrategyChartConfig[];
    if (dialogMode === "add") {
      // 添加新图表
      newConfigs = [...strategyChartConfig, tempChartConfig];
      setStrategyChartConfig(newConfigs);
      console.log("新增图表后的配置", newConfigs);
    } else {
      // 更新现有图表
      newConfigs = strategyChartConfig.map(config =>
        config.chart_id === currentEditingChart?.chart_id ? tempChartConfig : config
      );
      setStrategyChartConfig(newConfigs);
      console.log("更新图表后的配置", newConfigs);
    }
      // 立即更新全局策略状态，确保图表能够正确渲染
    if (strategy) {
      setStrategy({...strategy, chartConfig: newConfigs});
    }
    
    setDialogOpen(false);
  };
  
  // 处理删除确认
  const handleDeleteConfirm = () => {
    if (chartToDelete) {
      const filteredConfigs = strategyChartConfig.filter(config => 
        config.chart_id !== chartToDelete
      );
      setStrategyChartConfig(filteredConfigs);
      if (strategy) {
        setStrategy({...strategy, chartConfig: filteredConfigs});
      }
    }
    setDeleteDialogOpen(false);
  };

  // 获取指标显示名称
  const getIndicatorLabel = (key: string): string => {
    if (!key || !cacheKeys[key]) return key;
    
    const indicatorData = cacheKeys[key] as IndicatorCacheKey;
    return `${indicatorData.indicatorType} (${indicatorData.indicatorConfig.period})`;
  };

  // 保存图表配置
  const handleSaveChart = () => {
    // 这里可以添加保存图表配置的逻辑
    if (strategy) {
      setStrategy({...strategy, chartConfig: strategyChartConfig});
    }
    console.log("保存图表配置后的策略", strategy);
    updateStrategy(strategyId, {
      ...strategy,
      chartConfig: strategyChartConfig
    });

    showAlertMessage("图表配置已保存");
  };

  return (
    <div className="flex flex-1 flex-col h-full w-full min-w-0 overflow-y-auto">
      <ChartHeader 
        showAlert={showAlert}
        alertMessage={alertMessage}
        onAddChart={openAddChartDialog}
        onSaveChart={handleSaveChart}
      />
      
      <div className="flex-1 p-4 pt-0 overflow-y-auto">
        {strategyChartConfig.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-[calc(100vh-150px)]">
            <Button 
              size="lg" 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={openAddChartDialog}
            >
              <PlusCircle className="h-5 w-5" />
              添加图表
            </Button>
          </div>
        ) : (
          <div className="h-full flex flex-col gap-6 pb-6">
            {strategyChartConfig.map((chartConfig) => {
              const klineCacheKey = parseCacheKey(chartConfig.klineKeyStr);
              const currentKlineKeys = chartConfig.klineKeyStr;
              const currentIndicatorKeys = chartConfig.indicatorKeyStrs || [];
              
              return (
                <ChartCard
                  key={chartConfig.chart_id}
                  id={chartConfig.chart_id}
                  chartTitle={klineCacheKey.symbol + " " + klineCacheKey.interval}
                  klineCacheKeys={currentKlineKeys}
                  indicatorCacheKeys={currentIndicatorKeys}
                  hasKlineData={!!chartConfig.klineKeyStr}
                  onEdit={() => openEditChartDialog(chartConfig)}
                  onDelete={() => openDeleteDialog(chartConfig.chart_id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 添加/编辑图表对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "添加图表" : "编辑图表"}</DialogTitle>
            <DialogDescription>
              请选择要显示的K线和指标数据
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">K线</h3>
              <Select 
                value={tempChartConfig.klineKeyStr} 
                onValueChange={(value) => updateTempChartConfig('klineKeyStr', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择K线">
                    {tempChartConfig.klineKeyStr && cacheKeys[tempChartConfig.klineKeyStr] && 
                      renderKlineItem(cacheKeys[tempChartConfig.klineKeyStr] as KlineCacheKey)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {klineOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {renderKlineItem(option.data)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">指标</h3>
              <MultipleSelector 
                value={tempChartConfig.indicatorKeyStrs.map(key => ({
                  value: key,
                  label: getIndicatorLabel(key)
                }))}
                options={getIndicatorOptions(tempChartConfig.klineKeyStr)}
                placeholder="选择指标"
                disabled={!tempChartConfig.klineKeyStr}
                onChange={(selectedOptions) => {
                  updateTempChartConfig('indicatorKeyStrs', selectedOptions.map(option => option.value));
                }}
                emptyIndicator={
                  <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                    没有找到匹配的指标
                  </p>
                }
                triggerSearchOnFocus={true}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button 
              onClick={handleDialogConfirm} 
              disabled={!tempChartConfig.klineKeyStr}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除此图表吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 