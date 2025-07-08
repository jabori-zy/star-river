import { SciChartReact, TResolvedReturnType } from "scichart-react";
import { AxisBase2D, SciChartSurface } from "scichart";
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { initKlineChart } from "./init-kline-chart";
import { Kline } from "@/types/kline";
import { IndicatorValue } from "@/types/indicator";
import { useBacktestKlineDataStore } from "@/store/backtest-replay-store/use-backtest-kline-store";
import { useBacktestIndicatorDataStore } from "@/store/backtest-replay-store/use-backtest-indicator-store";
import { VirtualOrder } from "@/types/order/virtual-order";
import { useBacktestOrderDataStore } from "@/store/backtest-replay-store/use-backtest-order-store";
import { parseCacheKey } from "@/utils/parseCacheKey";
import { BacktestKlineCacheKey } from "@/types/cache";


interface KlineChartProps {
    chartId: number;
    klineKeyStr: string;
    indicatorKeyStrs: string[];
    setMainChart: (sciChartSurface: SciChartSurface) => void;
    addAxis: (axis: AxisBase2D) => void;
    addSurfaceToGroup: (surface: SciChartSurface) => void;
}

interface KlineChartRef {
    clearChartData: () => void;
}

const KlineChart = forwardRef<KlineChartRef, KlineChartProps>(({ klineKeyStr, indicatorKeyStrs, setMainChart, addAxis, addSurfaceToGroup }, ref) => {
    

    let klineKey = parseCacheKey(klineKeyStr) as BacktestKlineCacheKey;

    const latestKline = useBacktestKlineDataStore(
        state => state.getLatestKlineData(klineKeyStr) as Kline
    );

    const chartControlsRef = useRef<{
        setData: (symbolName: string, kline: Kline[]) => void;
        setXRange: (startDate: Date, endDate: Date) => void;
        onNewKline: (newKline: Kline) => void;
        onNewIndicator: (newIndicators: Record<string, IndicatorValue>) => void;
        onNewOrder: (newOrder: VirtualOrder) => void;  
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

    // 使用 useRef 包装 indicatorKeyStrs，避免依赖项警告
    const indicatorKeyStrsRef = useRef<string[]>(indicatorKeyStrs);
    
    // 更新 ref 的值
    useEffect(() => {
        indicatorKeyStrsRef.current = indicatorKeyStrs;
    }, [indicatorKeyStrs]);

    // 创建稳定的 initChart 函数
    const initChart = React.useCallback((rootElement: string | HTMLDivElement) => {
        return initKlineChart(rootElement, klineKeyStr, indicatorKeyStrs);
    }, [klineKeyStr, indicatorKeyStrs]);

    // 处理数据更新 - 使用 ref 来避免依赖项警告
    useEffect(() => {
        console.log(`=== useEffect 触发 ===`);
        console.log(`latestKline:`, latestKline);
        console.log(`chartControlsRef.current:`, !!chartControlsRef.current);
        
        // 如果没有最新数据，则不进行更新
        if (!latestKline) {
            console.log(`没有最新数据，返回`);
            return;
        }

        // 取最新一条数据
        if (chartControlsRef.current) {
            console.log(`准备调用 onNewKlineData，K线时间戳: ${latestKline.timestamp}, 价格: ${latestKline.close}`);
            
            // 直接在 effect 内获取最新的指标数据，使用 ref 来获取最新的 indicatorKeyStrs
            const indicatorStore = useBacktestIndicatorDataStore.getState();
            const latestIndicatorData: Record<string, IndicatorValue> = {};
            
            indicatorKeyStrsRef.current.forEach(indicatorKeyStr => {
                const data = indicatorStore.getLatestIndicatorData(indicatorKeyStr) as IndicatorValue;
                if (data) {
                    latestIndicatorData[indicatorKeyStr] = data;
                }
            });
            
            chartControlsRef.current.onNewKline(latestKline);
            chartControlsRef.current.onNewIndicator(latestIndicatorData);

            const orderStore = useBacktestOrderDataStore.getState();
            const latestOrder = orderStore.getLatestOrder(klineKey.exchange, klineKey.symbol);
            if (latestOrder) {
                chartControlsRef.current.onNewOrder(latestOrder);
            }

            
        }
    }, [latestKline]); // 只依赖 latestKline，不会再有警告
    

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <SciChartReact
                key={`${klineKeyStr}-${indicatorKeyStrs.join('-')}`} // 添加 key，当配置变化时强制重新初始化
                initChart={initChart}
                style={{ flexBasis: 200, flexGrow: 1, flexShrink: 1 }}
                onInit={(initResult: TResolvedReturnType<typeof initChart>) => {
                    const { sciChartSurface, controls } = initResult;
                    setMainChart(sciChartSurface);
                    chartControlsRef.current = controls;

                    addAxis(sciChartSurface.xAxes.get(0));
                    addSurfaceToGroup(sciChartSurface);

                    // 返回清理函数
                    return () => {
                        console.log(`=== 图表清理 ===`);
                        chartControlsRef.current = undefined;
                    };
                }}
            />
        </div>
    );
});

KlineChart.displayName = 'KlineChart';

export default KlineChart;
