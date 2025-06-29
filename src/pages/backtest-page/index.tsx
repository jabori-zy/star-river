import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useBacktestStrategySSE from "../../hooks/sse/use-backtest-strategy-sse";
import BacktestWindowHeader from "../../components/backtest/backtest-window-header";
import BacktestControl from "./components/backtest-control";
import ChartContainer from "./components/chart-container";
import { LayoutMode, BacktestStrategyChartConfig } from "@/types/chart/backtest-chart";
import AddChartButton from "./components/add-chart-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBacktestStrategyChartConfig, updateBacktestStrategyChartConfig } from "@/service/strategy";
import { toast } from "sonner";

export default function BacktestPage() {
    const navigate = useNavigate();
    
    // 从URL路径获取strategyId参数
    const getStrategyIdFromPath = (): number | null => {
        const path = window.location.pathname;
        const match = path.match(/\/backtest\/(\d+)/);
        if (match && match[1]) {
            const id = parseInt(match[1], 10);
            return !isNaN(id) && id > 0 ? id : null;
        }
        return null;
    };
    
    const [strategyId, setStrategyId] = useState<number | null>(getStrategyIdFromPath());
    const isValidStrategyId = strategyId !== null;
    
    useBacktestStrategySSE();
    
    const [strategyChartConfig, setStrategyChartConfig] = useState<BacktestStrategyChartConfig>({
        charts: [],
        layout: 'vertical'
    });
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [configLoaded, setConfigLoaded] = useState<boolean>(false);

    // 从后端获取图表配置
    const loadChartConfig = async (strategyId: number) => {
        try {
            setIsLoading(true);
            const config = await getBacktestStrategyChartConfig(strategyId);
            console.log('从后端获取的配置:', config);
            
            // 如果后端返回的配置有效，则使用后端配置，否则使用默认配置
            if (config && config.charts) {
                setStrategyChartConfig({
                    charts: config.charts || [],
                    layout: config.layout || 'vertical'
                });
            } else {
                // 使用默认配置
                setStrategyChartConfig({
                    charts: [],
                    layout: 'vertical'
                });
            }
            setConfigLoaded(true);
        } catch (error) {
            console.error('获取图表配置失败:', error);
            // 如果获取失败，使用默认配置
            setStrategyChartConfig({
                charts: [],
                layout: 'vertical'
            });
            setConfigLoaded(true);
            toast.error('获取图表配置失败', {
                description: '已使用默认配置，您可以重新添加图表',
                duration: 4000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 保存图表配置到后端
    const saveChartConfig = async () => {
        if (!strategyId) return;
        
        try {
            setIsSaving(true);
            await updateBacktestStrategyChartConfig(strategyId, strategyChartConfig);
            console.log('配置保存成功:', strategyChartConfig);
            
            // 显示简洁的成功提示
            toast.success('图表配置保存成功');
        } catch (error) {
            console.error('保存图表配置失败:', error);
            toast.error('保存图表配置失败', {
                description: error instanceof Error ? error.message : '未知错误',
                duration: 4000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    // 监听路径变化
    useEffect(() => {
        const handlePathChange = () => {
            const newStrategyId = getStrategyIdFromPath();
            setStrategyId(newStrategyId);
        };

        // 监听popstate事件（浏览器前进后退）
        window.addEventListener('popstate', handlePathChange);
        
        return () => {
            window.removeEventListener('popstate', handlePathChange);
        };
    }, []);

    // 当strategyId变化时，重新加载配置
    useEffect(() => {
        if (strategyId) {
            setConfigLoaded(false);
            loadChartConfig(strategyId);
        }
    }, [strategyId]);

    useEffect(() => {
        console.log('当前图表配置:', strategyChartConfig);
    }, [strategyChartConfig]);

    // 如果没有提供有效的strategyId，显示错误页面
    if (!isValidStrategyId) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
                <Alert variant="destructive" className="max-w-md mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        缺少或无效的策略ID参数。请从策略页面正确启动回测。
                    </AlertDescription>
                </Alert>
                <Button 
                    variant="outline" 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    返回策略列表
                </Button>
            </div>
        );
    }

    // 配置加载中的显示
    if (isLoading || !configLoaded) {
        return (
            <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
                <BacktestWindowHeader strategyName={`策略 ${strategyId} 回测`} />
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-muted-foreground">正在加载图表配置...</p>
                    </div>
                </div>
            </div>
        );
    }

    // 添加图表
    const addCharts = (klineCacheKeyStr: string, indicatorCacheKeyStrs: string[], chartName: string) => {
        const chartId = Math.max(0, ...strategyChartConfig.charts.map(c => c.id)) + 1;
        setStrategyChartConfig(prev => ({
            ...prev,
            charts: [...prev.charts, {
                id: chartId,
                chartName: chartName,
                klineCacheKeyStr: klineCacheKeyStr,
                indicatorCacheKeyStrs: indicatorCacheKeyStrs
            }]
        }));
    };

    // 删除图表
    const onDelete = (chartId: number) => {
        setStrategyChartConfig(prev => ({
            ...prev,
            charts: prev.charts.filter(chart => chart.id !== chartId)
        }));
    };

    // 更新布局模式
    const updateLayout = (layout: LayoutMode) => {
        setStrategyChartConfig(prev => ({
            ...prev,
            layout
        }));
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
            <BacktestWindowHeader strategyName={`策略 ${strategyId} 回测`} />

            {/* 回测窗口内容 */}
            {/* 如果图表数量为0，则显示添加图表按钮 */}
            { strategyChartConfig.charts.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <AddChartButton 
                        onAddChart={addCharts} 
                        strategyId={strategyId}
                    />
                </div>
                
            ) : (
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-hidden m-2 rounded-lg border border-border shadow-md bg-white">
                        <ChartContainer strategyChartConfig={strategyChartConfig} onDelete={onDelete} />
                    </div>
                    <div className="flex items-center p-2 bg-white border-t">
                        <BacktestControl 
                            strategyId={strategyId}
                            strategyChartConfig={strategyChartConfig} 
                            updateLayout={updateLayout} 
                            onAddChart={addCharts} 
                            onSaveChart={saveChartConfig}
                            isSaving={isSaving}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}