import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { SciChartReact, TResolvedReturnType } from "scichart-react";
import { AxisBase2D, SciChartSurface, XyDataSeries } from "scichart";
import { Subscription } from "rxjs";
import initIndicatorChart from "./init-indicator-chart";
import { IndicatorValue } from "@/types/indicator";
import { IndicatorChartConfig } from "@/types/indicator/indicator-chart-config";
import { createIndicatorStreamForCacheKey } from "@/hooks/obs/backtest-strategy-data-obs";

interface IndicatorChartWithObservableProps {
    indicatorKeyStr: string;
    indicatorName: string;
    addSurfaceToGroup: (surface: SciChartSurface) => void;
    addAxis: (axis: AxisBase2D) => void;
    enabled?: boolean; // 是否启用Observable数据流
}

interface IndicatorChartRef {
    clearChartData: () => void;
}

const IndicatorChartWithObservable = forwardRef<IndicatorChartRef, IndicatorChartWithObservableProps>(
    ({ indicatorKeyStr, indicatorName, addSurfaceToGroup, addAxis, enabled = true }, ref) => {
        
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

        // 创建图表初始化函数 - 参考官网示例的方式
        const initChart = React.useCallback(async (rootElement: string | HTMLDivElement) => {
            // 初始化图表
            const { sciChartSurface, controls } = await initIndicatorChart(rootElement, indicatorKeyStr, indicatorName);
            
            // 订阅指标数据流 - 类似官网示例中的 obs.subscribe()
            let subscription: Subscription | null = null;
            if (enabled) {
                const obs = createIndicatorStreamForCacheKey(indicatorKeyStr, enabled);
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
        }, [indicatorKeyStr, indicatorName, enabled]);

        return (
            <div className="w-full h-full flex flex-col overflow-hidden">
                <SciChartReact
                    key={`indicator-${indicatorKeyStr}`}
                    initChart={initChart}
                    style={{ flexBasis: 200, flexGrow: 1, flexShrink: 1 }}
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

IndicatorChartWithObservable.displayName = 'IndicatorChartWithObservable';

export default IndicatorChartWithObservable;
