import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { SciChartReact, TResolvedReturnType } from "scichart-react";
import { AxisBase2D, SciChartSurface, XyDataSeries } from "scichart";
import { Subscription } from "rxjs";
import initIndicatorChart from "./init-indicator-chart";
import { IndicatorValue } from "@/types/indicator";
import { IndicatorChartConfig } from "@/types/chart";
import { createIndicatorStreamForCacheKey } from "@/hooks/obs/backtest-strategy-data-obs";
import { SubChartConfig } from "@/types/chart";
import ChartEditButton from "../chart-edit-button";

interface IndicatorChartProps {
    enabled?: boolean; // 是否启用Observable数据流
    subChartConfig: SubChartConfig
    addSurfaceToGroup: (surface: SciChartSurface) => void;
    addAxis: (axis: AxisBase2D) => void;
    onDeleteSubChart: (subChartId: number) => void;
    
}

interface IndicatorChartRef {
    clearChartData: () => void;
}

const IndicatorChart = forwardRef<IndicatorChartRef, IndicatorChartProps>(
    ({ addSurfaceToGroup, addAxis, enabled = true, subChartConfig, onDeleteSubChart }, ref) => {
        
        const chartControlsRef = useRef<{
            onNewData: (data: IndicatorValue) => void;
            getDataSeries: () => XyDataSeries[];
            getIndicatorConfig: () => IndicatorChartConfig;
            clearChartData: () => void;
        }>(undefined);

        // 暴露清空方法给父组件
        useImperativeHandle(ref, () => ({
            clearChartData: () => {
                if (chartControlsRef.current) {
                    chartControlsRef.current.clearChartData();
                }
            }
        }));

        const  indicatorChartConfig = Object.values(subChartConfig.indicatorChartConfigs)[0];
        const indicatorCacheKeyStr = Object.keys(subChartConfig.indicatorChartConfigs)[0];

        // 创建图表初始化函数 - 参考官网示例的方式
        const initChart = React.useCallback(async (rootElement: string | HTMLDivElement) => {
            // 初始化图表
            const { sciChartSurface, controls } = await initIndicatorChart(rootElement, indicatorChartConfig);
            
            // 订阅指标数据流 - 类似官网示例中的 obs.subscribe()
            let subscription: Subscription | null = null;
            if (enabled) {

                const obs = createIndicatorStreamForCacheKey(indicatorCacheKeyStr, enabled);
                subscription = obs.subscribe((indicatorData: IndicatorValue[]) => {
                    console.log(`=== 收到指标数据流更新 ===`);
                    console.log(`数据长度: ${indicatorData.length}`);
                    
                    if (indicatorData.length > 0) {
                        // 取最新的指标数据
                        const latestIndicator = indicatorData[indicatorData.length - 1];
                        console.log(`最新指标:`, latestIndicator);
                        
                        // 直接调用图表更新方法
                        controls.onNewData(latestIndicator);
                    }
                });
            }
            
            return { sciChartSurface, controls, subscription };
        }, [indicatorCacheKeyStr, indicatorChartConfig, enabled]);

        return (
            <div className="w-full h-full flex flex-col overflow-hidden relative group">
                {/* 悬浮时显示的按钮组 */}
                <div className="absolute top-2 right-20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ChartEditButton 
                        isMainChart={false}
                        onEdit={() => {}} 
                        subChartId={1} 
                        onDeleteSubChart={onDeleteSubChart} />
                </div>

                {/* 图表区域 - 占据全部空间 */}
                <SciChartReact
                    key={`indicator-${indicatorCacheKeyStr}`}
                    initChart={initChart}
                    style={{ width: '100%', height: '100%' }}
                    onInit={(initResult: TResolvedReturnType<typeof initChart>) => {
                        const { sciChartSurface, controls, subscription } = initResult;
                        chartControlsRef.current = controls;

                        addAxis(sciChartSurface.xAxes.get(0));
                        addSurfaceToGroup(sciChartSurface);

                        // 返回清理函数 - 类似官网示例
                        return () => {
                            console.log(`=== 指标图表清理 ===`);
                            chartControlsRef.current = undefined;
                            
                            // 清理订阅 - 类似官网示例中的 subscription.unsubscribe()
                            if (subscription) {
                                subscription.unsubscribe();
                            }
                        };
                    }}
                />
            </div>
        );
    }
);

IndicatorChart.displayName = 'IndicatorChartWithObservable';

export default IndicatorChart;
