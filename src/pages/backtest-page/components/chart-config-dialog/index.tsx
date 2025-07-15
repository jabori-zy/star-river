import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getStrategyCacheKeys } from "@/service/strategy";
import { parseKey } from "@/utils/parse-key";
import { KlineKey, BacktestKlineKey, BacktestIndicatorKey } from "@/types/symbol-key";
import { BacktestChart } from "@/types/chart/backtest-chart";
import KlineSelector from "./kline-selector";
import IndicatorSelector from "./indicator-selector";

interface ChartConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (klineCacheKeyStr: string, indicatorCacheKeyStrs: string[], chartName: string) => void;
    strategyId: number;
}

const ChartConfigDialog = ({ open, onOpenChange, onConfirm, strategyId }: ChartConfigDialogProps) => {

    // 缓存键
    const [cacheKeys, setCacheKeys] = useState<Record<string, BacktestKlineKey | BacktestIndicatorKey>>({});
    const [tempChartConfig, setTempChartConfig] = useState<BacktestChart>({
        id: 0,
        chartName: "",
        klineCacheKeyStr: "",
        indicatorCacheKeyStrs: []
    });

    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    // 获取策略缓存键
    const fetchCacheKeys = useCallback(async () => {
        setLoading(true);
        try {
            const keys = await getStrategyCacheKeys(strategyId);
            const parsedKeyMap: Record<string, BacktestKlineKey | BacktestIndicatorKey> = {};
            
            keys.forEach(keyString => {
                parsedKeyMap[keyString] = parseKey(keyString) as BacktestKlineKey | BacktestIndicatorKey;
            });
            console.log("parsedKeyMap", parsedKeyMap);
            return parsedKeyMap;

        } catch (error) {
            console.error('获取策略缓存键失败:', error);
            showAlertMessage("获取图表数据失败，请重试");
            return {};
        } finally {
            setLoading(false);
        }
    }, [strategyId]);

    // 显示警告信息
    const showAlertMessage = (message: string) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    // 重置表单
    const resetForm = useCallback(() => {
        const defaultChartName = `图表${Date.now()}`;
        setTempChartConfig({
            id: 0,
            chartName: defaultChartName,
            klineCacheKeyStr: "",
            indicatorCacheKeyStrs: []
        });
        setShowAlert(false);
    }, []);

    // 当dialog打开时重置表单并预加载数据
    useEffect(() => {
        if (open) {
            resetForm();
            // 预加载缓存数据
            fetchCacheKeys().then(cacheKeys => {
                setCacheKeys(cacheKeys);
            });

        }
    }, [open, fetchCacheKeys, resetForm]);

    // 更新临时图表配置
    const updateTempChartConfig = (key: keyof BacktestChart, value: string | string[]) => {
        setTempChartConfig(prev => {
            const newConfig: BacktestChart = {
                ...prev,
                [key]: value,
                ...(key === 'klineCacheKeyStr' ? { indicatorCacheKeyStrs: [] } : {})
            };
            
            // 只有当图表名称是默认名称格式时才自动更新
            if (key === 'klineCacheKeyStr' && value && cacheKeys[value as string]) {
                const isDefaultName = prev?.chartName.startsWith('图表');
                if (isDefaultName) {
                    const klineData = cacheKeys[value as string] as KlineKey;
                    newConfig.chartName = `${klineData.symbol} ${klineData.interval}`;
                }
            }
            
            return newConfig;
        });
    };

    // 处理K线选择变化
    const handleKlineCachekeyChange = (klineCacheKey: string) => {
        updateTempChartConfig('klineCacheKeyStr', klineCacheKey);
    };

    // 处理指标选择变化
    const handleIndicatorChange = (indicatorKeys: string[]) => {
        updateTempChartConfig('indicatorCacheKeyStrs', indicatorKeys);
    };

    // 处理对话框确认
    const handleConfirm = () => {
        if (!tempChartConfig?.klineCacheKeyStr) {
            showAlertMessage("请至少选择一个K线");
            return;
        }

        onConfirm(tempChartConfig.klineCacheKeyStr, tempChartConfig.indicatorCacheKeyStrs, tempChartConfig.chartName);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
            <DialogContent 
                className="sm:max-w-[500px]"
                onOpenAutoFocus={(e) => e.preventDefault()} // 防止自动聚焦，避免 aria-hidden 警告
            >
                <DialogHeader>
                    <DialogTitle>添加图表</DialogTitle>
                    <DialogDescription>
                        请选择要显示的K线和指标数据
                    </DialogDescription>
                </DialogHeader>
                
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-sm text-gray-500">正在加载图表数据...</div>
                    </div>
                ) : (
                    <div className="grid gap-6 py-4">
                        {showAlert && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{alertMessage}</AlertDescription>
                            </Alert>
                        )}

                        <KlineSelector
                            cacheKeys={cacheKeys}
                            selectedKlineCacheKey={tempChartConfig?.klineCacheKeyStr}
                            onKlineChange={handleKlineCachekeyChange}
                            loading={loading}
                        />
                        
                        <IndicatorSelector
                            cacheKeys={cacheKeys}
                            selectedKlineCacheKeyStr={tempChartConfig?.klineCacheKeyStr}
                            selectedIndicatorKeys={tempChartConfig?.indicatorCacheKeyStrs}
                            onIndicatorChange={handleIndicatorChange}
                        />
                    </div>
                )}
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
                    <Button 
                        onClick={handleConfirm} 
                        disabled={loading || !tempChartConfig.klineCacheKeyStr || !tempChartConfig.chartName.trim()}
                    >
                        确认
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ChartConfigDialog;
